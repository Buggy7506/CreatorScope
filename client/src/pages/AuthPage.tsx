import axios from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AuthUser, saveAuth } from "../lib/auth";
import PublicHeaderTemplate from "../templates/navigation/PublicHeaderTemplate";

interface AuthPageProps {
  user: AuthUser | null;
  onLogin: (user: AuthUser, token?: string) => void;
  isOnline: boolean;
}

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M11.4 11.4V0H0v11.4h11.4z" fill="#00A4EF" />
    <path d="M23 11.4V0H11.4v11.4H23z" fill="#7FBA00" />
    <path d="M11.4 23v-11.4H0V23h11.4z" fill="#F25022" />
    <path d="M23 23v-11.4H11.4V23H23z" fill="#FFB900" />
  </svg>
);

const AppleIcon = () => (
  <img src="/assets/apple.svg" alt="" className="auth-social-svg" />
);

const SOCIAL_ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "Sign-in was cancelled. Choose a provider again when you are ready.",
  cancelled: "Sign-in was cancelled. No changes were made to your account.",
  timeout:
    "The provider took too long to respond. Please check your connection and try again.",
  provider_timeout:
    "The provider took too long to respond. Please check your connection and try again.",
  oauth_error:
    "The social provider could not finish sign-in. Please try again or use email instead.",
};

const getSocialErrorMessage = (code: string) =>
  SOCIAL_ERROR_MESSAGES[code] ?? decodeURIComponent(code.replace(/_/g, " "));

const AuthPage = ({ user, onLogin, isOnline }: AuthPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<
    "google" | "apple" | "microsoft" | null
  >(null);

  const apiOrigin = useMemo(() => {
    const configured = import.meta.env.VITE_API_URL as string | undefined;
    if (!configured || configured.startsWith("/")) return "";
    return configured.replace(/\/api\/v1\/?$/, "");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const socialError = params.get("error");

    if (socialError) {
      setError(getSocialErrorMessage(socialError));
      navigate("/login", { replace: true });
    }

    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, location.search]);

  const getErrorMessage = (caughtError: unknown) => {
    if (axios.isAxiosError(caughtError)) {
      return (
        caughtError.response?.data?.message ||
        caughtError.message ||
        "Something went wrong. Please try again."
      );
    }

    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isOnline) {
      setError(
        "You are offline. Sign-in will be available as soon as your connection returns.",
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || (isRegister && !name.trim())) {
      setError("Enter all required fields to continue.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = { email: normalizedEmail, password, name: name.trim() };
      const response = await api.post(endpoint, payload);
      const authUser = response.data?.user;
      const token = response.data?.token;

      if (!authUser?.email || !token) {
        throw new Error(
          "The authentication server returned an invalid response.",
        );
      }

      saveAuth(token, authUser);
      onLogin(authUser, token);
    } catch (caughtError) {
      console.error(caughtError);
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "apple" | "microsoft") => {
    setError("");

    if (!isOnline) {
      setError(
        "You are offline. Social sign-in needs an internet connection, but you can keep reviewing cached CreatorScope details.",
      );
      return;
    }

    try {
      const targetUrl = `${apiOrigin}/api/v1/connect/${provider}`;
      setSocialProvider(provider);

      window.setTimeout(() => {
        setSocialProvider((currentProvider) => {
          if (currentProvider === provider) {
            setError(
              "The provider is taking longer than expected. If the sign-in page did not open, try again or use email.",
            );
            return null;
          }

          return currentProvider;
        });
      }, 12000);

      window.location.assign(targetUrl);
    } catch (caughtError) {
      console.error(caughtError);
      setSocialProvider(null);
      setError(
        "We could not open the social sign-in provider. Please try again or continue with email.",
      );
    }
  };

  return (
    <section className="auth-shell">
      <PublicHeaderTemplate variant="auth" />

      <div className="auth-kicker-row">
        <div className="auth-brand-chip">CreatorScope</div>
        <div className="auth-brand-chip auth-brand-chip--soft">
          Secure access
        </div>
      </div>

      <div className="auth-grid">
        <div className="auth-copy">
          <div className="auth-copy-badge">
            Creator intelligence workspace
          </div>
          <h1 className="auth-copy-title">
            {isRegister
              ? "Create your revenue workspace"
              : "Sign in to your creator command center"}
          </h1>
          <p className="auth-copy-text">
            Manage analytics, campaigns, billing, and social channels through a
            calm green dashboard styled like a modern automation platform.
          </p>

          <div className="auth-copy-list">
            <div className="auth-copy-item">
              Unified TikTok, YouTube & Instagram analytics
            </div>
            <div className="auth-copy-item">
              AI captions, reports & viral timing signals
            </div>
            <div className="auth-copy-item">
              Secure email, Google, Microsoft & Apple sign-in
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="auth-card-kicker">
              {isRegister ? "Start free" : "Welcome back"}
            </p>
            <h2>{isRegister ? "Create account" : "Log in"}</h2>
            <p>
              {isRegister
                ? "Your trial dashboard is ready after one step."
                : "Continue with your account or a social provider."}
            </p>
          </div>

          <div className="auth-social-grid">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="auth-social-button"
              disabled={!isOnline || Boolean(socialProvider)}
            >
              <GoogleIcon />{" "}
              {socialProvider === "google" ? "Opening..." : "Google"}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("microsoft")}
              className="auth-social-button"
              disabled={!isOnline || Boolean(socialProvider)}
            >
              <MicrosoftIcon />{" "}
              {socialProvider === "microsoft" ? "Opening..." : "Microsoft"}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              className="auth-social-button"
              disabled={!isOnline || Boolean(socialProvider)}
            >
              <AppleIcon />{" "}
              {socialProvider === "apple" ? "Opening..." : "Apple"}
            </button>
          </div>

          {!isOnline ? (
            <p className="auth-warning">
              You are currently offline. Email and social sign-in are paused
              until the connection returns.
            </p>
          ) : null}

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-step-block">
            {isRegister ? (
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ada Creator"
                  className="auth-input"
                />
              </div>
            ) : null}

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>

            {isRegister ? (
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  className="auth-input"
                />
              </div>
            ) : null}

            {error ? <p className="auth-error">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting || !isOnline}
              className="auth-primary-button"
            >
              {isSubmitting
                ? "Working..."
                : isRegister
                  ? "Create account"
                  : "Continue"}
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              {isRegister ? "Already have an account? " : "New here? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="auth-inline-link"
              >
                {isRegister ? "Sign in" : "Create one"}
              </button>
            </p>
            <Link to="/" className="auth-inline-link">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
