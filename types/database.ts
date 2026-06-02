// ============================================================
// CAMPUSCONNECT — DATABASE TYPES
// Generated from supabase/schema.sql
// ============================================================

// ============================================================
// SHARED UNION TYPES
// ============================================================

export type UserRole = 'student' | 'department_admin' | 'super_admin'

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'banned'

export type ChatType = 'department' | 'general'

/** Shared by both notes and notices — same status lifecycle */
export type ContentStatus = 'pending' | 'approved' | 'rejected'

export type NoticeScope = 'college' | 'department'

export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export type RequestType = 'general_chat' | 'yufi'

export type UnlimitedRequestStatus = 'pending' | 'approved' | 'denied'

// ============================================================
// TABLE 1: departments
// ============================================================

export interface Department {
  id: string
  name: string
  max_semesters: number
  programs: string[]
  code: string | null
  description: string
  created_at: string
}

// ============================================================
// TABLE 2: profiles
// ============================================================

export interface Profile {
  id: string
  scholar_number: string
  email: string
  full_name: string
  department_id: string
  semester: number
  bio: string
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  general_chat_unlimited: boolean
  yufi_unlimited: boolean
  is_muted: boolean
  notes_uploaded_count: number
  helpful_votes_count: number
  created_at: string
  updated_at: string
}

// ============================================================
// TABLE 3: messages
// ============================================================

export interface Message {
  id: string
  chat_type: ChatType
  department_id: string | null
  sender_id: string
  content: string | null
  image_url: string | null
  gif_url: string | null
  reply_to_id: string | null
  is_pinned: boolean
  is_deleted: boolean
  is_edited: boolean
  reactions: Record<string, string[]> | null
  created_at: string
}

// ============================================================
// TABLE 4: notes
// ============================================================

export interface Note {
  id: string
  department_id: string
  uploaded_by: string
  title: string
  description: string
  semester: number
  tags: string[]
  file_url: string
  file_type: string
  status: ContentStatus
  rejection_reason: string | null
  upvote_count: number
  download_count: number
  created_at: string
  updated_at: string
}

// ============================================================
// TABLE 5: upvotes
// ============================================================

export interface Upvote {
  id: string
  user_id: string
  note_id: string
  created_at: string
}

// ============================================================
// TABLE 6: notices
// ============================================================

export interface Notice {
  id: string
  scope: NoticeScope
  department_id: string | null
  posted_by: string
  title: string
  content: string
  image_url: string | null
  status: ContentStatus
  submitted_by_student: boolean
  rejection_reason: string | null
  created_at: string
}

// ============================================================
// TABLE 7: notifications
// ============================================================

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  is_read: boolean
  link: string | null
  created_at: string
}

// ============================================================
// TABLE 8: yufi_conversations
// ============================================================

/** Shape of individual messages stored in yufi_conversations.messages (JSONB) */
export interface YufiMessage {
  role: 'user' | 'model'
  content: string
  timestamp: string
}

export interface YufiConversation {
  id: string
  user_id: string
  title: string
  messages: YufiMessage[]
  created_at: string
  updated_at: string
}

// ============================================================
// TABLE 9: reports
// ============================================================

export interface Report {
  id: string
  reporter_id: string
  message_id: string
  reason: string
  status: ReportStatus
  resolved_by: string | null
  resolution_note: string | null
  created_at: string
}

// ============================================================
// TABLE 10: bans
// ============================================================

export interface Ban {
  id: string
  user_id: string
  banned_by: string
  reason: string
  is_active: boolean
  created_at: string
}
// ============================================================
// TABLE 11: admin_roles
// ============================================================

export interface AdminRole {
  id: string
  admin_id: string
  department_id: string
  semester: number | null
  created_at: string
}

// ============================================================
// TABLE 12: semesters
// ============================================================

export interface Semester {
  id: string
  department_id: string
  number: number
  is_active: boolean
  created_at: string
}

// ============================================================
// TABLE 13: exam_events
// ============================================================

export interface ExamEvent {
  id: string
  department_id: string
  title: string
  exam_date: string
  created_by: string
  created_at: string
}

// ============================================================
// TABLE 16: exams
// ============================================================

export interface Exam {
  id: string
  department_id: string
  semester: number
  title: string
  subject: string
  exam_date: string
  exam_time: string | null
  duration: string | null
  venue: string | null
  exam_type: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// TABLE 14: admin_action_log
// ============================================================

export interface AdminActionLog {
  id: string
  admin_id: string
  action_type: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  created_at: string
}

// ============================================================
// TABLE 15: unlimited_requests
// ============================================================

export interface UnlimitedRequest {
  id: string
  user_id: string
  request_type: RequestType
  reason: string
  status: UnlimitedRequestStatus
  reviewed_by: string | null
  review_note: string | null
  created_at: string
}

// ============================================================
// EXTENDED JOIN TYPES
// Used for Supabase queries with .select('*, profiles(...)')
// ============================================================

/** Profile with its department joined */
export interface ProfileWithDepartment extends Profile {
  departments: Pick<Department, 'id' | 'name'>
}

/** Message with sender profile joined */
export interface MessageWithSender extends Message {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'scholar_number' | 'role'>
}

/** Message with sender + replied-to message (with that sender's name) */
export interface MessageWithReply extends MessageWithSender {
  reply_to: (Pick<Message, 'id' | 'content' | 'sender_id'> & {
    profiles: Pick<Profile, 'full_name'>
  }) | null
}

/** Note with uploader profile joined */
export interface NoteWithUploader extends Note {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'scholar_number'>
}

/** Notice with poster profile joined */
export interface NoticeWithPoster extends Notice {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
}
