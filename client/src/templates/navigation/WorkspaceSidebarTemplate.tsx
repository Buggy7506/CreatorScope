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
import { Link, useLocation } from "react-router-dom";

import type { AuthUser } from "../../lib/auth";

export type SidebarTemplateItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  disabledOffline?: boolean;
};

export const workspaceSidebarTemplate: SidebarTemplateItem[] = [
  { label: "Overview", icon: Home, path: "/dashboard" },
  { label: "Audience", icon: Users, path: "/audience" },
  { label: "Content History", icon: FolderClock, path: "/content-history" },
  { label: "Revenue", icon: BarChart3, path: "/revenue" },
  { label: "Integrations", icon: Plug, path: "/integrations", disabledOffline: true },
  { label: "Billing", icon: CreditCard, path: "/billing" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

type WorkspaceSidebarTemplateProps = {
  user: AuthUser | null;
  isOnline: boolean;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onLogout: () => void;
};

const WorkspaceSidebarTemplate = ({ user, isOnline, isCollapsed, onToggleCollapsed, onLogout }: WorkspaceSidebarTemplateProps) => {
  const location = useLocation();
  const sidebarStateClass = isCollapsed ? "sidebar--collapsed" : "";
  const isSidebarItemActive = (path: string) => location.pathname === path;

  return (
    <aside className={`sidebar ${sidebarStateClass}`} aria-label="CreatorScope workspace navigation">
      <div className="sidebar-topbar">
        <Link to="/dashboard/overview" className="sidebar-brand" title="CreatorScope dashboard">
          <div className="sidebar-mark">CS</div>
          <div className="sidebar-copy">
            <p className="sidebar-brand-title">CreatorScope</p>
            <p className="sidebar-brand-subtitle">Creator OS</p>
          </div>
        </Link>

        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-scroll-area">
        <div className="sidebar-user-card" title={`${user?.name ?? "Creator"} · ${user?.email ?? "creator@creatorscope.app"}`}>
          <div className="sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase() ?? "C"}</div>
          <div className="sidebar-copy">
            <p className="sidebar-user-name">{user?.name ?? "Creator"}</p>
            <p className="sidebar-user-email">{user?.email ?? "creator@creatorscope.app"}</p>
          </div>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav">
          {workspaceSidebarTemplate.map(({ label, icon: Icon, path, disabledOffline }) => {
            const isDisabled = !isOnline && disabledOffline;
            const isActive = isSidebarItemActive(path);

            return (
              <Link
                key={label}
                to={path}
                className={`sidebar-link ${isActive ? "sidebar-link--active" : ""} ${isDisabled ? "sidebar-link--disabled" : ""}`}
                title={isDisabled ? `${label} is unavailable offline` : label}
                aria-disabled={isDisabled}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => {
                  if (isDisabled) {
                    event.preventDefault();
                  }
                }}
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="sidebar-link-label">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className={`sidebar-status ${isOnline ? "sidebar-status--online" : "sidebar-status--offline"}`}>
          <span aria-hidden="true" />
          <p className="sidebar-footer-note">{isOnline ? "Revenue intelligence online" : "Offline mode active"}</p>
        </div>
        <button type="button" onClick={onLogout} className="sidebar-logout">
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
        <Link to="/settings" className="sidebar-profile-link">
          <UserCircle size={18} />
          <span>Account settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default WorkspaceSidebarTemplate;
