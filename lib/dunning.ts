/**
 * Dunning Management System
 * 
 * Handles payment failure recovery through automated email sequences.
 * Integrates with Stripe webhooks to track payment status.
 * 
 * Dunning Schedule:
 * - Day 0: Initial payment failed notification
 * - Day 3: Second notice (reminder)
 * - Day 7: Suspension warning
 * - Day 14: Final notice before cancellation
 * - Day 15: Account suspended/cancelled
 */

import { createClient } from '@/lib/supabase/server'
import { 
  sendEmail, 
  paymentFailedEmail, 
  paymentReminderEmail, 
  suspensionWarningEmail, 
  finalNoticeEmail,
  accountReactivatedEmail 
} from '@/lib/email'

// ============================================
// Types
// ============================================

export type DunningStage = 
  | 'none'           // No issues
  | 'initial'        // Day 0 - First failure
  | 'reminder'       // Day 3 - Second notice  
  | 'warning'        // Day 7 - Suspension warning
  | 'final'          // Day 14 - Final notice
  | 'suspended'      // Day 15+ - Account suspended

export interface DunningRecord {
  user_id: string
  stage: DunningStage
  amount_due: number
  currency: string
  failed_at: string // ISO timestamp
  last_email_sent_at: string | null
  emails_sent: number
  stripe_invoice_id: string
  stripe_payment_intent_id?: string
  card_last_four?: string
  created_at: string
  updated_at: string
}

export interface DunningEmailResult {
  sent: boolean
  stage: DunningStage
  error?: string
}

// ============================================
// Dunning Stage Calculation
// ============================================

/**
 * Calculate the appropriate dunning stage based on days since failure
 */
