-- ==============================================================================
-- IZHAR FEST — COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA & SEED
-- ==============================================================================
-- Description: Sets up all tables, relations, security policies, and initial
-- seed data (Fest Settings, Teams, Participants, Leaders, Categories, Scoring
-- Templates, Events, Results, Point Adjustments, and Program Schedule).
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. FEST SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fest_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fest_name TEXT NOT NULL DEFAULT 'IZHAR 2K26',
    fest_year TEXT NOT NULL DEFAULT '2026',
    description TEXT DEFAULT 'Annual Arts, Cultural & Academic Fest celebrating Kerala Islamic heritage, creativity, and camaraderie.',
    logo_url TEXT DEFAULT '/logo.png',
    contact_info TEXT DEFAULT '+91 8075 055 921',
    venue_general TEXT DEFAULT 'IDC Academy, Chirakkal Markaz, Perumanna',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TEAMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    flag_color TEXT NOT NULL,
    theme_accent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. PARTICIPANTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class_batch TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TEAM LEADERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_team_leader UNIQUE (team_id, participant_id)
);

-- ------------------------------------------------------------------------------
-- 5. EVENT CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ------------------------------------------------------------------------------
-- 7. SCORING TEMPLATES & RULES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scoring_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_type TEXT DEFAULT 'all' CHECK (event_type IN ('individual', 'group', 'all')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scoring_template_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.scoring_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 8. EVENT SCORING RULES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. EVENT PARTICIPANTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_participant UNIQUE (event_id, participant_id)
);

-- ------------------------------------------------------------------------------
-- 10. EVENT TEAM ASSIGNMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_team_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    assignment_mode TEXT NOT NULL CHECK (assignment_mode IN ('entire_team', 'selected_participants')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_team UNIQUE (event_id, team_id)
);

-- ------------------------------------------------------------------------------
-- 11. EVENT RESULTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    scoring_rule_id UUID REFERENCES public.event_scoring_rules(id) ON DELETE SET NULL,
    result_label TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 12. TEAM POINT ADJUSTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_point_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('bonus', 'penalty')),
    reason TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 13. PROGRAM SCHEDULE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.program_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ------------------------------------------------------------------------------
