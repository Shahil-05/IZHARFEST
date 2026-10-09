import React, { useEffect, useState } from 'react';
import { festService } from '../../services/festService';
import { FestSettings } from '../../types/database';
import { Sparkles, Shield, Award, CheckCircle2, Trophy, Users, Database, Phone, MapPin } from 'lucide-react';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<FestSettings | null>(null);

  useEffect(() => {
    festService.getSettings().then(setSettings);
  }, []);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '1000px' }}>
      {/* Header with Academy Badge */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/logo.png"
            alt="IDC Academy"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(245, 158, 11, 0.7)',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.35)',
            }}
          />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Sparkles size={16} /> IDC ACADEMY CHIRAKKAL MARKAZ PERUMANNA
        </div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          <span className="fest-title-gold">IZHAR 2K26</span> Arts Fest
        </h1>
        <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>
          "മുസ്ലിം ജീവിതം കേരളീയ പൈതൃകം"
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
          {settings?.description ||
            'A premier inter-house arts and cultural championship celebrating linguistic eloquence, Islamic cultural heritage, intellectual debate, and stage excellence.'}
        </p>
      </div>

      {/* Official Poster Spotlight */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '3.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'linear-gradient(135deg, rgba(14, 20, 35, 0.8) 0%, rgba(8, 12, 22, 0.95) 100%)',
        }}
      >
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <img src="/poster.jpg" alt="Official Program Poster" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div>
          <div style={{ color: 'var(--gold)', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Official Festival Theme
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
            Kerala Islamic Cultural Heritage
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
            The 2026 edition of IZHAR Arts Fest is dedicated to exploring and honoring the centuries-old cultural, architectural, and spiritual legacy of Kerala's Islamic traditions — from Mampuram Maqam and historical Malabar mosques to classical literary arts, Qawali, and Mappila heritage.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)' }}>
            <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              📅 Oct 09 • 10 • 11, 2026
            </span>
            <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              📍 Chirakkal Markaz Campus
            </span>
          </div>
        </div>
      </div>

      {/* Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Intellectual Rigor
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Fostering eloquence, critical thought, classical Arabic & Malayalam elocution, debate, and creative prose.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Shield size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Cultural Tradition
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Preserving classical spiritual arts including Tajweed Quran recitation, sufi Qawali, Moulood, and Burdha ensembles.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Trophy size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Fair Competition
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Real-time verified scoring powered by PostgreSQL database rules. Group scores are credited only once per squad.
          </p>
        </div>
      </div>

      {/* Competition Rules & System Highlights */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
          Competition Scoring Governance
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
            <span>
              <strong>Rule 1 & 2:</strong> Every registered student represents exclusively one team throughout the fest, but may compete across multiple approved events.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
            <span>
              <strong>Rule 5 & 6:</strong> Group competition points are awarded directly to the team and are never multiplied by participant headcount.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
            <span>
              <strong>Rule 11 & 12:</strong> Only published results contribute to official team championship totals. Draft results remain private to ensure jury impartiality.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
            <span>
              <strong>Rule 13 & 14:</strong> Cumulative team points are dynamically calculated from published points plus committee bonuses minus validated penalties. Direct manual score overwriting is strictly disallowed.
            </span>
          </div>
        </div>
      </div>

      {/* Contact card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(8, 12, 22, 0.8) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
        }}
      >
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem', fontWeight: 800 }}>
          Fest Control & Official Inquiries
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          For registration queries, jury coordination, event timing details, and campus assistance:
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="tel:+918075055921"
            className="btn btn-primary btn-lg"
            style={{ gap: '0.5rem', textDecoration: 'none' }}
          >
            <Phone size={18} />
            <span>Call +91 8075 055 921</span>
          </a>

          <a
            href="https://wa.me/918075055921?text=Hello%20IDC%20Academy%20Izhar%20Fest%20Coordination"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-lg"
            style={{ gap: '0.5rem', textDecoration: 'none' }}
          >
            <span>WhatsApp Helpline</span>
          </a>
        </div>

        <div style={{ marginTop: '1.25rem', color: 'var(--text-faint)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <MapPin size={15} color="var(--gold)" />
          <span>{settings?.venue_general || 'IDC ACADEMY CHIRAKKAL MARKAZ PERUMANNA'}</span>
        </div>
      </div>
    </div>
  );
};
