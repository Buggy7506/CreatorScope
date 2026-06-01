import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import { logout } from './lib/auth';

const sidebarItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Audience', href: '/audience' },
  { label: 'Content', href: '/content' },
  { label: 'Revenue', href: '/revenue' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Reports', href: '/reports' },
  { label: 'Billing', href: '/billing' },
  { label: 'Support', href: '/support' },
  { label: 'Settings', href: '/settings' },
  { label: 'Compliance', href: '/compliance' },
];

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('creatorscope_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (authUser: { name: string; email: string }) => {
    localStorage.setItem('creatorscope_user', JSON.stringify(authUser));
    setUser(authUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('creatorscope_user');
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = Boolean(user);

  return (
    <div className={`app-shell ${isAuthenticated ? '' : 'app-shell--public'}`}>
      {isAuthenticated ? (
        <>
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-mark">CS</div>
              <div>
                <p className="sidebar-brand-title">CreatorScope</p>
                <p className="sidebar-brand-subtitle">Command center</p>
              </div>
            </div>

            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase() ?? 'C'}</div>
              <div>
                <p className="sidebar-user-name">{user?.name ?? 'Creator'}</p>
                <p className="sidebar-user-email">{user?.email ?? 'creator@creatorscope.app'}</p>
              </div>
            </div>

            <div className="sidebar-section-label">Workspace</div>
            <nav className="sidebar-nav">
              {sidebarItems.map((item) => (
                <Link key={item.href} to="/dashboard" className="sidebar-link">
                  <span className="sidebar-link-icon">↗</span>
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="sidebar-footer-note">AI-powered insights loaded</div>
              <button type="button" onClick={handleLogout} className="sidebar-logout">
                Sign out
              </button>
            </div>
          </aside>

          <main className="dashboard-main">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />}
              />
            </Routes>
          </main>
        </>
      ) : (
        <main className="public-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage user={user} onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;
