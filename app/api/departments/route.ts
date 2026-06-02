import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/departments
 *
 * Public endpoint — no auth required.
 * Uses the admin client (service role) to bypass the RLS policy on
 * the `departments` table, which otherwise blocks unauthenticated reads.
 *
 * Only exposes non-sensitive columns (id, name, max_semesters).
 */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select('id, name, max_semesters')
    .order('name')

  if (error) {
    console.error('[GET /api/departments] Supabase error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
