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

    // â”€â”€ Fetch user profile (server-side â€” prevents department_id spoofing) â”€â”€
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

    // â”€â”€ Parse JSON body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const contentType = request.headers.get('content-type') || ''
    console.log('[Notes Upload] Content-Type:', contentType)
    console.log('[Notes Upload] Using path:', contentType.includes('application/json') ? 'JSON' : 'FormData')

    let title: string
    let description: string
    let semesterRaw: unknown
    let file_url: string
    let file_type: string
    let tagsInput: unknown

    if (contentType.includes('application/json')) {
      // Client sent JSON (direct Cloudinary upload flow)
      const body = await request.json()
      title = body.title
      description = body.description || ''
      semesterRaw = body.semester
      tagsInput = body.tags
      file_url = body.file_url
      file_type = body.file_type
    } else {
      // Client sent form-data (fallback â€” upload to Cloudinary server-side)
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })

      const formData = await request.formData()
      const file = formData.get('file') as File | null
      title = formData.get('title') as string
      description = (formData.get('description') as string) || ''
      semesterRaw = formData.get('semester')
      tagsInput = formData.get('tags')

      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      const timestamp = Math.round(new Date().getTime() / 1000)
      const folder = 'campusconnect/notes'
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!
      )

      const cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
        folder,
        timestamp,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY!,
      })

      file_url = cloudinaryResult.secure_url
      file_type = file.name.split('.').pop()?.toLowerCase() || 'unknown'
    }

    if (!file_url || typeof file_url !== 'string') {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (semesterRaw === undefined || semesterRaw === null) {
      return NextResponse.json({ error: 'Semester is required' }, { status: 400 })
    }

    const semester = typeof semesterRaw === 'string' ? parseInt(semesterRaw, 10) : Number(semesterRaw)
    if (isNaN(semester) || semester < 1) {
      return NextResponse.json({ error: 'Invalid semester value' }, { status: 400 })
    }

    // â”€â”€ Validate semester against department max â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Parse tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let tags: string[] = []
    if (Array.isArray(tagsInput)) {
      tags = tagsInput.map((t: unknown) => String(t).trim()).filter((t: string) => t.length > 0)
    } else if (typeof tagsInput === 'string') {
      tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    }

    const fileType = (file_type as string || 'unknown').toLowerCase()

    // â”€â”€ Insert note â€” department_id always from server-side profile â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        department_id: profile.department_id, // NEVER from form â€” prevents IDOR
        uploaded_by: user.id,
        title: title.trim(),
        description: description.trim(),
        semester,
        tags,
        file_url: file_url,
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
