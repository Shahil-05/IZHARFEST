import React, { useState } from 'react';
import { useSupabaseConfig } from '../context/SupabaseConfigContext';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isConfigured, projectUrl, anonKey, connectionStatus, statusMessage, saveConfig, resetToDemo, testConnection } =
    useSupabaseConfig();

  const [url, setUrl] = useState(projectUrl);
  const [key, setKey] = useState(anonKey);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'connect' | 'sql'>('connect');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    await saveConfig(url, key);
    setTesting(false);
  };

  const handleCopySql = () => {
    const sqlScript = `-- IZHAR FEST DATABASE MIGRATION
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.fest_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fest_name TEXT NOT NULL DEFAULT 'IZHAR FEST 2026',
    fest_year TEXT NOT NULL DEFAULT '2026',
    description TEXT DEFAULT 'Annual Arts, Cultural & Academic Fest celebrating creativity, knowledge, and camaraderie.',
    logo_url TEXT DEFAULT '',
    contact_info TEXT DEFAULT '+91 8075 055 921',
    venue_general TEXT DEFAULT 'IDC Academy, Chirakkal Markaz, Perumanna',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    flag_color TEXT NOT NULL,
    theme_accent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class_batch TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.team_leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_team_leader UNIQUE (team_id, participant_id)
);

CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('individual', 'group')),
    category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    description TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    result_status TEXT NOT NULL DEFAULT 'not_entered' CHECK (result_status IN ('not_entered', 'draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scoring_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    event_type TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scoring_template_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.scoring_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.event_scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_participant UNIQUE (event_id, participant_id)
);

CREATE TABLE IF NOT EXISTS public.event_team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    assignment_mode TEXT NOT NULL CHECK (assignment_mode IN ('entire_team', 'selected_participants')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_team UNIQUE (event_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    scoring_rule_id UUID REFERENCES public.event_scoring_rules(id) ON DELETE SET NULL,
    result_label TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.team_point_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('bonus', 'penalty')),
    reason TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.program_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    schedule_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.leaderboard_view AS
WITH published_event_points AS (
    SELECT er.team_id, COALESCE(SUM(er.points), 0)::INTEGER AS event_points
    FROM public.event_results er
    INNER JOIN public.events e ON e.id = er.event_id
    WHERE e.result_status = 'published'
    GROUP BY er.team_id
),
team_adjustments AS (
    SELECT tpa.team_id,
        COALESCE(SUM(CASE WHEN tpa.adjustment_type = 'penalty' THEN -1 * ABS(tpa.points) ELSE ABS(tpa.points) END), 0)::INTEGER AS adjustment_points
    FROM public.team_point_adjustments tpa
    GROUP BY tpa.team_id
)
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.flag_color,
    t.theme_accent,
    COALESCE(pep.event_points, 0) AS event_points,
    COALESCE(ta.adjustment_points, 0) AS adjustment_points,
    (COALESCE(pep.event_points, 0) + COALESCE(ta.adjustment_points, 0))::INTEGER AS total_points,
    DENSE_RANK() OVER (ORDER BY (COALESCE(pep.event_points, 0) + COALESCE(ta.adjustment_points, 0)) DESC, t.name ASC)::INTEGER AS rank
FROM public.teams t
LEFT JOIN published_event_points pep ON pep.team_id = t.id
LEFT JOIN team_adjustments ta ON ta.team_id = t.id;

-- Seed Teams:
INSERT INTO public.teams (name, flag_color, theme_accent)
VALUES 
('TEAM WIRAS', '#f8fafc', '#cbd5e1'),
('TEAM SULUK', '#ef4444', '#dc2626'),
('TEAM DIRAYA', '#3b82f6', '#2563eb')
ON CONFLICT (name) DO NOTHING;
`;
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Supabase Database Configuration</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Connect live Supabase project or explore via local database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            className={`btn btn-sm ${tab === 'connect' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('connect')}
          >
            Credentials & Status
          </button>
          <button
            className={`btn btn-sm ${tab === 'sql' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('sql')}
          >
            View SQL Migrations
          </button>
        </div>

        {tab === 'connect' ? (
          <div>
            {/* Status box */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background:
                  connectionStatus === 'connected'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : connectionStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(59, 130, 246, 0.12)',
                border:
                  connectionStatus === 'connected'
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : connectionStatus === 'error'
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {connectionStatus === 'connected' ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle size={20} color="#ef4444" />
              ) : (
                <Database size={20} color="#3b82f6" />
              )}
              <div style={{ flex: 1, fontSize: '0.85rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                  {connectionStatus === 'connected'
                    ? 'Connected to Live Supabase'
                    : connectionStatus === 'error'
                    ? 'Connection Error'
                    : 'Local Demo Database Active'}
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>{statusMessage}</span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Supabase Project URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supabase Anon / Public Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                {isConfigured && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={resetToDemo}>
                    Reset to Local Database
                  </button>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={testing}
                    onClick={async () => {
                      setTesting(true);
                      await testConnection();
                      setTesting(false);
                    }}
                  >
                    <RefreshCw size={14} className={testing ? 'animate-spin' : ''} /> Test Ping
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={testing || !url || !key}>
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Run this SQL script in your Supabase project's SQL Editor to set up all tables, RLS policies, views, and initial seed teams.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopySql}>
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
              </button>
            </div>
            <pre
              style={{
                background: '#0a0f1d',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                color: '#93c5fd',
              }}
            >
              {`-- Tables created:
-- 1. fest_settings
-- 2. teams (TEAM WIRAS, TEAM SULUK, TEAM DIRAYA)
-- 3. participants & team_leaders
-- 4. event_categories & events
-- 5. scoring_templates & rules
-- 6. event_scoring_rules & event_participants
-- 7. event_team_assignments & event_results
-- 8. team_point_adjustments & program_schedule
-- 9. leaderboard_view (DENSE_RANK calculation)`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
