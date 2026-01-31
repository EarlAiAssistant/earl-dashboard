/**
 * Email Service for Call-Content
 * Uses Resend for transactional emails
 * 
 * Setup:
 * 1. Create account at resend.com
 * 2. Add RESEND_API_KEY to env vars
 * 3. Verify your domain
 */

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

let resendClient: any = null

/**
 * Get Resend client (lazy initialization)
 */
async function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set - emails will not be sent')
      return null
    }
    const { Resend } = await import('resend')
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const resend = await getResend()
    if (!resend) {
      console.log('[Email] Would send:', options.subject, 'to', options.to)
      return false
    }

    const { data, error } = await resend.emails.send({
      from: options.from || 'Call-Content <noreply@call-content.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('[Email] Error:', error)
      return false
    }

    console.log('[Email] Sent:', options.subject, 'to', options.to, 'id:', data?.id)
    return true
  } catch (error) {
    console.error('[Email] Exception:', error)
    return false
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Welcome email - sent after signup
 */
export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to Call-Content! 🎉',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Welcome, ${name}! 🎉</h1>
    
    <p>Thanks for signing up for Call-Content. You're about to transform how you create marketing content from customer calls.</p>
    
    <p>Here's what you can do with your 14-day free trial:</p>
    
    <ul>
      <li>✅ Upload transcripts or audio files</li>
      <li>✅ Generate blog posts, case studies, and social content</li>
      <li>✅ Export to your favorite tools</li>
      <li>✅ Access all premium templates</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/dashboard" class="button">Get Started Now →</a>
    </p>
    
    <p>Need help? Just reply to this email - we read every message.</p>
    
    <p>Happy content creating!</p>
    <p><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because you signed up for Call-Content.</p>
      <p>© 2026 Call-Content. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Trial ending warning - sent 3 days before trial ends
 */
export function trialEndingEmail(name: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `⏰ Your Call-Content trial ends in ${daysLeft} days`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .highlight { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Hey ${name},</h1>
    
    <p>Your free trial ends in <strong>${daysLeft} days</strong>. After that, you'll lose access to:</p>
    
    <ul>
      <li>📝 All your generated content</li>
      <li>🎙️ Saved transcripts</li>
      <li>✨ Premium templates</li>
    </ul>
    
    <div class="highlight">
      <p style="margin: 0;"><strong>🎁 Special offer:</strong> Upgrade now and get 30% off your first 3 months with code <strong>TRIAL30</strong></p>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Upgrade Now →</a>
    </p>
    
    <p>Questions? Just reply to this email.</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because you signed up for Call-Content.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Usage limit warning - sent at 80% usage
 */
export function usageLimitWarningEmail(name: string, used: number, limit: number): { subject: string; html: string } {
  const percent = Math.round((used / limit) * 100)
  return {
    subject: `⚠️ You've used ${percent}% of your monthly transcripts`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .progress { background: #e5e7eb; border-radius: 8px; height: 24px; overflow: hidden; margin: 20px 0; }
    .progress-bar { background: #f59e0b; height: 100%; transition: width 0.3s; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; }
    .button-secondary { background: #f59e0b; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Hey ${name},</h1>
    
    <p>You've used <strong>${used} of ${limit}</strong> transcripts this month (${percent}%).</p>
    
    <div class="progress">
      <div class="progress-bar" style="width: ${percent}%"></div>
    </div>
    
    <p>Don't worry - you have options:</p>
    
    <ul>
      <li><strong>Upgrade your plan</strong> for more monthly transcripts</li>
      <li><strong>Buy a booster pack</strong> (+5 transcripts for $47)</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Upgrade Plan</a>
      <a href="https://call-content.com/billing#booster" class="button button-secondary">Buy Booster</a>
    </p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because you have an active Call-Content subscription.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Payment receipt - sent after successful payment
 */
export function paymentReceiptEmail(
  name: string, 
  amount: number, 
  plan: string, 
  date: Date
): { subject: string; html: string } {
  return {
    subject: `✅ Payment received - $${amount} for Call-Content ${plan}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .receipt { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .receipt-row:last-child { border-bottom: none; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Thanks, ${name}! ✅</h1>
    
    <p>We've received your payment. Here's your receipt:</p>
    
    <div class="receipt">
      <div class="receipt-row">
        <span>Plan</span>
        <span>${plan}</span>
      </div>
      <div class="receipt-row">
        <span>Date</span>
        <span>${date.toLocaleDateString()}</span>
      </div>
      <div class="receipt-row">
        <span>Amount</span>
        <span>$${amount.toFixed(2)}</span>
      </div>
    </div>
    
    <p>Your subscription is active. Happy content creating!</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>This is your receipt for your Call-Content subscription.</p>
      <p>Questions? Reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

// ============================================
// DUNNING EMAILS (Payment Recovery)
// ============================================

/**
 * Payment failed - Initial notification (Day 0)
 */
export function paymentFailedEmail(name: string, amount: number, lastFour?: string): { subject: string; html: string } {
  return {
    subject: `⚠️ Your payment of $${amount} failed`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Hey ${name},</h1>
    
    <div class="alert">
      <p style="margin: 0;"><strong>Your payment of $${amount.toFixed(2)} didn't go through.</strong></p>
      ${lastFour ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Card ending in ${lastFour}</p>` : ''}
    </div>
    
    <p>No worries - this happens! Common reasons:</p>
    
    <ul>
      <li>Expired card</li>
      <li>Insufficient funds</li>
      <li>Bank flagged it as unusual activity</li>
    </ul>
    
    <p><strong>Your account is still active.</strong> We'll retry the payment in a few days, but you can update your card now to avoid any interruption:</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Update Payment Method →</a>
    </p>
    
    <p>Questions? Just reply to this email.</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because your Call-Content payment didn't process.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Payment still failing - Second notice (Day 3)
 */
export function paymentReminderEmail(name: string, amount: number, daysOverdue: number): { subject: string; html: string } {
  return {
    subject: `🔴 Action required: Update your payment method`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Hey ${name},</h1>
    
    <div class="warning">
      <p style="margin: 0;"><strong>We've tried to charge your card multiple times, but it keeps failing.</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">$${amount.toFixed(2)} • ${daysOverdue} days overdue</p>
    </div>
    
    <p>Your subscription is at risk of being suspended. To keep your account active and protect your content, please update your payment method:</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Update Payment Now →</a>
    </p>
    
    <p>If you're having trouble or need more time, just reply to this email - we're happy to help.</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because your Call-Content payment is overdue.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Account suspension warning (Day 7)
 */
export function suspensionWarningEmail(name: string, amount: number): { subject: string; html: string } {
  return {
    subject: `🚨 Your account will be suspended in 7 days`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .urgent { background: #fef2f2; border: 2px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .countdown { font-size: 36px; font-weight: bold; color: #ef4444; text-align: center; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Hey ${name},</h1>
    
    <div class="urgent">
      <div class="countdown">7 days until suspension</div>
      <p style="text-align: center; margin: 10px 0 0 0;">Outstanding balance: <strong>$${amount.toFixed(2)}</strong></p>
    </div>
    
    <p>We haven't been able to process your payment. If we don't receive payment in the next 7 days, your account will be suspended and you'll lose access to:</p>
    
    <ul>
      <li>❌ All your transcripts</li>
      <li>❌ Generated content</li>
      <li>❌ Saved templates</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Pay Now & Keep Access →</a>
    </p>
    
    <p><strong>Having financial difficulties?</strong> We understand. Reply to this email and let's work something out.</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because your Call-Content payment is significantly overdue.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Final notice before cancellation (Day 14)
 */
export function finalNoticeEmail(name: string, amount: number): { subject: string; html: string } {
  return {
    subject: `⛔ FINAL NOTICE: Your account will be cancelled tomorrow`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .critical { background: #1f2937; color: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .critical h2 { color: #ef4444; margin: 0 0 10px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>${name},</h1>
    
    <div class="critical">
      <h2>⛔ FINAL NOTICE</h2>
      <p style="margin: 0;">Your account will be <strong>cancelled tomorrow</strong> and all data will be <strong>permanently deleted</strong>.</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Outstanding: $${amount.toFixed(2)}</p>
    </div>
    
    <p>This is your last chance to save your account. After cancellation:</p>
    
    <ul>
      <li>🗑️ All transcripts will be deleted</li>
      <li>🗑️ All generated content will be deleted</li>
      <li>🗑️ Your account cannot be recovered</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/billing" class="button">Save My Account →</a>
    </p>
    
    <p>If you've already updated your payment method, you can ignore this email.</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>This is an automated final notice for your Call-Content account.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Account reactivated after payment
 */
export function accountReactivatedEmail(name: string): { subject: string; html: string } {
  return {
    subject: `✅ Welcome back! Your account is reactivated`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .success { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Welcome back, ${name}! 🎉</h1>
    
    <div class="success">
      <p style="margin: 0;"><strong>Great news!</strong> Your payment went through and your account is fully reactivated.</p>
    </div>
    
    <p>All your content is safe and waiting for you:</p>
    
    <ul>
      <li>✅ All transcripts restored</li>
      <li>✅ All generated content available</li>
      <li>✅ Full feature access restored</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/dashboard" class="button">Go to Dashboard →</a>
    </p>
    
    <p>Thanks for sticking with us!</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because your Call-Content account was reactivated.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

/**
 * Booster pack confirmation
 */
export function boosterPackEmail(name: string, credits: number): { subject: string; html: string } {
  return {
    subject: `🚀 +${credits} transcripts added to your account!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .highlight { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .big-number { font-size: 48px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Booster Pack Activated! 🚀</h1>
    
    <p>Hey ${name},</p>
    
    <p>We've added your booster credits to your account:</p>
    
    <div class="highlight">
      <div class="big-number">+${credits}</div>
      <p style="margin: 0; color: #059669;">transcripts added</p>
    </div>
    
    <p>These credits are available immediately and valid until your next billing cycle.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/dashboard" class="button">Start Creating →</a>
    </p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You purchased a booster pack for Call-Content.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
