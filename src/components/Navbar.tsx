import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { festService } from '../services/festService';
import { useAuth } from '../context/AuthContext';
import { FestSettings } from '../types/database';
import { ConnectionBanner } from './ConnectionBanner';
import { Trophy, Calendar, Award, Users, Info, Shield, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [settings, setSettings] = useState<FestSettings | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    festService.getSettings().then(setSettings);
    const handler = () => {
      festService.getSettings().then(setSettings);
    };
    window.addEventListener('izhar_db_updated', handler);

    // Discreet shortcut for Fest Admins: Alt + A or Ctrl + Shift + A
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('izhar_db_updated', handler);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [navigate]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Events', path: '/events', icon: Award },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Results', path: '/results', icon: Trophy },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="IDC Academy"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(245, 158, 11, 0.6)',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
              background: '#0d162a',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: '1.3rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              <span className="fest-title-gold">IZHAR 2K26</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              IDC ACADEMY • CHIRAKKAL MARKAZ
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.35rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? 'var(--gold)' : 'currentColor'} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ConnectionBanner />

          {/* Only visible when authenticated as fest admin */}
          {session?.isAdmin && (
            <Link to="/admin" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <Shield size={14} color="var(--gold)" />
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem 1.5rem 1.5rem',
            background: 'rgba(10, 15, 26, 0.98)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--gold)' : 'currentColor'} />
                {link.name}
              </Link>
            );
          })}

          {/* Admin link for authenticated users only in mobile drawer */}
          {session?.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
            >
              <Shield size={14} color="var(--gold)" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
