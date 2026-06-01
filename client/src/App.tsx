import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import { api } from './lib/api';
import { AuthUser, getStoredUser, getToken, logout, saveAuth } from './lib/auth';

const sidebarItems = ['Overview', 'Audience', 'Content', 'Revenue', 'Integrations', 'Reports', 'Billing', 'Settings'];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getToken()));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');

    if (token && email) {
      const nextUser = { name: name || email.split('@')[0] || 'Creator', email };
      saveAuth(token, nextUser);
      setUser(nextUser);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    api
      .get('/auth/me')
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
  }, []);

  const handleLogin = (authUser: AuthUser, token?: string) => {
    if (token) {
      saveAuth(token, authUser);
    } else {
      localStorage.setItem('creatorscope_user', JSON.stringify(authUser));
    }

    setUser(authUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = Boolean(user);

  if (isBootstrapping) {
    return <main className="boot-screen">Loading CreatorScope...</main>;
  }

  return (
    <div className={`app-shell ${isAuthenticated ? '' : 'app-shell--public'}`}>
      {isAuthenticated ? (
        <>
          <aside className="sidebar">
            <Link to="/dashboard" className="sidebar-brand">
              <div className="sidebar-mark">CS</div>
              <div>
                <p className="sidebar-brand-title">CreatorScope</p>
                <p className="sidebar-brand-subtitle">Creator OS</p>
              </div>
            </Link>

            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase() ?? 'C'}</div>
              <div>
                <p className="sidebar-user-name">{user?.name ?? 'Creator'}</p>
                <p className="sidebar-user-email">{user?.email ?? 'creator@creatorscope.app'}</p>
              </div>
            </div>

            <div className="sidebar-section-label">Workspace</div>
            <nav className="sidebar-nav">
              {sidebarItems.map((label) => (
                <Link key={label} to="/dashboard" className="sidebar-link">
                  <span className="sidebar-link-icon">●</span>
                  <span className="sidebar-link-label">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="sidebar-footer-note">Revenue intelligence online</div>
              <button type="button" onClick={handleLogout} className="sidebar-logout">
                Sign out
              </button>
            </div>
          </aside>

          <main className="dashboard-main">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className="public-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage user={user} onLogin={handleLogin} />} />
            <Route path="/auth/callback" element={<AuthPage user={user} onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;
