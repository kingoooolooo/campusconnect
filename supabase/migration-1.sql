-- ============================================================
-- CAMPUSCONNECT MIGRATION-1
-- Run AFTER the 5 original SQL files (schema, functions,
-- trigger, seed, rls) in the Supabase SQL Editor.
--
-- Adds:
--   • admin_roles        (NEW table)
--   • semesters           (NEW table)
--   • exam_events         (NEW table)
--   • admin_action_log    (NEW table)
--   • unlimited_requests  (NEW table)
--   • departments.code    (NEW column)
--   • departments.description (NEW column)
--   • Seed: department codes + semester rows
-- ============================================================


-- ============================================================
-- TABLE: admin_roles
-- Semester-scoped admin assignments.
-- semester = NULL  →  admin for the entire department
-- semester = N     →  admin for that specific semester only
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(admin_id, department_id, semester)
);

COMMENT ON COLUMN admin_roles.semester IS
  'If set, admin is scoped to this specific semester within the department. NULL means admin for the entire department.';

CREATE INDEX idx_admin_roles_admin ON admin_roles(admin_id);
CREATE INDEX idx_admin_roles_department ON admin_roles(department_id);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_roles_select"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_roles_insert"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "admin_roles_update"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "admin_roles_delete"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (public.is_super_admin());


-- ============================================================
-- TABLE: semesters
-- Explicit semester records per department.
-- ============================================================

CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(department_id, number)
);

CREATE INDEX idx_semesters_department ON semesters(department_id);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semesters_select"
  ON semesters FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- TABLE: exam_events
-- Exam dates per department, managed by super admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS exam_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_events_department ON exam_events(department_id);
CREATE INDEX idx_exam_events_date ON exam_events(exam_date);

ALTER TABLE exam_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_events_select"
  ON exam_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "exam_events_insert"
  ON exam_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "exam_events_update"
  ON exam_events FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "exam_events_delete"
  ON exam_events FOR DELETE
  TO authenticated
  USING (public.is_super_admin());


-- ============================================================
-- TABLE: admin_action_log
-- Immutable audit trail of every admin action.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_log_admin ON admin_action_log(admin_id);
CREATE INDEX idx_admin_log_type ON admin_action_log(action_type);
CREATE INDEX idx_admin_log_created ON admin_action_log(created_at DESC);

ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_log_select_super"
  ON admin_action_log FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "admin_log_insert"
  ON admin_action_log FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- TABLE: unlimited_requests
-- Students request unlimited chat/Yufi access.
-- ============================================================

CREATE TABLE IF NOT EXISTS unlimited_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('general_chat', 'yufi')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES profiles(id),
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_unlimited_requests_user ON unlimited_requests(user_id);
CREATE INDEX idx_unlimited_requests_status ON unlimited_requests(status);

ALTER TABLE unlimited_requests ENABLE ROW LEVEL SECURITY;

-- Users see their own requests. Admins see requests from their department. Super admin sees all.
CREATE POLICY "unlimited_requests_select_own"
  ON unlimited_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_id
      AND p.department_id = public.get_user_department()
      AND EXISTS (
        SELECT 1 FROM admin_roles ar
        WHERE ar.admin_id = auth.uid()
        AND ar.department_id = p.department_id
      )
    )
  );

-- Approved users can submit requests for themselves
CREATE POLICY "unlimited_requests_insert"
  ON unlimited_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND user_id = auth.uid()
  );

-- Admins can approve/deny requests for users in their department
CREATE POLICY "unlimited_requests_update_admin"
  ON unlimited_requests FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_id
      AND public.is_dept_admin_of(p.department_id)
    )
  );


-- ============================================================
-- MODIFY: departments — add code and description columns
-- ============================================================

ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Seed department short codes
UPDATE departments SET code = 'MNC' WHERE name = 'Faculty of Management & Commerce';
UPDATE departments SET code = 'ASH' WHERE name = 'Faculty of Arts, Social Sciences & Humanities';
UPDATE departments SET code = 'SCI' WHERE name = 'Faculty of Sciences';
UPDATE departments SET code = 'AGR' WHERE name = 'Faculty of Agriculture Sciences';
UPDATE departments SET code = 'EDU' WHERE name = 'Faculty of Education';
UPDATE departments SET code = 'ENG' WHERE name = 'Faculty of Engineering & Technology';
UPDATE departments SET code = 'AYU' WHERE name = 'Faculty of Ayurveda';
UPDATE departments SET code = 'MED' WHERE name = 'Faculty of Medical & Paramedical Sciences';
UPDATE departments SET code = 'NUR' WHERE name = 'Faculty of Nursing';
UPDATE departments SET code = 'ITS' WHERE name = 'Faculty of IT';


-- ============================================================
-- SEED: Generate semester rows for every department
-- ============================================================

INSERT INTO semesters (department_id, number)
SELECT d.id, generate_series(1, d.max_semesters)
FROM departments d
ON CONFLICT DO NOTHING;


-- ============================================================
-- DONE
-- Verify: SELECT count(*) FROM semesters;
--         SELECT code, name FROM departments;
-- ============================================================
