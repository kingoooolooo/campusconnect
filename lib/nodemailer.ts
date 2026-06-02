import nodemailer from 'nodemailer'

// ============================================================
// SMTP TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// ============================================================
// SEND EMAIL HELPER
// ============================================================

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions): Promise<{ success: boolean; error?: unknown }> {
  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('[Nodemailer] Email send failed:', error)
    return { success: false, error }
  }
}

// ============================================================
// EMAIL TEMPLATES
// All templates share: dark background, monospace font,
// steel-blue accent, muted footer.
// ============================================================

const baseStyle = `
  font-family: 'Courier New', Courier, monospace;
  background: #000000;
  color: #ffffff;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
`

const hrStyle = `border: none; border-top: 1px solid #3A3B3C; margin: 28px 0;`

const footerStyle = `color: #52525B; font-size: 12px; margin: 0;`

const bodyTextStyle = `color: #E4E4E7; line-height: 1.6;`

const ctaButtonStyle = `
  display: inline-block;
  background: #607C8E;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  margin-top: 16px;
  letter-spacing: 0.05em;
`

export const emailTemplates = {
  /** Sent immediately after account creation — account is pending */
  welcome: (name: string) => ({
    subject: 'Welcome to CampusConnect',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: #607C8E; font-size: 24px; margin: 0 0 16px;">Welcome, ${name}.</h1>
        <p style="${bodyTextStyle}">Your CampusConnect account has been created.</p>
        <p style="${bodyTextStyle}">Your account is <strong>pending approval</strong> by your department admin. You will receive an email once your account is approved.</p>
        <hr style="${hrStyle}">
        <p style="${footerStyle}">CampusConnect — Built by students, for students.</p>
      </div>
    `,
  }),

  /** Sent when a department admin approves a student account */
  approved: (name: string) => ({
    subject: 'Your CampusConnect account has been approved',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: #2A7668; font-size: 24px; margin: 0 0 16px;">Approved.</h1>
        <p style="${bodyTextStyle}">${name}, your account has been approved.</p>
        <p style="${bodyTextStyle}">You now have full access to your department's space on CampusConnect — chat, notes, notices, and more.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="${ctaButtonStyle}">Log In to CampusConnect</a>
        <hr style="${hrStyle}">
        <p style="${footerStyle}">CampusConnect — Built by students, for students.</p>
      </div>
    `,
  }),

  /** Sent when a department admin rejects a student account */
  rejected: (name: string, reason: string) => ({
    subject: 'Your CampusConnect account was not approved',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: #8A2422; font-size: 24px; margin: 0 0 16px;">Not Approved.</h1>
        <p style="${bodyTextStyle}">${name}, your account was not approved.</p>
        <p style="${bodyTextStyle}"><strong>Reason:</strong> ${reason}</p>
        <p style="color: #52525B; font-size: 14px;">If you believe this is an error, contact your department admin directly.</p>
        <hr style="${hrStyle}">
        <p style="${footerStyle}">CampusConnect — Built by students, for students.</p>
      </div>
    `,
  }),

  /** Sent when an account is banned by an admin */
  banned: (name: string, reason: string) => ({
    subject: 'Your CampusConnect account has been banned',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: #8A2422; font-size: 24px; margin: 0 0 16px;">Banned.</h1>
        <p style="${bodyTextStyle}">${name}, your CampusConnect account has been banned.</p>
        <p style="${bodyTextStyle}"><strong>Reason:</strong> ${reason}</p>
        <p style="color: #52525B; font-size: 14px;">Contact the platform admin if you believe this is an error.</p>
        <hr style="${hrStyle}">
        <p style="${footerStyle}">CampusConnect — Built by students, for students.</p>
      </div>
    `,
  }),

  /** Sent to department admin when a new student registers */
  adminNewStudent: (studentName: string, department: string) => ({
    subject: `[CampusConnect] New student pending approval: ${studentName}`,
    html: `
      <div style="${baseStyle}">
        <h1 style="color: #607C8E; font-size: 24px; margin: 0 0 16px;">New Student Pending.</h1>
        <p style="${bodyTextStyle}">A new student has registered and is awaiting your approval.</p>
        <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
          <tr>
            <td style="color: #52525B; padding: 6px 0; width: 140px;">Name</td>
            <td style="color: #E4E4E7; padding: 6px 0;">${studentName}</td>
          </tr>
          <tr>
            <td style="color: #52525B; padding: 6px 0;">Department</td>
            <td style="color: #E4E4E7; padding: 6px 0;">${department}</td>
          </tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="${ctaButtonStyle}">Review in Admin Panel</a>
        <hr style="${hrStyle}">
        <p style="${footerStyle}">CampusConnect — Built by students, for students.</p>
      </div>
    `,
  }),
}
