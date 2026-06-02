-- ============================================================
-- CAMPUSCONNECT SEED DATA
-- Execution order: 4 of 5
-- Run AFTER trigger.sql in the Supabase SQL Editor.
-- ============================================================

INSERT INTO departments (name, max_semesters, programs) VALUES
  ('Faculty of Management & Commerce',             6,  ARRAY['B.Com', 'BBA']),
  ('Faculty of Arts, Social Sciences & Humanities',6,  ARRAY['BA']),
  ('Faculty of Sciences',                          6,  ARRAY['B.Sc']),
  ('Faculty of Agriculture Sciences',              8,  ARRAY['B.Sc Agriculture']),
  ('Faculty of Education',                         4,  ARRAY['B.Ed']),
  ('Faculty of Engineering & Technology',          8,  ARRAY['B.Tech']),
  ('Faculty of Ayurveda',                          10, ARRAY['BAMS']),
  ('Faculty of Medical & Paramedical Sciences',    6,  ARRAY['Paramedical']),
  ('Faculty of Nursing',                           8,  ARRAY['B.Sc Nursing']),
  ('Faculty of IT',                                8,  ARRAY['BCA', 'B.Tech IT']);
