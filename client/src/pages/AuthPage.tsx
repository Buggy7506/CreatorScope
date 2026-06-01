import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { saveAuth } from '../lib/auth';

interface AuthPageProps {
  user: { name: string; email: string } | null;
  onLogin: (user: { name: string; email: string }) => void;
}

// SVG Icons for social logins
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 11.4V0H0v11.4h11.4z" fill="#00A4EF"/>
    <path d="M23 11.4V0H11.4v11.4H23z" fill="#7FBA00"/>
    <path d="M11.4 23v-11.4H0V23h11.4z" fill="#F25022"/>
    <path d="M23 23v-11.4H11.4V23H23z" fill="#FFB900"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 13.5c-.91 2.92 1.72 5.5 4.05 5.5 1.54 0 2.54-.63 2.54-2.02 0-1.42-.73-2.43-1.98-3.16-.6-.37-1.25-.56-1.98-.56-.35 0-.7.07-1.04.24M17.05 13.5c.91-2.92-1.72-5.5-4.05-5.5-1.54 0-2.54.63-2.54 2.02 0 1.42.73 2.43 1.98 3.16.6.37 1.25.56 1.98.56.35 0 .7-.07 1.04-.24m0 0c-1.97 0-3.57-1.6-3.57-3.57 0-1.97 1.6-3.57 3.57-3.57 1.97 0 3.57 1.6 3.57 3.57 0 1.97-1.6 3.57-3.57 3.57M8.95 19c-.5 0-.93-.43-.93-.93V4.93c0-.5.43-.93.93-.93h6.1c.5 0 .93.43.93.93v13.14c0 .5-.43.93-.93.93H8.95z"/>
  </svg>
);

const AuthPage = ({ user, onLogin }: AuthPageProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'identifier' | 'verify' | 'password'>('identifier');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.'
      );
    }

    return 'Something went wrong. Please try again.';
  };

  const handleContinue = () => {
    if (isRegister && !name.trim()) {
      setError('Please add your full name to continue.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setStep('verify');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Enter all required fields to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.toLowerCase();
      const payload = {
        email: normalizedEmail,
        password,
        ...(isRegister ? { name } : {}),
      };

      const response = await api.post('/auth/sign-in', payload);

      if (response.data?.token) {
        saveAuth(response.data.token);
      }

      const authUser = response.data?.user ?? {
        name: isRegister ? name : normalizedEmail.split('@')[0] || 'Creator',
        email: normalizedEmail,
      };

      onLogin(authUser);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'microsoft') => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/v1/connect/${provider}`;
    window.location.href = redirectUri;
  };

  return (
    <section className="auth-shell">
      <div className="auth-kicker-row">
        <div className="auth-brand-chip">CreatorScope</div>
        <div className="auth-brand-chip auth-brand-chip--soft">Secure access</div>
      </div>

      <div className="auth-grid">
        <div className="auth-copy">
          <div className="auth-copy-badge">Multi-platform creator intelligence</div>
          <h1 className="auth-copy-title">
            {isRegister ? 'Create your CreatorScope workspace' : 'Sign in to your creator workspace'}
          </h1>
          <p className="auth-copy-text">
            {isRegister
              ? 'Launch campaigns, monitor revenue, and centralize audience insights across every creator channel.'
              : 'Review analytics, manage campaigns, and keep your creator operations aligned from one secure panel.'}
          </p>

          <div className="auth-copy-list">
            <div className="auth-copy-item">Realtime channel analytics</div>
            <div className="auth-copy-item">Creator revenue tracking</div>
            <div className="auth-copy-item">Billing, reports & integrations</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-topline">
            <div>
              <p className="auth-card-label">Welcome</p>
              <h2 className="auth-card-title">{isRegister ? 'Register your account' : 'Sign in to continue'}</h2>
            </div>
            <div className="auth-mode-pill">{isRegister ? 'Register' : 'Sign in'}</div>
          </div>

          <div className="auth-switch-row">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
                setStep('identifier');
              }}
              className={`auth-switch ${!isRegister ? 'auth-switch--active' : ''}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
                setStep('identifier');
              }}
              className={`auth-switch ${isRegister ? 'auth-switch--active' : ''}`}
            >
              Register
            </button>
          </div>

          <div className="auth-provider-stack">
            <button 
              type="button" 
              className="auth-provider-button" 
              onClick={() => handleSocialLogin('google')}
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button 
              type="button" 
              className="auth-provider-button" 
              onClick={() => handleSocialLogin('microsoft')}
            >
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
            <button 
              type="button" 
              className="auth-provider-button" 
              onClick={() => handleSocialLogin('apple')}
            >
              <AppleIcon />
              Continue with Apple
            </button>
          </div>

          <div className="auth-divider"><span>OR</span></div>

          {step === 'identifier' && (
            <div className="auth-step-block">
              {isRegister ? (
                <div className="auth-field-group">
                  <label className="auth-field-label">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jordan Smith"
                    className="auth-input"
                  />
                </div>
              ) : null}

              <div className="auth-field-group">
                <label className="auth-field-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="auth-input"
                />
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <button type="button" onClick={handleContinue} className="auth-primary-button">
                Continue
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="auth-step-block">
              <div className="auth-verify-copy">
                <p className="auth-verify-title">Check your inbox</p>
                <p className="auth-verify-subtitle">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Verification code</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" className="auth-input auth-input--center" />
              </div>

              <div className="auth-step-actions">
                <button type="button" onClick={() => setStep('password')} className="auth-primary-button">
                  Verify code
                </button>
                <button type="button" className="auth-secondary-button">
                  Resend code
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleSubmit} className="auth-step-block">
              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="auth-input"
                />
              </div>

              {isRegister ? (
                <div className="auth-field-group">
                  <label className="auth-field-label">Confirm password</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="auth-input"
                  />
                </div>
              ) : null}

              {error ? <p className="auth-error">{error}</p> : null}

              <button type="submit" disabled={isSubmitting} className="auth-primary-button">
                {isSubmitting ? 'Working...' : isRegister ? 'Create account' : 'Continue'}
              </button>
            </form>
          )}

          <div className="auth-card-footer">
            <p>
              {isRegister ? 'Already have an account? ' : 'New here? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setStep('identifier');
                }}
                className="auth-inline-link"
              >
                {isRegister ? 'Sign in' : 'Create one'}
              </button>
            </p>
            <Link to="/" className="auth-inline-link">Back to home</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
