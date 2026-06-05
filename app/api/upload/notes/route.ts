import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadToCloudinary(buffer: Buffer): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'campusconnect/notes',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'))
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          })
        }
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || ''
    const semesterRaw = formData.get('semester')
    const tagsInput = formData.get('tags')

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!title || !title.trim()) {
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

    let tags: string[] = []
    if (tagsInput && typeof tagsInput === 'string') {
      tags = tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
    }

    // Upload file to Cloudinary as 'raw' resource (public by default)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown'

    console.log('[Upload] Uploading to Cloudinary with resource_type: raw...')
    const uploadResult = await uploadToCloudinary(buffer)
    console.log('[Upload] Cloudinary URL:', uploadResult.secure_url)
    console.log('[Upload] Public ID:', uploadResult.public_id)

    // Insert note record
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        department_id: profile.department_id,
        uploaded_by: user.id,
        title: title.trim(),
        description: description.trim(),
        semester,
        tags,
        file_url: uploadResult.secure_url,
        file_type: fileExtension,
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
