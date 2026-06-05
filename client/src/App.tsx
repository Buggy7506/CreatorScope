import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";
import { api } from "./lib/api";
import {
  AuthUser,
  getStoredUser,
  getToken,
  logout,
  saveAuth,
} from "./lib/auth";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import WorkspaceSidebarTemplate from "./templates/navigation/WorkspaceSidebarTemplate";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useNetworkStatus();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getToken()));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem("creatorscope_sidebar_collapsed") === "true");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");

    if (token && email) {
      const nextUser = {
        name: name || email.split("@")[0] || "Creator",
        email,
      };
      saveAuth(token, nextUser);
      setUser(nextUser);
      navigate("/dashboard/overview", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const token = getToken();

    if (!token || !isOnline) {
      setIsBootstrapping(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        const authUser = response.data?.user ?? response.data;
        if (authUser?.email) {
          saveAuth(token, authUser);
          setUser(authUser);
        }
      })
      .catch(() => {
        // Keep the locally saved session on transient API failures so a refresh
        // does not unexpectedly return creators to the public landing page.
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      })
      .finally(() => setIsBootstrapping(false));
  }, [isOnline]);

  const handleLogin = (authUser: AuthUser, token?: string) => {
    if (token) {
      saveAuth(token, authUser);
    } else {
      localStorage.setItem("creatorscope_user", JSON.stringify(authUser));
    }

    setUser(authUser);
    navigate("/dashboard/overview");
  };

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setUser(null);
    setIsLogoutDialogOpen(false);
    navigate("/");
  };

  const isAuthenticated = Boolean(user);
  useEffect(() => {
    localStorage.setItem("creatorscope_sidebar_collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  if (isBootstrapping) {
    return <main className="boot-screen">Loading CreatorScope...</main>;
  }

  return (
    <ErrorBoundary>
      <div
        className={`app-shell ${isAuthenticated ? "" : "app-shell--public"}`}
      >
        {isAuthenticated ? (
          <>
            <WorkspaceSidebarTemplate
              user={user}
              isOnline={isOnline}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
              onLogout={handleLogout}
            />

            <main className="dashboard-main">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard/overview" replace />}
                />
                <Route
                  path="/login"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={<DashboardPage section="overview" user={user} isOnline={isOnline} />}
                />
                <Route
                  path="/audience"
                  element={<DashboardPage section="audience" user={user} isOnline={isOnline} />}
                />
                <Route
                  path="/content-history"
                  element={<DashboardPage section="content" user={user} isOnline={isOnline} />}
                />
                <Route
                  path="/revenue"
                  element={<DashboardPage section="revenue" user={user} isOnline={isOnline} />}
                />
                <Route
                  path="/profile"
                  element={<SettingsPage section="profile" user={user} />}
                />
                <Route
                  path="/integrations"
                  element={<SettingsPage section="integrations" user={user} />}
                />
                <Route
                  path="/billing"
                  element={<SettingsPage section="billing" user={user} />}
                />
                <Route
                  path="/settings"
                  element={<SettingsPage section="settings" user={user} />}
                />
                <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="/dashboard/overview" element={<DashboardPage user={user} isOnline={isOnline} section="overview" />} />
                <Route path="/dashboard/audience" element={<DashboardPage user={user} isOnline={isOnline} section="audience" />} />
                <Route path="/dashboard/content-history" element={<DashboardPage user={user} isOnline={isOnline} section="content" />} />
                <Route path="/dashboard/revenue" element={<DashboardPage user={user} isOnline={isOnline} section="revenue" />} />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard/overview" replace />}
                />
              </Routes>
            </main>

            {isLogoutDialogOpen ? (
              <div className="confirm-dialog-backdrop" role="presentation">
                <div
                  className="confirm-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sign-out-dialog-title"
                >
                  <p className="confirm-dialog-kicker">Confirm sign out</p>
                  <h2 id="sign-out-dialog-title">Sign out of CreatorScope?</h2>
                  <p>
                    Your current workspace will close and you will need to sign in again
                    to view protected analytics, billing, and integrations.
                  </p>
                  <div className="confirm-dialog-actions">
                    <button
                      type="button"
                      className="confirm-dialog-secondary"
                      onClick={() => setIsLogoutDialogOpen(false)}
                    >
                      Stay signed in
                    </button>
                    <button
                      type="button"
                      className="confirm-dialog-primary"
                      onClick={confirmLogout}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <main className="public-main">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<LandingPage />} />
              <Route path="/analytics" element={<LandingPage />} />
              <Route path="/integrations" element={<LandingPage />} />
              <Route path="/pricing" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <AuthPage
                    user={user}
                    onLogin={handleLogin}
                    isOnline={isOnline}
                  />
                }
              />
              <Route
                path="/auth/callback"
                element={
                  <AuthPage
                    user={user}
                    onLogin={handleLogin}
                    isOnline={isOnline}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/audience"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/content-history"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/revenue"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/profile"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/billing"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/settings"
                element={<Navigate to="/login" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