export function calculateDunningStage(failedAt: Date): DunningStage {
  const now = new Date()
  const daysSinceFailure = Math.floor(
    (now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceFailure >= 15) return 'suspended'
  if (daysSinceFailure >= 14) return 'final'
  if (daysSinceFailure >= 7) return 'warning'
  if (daysSinceFailure >= 3) return 'reminder'
  return 'initial'
}

/**
 * Get days overdue from failure date
 */
export function getDaysOverdue(failedAt: Date): number {
  const now = new Date()
  return Math.floor(
    (now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
}

// ============================================
// Database Operations
// ============================================

/**
 * Create or update dunning record when payment fails
 */
export async function createDunningRecord(
  userId: string,
  stripeInvoiceId: string,
  amountDue: number,
  currency: string = 'usd',
  cardLastFour?: string,
  paymentIntentId?: string
): Promise<DunningRecord | null> {
  const supabase = await createClient()
  
  const record: Partial<DunningRecord> = {
    user_id: userId,
    stage: 'initial',
    amount_due: amountDue,
    currency,
    failed_at: new Date().toISOString(),
    stripe_invoice_id: stripeInvoiceId,
    stripe_payment_intent_id: paymentIntentId,
    card_last_four: cardLastFour,
    emails_sent: 0,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('dunning_records')
    .upsert(record, { onConflict: 'stripe_invoice_id' })
    .select()
    .single()

  if (error) {
    console.error('[Dunning] Error creating record:', error)
    return null
  }

  return data
}

/**
 * Get active dunning record for user
 */
export async function getDunningRecord(userId: string): Promise<DunningRecord | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('dunning_records')
    .select('*')
    .eq('user_id', userId)
    .neq('stage', 'none')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

/**
 * Update dunning record stage
 */
export async function updateDunningStage(
  invoiceId: string,
  stage: DunningStage
): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('dunning_records')
    .update({ 
      stage, 
      updated_at: new Date().toISOString() 
    })
    .eq('stripe_invoice_id', invoiceId)
}

/**
 * Mark dunning record as resolved (payment successful)
 */
export async function resolveDunningRecord(invoiceId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('dunning_records')
    .update({ 
      stage: 'none',
      updated_at: new Date().toISOString() 
    })
    .eq('stripe_invoice_id', invoiceId)
}

/**
 * Record email sent
 */
export async function recordDunningEmail(
  invoiceId: string,
  stage: DunningStage
): Promise<void> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('dunning_records')
    .select('emails_sent')
    .eq('stripe_invoice_id', invoiceId)
    .single()

  await supabase
    .from('dunning_records')
    .update({ 
      stage,
      emails_sent: (data?.emails_sent || 0) + 1,
      last_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('stripe_invoice_id', invoiceId)
}

// ============================================
// Email Sending
// ============================================

/**
 * Send appropriate dunning email based on current stage
 */
export async function sendDunningEmail(
  record: DunningRecord,
  userName: string,
  userEmail: string
): Promise<DunningEmailResult> {
  const failedAt = new Date(record.failed_at)
  const stage = calculateDunningStage(failedAt)
  const daysOverdue = getDaysOverdue(failedAt)
  
  // Don't re-send if already sent for this stage
  if (record.stage === stage && record.last_email_sent_at) {
    const lastSent = new Date(record.last_email_sent_at)
    const hoursSinceLast = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60)
    
    // Don't send more than once per 24 hours for same stage
    if (hoursSinceLast < 24) {
      return { sent: false, stage, error: 'Already sent recently' }
    }
  }

  let email: { subject: string; html: string }
  
  switch (stage) {
    case 'initial':
      email = paymentFailedEmail(userName, record.amount_due / 100, record.card_last_four)
      break
    case 'reminder':
      email = paymentReminderEmail(userName, record.amount_due / 100, daysOverdue)
      break
    case 'warning':
      email = suspensionWarningEmail(userName, record.amount_due / 100)
      break
    case 'final':
      email = finalNoticeEmail(userName, record.amount_due / 100)
      break
    case 'suspended':
      // Don't send emails after suspension
      return { sent: false, stage, error: 'Account already suspended' }
    default:
      return { sent: false, stage, error: 'Unknown stage' }
  }

  const sent = await sendEmail({
    to: userEmail,
    subject: email.subject,
    html: email.html,
  })

  if (sent) {
    await recordDunningEmail(record.stripe_invoice_id, stage)
  }

  return { sent, stage }
}

/**
 * Send reactivation email when payment succeeds
 */
export async function sendReactivationEmail(
  userName: string,
  userEmail: string
): Promise<boolean> {
  const email = accountReactivatedEmail(userName)
  
  return sendEmail({
    to: userEmail,
    subject: email.subject,
    html: email.html,
  })
}

// ============================================
// Account Status
// ============================================

/**
 * Check if user's account should be suspended
 */
export async function checkAccountStatus(userId: string): Promise<{
  status: 'active' | 'grace' | 'suspended'
  daysOverdue?: number
  amountDue?: number
}> {
  const record = await getDunningRecord(userId)
  
  if (!record || record.stage === 'none') {
    return { status: 'active' }
  }

  const failedAt = new Date(record.failed_at)
  const daysOverdue = getDaysOverdue(failedAt)

  if (daysOverdue >= 15) {
    return { 
      status: 'suspended', 
      daysOverdue, 
      amountDue: record.amount_due / 100 
    }
  }

  return { 
    status: 'grace', 
    daysOverdue, 
    amountDue: record.amount_due / 100 
  }
}

/**
 * Suspend account (called after final notice period)
 */
export async function suspendAccount(userId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('users')
    .update({ 
      subscription_status: 'suspended',
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)

  // Update dunning record
  const record = await getDunningRecord(userId)
  if (record) {
    await updateDunningStage(record.stripe_invoice_id, 'suspended')
  }
}

/**
 * Reactivate account after successful payment
 */
export async function reactivateAccount(userId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('users')
    .update({ 
      subscription_status: 'active',
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)

  // Resolve dunning record
  const record = await getDunningRecord(userId)
  if (record) {
    await resolveDunningRecord(record.stripe_invoice_id)
  }
}

// ============================================
// Batch Processing (for cron job)
// ============================================

/**
 * Process all active dunning records
 * Should be called daily by a cron job
 */
export async function processDunningQueue(): Promise<{
  processed: number
  emailsSent: number
  accountsSuspended: number
  errors: string[]
}> {
  const supabase = await createClient()
  const results = {
    processed: 0,
    emailsSent: 0,
    accountsSuspended: 0,
    errors: [] as string[],
  }

  // Get all active dunning records
  const { data: records, error } = await supabase
    .from('dunning_records')
    .select('*, users!inner(name, email)')
    .neq('stage', 'none')
    .neq('stage', 'suspended')

  if (error || !records) {
    results.errors.push(`Failed to fetch records: ${error?.message}`)
    return results
  }

  for (const record of records) {
    results.processed++
    
    try {
      const user = record.users as { name: string; email: string }
      const failedAt = new Date(record.failed_at)
      const stage = calculateDunningStage(failedAt)

      // Check if account should be suspended
      if (stage === 'suspended') {
        await suspendAccount(record.user_id)
        results.accountsSuspended++
        continue
      }

      // Send appropriate email
      const emailResult = await sendDunningEmail(
        record,
        user.name,
        user.email
      )

      if (emailResult.sent) {
        results.emailsSent++
      }
    } catch (err) {
      results.errors.push(`Error processing ${record.user_id}: ${err}`)
    }
  }

  return results
}
