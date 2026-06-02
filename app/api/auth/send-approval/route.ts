import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/nodemailer'

export async function POST(request: Request) {
  try {
    const { email, fullName, departmentName } = await request.json()

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const html = `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 32px; background: #0D0D0E; color: #FFFFFF;">
        <h1 style="color: #607C8E; font-size: 20px; margin-bottom: 16px;">
          CampusConnect
        </h1>
        <p style="color: #E4E4E7; font-size: 14px; line-height: 1.6;">
          Hello ${fullName},
        </p>
        <p style="color: #E4E4E7; font-size: 14px; line-height: 1.6;">
          Great news! Your account has been <strong style="color: #2A7668;">approved</strong>.
          You can now sign in to CampusConnect and access
          ${departmentName ? `<strong>${departmentName}</strong>` : 'your department'}'s
          resources including chat, notes, notices, and more.
        </p>
        <div style="margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login"
             style="display: inline-block; padding: 12px 24px; background: #607C8E; color: #FFFFFF; text-decoration: none; font-family: monospace; font-size: 12px; letter-spacing: 0.05em;">
            SIGN IN NOW
          </a>
        </div>
        <p style="color: #52525B; font-size: 11px; margin-top: 24px;">
          If you didn't request this account, please ignore this email.
        </p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: 'Your CampusConnect Account Has Been Approved',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send approval email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