-- 14. ADMIN PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'judge')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 15. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON public.participants(team_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_result_status ON public.events(result_status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_participant ON public.event_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_results_event ON public.event_results(event_id);
CREATE INDEX IF NOT EXISTS idx_event_results_team ON public.event_results(team_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_team ON public.team_point_adjustments(team_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON public.program_schedule(schedule_date);

-- ------------------------------------------------------------------------------
-- 16. LEADERBOARD VIEW
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.leaderboard_view AS
WITH published_event_points AS (
    SELECT 
        er.team_id,
        COALESCE(SUM(er.points), 0)::INTEGER AS event_points
    FROM public.event_results er
    INNER JOIN public.events e ON e.id = er.event_id
    WHERE e.result_status = 'published'
    GROUP BY er.team_id
),
team_adjustments AS (
    SELECT 
        tpa.team_id,
        COALESCE(SUM(
            CASE 
                WHEN tpa.adjustment_type = 'penalty' THEN -1 * ABS(tpa.points)
                ELSE ABS(tpa.points)
            END
        ), 0)::INTEGER AS adjustment_points
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
    DENSE_RANK() OVER (
        ORDER BY (COALESCE(pep.event_points, 0) + COALESCE(ta.adjustment_points, 0)) DESC, t.name ASC
    )::INTEGER AS rank
FROM public.teams t
LEFT JOIN published_event_points pep ON pep.team_id = t.id
LEFT JOIN team_adjustments ta ON ta.team_id = t.id;

-- ------------------------------------------------------------------------------
-- 17. SCHEMA PERMISSIONS (GRANTS)
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.fest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_template_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_point_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Clean existing policies safely and idempotently
DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOR tbl, pol IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
    END LOOP;
END $$;

-- Public READ (SELECT) Policies for all visitors (Frontend & Public Webapp)
CREATE POLICY "Public can view fest settings" ON public.fest_settings FOR SELECT USING (true);
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Public can view team leaders" ON public.team_leaders FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public can view scoring templates" ON public.scoring_templates FOR SELECT USING (true);
CREATE POLICY "Public can view template rules" ON public.scoring_template_rules FOR SELECT USING (true);
CREATE POLICY "Public can view scoring rules" ON public.event_scoring_rules FOR SELECT USING (true);
CREATE POLICY "Public can view event participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Public can view event team assignments" ON public.event_team_assignments FOR SELECT USING (true);
CREATE POLICY "Public can view schedule" ON public.program_schedule FOR SELECT USING (true);
CREATE POLICY "Public can view adjustments" ON public.team_point_adjustments FOR SELECT USING (true);
CREATE POLICY "Public can view event results" ON public.event_results FOR SELECT USING (true);
CREATE POLICY "Public can view admin profiles" ON public.admin_profiles FOR SELECT USING (true);

-- Full Management (INSERT, UPDATE, DELETE) Policies for Admin Portal
CREATE POLICY "Manage fest settings" ON public.fest_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage teams" ON public.teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage participants" ON public.participants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage team leaders" ON public.team_leaders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage categories" ON public.event_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage events" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage scoring templates" ON public.scoring_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage template rules" ON public.scoring_template_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage event scoring rules" ON public.event_scoring_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage event participants" ON public.event_participants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage event team assignments" ON public.event_team_assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage event results" ON public.event_results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage adjustments" ON public.team_point_adjustments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage schedule" ON public.program_schedule FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Manage admin profiles" ON public.admin_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 19. CORE SEED DATA (Fest, Teams, Participants, Events, Schedule, Results)
-- ------------------------------------------------------------------------------

-- 19.1 Fest Settings
INSERT INTO public.fest_settings (fest_name, fest_year, description, logo_url, contact_info, venue_general)
VALUES (
    'IZHAR 2K26',
    '2026',
    'Annual Arts, Cultural & Academic Fest celebrating Kerala Islamic heritage, creativity, and camaraderie.',
    '/logo.png',
    '+91 8075 055 921',
    'IDC Academy, Chirakkal Markaz, Perumanna'
)
ON CONFLICT DO NOTHING;

-- 19.2 Event Categories
INSERT INTO public.event_categories (name, description) VALUES
('Literary', 'Debates, speeches, and creative writing'),
('Arts & Stage', 'Dramatics, mime, and performance arts'),
('Islamic Cultural', 'Qawali, Moulood, Burdha, and recitation'),
('Media & IT', 'Coding, digital media, photography, and design')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 19.3 Scoring Templates
DO $$
DECLARE
    ind_tpl_id UUID;
    grp_tpl_id UUID;
    grd_tpl_id UUID;
BEGIN
    SELECT id INTO ind_tpl_id FROM public.scoring_templates WHERE name = 'Individual Standard (1st, 2nd, 3rd)';
    IF ind_tpl_id IS NULL THEN
        INSERT INTO public.scoring_templates (name, event_type)
        VALUES ('Individual Standard (1st, 2nd, 3rd)', 'individual')
        RETURNING id INTO ind_tpl_id;

        INSERT INTO public.scoring_template_rules (template_id, label, points, sort_order) VALUES
        (ind_tpl_id, '1st Position', 20, 1),
        (ind_tpl_id, '2nd Position', 15, 2),
        (ind_tpl_id, '3rd Position', 10, 3);
    END IF;

    SELECT id INTO grp_tpl_id FROM public.scoring_templates WHERE name = 'Group Standard (1st, 2nd, 3rd)';
    IF grp_tpl_id IS NULL THEN
        INSERT INTO public.scoring_templates (name, event_type)
        VALUES ('Group Standard (1st, 2nd, 3rd)', 'group')
        RETURNING id INTO grp_tpl_id;

        INSERT INTO public.scoring_template_rules (template_id, label, points, sort_order) VALUES
        (grp_tpl_id, '1st Position', 30, 1),
        (grp_tpl_id, '2nd Position', 20, 2),
        (grp_tpl_id, '3rd Position', 10, 3);
    END IF;

    SELECT id INTO grd_tpl_id FROM public.scoring_templates WHERE name = 'Grade-based Scoring (A, B, C)';
    IF grd_tpl_id IS NULL THEN
        INSERT INTO public.scoring_templates (name, event_type)
        VALUES ('Grade-based Scoring (A, B, C)', 'all')
        RETURNING id INTO grd_tpl_id;

        INSERT INTO public.scoring_template_rules (template_id, label, points, sort_order) VALUES
        (grd_tpl_id, 'A Grade', 10, 1),
        (grd_tpl_id, 'B Grade', 7, 2),
        (grd_tpl_id, 'C Grade', 5, 3);
    END IF;
END $$;

-- 19.4 Teams, Participants, Leaders, Events, Results & Schedule
DO $$
DECLARE
    wiras_id UUID;
    suluk_id UUID;
    diraya_id UUID;

    cat_lit UUID;
    cat_isl UUID;
    cat_art UUID;
    cat_med UUID;

    p_riyas UUID;
    p_hafeel UUID;
    p_shahil UUID;
    p_nihal UUID;
    p_shakeeb UUID;
    p_arun UUID;
    p_amal UUID;
    p_midlaj UUID;
    p_anfas UUID;
    p_rahul UUID;

    ev_speech UUID;
    ev_qawali UUID;
    ev_quran UUID;
    ev_debate UUID;

    sr_sp1 UUID;
    sr_sp2 UUID;
    sr_sp3 UUID;
    sr_qw1 UUID;
    sr_qw2 UUID;
    sr_qw3 UUID;
BEGIN
    -- 1. Teams
    INSERT INTO public.teams (name, flag_color, theme_accent)
    VALUES ('TEAM WIRAS', '#f8fafc', '#cbd5e1')
    ON CONFLICT (name) DO UPDATE SET flag_color = EXCLUDED.flag_color, theme_accent = EXCLUDED.theme_accent
    RETURNING id INTO wiras_id;
    IF wiras_id IS NULL THEN SELECT id INTO wiras_id FROM public.teams WHERE name = 'TEAM WIRAS'; END IF;

    INSERT INTO public.teams (name, flag_color, theme_accent)
    VALUES ('TEAM SULUK', '#ef4444', '#dc2626')
    ON CONFLICT (name) DO UPDATE SET flag_color = EXCLUDED.flag_color, theme_accent = EXCLUDED.theme_accent
    RETURNING id INTO suluk_id;
    IF suluk_id IS NULL THEN SELECT id INTO suluk_id FROM public.teams WHERE name = 'TEAM SULUK'; END IF;

    INSERT INTO public.teams (name, flag_color, theme_accent)
    VALUES ('TEAM DIRAYA', '#3b82f6', '#2563eb')
    ON CONFLICT (name) DO UPDATE SET flag_color = EXCLUDED.flag_color, theme_accent = EXCLUDED.theme_accent
    RETURNING id INTO diraya_id;
    IF diraya_id IS NULL THEN SELECT id INTO diraya_id FROM public.teams WHERE name = 'TEAM DIRAYA'; END IF;

    -- Categories lookup
    SELECT id INTO cat_lit FROM public.event_categories WHERE name = 'Literary';
    SELECT id INTO cat_isl FROM public.event_categories WHERE name = 'Islamic Cultural';
    SELECT id INTO cat_art FROM public.event_categories WHERE name = 'Arts & Stage';
    SELECT id INTO cat_med FROM public.event_categories WHERE name = 'Media & IT';

    -- 2. Participants
    -- Wiras members
    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('WIR-001', 'Muhammed Riyas', 'Senior Batch A', wiras_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_riyas;
    IF p_riyas IS NULL THEN SELECT id INTO p_riyas FROM public.participants WHERE participant_code = 'WIR-001'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('WIR-002', 'Abdul Hafeel', 'Senior Batch B', wiras_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_hafeel;
    IF p_hafeel IS NULL THEN SELECT id INTO p_hafeel FROM public.participants WHERE participant_code = 'WIR-002'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('WIR-003', 'Shahil Mohammed', 'Junior Batch A', wiras_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_shahil;
    IF p_shahil IS NULL THEN SELECT id INTO p_shahil FROM public.participants WHERE participant_code = 'WIR-003'; END IF;

    -- Suluk members
    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-001', 'Nihal Najeeb', 'Senior Batch A', suluk_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_nihal;
    IF p_nihal IS NULL THEN SELECT id INTO p_nihal FROM public.participants WHERE participant_code = 'SLK-001'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-002', 'Shakeeb Arsal', 'Senior Batch C', suluk_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_shakeeb;
    IF p_shakeeb IS NULL THEN SELECT id INTO p_shakeeb FROM public.participants WHERE participant_code = 'SLK-002'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-003', 'Arun Kumar', 'Junior Batch B', suluk_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_arun;
    IF p_arun IS NULL THEN SELECT id INTO p_arun FROM public.participants WHERE participant_code = 'SLK-003'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-004', 'Amal Farooq', 'Senior Batch B', suluk_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_amal;
    IF p_amal IS NULL THEN SELECT id INTO p_amal FROM public.participants WHERE participant_code = 'SLK-004'; END IF;

    -- Diraya members
    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('DRY-001', 'Muhammed Midlaj', 'Senior Batch B', diraya_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_midlaj;
    IF p_midlaj IS NULL THEN SELECT id INTO p_midlaj FROM public.participants WHERE participant_code = 'DRY-001'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('DRY-002', 'Muhammed Anfas', 'Senior Batch A', diraya_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_anfas;
    IF p_anfas IS NULL THEN SELECT id INTO p_anfas FROM public.participants WHERE participant_code = 'DRY-002'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('DRY-003', 'Rahul Krishnan', 'Junior Batch A', diraya_id)
    ON CONFLICT (participant_code) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
    RETURNING id INTO p_rahul;
    IF p_rahul IS NULL THEN SELECT id INTO p_rahul FROM public.participants WHERE participant_code = 'DRY-003'; END IF;

    -- 3. Team Leaders Link
    INSERT INTO public.team_leaders (team_id, participant_id) VALUES
    (wiras_id, p_riyas),
    (wiras_id, p_hafeel),
    (suluk_id, p_nihal),
    (suluk_id, p_shakeeb),
    (diraya_id, p_midlaj),
    (diraya_id, p_anfas)
    ON CONFLICT (team_id, participant_id) DO NOTHING;

    -- 4. Events
    -- Event 1: Malayalam Elocution (Individual, Completed, Published)
    SELECT id INTO ev_speech FROM public.events WHERE name = 'Malayalam Elocution';
    IF ev_speech IS NULL THEN
        INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
        VALUES ('Malayalam Elocution', 'individual', cat_lit, 'Time limit: 5 minutes. Topics announced 10 minutes prior.', CURRENT_DATE, '09:30:00', '11:00:00', 'Auditorium Stage 1', 'completed', 'published')
        RETURNING id INTO ev_speech;

        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_speech, '1st Position', 20, 1) RETURNING id INTO sr_sp1;
        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_speech, '2nd Position', 15, 2) RETURNING id INTO sr_sp2;
        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_speech, '3rd Position', 10, 3) RETURNING id INTO sr_sp3;

        INSERT INTO public.event_participants (event_id, participant_id) VALUES
        (ev_speech, p_shahil),
        (ev_speech, p_arun),
        (ev_speech, p_rahul)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.event_results (event_id, participant_id, team_id, scoring_rule_id, result_label, points) VALUES
        (ev_speech, p_shahil, wiras_id, sr_sp1, '1st Position', 20),
        (ev_speech, p_arun, suluk_id, sr_sp2, '2nd Position', 15),
        (ev_speech, p_rahul, diraya_id, sr_sp3, '3rd Position', 10);
    END IF;

    -- Event 2: Traditional Qawali (Group, Completed, Published)
    SELECT id INTO ev_qawali FROM public.events WHERE name = 'Traditional Qawali';
    IF ev_qawali IS NULL THEN
        INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
        VALUES ('Traditional Qawali', 'group', cat_isl, 'Group cultural presentation. Max 6 members per team. Time: 12 minutes.', CURRENT_DATE, '11:30:00', '13:00:00', 'Open Air Theatre', 'completed', 'published')
        RETURNING id INTO ev_qawali;

        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_qawali, '1st Position', 30, 1) RETURNING id INTO sr_qw1;
        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_qawali, '2nd Position', 20, 2) RETURNING id INTO sr_qw2;
        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_qawali, '3rd Position', 10, 3) RETURNING id INTO sr_qw3;

        INSERT INTO public.event_team_assignments (event_id, team_id, assignment_mode) VALUES
        (ev_qawali, wiras_id, 'selected_participants'),
        (ev_qawali, suluk_id, 'selected_participants'),
        (ev_qawali, diraya_id, 'selected_participants')
        ON CONFLICT DO NOTHING;

        INSERT INTO public.event_participants (event_id, participant_id) VALUES
        (ev_qawali, p_riyas), (ev_qawali, p_hafeel), (ev_qawali, p_shahil),
        (ev_qawali, p_nihal), (ev_qawali, p_amal),
        (ev_qawali, p_midlaj), (ev_qawali, p_anfas)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.event_results (event_id, participant_id, team_id, scoring_rule_id, result_label, points) VALUES
        (ev_qawali, NULL, wiras_id, sr_qw1, '1st Position', 30),
        (ev_qawali, NULL, suluk_id, sr_qw2, '2nd Position', 20),
        (ev_qawali, NULL, diraya_id, sr_qw3, '3rd Position', 10);
    END IF;

    -- Event 3: Quran Recitation (Individual, Ongoing, Not entered)
    SELECT id INTO ev_quran FROM public.events WHERE name = 'Quran Recitation (Tajweed)';
    IF ev_quran IS NULL THEN
        INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
        VALUES ('Quran Recitation (Tajweed)', 'individual', cat_isl, 'Spiritual recitation test with strict tajweed rules.', CURRENT_DATE, '14:00:00', '16:00:00', 'Seminary Hall A', 'ongoing', 'not_entered')
        RETURNING id INTO ev_quran;

        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_quran, '1st Position', 20, 1),
        (ev_quran, '2nd Position', 15, 2),
        (ev_quran, '3rd Position', 10, 3);

        INSERT INTO public.event_participants (event_id, participant_id) VALUES
        (ev_quran, p_riyas),
        (ev_quran, p_nihal),
        (ev_quran, p_midlaj)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Event 4: English Parliamentary Debate (Group, Upcoming, Not entered)
    SELECT id INTO ev_debate FROM public.events WHERE name = 'English Parliamentary Debate';
    IF ev_debate IS NULL THEN
        INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
        VALUES ('English Parliamentary Debate', 'group', cat_lit, 'Oxford style debate. Motions announced 15 mins prior.', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:30:00', 'Conference Hall', 'upcoming', 'not_entered')
        RETURNING id INTO ev_debate;

        INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
        (ev_debate, 'Winner', 25, 1),
        (ev_debate, 'Runner Up', 15, 2);
    END IF;

    -- 5. Team Point Adjustments (Bonuses & Penalties)
    DELETE FROM public.team_point_adjustments WHERE reason IN (
        'Best Overall Discipline & Timeliness in Inaugural Procession',
        'Venue Cleanliness Violation after Qawali prep'
    );
    INSERT INTO public.team_point_adjustments (team_id, points, adjustment_type, reason) VALUES
    (wiras_id, 5, 'bonus', 'Best Overall Discipline & Timeliness in Inaugural Procession'),
    (suluk_id, 3, 'penalty', 'Venue Cleanliness Violation after Qawali prep');

    -- 6. Program Schedule Items
    DELETE FROM public.program_schedule WHERE title IN (
        'Grand Inauguration Ceremony',
        'Malayalam Elocution',
        'Traditional Qawali',
        'Lunch & Prayer Break',
        'Quran Recitation (Tajweed)',
        'English Parliamentary Debate',
        'Grand Valedictory & Prize Distribution'
    );
    INSERT INTO public.program_schedule (event_id, title, description, schedule_date, start_time, end_time, venue) VALUES
    (NULL, 'Grand Inauguration Ceremony', 'Welcoming dignitaries, flag hoisting, and fest declaration.', CURRENT_DATE, '08:30:00', '09:15:00', 'Main Ground'),
    (ev_speech, 'Malayalam Elocution', 'Individual speech competition on literary themes.', CURRENT_DATE, '09:30:00', '11:00:00', 'Auditorium Stage 1'),
    (ev_qawali, 'Traditional Qawali', 'Group cultural presentation by squad finalists.', CURRENT_DATE, '11:30:00', '13:00:00', 'Open Air Theatre'),
    (NULL, 'Lunch & Prayer Break', 'Arrangements for all participating teams and faculty.', CURRENT_DATE, '13:00:00', '14:00:00', 'Dining Pavilion'),
    (ev_quran, 'Quran Recitation (Tajweed)', 'Spiritual recitation test with tajweed rules.', CURRENT_DATE, '14:00:00', '16:00:00', 'Seminary Hall A'),
    (ev_debate, 'English Parliamentary Debate', 'Preliminary and final rounds between teams.', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:30:00', 'Conference Hall'),
    (NULL, 'Grand Valedictory & Prize Distribution', 'Championship trophy presentation and valedictory address.', CURRENT_DATE + INTERVAL '1 day', '17:00:00', '19:00:00', 'Main Auditorium');

END $$;

-- ------------------------------------------------------------------------------
-- 20. RELOAD SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
