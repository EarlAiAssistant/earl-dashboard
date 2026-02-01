import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // For now, just log the contact form submission
    // In production, this would send an email via Resend
    console.log('Contact form submission:', {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // TODO: Send email via Resend when RESEND_API_KEY is configured
    // const { sendEmail } = await import('@/lib/email')
    // await sendEmail({
    //   to: 'support@call-content.com',
    //   subject: `[Contact Form] ${subject}: ${name}`,
    //   html: `<p><strong>From:</strong> ${name} (${email})</p>
    //          <p><strong>Company:</strong> ${company || 'N/A'}</p>
    //          <p><strong>Subject:</strong> ${subject}</p>
    //          <p><strong>Message:</strong></p>
    //          <p>${message}</p>`
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
