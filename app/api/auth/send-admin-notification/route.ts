import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, emailTemplates } from '@/lib/nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { studentName, departmentId, departmentName } = await request.json()
    
    if (!studentName || !departmentId || !departmentName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Find department admin(s) for this department
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('department_id', departmentId)
      .eq('role', 'department_admin')
      .eq('status', 'approved')

    // Also notify super admin
    const { data: superAdmin } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'super_admin')
      .single()

    const recipients = [
      ...(admins?.map(a => a.email) || []),
      ...(superAdmin ? [superAdmin.email] : []),
    ]

    if (recipients.length === 0) {
      return NextResponse.json({ sent: false, reason: 'No admins found' })
    }

    const template = emailTemplates.adminNewStudent(studentName, departmentName)

    for (const email of recipients) {
      await sendEmail({ to: email, subject: template.subject, html: template.html })
    }

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ sent: false })
  }
}
