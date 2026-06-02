import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, scholarNumber, departmentId, semester } = body

    if (!email || !password || !fullName || !scholarNumber || !departmentId || !semester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create user via Admin API — no Supabase email sent
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Auto-confirm so user can log in after approval
      user_metadata: {
        scholar_number: scholarNumber,
        full_name: fullName.trim(),
        department_id: departmentId,
        semester: parseInt(semester.toString()),
      },
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user?.id })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
