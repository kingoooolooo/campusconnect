import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const template = emailTemplates.welcome(name)
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (!result.success) {
      // Don't fail the signup flow if email fails
      return NextResponse.json({ sent: false })
    }

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ sent: false })
  }
}
