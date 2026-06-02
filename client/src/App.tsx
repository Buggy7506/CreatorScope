import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FolderClock,
  Home,
  LogOut,
  Plug,
  Settings,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Link,
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

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  disabledOffline?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { label: "Overview", icon: Home, path: "/dashboard?section=overview" },
  { label: "Audience", icon: Users, path: "/dashboard?section=audience" },
  { label: "Content History", icon: FolderClock, path: "/dashboard?section=content" },
  { label: "Revenue", icon: BarChart3, path: "/dashboard?section=revenue" },
  { label: "Integrations", icon: Plug, path: "/settings?section=integrations", disabledOffline: true },
  { label: "Billing", icon: CreditCard, path: "/settings?section=billing" },
  { label: "Settings", icon: Settings, path: "/settings?section=settings" },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useNetworkStatus();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getToken()));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      navigate("/dashboard", { replace: true });
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
        logout();
        setUser(null);
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
    navigate("/dashboard");
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
  const sidebarStateClass = isSidebarCollapsed ? "sidebar--collapsed" : "";

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
            <aside
              className={`sidebar ${sidebarStateClass}`}
              aria-label="CreatorScope workspace navigation"
            >
              <div className="sidebar-topbar">
                <Link
                  to="/dashboard"
                  className="sidebar-brand"
                  title="CreatorScope dashboard"
                >
                  <div className="sidebar-mark">CS</div>
                  <div className="sidebar-copy">
                    <p className="sidebar-brand-title">CreatorScope</p>
                    <p className="sidebar-brand-subtitle">Creator OS</p>
                  </div>
                </Link>

                <button
                  type="button"
                  className="sidebar-collapse-button"
                  onClick={() => setIsSidebarCollapsed((current) => !current)}
                  aria-label={
                    isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  title={
                    isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>
              </div>

              <div className="sidebar-scroll-area">
                <div
                  className="sidebar-user-card"
                  title={`${user?.name ?? "Creator"} · ${user?.email ?? "creator@creatorscope.app"}`}
                >
                  <div className="sidebar-user-avatar">
                    {user?.name?.charAt(0).toUpperCase() ?? "C"}
                  </div>
                  <div className="sidebar-copy">
                    <p className="sidebar-user-name">
                      {user?.name ?? "Creator"}
                    </p>
                    <p className="sidebar-user-email">
                      {user?.email ?? "creator@creatorscope.app"}
                    </p>
                  </div>
                </div>

                <div className="sidebar-section-label">Workspace</div>
                <nav className="sidebar-nav">
                  {sidebarItems.map(
                    ({ label, icon: Icon, path, disabledOffline }) => {
                      const isDisabled = !isOnline && disabledOffline;

                      return (
                        <Link
                          key={label}
                          to={path}
                          className={`sidebar-link ${isDisabled ? "sidebar-link--disabled" : ""}`}
                          title={
                            isDisabled
                              ? `${label} is unavailable offline`
                              : label
                          }
                          aria-disabled={isDisabled}
                          onClick={(event) => {
                            if (isDisabled) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <span
                            className="sidebar-link-icon"
                            aria-hidden="true"
                          >
                            <Icon size={18} strokeWidth={2} />
                          </span>
                          <span className="sidebar-link-label">{label}</span>
                        </Link>
                      );
                    },
                  )}
                </nav>
              </div>

              <div className="sidebar-footer">
                <div
                  className={`sidebar-status ${isOnline ? "sidebar-status--online" : "sidebar-status--offline"}`}
                >
                  <span aria-hidden="true" />
                  <p className="sidebar-footer-note">
                    {isOnline
                      ? "Revenue intelligence online"
                      : "Offline mode active"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="sidebar-logout"
                  title="Sign out"
                >
                  <LogOut size={17} />
                  <span className="sidebar-link-label">Sign out</span>
                </button>
                <Link
                  to="/settings?section=profile"
                  className="sidebar-profile-link"
                  title="Profile and preferences"
                >
                  <UserCircle size={18} />
                  <span className="sidebar-link-label">Profile</span>
                </Link>
              </div>
            </aside>

            <main className="dashboard-main">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/login"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={<DashboardPage user={user} isOnline={isOnline} />}
                />
                <Route
                  path="/settings"
                  element={<SettingsPage user={user} />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
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
