import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { festService } from '../services/festService';
import { FestSettings } from '../types/database';
import { ConnectionBanner } from './ConnectionBanner';
import { Shield, Sparkles, Heart, Phone } from 'lucide-react';
import { ASSETS } from '../constants/assets';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FestSettings | null>(null);

  useEffect(() => {
    festService.getSettings().then(setSettings);
  }, []);

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 8, 15, 0.95)',
        padding: '3.5rem 0 2rem',
        marginTop: '5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img
                src={ASSETS.LOGO}
                alt="IDC Academy"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(245, 158, 11, 0.6)',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, lineHeight: 1.15 }}>
                  <span className="fest-title-gold">IZHAR 2K26</span>
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  IDC ACADEMY CHIRAKKAL MARKAZ
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
              "മുസ്ലിം ജീവിതം കേരളീയ പൈതൃകം" — Annual Arts, Cultural & Academic Fest celebrating creativity, knowledge, and camaraderie.
            </p>
            <ConnectionBanner />
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '1rem' }}>
              Quick Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <Link to="/events" style={{ transition: 'color 0.15s' }}>All Events</Link>
              <Link to="/schedule" style={{ transition: 'color 0.15s' }}>Program Schedule</Link>
              <Link to="/results" style={{ transition: 'color 0.15s' }}>Official Results & Leaderboard</Link>
              <Link to="/teams" style={{ transition: 'color 0.15s' }}>Competing Teams</Link>
              <Link to="/about" style={{ transition: 'color 0.15s' }}>About Fest & Rules</Link>
            </div>
          </div>

          {/* Col 3: Contact & Campus */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '1rem' }}>
              Venue & Contact
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.65rem' }}>
              <strong>Campus:</strong> {settings?.venue_general || 'IDC ACADEMY CHIRAKKAL MARKAZ PERUMANNA'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Phone size={14} color="var(--gold)" />
              <strong>Contact:</strong>{' '}
              <a
                href="tel:+918075055921"
                style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 700 }}
              >
                {settings?.contact_info || '+91 8075 055 921'}
              </a>
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-faint)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>© {settings?.fest_year || '2026'} {settings?.fest_name || 'IZHAR FEST'}. All rights reserved.</span>
            {/* Discreet admin portal access */}
            <Link
              to="/admin/login"
              style={{
                color: 'var(--text-faint)',
                opacity: 0.25,
                transition: 'opacity 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.25')}
              title="Admin Portal Access"
              aria-label="Admin Portal"
            >
              <Shield size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Designed by <strong style={{ color: 'var(--gold)', fontWeight: 700 }}>Shahil-05</strong></span>
            <Sparkles size={14} color="var(--gold)" />
          </div>
        </div>
      </div>
    </footer>
  );
};
