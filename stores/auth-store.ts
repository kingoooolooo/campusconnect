'use client'

import { create } from 'zustand'
import type { Profile, Department } from '@/types/database'

// ============================================================
// AUTH STORE
// Holds the authenticated user's profile and department.
// The Profile IS the user — no separate Supabase auth user object.
// Raw auth session is managed by Supabase cookies in middleware.
// ============================================================

interface AuthState {
  /** The authenticated user's full profile from public.profiles */
  user: Profile | null
  /** The user's department — loaded alongside the profile */
  department: Department | null
  /** True while the profile is being fetched on initial load */
  isLoading: boolean

  // ── Setters ──────────────────────────────────────────────
  setUser: (user: Profile | null) => void
  setDepartment: (department: Department | null) => void
  setLoading: (loading: boolean) => void

  // ── Computed helpers ─────────────────────────────────────
  /** Returns true if the current user has the super_admin role */
  isSuperAdmin: () => boolean
  /** Returns true if the current user has the department_admin role */
  isDeptAdmin: () => boolean
  /** Returns true if the current user's status is 'approved' */
  isApproved: () => boolean
  /**
   * Returns true if the user can send messages in general chat.
   * Approved students are allowed only if general_chat_unlimited is true
   * OR if they haven't hit the daily limit (limit logic enforced server-side).
   */
  canAccessGeneralChat: () => boolean

  // ── Reset ─────────────────────────────────────────────────
  /** Clears all auth state (call on sign-out) */
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  department: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setDepartment: (department) => set({ department }),
  setLoading: (loading) => set({ isLoading: loading }),

  isSuperAdmin: () => get().user?.role === 'super_admin',

  isDeptAdmin: () => get().user?.role === 'department_admin',

  isApproved: () => get().user?.status === 'approved',

  canAccessGeneralChat: () => {
    const user = get().user
    if (!user) return false
    if (user.status !== 'approved') return false
    // super_admin and department_admin always have access
    if (user.role !== 'student') return true
    // Students need unlimited flag (daily limit enforced server-side)
    return user.general_chat_unlimited
  },

  reset: () =>
    set({
      user: null,
      department: null,
      isLoading: false,
    }),
}))
