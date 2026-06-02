-- ============================================================
-- CAMPUSCONNECT ROW LEVEL SECURITY POLICIES
-- Execution order: 5 of 5 (LAST)
-- Run AFTER seed.sql in the Supabase SQL Editor.
-- ============================================================

-- Enable RLS on ALL tables
ALTER TABLE departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE yufi_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans               ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE POLICY "departments_select"
  ON departments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "departments_insert"
  ON departments FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "departments_update"
  ON departments FOR UPDATE TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "departments_delete"
  ON departments FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ============================================================
-- PROFILES
-- ============================================================

-- Users see profiles in their own department. Super admin sees all.
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR department_id = public.get_user_department()
  );

-- Users can update their own profile (name, bio, avatar, semester)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Department admins can update status of students in their department
CREATE POLICY "profiles_update_dept_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (
    public.is_dept_admin_of(department_id)
    AND id != auth.uid()
  )
  WITH CHECK (
    public.is_dept_admin_of(department_id)
  );

-- Super admin can update any profile
CREATE POLICY "profiles_update_super_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- ============================================================
-- MESSAGES
-- ============================================================

-- Approved users can read messages from their department + general chat.
-- Super admin reads all.
CREATE POLICY "messages_select"
  ON messages FOR SELECT TO authenticated
  USING (
    public.get_user_status() = 'approved'
    AND (
      chat_type = 'general'
      OR department_id = public.get_user_department()
      OR public.is_super_admin()
    )
  );

-- Approved, non-muted users can send messages
CREATE POLICY "messages_insert"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND sender_id = auth.uid()
    AND NOT public.is_user_muted()
  );

-- Users can soft-delete their own messages
CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- Admins can delete messages in their department
CREATE POLICY "messages_delete_admin"
  ON messages FOR DELETE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      department_id IS NOT NULL
      AND public.is_dept_admin_of(department_id)
    )
  );

-- Users can update their own messages (edit content)
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- Admins can update messages (pin/unpin) in their department
CREATE POLICY "messages_update_admin"
  ON messages FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      department_id IS NOT NULL
      AND public.is_dept_admin_of(department_id)
    )
  );

-- ============================================================
-- NOTES
-- ============================================================

-- Students see approved notes in their department.
-- Dept admins see all notes in their department.
-- Super admin sees all.
CREATE POLICY "notes_select"
  ON notes FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      status = 'approved'
      AND department_id = public.get_user_department()
    )
    OR public.is_dept_admin_of(department_id)
  );

-- Approved students can upload notes to their own department
CREATE POLICY "notes_insert"
  ON notes FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND uploaded_by = auth.uid()
    AND department_id = public.get_user_department()
  );

-- Admins can update note status (approve/reject) in their department
CREATE POLICY "notes_update_admin"
  ON notes FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR public.is_dept_admin_of(department_id)
  );

-- ============================================================
-- UPVOTES
-- ============================================================
CREATE POLICY "upvotes_select"
  ON upvotes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "upvotes_insert"
  ON upvotes FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND user_id = auth.uid()
  );

CREATE POLICY "upvotes_delete"
  ON upvotes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- NOTICES
-- ============================================================

-- Students see approved notices for their department + college-wide.
-- Dept admins see all notices in their department.
-- Super admin sees all.
CREATE POLICY "notices_select"
  ON notices FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      status = 'approved'
      AND (scope = 'college' OR department_id = public.get_user_department())
    )
    OR public.is_dept_admin_of(department_id)
  );

-- Students can submit pending department notices
CREATE POLICY "notices_insert_student"
  ON notices FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND scope = 'department'
    AND department_id = public.get_user_department()
    AND submitted_by_student = true
    AND status = 'pending'
    AND posted_by = auth.uid()
  );

-- Department admins can post approved department notices
CREATE POLICY "notices_insert_dept_admin"
  ON notices FOR INSERT TO authenticated
  WITH CHECK (
    scope = 'department'
    AND department_id IS NOT NULL
    AND public.is_dept_admin_of(department_id)
    AND submitted_by_student = false
    AND posted_by = auth.uid()
  );

-- Super admin can post any notice (college-wide or department)
CREATE POLICY "notices_insert_super_admin"
  ON notices FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

-- Admins can update notice status (approve/reject)
CREATE POLICY "notices_update_admin"
  ON notices FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR public.is_dept_admin_of(department_id)
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_select"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role inserts notifications. This policy allows authenticated inserts too.
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete"
  ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- YUFI CONVERSATIONS
-- ============================================================
CREATE POLICY "yufi_select"
  ON yufi_conversations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "yufi_insert"
  ON yufi_conversations FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND user_id = auth.uid()
  );

CREATE POLICY "yufi_update"
  ON yufi_conversations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "yufi_delete"
  ON yufi_conversations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- REPORTS
-- ============================================================

-- Admins can view reports for messages in their department
CREATE POLICY "reports_select"
  ON reports FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND m.department_id IS NOT NULL
      AND public.is_dept_admin_of(m.department_id)
    )
  );

-- Approved users can create reports
CREATE POLICY "reports_insert"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_status() = 'approved'
    AND reporter_id = auth.uid()
  );

-- Admins can update reports (resolve/dismiss)
CREATE POLICY "reports_update"
  ON reports FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_id
      AND m.department_id IS NOT NULL
      AND public.is_dept_admin_of(m.department_id)
    )
  );

-- ============================================================
-- BANS
-- ============================================================

-- Users can see if they themselves are banned.
-- Admins can see bans for users in their department.
-- Super admin sees all.
CREATE POLICY "bans_select"
  ON bans FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_id
      AND public.is_dept_admin_of(p.department_id)
    )
  );

-- Admins can ban users in their department. Super admin can ban anyone.
CREATE POLICY "bans_insert"
  ON bans FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_id
      AND public.is_dept_admin_of(p.department_id)
    )
  );

-- Same for unbanning (updating is_active to false)
CREATE POLICY "bans_update"
  ON bans FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_id
      AND public.is_dept_admin_of(p.department_id)
    )
  );
