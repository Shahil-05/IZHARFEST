-- ==============================================================================
-- IZHAR FEST — DEMO SEED DATA (Events, Assignments, Schedule, Adjustments)
-- ==============================================================================

DO $$
DECLARE
    wiras_id UUID;
    suluk_id UUID;
    diraya_id UUID;
    
    cat_literary UUID;
    cat_islamic UUID;
    cat_arts UUID;
    cat_media UUID;
    
    p_riyas UUID;
    p_hafeel UUID;
    p_nihal UUID;
    p_shakeeb UUID;
    p_midlaj UUID;
    p_anfas UUID;
    
    p_shahil UUID;
    p_arun UUID;
    p_rahul UUID;
    p_amal UUID;
    
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
    SELECT id INTO wiras_id FROM public.teams WHERE name = 'TEAM WIRAS';
    SELECT id INTO suluk_id FROM public.teams WHERE name = 'TEAM SULUK';
    SELECT id INTO diraya_id FROM public.teams WHERE name = 'TEAM DIRAYA';
    
    SELECT id INTO cat_literary FROM public.event_categories WHERE name = 'Literary';
    SELECT id INTO cat_islamic FROM public.event_categories WHERE name = 'Islamic Cultural';
    SELECT id INTO cat_arts FROM public.event_categories WHERE name = 'Arts & Stage';
    SELECT id INTO cat_media FROM public.event_categories WHERE name = 'Media & IT';

    SELECT id INTO p_riyas FROM public.participants WHERE participant_code = 'WIR-001';
    SELECT id INTO p_hafeel FROM public.participants WHERE participant_code = 'WIR-002';
    SELECT id INTO p_nihal FROM public.participants WHERE participant_code = 'SLK-001';
    SELECT id INTO p_shakeeb FROM public.participants WHERE participant_code = 'SLK-002';
    SELECT id INTO p_midlaj FROM public.participants WHERE participant_code = 'DRY-001';
    SELECT id INTO p_anfas FROM public.participants WHERE participant_code = 'DRY-002';

    -- Additional sample participants
    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('WIR-003', 'Shahil Mohammed', 'Junior Batch A', wiras_id)
    ON CONFLICT (participant_code) DO NOTHING
    RETURNING id INTO p_shahil;
    IF p_shahil IS NULL THEN SELECT id INTO p_shahil FROM public.participants WHERE participant_code = 'WIR-003'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-003', 'Arun Kumar', 'Junior Batch B', suluk_id)
    ON CONFLICT (participant_code) DO NOTHING
    RETURNING id INTO p_arun;
    IF p_arun IS NULL THEN SELECT id INTO p_arun FROM public.participants WHERE participant_code = 'SLK-003'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('DRY-003', 'Rahul Krishnan', 'Junior Batch A', diraya_id)
    ON CONFLICT (participant_code) DO NOTHING
    RETURNING id INTO p_rahul;
    IF p_rahul IS NULL THEN SELECT id INTO p_rahul FROM public.participants WHERE participant_code = 'DRY-003'; END IF;

    INSERT INTO public.participants (participant_code, name, class_batch, team_id)
    VALUES ('SLK-004', 'Amal Farooq', 'Senior Batch B', suluk_id)
    ON CONFLICT (participant_code) DO NOTHING
    RETURNING id INTO p_amal;
    IF p_amal IS NULL THEN SELECT id INTO p_amal FROM public.participants WHERE participant_code = 'SLK-004'; END IF;

    -- 1. Create Event 1: Malayalam Elocution (Individual, Completed, Published)
    INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
    VALUES (
        'Malayalam Elocution',
        'individual',
        cat_literary,
        'Time limit: 5 minutes. Topics announced 10 minutes prior.',
        CURRENT_DATE,
        '09:30:00',
        '11:00:00',
        'Auditorium Stage 1',
        'completed',
        'published'
    )
    RETURNING id INTO ev_speech;

    -- Event scoring rules for Malayalam Elocution
    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_speech, '1st Position', 20, 1) RETURNING id INTO sr_sp1;
    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_speech, '2nd Position', 15, 2) RETURNING id INTO sr_sp2;
    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_speech, '3rd Position', 10, 3) RETURNING id INTO sr_sp3;

    -- Event participants for Malayalam Elocution
    INSERT INTO public.event_participants (event_id, participant_id) VALUES
    (ev_speech, p_shahil),
    (ev_speech, p_arun),
    (ev_speech, p_rahul)
    ON CONFLICT DO NOTHING;

    -- Results for Malayalam Elocution:
    -- 1st: Shahil (WIRAS) +20
    -- 2nd: Arun (SULUK) +15
    -- 3rd: Rahul (DIRAYA) +10
    INSERT INTO public.event_results (event_id, participant_id, team_id, scoring_rule_id, result_label, points) VALUES
    (ev_speech, p_shahil, wiras_id, sr_sp1, '1st Position', 20),
    (ev_speech, p_arun, suluk_id, sr_sp2, '2nd Position', 15),
    (ev_speech, p_rahul, diraya_id, sr_sp3, '3rd Position', 10);

    -- 2. Create Event 2: Qawali (Group, Completed, Published)
    INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
    VALUES (
        'Traditional Qawali',
        'group',
        cat_islamic,
        'Group performance. Max 6 members per team. Time: 12 minutes.',
        CURRENT_DATE,
        '11:30:00',
        '13:00:00',
        'Open Air Theatre',
        'completed',
        'published'
    )
    RETURNING id INTO ev_qawali;

    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_qawali, '1st Position', 30, 1) RETURNING id INTO sr_qw1;
    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_qawali, '2nd Position', 20, 2) RETURNING id INTO sr_qw2;
    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_qawali, '3rd Position', 10, 3) RETURNING id INTO sr_qw3;

    -- Group assignments
    INSERT INTO public.event_team_assignments (event_id, team_id, assignment_mode) VALUES
    (ev_qawali, wiras_id, 'selected_participants'),
    (ev_qawali, suluk_id, 'selected_participants'),
    (ev_qawali, diraya_id, 'selected_participants')
    ON CONFLICT DO NOTHING;

    -- Participants in Qawali
    INSERT INTO public.event_participants (event_id, participant_id) VALUES
    (ev_qawali, p_riyas),
    (ev_qawali, p_hafeel),
    (ev_qawali, p_shahil),
    (ev_qawali, p_nihal),
    (ev_qawali, p_amal),
    (ev_qawali, p_midlaj),
    (ev_qawali, p_anfas)
    ON CONFLICT DO NOTHING;

    -- Results for Qawali:
    -- 1st: TEAM WIRAS +30 (no participant_id)
    -- 2nd: TEAM SULUK +20 (no participant_id)
    -- 3rd: TEAM DIRAYA +10 (no participant_id)
    INSERT INTO public.event_results (event_id, participant_id, team_id, scoring_rule_id, result_label, points) VALUES
    (ev_qawali, NULL, wiras_id, sr_qw1, '1st Position', 30),
    (ev_qawali, NULL, suluk_id, sr_qw2, '2nd Position', 20),
    (ev_qawali, NULL, diraya_id, sr_qw3, '3rd Position', 10);

    -- 3. Create Event 3: Quran Recitation (Individual, Ongoing, Not entered)
    INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
    VALUES (
        'Quran Recitation (Tajweed)',
        'individual',
        cat_islamic,
        'Evaluation on Tajweed, voice control, and Makharaij.',
        CURRENT_DATE,
        '14:00:00',
        '16:00:00',
        'Seminary Hall A',
        'ongoing',
        'not_entered'
    )
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

    -- 4. Create Event 4: English Parliamentary Debate (Group, Upcoming)
    INSERT INTO public.events (name, event_type, category_id, description, event_date, start_time, end_time, venue, status, result_status)
    VALUES (
        'English Parliamentary Debate',
        'group',
        cat_literary,
        '3 vs 3 Oxford style debate. Motions released 15 minutes before round.',
        CURRENT_DATE + INTERVAL '1 day',
        '10:00:00',
        '12:30:00',
        'Conference Hall',
        'upcoming',
        'not_entered'
    )
    RETURNING id INTO ev_debate;

    INSERT INTO public.event_scoring_rules (event_id, label, points, sort_order) VALUES
    (ev_debate, 'Winner', 25, 1),
    (ev_debate, 'Runner Up', 15, 2);

    -- Point adjustments
    INSERT INTO public.team_point_adjustments (team_id, points, adjustment_type, reason) VALUES
    (wiras_id, 5, 'bonus', 'Best Overall Discipline & Timeliness in Inaugural Procession'),
    (suluk_id, 3, 'penalty', 'Venue Cleanliness Violation after Qawali prep');

    -- Program Schedule Items
    INSERT INTO public.program_schedule (event_id, title, description, schedule_date, start_time, end_time, venue) VALUES
    (NULL, 'Grand Inauguration Ceremony', 'Welcoming dignitaries, flag hoisting, and fest declaration.', CURRENT_DATE, '08:30:00', '09:15:00', 'Main Ground'),
    (ev_speech, 'Malayalam Elocution', 'Individual speech competition.', CURRENT_DATE, '09:30:00', '11:00:00', 'Auditorium Stage 1'),
    (ev_qawali, 'Traditional Qawali', 'Group cultural presentation.', CURRENT_DATE, '11:30:00', '13:00:00', 'Open Air Theatre'),
    (NULL, 'Lunch & Prayer Break', 'Dining hall arrangements for participants and guests.', CURRENT_DATE, '13:00:00', '14:00:00', 'Dining Pavilion'),
    (ev_quran, 'Quran Recitation (Tajweed)', 'Spiritual recitation test with strict tajweed rules.', CURRENT_DATE, '14:00:00', '16:00:00', 'Seminary Hall A'),
    (ev_debate, 'English Parliamentary Debate', 'Preliminary and final rounds between teams.', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:30:00', 'Conference Hall'),
    (NULL, 'Grand Valedictory & Prize Distribution', 'Announcement of champions, trophy presentation, and concluding address.', CURRENT_DATE + INTERVAL '1 day', '17:00:00', '19:00:00', 'Main Auditorium');

END $$;
