/**
 * Referral Program System
 * 
 * Give $20, Get $20 referral program:
 * - Referrer gets $20 credit when referee subscribes
 * - Referee gets $20 off their first month
 * - Credits applied as Stripe coupon/credit
 */

import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'

// ============================================
// Types
// ============================================

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  uses: number
  max_uses: number | null
  credits_earned: number
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referee_id: string
  referral_code: string
  status: 'pending' | 'qualified' | 'rewarded' | 'expired'
  referee_subscribed_at: string | null
  reward_issued_at: string | null
  created_at: string
}

export interface ReferralStats {
  totalReferrals: number
  qualifiedReferrals: number
  creditsEarned: number
  pendingCredits: number
}

// ============================================
// Constants
// ============================================

export const REFERRAL_REWARD_AMOUNT = 2000 // $20 in cents
export const REFEREE_DISCOUNT_AMOUNT = 2000 // $20 off first month
export const QUALIFYING_PERIOD_DAYS = 30 // Must stay subscribed for 30 days

// ============================================
// Code Generation
// ============================================

/**
 * Generate a unique referral code
 */
function generateReferralCode(prefix?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, O, 1, 0 to avoid confusion
  let code = prefix ? prefix.toUpperCase().slice(0, 4) : ''
  
  while (code.length < 8) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  
  return code
}

// ============================================
// Database Operations
// ============================================

/**
 * Get or create referral code for a user
 */
export async function getOrCreateReferralCode(userId: string, userName?: string): Promise<ReferralCode | null> {
  const supabase = await createClient()
  
  // Check for existing code
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (existing) return existing
  
  // Generate new code with name prefix if available
  const prefix = userName?.split(' ')[0]?.slice(0, 4) || undefined
  let code = generateReferralCode(prefix)
  
  // Ensure uniqueness
  let attempts = 0
  while (attempts < 5) {
    const { data: codeCheck } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()
    
    if (!codeCheck) break
    code = generateReferralCode()
    attempts++
  }
  
  // Create the code
  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      user_id: userId,
      code,
      uses: 0,
      credits_earned: 0,
    })
    .select()
    .single()
  
  if (error) {
    console.error('[Referral] Error creating code:', error)
    return null
  }
  
  return data
}

/**
 * Validate a referral code and get referrer info
 */
export async function validateReferralCode(code: string): Promise<{
  valid: boolean
  referrerId?: string
  referrerName?: string
  error?: string
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*, users!inner(id, name)')
    .eq('code', code.toUpperCase())
    .single()
  
  if (error || !data) {
    return { valid: false, error: 'Invalid referral code' }
  }
  
  // Check max uses
  if (data.max_uses && data.uses >= data.max_uses) {
    return { valid: false, error: 'This referral code has reached its limit' }
  }
  
  const user = data.users as { id: string; name: string }
  
  return {
    valid: true,
    referrerId: user.id,
    referrerName: user.name,
  }
}

/**
 * Apply referral code to new user signup
 */
export async function applyReferralCode(
  refereeId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Validate code
  const validation = await validateReferralCode(referralCode)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }
  
  // Can't refer yourself
  if (validation.referrerId === refereeId) {
    return { success: false, error: "You can't use your own referral code" }
  }
  
  // Check if already referred
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referee_id', refereeId)
    .single()
  
  if (existingReferral) {
    return { success: false, error: 'You have already used a referral code' }
  }
  
  // Create referral record
  const { error: insertError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: validation.referrerId,
      referee_id: refereeId,
      referral_code: referralCode.toUpperCase(),
      status: 'pending',
    })
  
  if (insertError) {
    console.error('[Referral] Error creating referral:', insertError)
    return { success: false, error: 'Failed to apply referral code' }
  }
  
  // Increment code usage
  await supabase.rpc('increment_referral_uses', { code_id: referralCode.toUpperCase() })
  
  // Store referrer ID on user for discount application
  await supabase
    .from('users')
    .update({ referred_by: validation.referrerId })
    .eq('id', refereeId)
  
  return { success: true }
}

/**
 * Create Stripe coupon for referee discount
 */
export async function createRefereeCoupon(): Promise<string | null> {
  try {
    const stripe = getStripe()
    
    // Check if coupon already exists
    try {
      const existing = await stripe.coupons.retrieve('REFERRAL_DISCOUNT')
      return existing.id
    } catch {
      // Coupon doesn't exist, create it
    }
    
    const coupon = await stripe.coupons.create({
      id: 'REFERRAL_DISCOUNT',
      amount_off: REFEREE_DISCOUNT_AMOUNT,
      currency: 'usd',
      duration: 'once',
      name: 'Referral Discount - $20 off first month',
    })
    
    return coupon.id
  } catch (error) {
    console.error('[Referral] Error creating coupon:', error)
    return null
  }
}

/**
 * Mark referral as qualified when referee subscribes and stays for qualifying period
 */
