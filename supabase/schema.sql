-- ============================================================
-- CAMPUSCONNECT DATABASE SCHEMA
-- Execution order: 1 of 5
-- Run this FIRST in the Supabase SQL Editor.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================
-- TABLE 1: departments
-- ============================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  max_semesters INTEGER NOT NULL CHECK (max_semesters > 0 AND max_semesters <= 10),
  programs TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 2: profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  scholar_number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  semester INTEGER NOT NULL CHECK (semester > 0),
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'department_admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'banned')),
  general_chat_unlimited BOOLEAN NOT NULL DEFAULT false,
  yufi_unlimited BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  notes_uploaded_count INTEGER NOT NULL DEFAULT 0,
  helpful_votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholar number must be exactly 6 digits
ALTER TABLE profiles ADD CONSTRAINT scholar_number_format
  CHECK (scholar_number ~ '^\d{6}$');

-- ============================================================
-- TABLE 3: messages
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_type TEXT NOT NULL DEFAULT 'department'
    CHECK (chat_type IN ('department', 'general')),
  department_id UUID REFERENCES departments(id),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  image_url TEXT,
  gif_url TEXT,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Department messages must have department_id; general chat must not
  CONSTRAINT chat_room_check CHECK (
    (chat_type = 'department' AND department_id IS NOT NULL) OR
    (chat_type = 'general' AND department_id IS NULL)
  ),
  -- At least one of content, image_url, or gif_url must be present
  CONSTRAINT message_content_check CHECK (
    content IS NOT NULL OR image_url IS NOT NULL OR gif_url IS NOT NULL
  )
);

-- ============================================================
-- TABLE 4: notes
-- ============================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  semester INTEGER NOT NULL CHECK (semester > 0),
  tags TEXT[] NOT NULL DEFAULT '{}',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 5: upvotes
-- ============================================================
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, note_id)
);

-- ============================================================
-- TABLE 6: notices
-- ============================================================
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL DEFAULT 'department'
    CHECK (scope IN ('college', 'department')),
  department_id UUID REFERENCES departments(id),
  posted_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_student BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- College-wide notices have no department; department notices must have one
  CONSTRAINT notice_scope_check CHECK (
    (scope = 'college' AND department_id IS NULL) OR
    (scope = 'department' AND department_id IS NOT NULL)
  )
);

-- ============================================================
-- TABLE 7: notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 8: yufi_conversations
-- ============================================================
CREATE TABLE yufi_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 9: reports
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  message_id UUID NOT NULL REFERENCES messages(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 10: bans
-- ============================================================
CREATE TABLE bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  banned_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_scholar ON profiles(scholar_number);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_name_search ON profiles USING gin(full_name gin_trgm_ops);

-- Messages
CREATE INDEX idx_messages_department ON messages(department_id);
CREATE INDEX idx_messages_chat_type ON messages(chat_type);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_pinned ON messages(is_pinned) WHERE is_pinned = true;

-- Notes
CREATE INDEX idx_notes_department ON notes(department_id);
CREATE INDEX idx_notes_status ON notes(status);
CREATE INDEX idx_notes_semester ON notes(semester);
CREATE INDEX idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX idx_notes_title_search ON notes USING gin(title gin_trgm_ops);

-- Upvotes
CREATE INDEX idx_upvotes_note ON upvotes(note_id);
CREATE INDEX idx_upvotes_user ON upvotes(user_id);

-- Notices
CREATE INDEX idx_notices_department ON notices(department_id);
CREATE INDEX idx_notices_scope ON notices(scope);
CREATE INDEX idx_notices_status ON notices(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- Yufi
CREATE INDEX idx_yufi_user ON yufi_conversations(user_id);

-- Reports
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_message ON reports(message_id);

-- Bans
CREATE INDEX idx_bans_user ON bans(user_id);
CREATE INDEX idx_bans_active ON bans(user_id) WHERE is_active = true;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_yufi_updated_at
  BEFORE UPDATE ON yufi_conversations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- UPVOTE COUNT TRIGGER
-- Automatically syncs notes.upvote_count when upvotes change.
-- Also increments the uploader's helpful_votes_count.
-- ============================================================
CREATE OR REPLACE FUNCTION sync_note_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE notes SET upvote_count = upvote_count + 1 WHERE id = NEW.note_id;
    UPDATE profiles
      SET helpful_votes_count = helpful_votes_count + 1
      WHERE id = (SELECT uploaded_by FROM notes WHERE id = NEW.note_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE notes SET upvote_count = upvote_count - 1 WHERE id = OLD.note_id;
    UPDATE profiles
      SET helpful_votes_count = helpful_votes_count - 1
      WHERE id = (SELECT uploaded_by FROM notes WHERE id = OLD.note_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON upvotes FOR EACH ROW
  EXECUTE FUNCTION sync_note_upvote_count();

-- ============================================================
-- NOTES COUNT TRIGGER
-- Automatically syncs profiles.notes_uploaded_count.
-- ============================================================
CREATE OR REPLACE FUNCTION sync_notes_uploaded_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET notes_uploaded_count = notes_uploaded_count + 1 WHERE id = NEW.uploaded_by;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET notes_uploaded_count = notes_uploaded_count - 1 WHERE id = OLD.uploaded_by;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_notes_count_change
  AFTER INSERT OR DELETE ON notes FOR EACH ROW
  EXECUTE FUNCTION sync_notes_uploaded_count();
