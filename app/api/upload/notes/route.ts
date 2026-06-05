import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, department_id, semester')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your account must be approved to upload notes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description = '', semester: semesterRaw, file_url, file_type } = body

    if (!file_url || typeof file_url !== 'string') {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!semesterRaw) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 })
    }

    const semester = typeof semesterRaw === 'string' ? parseInt(semesterRaw, 10) : Number(semesterRaw)
    if (isNaN(semester) || semester < 1) {
      return NextResponse.json({ error: 'Invalid semester value' }, { status: 400 })
    }

    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('max_semesters')
      .eq('id', profile.department_id)
      .single()

    if (deptError || !department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    if (semester > department.max_semesters) {
      return NextResponse.json(
        { error: `Semester ${semester} exceeds your department's maximum of ${department.max_semesters}` },
        { status: 400 }
      )
    }

    const fileType = (file_type as string || 'unknown').toLowerCase()

    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        department_id: profile.department_id,
        uploaded_by: user.id,
        title: title.trim(),
        description: description.trim(),
        semester,
        tags: [],
        file_url: file_url,
        file_type: fileType,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Notes Upload] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save note record' }, { status: 500 })
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('[Notes Upload] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
