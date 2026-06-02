import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get('department_id')
  const limit = parseInt(searchParams.get('limit') || '20')
  const semester = searchParams.get('semester')

  let query = supabase
    .from('notes')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  if (semester) {
    query = query.eq('semester', parseInt(semester))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