export async function qualifyReferral(refereeId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('referrals')
    .update({
      status: 'qualified',
      referee_subscribed_at: new Date().toISOString(),
    })
    .eq('referee_id', refereeId)
    .eq('status', 'pending')
}

/**
 * Issue reward to referrer
 */
export async function issueReferralReward(referralId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get referral details
  const { data: referral } = await supabase
    .from('referrals')
    .select('*, referrer:users!referrer_id(id, email, name, stripe_customer_id)')
    .eq('id', referralId)
    .single()
  
  if (!referral || referral.status !== 'qualified') {
    return false
  }
  
  const referrer = referral.referrer as {
    id: string
    email: string
    name: string
    stripe_customer_id: string
  }
  
  try {
    const stripe = getStripe()
    
    // Add credit to Stripe customer
    if (referrer.stripe_customer_id) {
      await stripe.customers.update(referrer.stripe_customer_id, {
        balance: -REFERRAL_REWARD_AMOUNT, // Negative = credit
      })
    }
    
    // Update referral status
    await supabase
      .from('referrals')
      .update({
        status: 'rewarded',
        reward_issued_at: new Date().toISOString(),
      })
      .eq('id', referralId)
    
    // Update referral code credits
    await supabase
      .from('referral_codes')
      .update({
        credits_earned: referral.referral_code 
          ? supabase.rpc('increment_credits', { 
              code: referral.referral_code, 
              amount: REFERRAL_REWARD_AMOUNT 
            })
          : REFERRAL_REWARD_AMOUNT,
      })
      .eq('code', referral.referral_code)
    
    // Send reward email
    if (referrer.email) {
      await sendReferralRewardEmail(referrer.name, referrer.email)
    }
    
    return true
  } catch (error) {
    console.error('[Referral] Error issuing reward:', error)
    return false
  }
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = await createClient()
  
  // Get referral code
  const { data: code } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // Get referrals
  const { data: referrals } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', userId)
  
  const stats: ReferralStats = {
    totalReferrals: referrals?.length || 0,
    qualifiedReferrals: referrals?.filter(r => r.status === 'qualified' || r.status === 'rewarded').length || 0,
    creditsEarned: code?.credits_earned || 0,
    pendingCredits: (referrals?.filter(r => r.status === 'qualified').length || 0) * REFERRAL_REWARD_AMOUNT,
  }
  
  return stats
}

/**
 * Get all referrals for a user (as referrer)
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
  
  return data || []
}

// ============================================
// Referral URL Generation
// ============================================

/**
 * Generate shareable referral URL
 */
export function getReferralUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://call-content.com'
  return `${baseUrl}/signup?ref=${code}`
}

// ============================================
// Email Templates
// ============================================

async function sendReferralRewardEmail(name: string, email: string): Promise<void> {
  const template = referralRewardEmail(name, REFERRAL_REWARD_AMOUNT / 100)
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export function referralRewardEmail(name: string, amount: number): { subject: string; html: string } {
  return {
    subject: `🎉 You earned $${amount} from your referral!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .reward { background: #ecfdf5; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
    .amount { font-size: 48px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>Cha-ching! 💰</h1>
    
    <p>Hey ${name},</p>
    
    <p>Great news! Someone you referred just became a paying customer, which means you've earned a reward:</p>
    
    <div class="reward">
      <div class="amount">$${amount}</div>
      <p style="margin: 10px 0 0 0; color: #059669;">Credit applied to your account</p>
    </div>
    
    <p>This credit will automatically be applied to your next invoice.</p>
    
    <p>Keep referring friends to earn more! Every new subscriber earns you $${amount}.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/referrals" class="button">Share Your Referral Link →</a>
    </p>
    
    <p>Thanks for spreading the word!</p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You're receiving this because you earned a referral reward.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function referralWelcomeEmail(name: string, referrerName: string, discount: number): { subject: string; html: string } {
  return {
    subject: `🎁 ${referrerName} gave you $${discount} off Call-Content!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .gift { background: #fef3c7; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
    .discount { font-size: 36px; font-weight: bold; color: #d97706; }
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
    
    <p>${referrerName} thought you'd love Call-Content, so they're giving you a special gift:</p>
    
    <div class="gift">
      <div class="discount">$${discount} OFF</div>
      <p style="margin: 10px 0 0 0; color: #b45309;">Your first month</p>
    </div>
    
    <p>With Call-Content, you can transform customer calls into marketing gold:</p>
    
    <ul>
      <li>✅ Upload transcripts or audio files</li>
      <li>✅ Generate blog posts, case studies, and social content</li>
      <li>✅ Export to your favorite tools</li>
    </ul>
    
    <p><strong>Your discount is automatically applied at checkout.</strong></p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://call-content.com/signup" class="button">Start Your Free Trial →</a>
    </p>
    
    <p>Best,<br><strong>The Call-Content Team</strong></p>
    
    <div class="footer">
      <p>You received this because ${referrerName} invited you to Call-Content.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
