import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToCloudinary, validateFile } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Fetch user profile (server-side — prevents department_id spoofing) ──
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

    // ── Parse form data ─────────────────────────────────────────────────────
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = (formData.get('description') as string) ?? ''
    const semesterRaw = formData.get('semester') as string | null
    const tagsRaw = (formData.get('tags') as string) ?? ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!semesterRaw) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 })
    }

    const semester = parseInt(semesterRaw, 10)
    if (isNaN(semester) || semester < 1) {
      return NextResponse.json({ error: 'Invalid semester value' }, { status: 400 })
    }

    // ── Validate semester against department max ────────────────────────────
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
        {
          error: `Semester ${semester} exceeds your department's maximum of ${department.max_semesters}`,
        },
        { status: 400 }
      )
    }

    // ── Validate and upload file ────────────────────────────────────────────
    const validation = validateFile(file, 'notes')
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileUrl = await uploadToCloudinary(buffer, file.name, 'notes', file.type)

    // ── Parse tags from comma-separated string into array ──────────────────
    const tags = tagsRaw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const fileType = file.name.split('.').pop()?.toLowerCase() ?? 'unknown'

    // ── Insert note — department_id always from server-side profile ─────────
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        department_id: profile.department_id, // NEVER from form — prevents IDOR
        uploaded_by: user.id,
        title: title.trim(),
        description: description.trim(),
        semester,
        tags,
        file_url: fileUrl,
        file_type: fileType,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Notes Upload] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save note record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('[Notes Upload] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
