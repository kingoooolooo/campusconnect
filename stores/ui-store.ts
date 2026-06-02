'use client'

import { create } from 'zustand'

// ============================================================
// UI STORE
// Controls global UI state: sidebar, mobile menu, active nav.
// ============================================================

interface UIState {
  /** Desktop sidebar open/collapsed state */
  isSidebarOpen: boolean
  /** Mobile bottom sheet / drawer open state */
  isMobileMenuOpen: boolean
  /** Currently active navigation item identifier */
  activeNavItem: string

  // ── Sidebar ──────────────────────────────────────────────
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // ── Mobile menu ──────────────────────────────────────────
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void

  // ── Active nav ───────────────────────────────────────────
  setActiveNavItem: (item: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  activeNavItem: 'chat',

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setActiveNavItem: (item) => set({ activeNavItem: item }),
}))
