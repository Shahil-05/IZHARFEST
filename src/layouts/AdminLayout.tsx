import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConnectionBanner } from '../components/ConnectionBanner';
import {
  LayoutDashboard,
  Users,
  Flag,
  Award,
  UserCheck,
  Trophy,
  Sliders,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { session, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(245, 158, 11, 0.2)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  // Protected route check
  if (!session.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Participants', path: '/admin/participants', icon: Users },
    { label: 'Teams', path: '/admin/teams', icon: Flag },
    { label: 'Events', path: '/admin/events', icon: Award },
    { label: 'Assignments', path: '/admin/assignments', icon: UserCheck },
    { label: 'Results & Scores', path: '/admin/results', icon: Trophy },
    { label: 'Point Adjustments', path: '/admin/adjustments', icon: Sliders },
    { label: 'Program Schedule', path: '/admin/schedule', icon: Calendar },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070a12' }}>
      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 998,
          }}
          className="admin-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: '#0d1322',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: sidebarOpen ? 0 : '-260px',
          transition: 'left 0.25s ease',
        }}
        className="admin-sidebar"
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="IDC Academy"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(245, 158, 11, 0.6)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)',
              }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                IZHAR 2K26
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>IDC Academy Admin</div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} color={isActive ? 'var(--gold)' : 'currentColor'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <ConnectionBanner />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '0.75rem' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
              {session.user?.email}
            </span>
            <span className="badge badge-published" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              {session.user?.role?.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/"
              target="_blank"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
              title="Open Public Website"
            >
              <ExternalLink size={12} /> Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem' }}
              title="Sign Out"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main-wrap">
        {/* Top Header bar */}
        <header
          style={{
            height: '65px',
            background: 'rgba(13, 19, 34, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '6px',
                color: '#fff',
                cursor: 'pointer',
              }}
              className="mobile-open-btn"
            >
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {menuItems.find((m) => m.path === location.pathname)?.label || 'Admin Portal'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link to="/" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
              <ExternalLink size={13} /> View Fest Website
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (min-width: 960px) {
          .admin-sidebar {
            position: sticky !important;
            left: 0 !important;
            height: 100vh !important;
          }
          .mobile-close-btn { display: none !important; }
          .mobile-open-btn { display: none !important; }
          .admin-overlay { display: none !important; }
        }
      `}</style>
    </div>
  );
};
