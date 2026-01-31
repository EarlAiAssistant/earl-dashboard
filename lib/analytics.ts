'use client'

import posthog from 'posthog-js'

/**
 * Analytics utility for Call-Content
 * Wraps PostHog with specific event tracking functions
 */

// Check if PostHog is available
function isPostHogReady(): boolean {
  return typeof window !== 'undefined' && posthog && posthog.__loaded
}

// Generic track function
function track(eventName: string, properties?: Record<string, any>) {
  if (isPostHogReady()) {
    posthog.capture(eventName, properties)
  }
}

// ============================================
// ACCOUNT & AUTH EVENTS
// ============================================

export const AuthAnalytics = {
  signupStarted: (source?: string) => 
    track('signup_started', { source }),
  
  signupCompleted: (method: 'email' | 'google', plan: string) =>
    track('signup_completed', { method, plan }),
  
  login: (method: 'email' | 'google') =>
    track('login', { method }),
  
  logout: () =>
    track('logout'),
  
  passwordResetRequested: () =>
    track('password_reset_requested'),
  
  passwordResetCompleted: () =>
    track('password_reset_completed'),
}

// ============================================
// ONBOARDING EVENTS
// ============================================

export const OnboardingAnalytics = {
  started: () => 
    track('onboarding_started'),
  
  stepViewed: (step: string) =>
    track('onboarding_step_viewed', { step }),
  
  stepCompleted: (step: string, timeSeconds?: number) =>
    track('onboarding_step_completed', { step, time_seconds: timeSeconds }),
  
  completed: (totalTimeSeconds: number) =>
    track('onboarding_completed', { time_to_complete: totalTimeSeconds }),
  
  skipped: (fromStep: string) =>
    track('onboarding_skipped', { step: fromStep }),
  
  modalViewed: () =>
    track('onboarding_modal_viewed'),
  
  modalDismissed: () =>
    track('onboarding_modal_dismissed'),
  
  getStartedClicked: () =>
    track('onboarding_get_started_clicked'),
}

// ============================================
// TRANSCRIPT EVENTS
// ============================================

export const TranscriptAnalytics = {
  uploadStarted: (source: 'file' | 'paste' | 'url' | 'record') =>
    track('transcript_upload_started', { source }),
  
  uploadCompleted: (source: string, wordCount: number, durationSeconds?: number) =>
    track('transcript_upload_completed', { source, word_count: wordCount, duration_seconds: durationSeconds }),
  
  uploadFailed: (source: string, error: string) =>
    track('transcript_upload_failed', { source, error }),
  
  transcriptionStarted: (fileType: string, durationSeconds: number) =>
    track('transcription_started', { file_type: fileType, duration_seconds: durationSeconds }),
  
  transcriptionCompleted: (durationSeconds: number, costUsd: number) =>
    track('transcription_completed', { duration_seconds: durationSeconds, cost_usd: costUsd }),
  
  transcriptionFailed: (error: string) =>
    track('transcription_failed', { error }),
  
  viewed: (transcriptId: string) =>
    track('transcript_viewed', { transcript_id: transcriptId }),
  
  deleted: (transcriptId: string) =>
    track('transcript_deleted', { transcript_id: transcriptId }),
}

// ============================================
// CONTENT GENERATION EVENTS
// ============================================

export const ContentAnalytics = {
  generationStarted: (template: string, transcriptId: string) =>
    track('content_generation_started', { template, transcript_id: transcriptId }),
  
  generationCompleted: (template: string, wordCount: number, generationTimeSeconds: number) =>
    track('content_generation_completed', { 
      template, 
      word_count: wordCount, 
      generation_time_seconds: generationTimeSeconds 
    }),
  
  generationFailed: (template: string, error: string) =>
    track('content_generation_failed', { template, error }),
  
  contentViewed: (contentId: string, template: string) =>
    track('content_viewed', { content_id: contentId, template }),
  
  contentEdited: (contentId: string, template: string) =>
    track('content_edited', { content_id: contentId, template }),
  
  contentExported: (contentId: string, format: 'markdown' | 'docx' | 'pdf' | 'html') =>
    track('content_exported', { content_id: contentId, format }),
  
  contentCopied: (contentId: string) =>
    track('content_copied', { content_id: contentId }),
  
  contentDeleted: (contentId: string) =>
    track('content_deleted', { content_id: contentId }),
}

// ============================================
// TEMPLATE EVENTS
// ============================================

export const TemplateAnalytics = {
  viewed: (template: string) =>
    track('template_viewed', { template }),
  
  selected: (template: string) =>
    track('template_selected', { template }),
  
  customized: (template: string) =>
    track('template_customized', { template }),
}

// ============================================
// BILLING & SUBSCRIPTION EVENTS
// ============================================

export const BillingAnalytics = {
  pricingViewed: () =>
    track('pricing_page_viewed'),
  
  planSelected: (tier: string, billingPeriod: 'monthly' | 'annual') =>
    track('plan_selected', { tier, billing_period: billingPeriod }),
  
  checkoutStarted: (tier: string, amount: number) =>
    track('checkout_started', { tier, amount }),
  
  checkoutCompleted: (tier: string, amount: number) =>
    track('checkout_completed', { tier, amount }),
  
  checkoutAbandoned: (tier: string, step: string) =>
    track('checkout_abandoned', { tier, step }),
  
  trialStarted: (tier: string) =>
    track('trial_started', { tier }),
  
  trialEnding: (daysRemaining: number) =>
    track('trial_ending', { days_remaining: daysRemaining }),
  
  trialConverted: (tier: string) =>
    track('trial_converted', { tier }),
  
  trialExpired: (tier: string) =>
    track('trial_expired', { tier }),
  
  boosterPackViewed: (usagePercent: number) =>
    track('booster_pack_viewed', { usage_percent: usagePercent }),
  
  boosterPackPurchased: (credits: number, amount: number) =>
    track('booster_pack_purchased', { credits, amount }),
  
  limitReached: (currentUsage: number, limit: number) =>
    track('usage_limit_reached', { current_usage: currentUsage, limit }),
  
  gracePeriodEntered: (usagePercent: number) =>
    track('grace_period_entered', { usage_percent: usagePercent }),
  
  upgraded: (fromTier: string, toTier: string) =>
    track('plan_upgraded', { from_tier: fromTier, to_tier: toTier }),
  
  downgraded: (fromTier: string, toTier: string) =>
    track('plan_downgraded', { from_tier: fromTier, to_tier: toTier }),
  
  cancelled: (tier: string, reason?: string) =>
    track('subscription_cancelled', { tier, reason }),
}

// ============================================
// FEATURE USAGE EVENTS
// ============================================

export const FeatureAnalytics = {
  used: (feature: string, properties?: Record<string, any>) =>
    track('feature_used', { feature, ...properties }),
  
  searchUsed: (query: string, resultsCount: number) =>
    track('search_used', { query_length: query.length, results_count: resultsCount }),
  
  filterUsed: (filterType: string, filterValue: string) =>
    track('filter_used', { filter_type: filterType, filter_value: filterValue }),
  
  sortUsed: (sortField: string, sortDirection: 'asc' | 'desc') =>
    track('sort_used', { sort_field: sortField, sort_direction: sortDirection }),
  
  exportUsed: (format: string, itemCount: number) =>
    track('export_used', { format, item_count: itemCount }),
}

// ============================================
// ERROR TRACKING
// ============================================

export const ErrorAnalytics = {
  occurred: (errorType: string, errorMessage: string, context?: Record<string, any>) =>
    track('error_occurred', { 
      error_type: errorType, 
      error_message: errorMessage,
      ...context 
    }),
  
  pageNotFound: (path: string) =>
    track('page_not_found', { path }),
  
  apiError: (endpoint: string, statusCode: number, errorMessage: string) =>
    track('api_error', { endpoint, status_code: statusCode, error_message: errorMessage }),
}

// ============================================
// PAGE & NAVIGATION EVENTS
// ============================================

export const PageAnalytics = {
  viewed: (pageName: string, properties?: Record<string, any>) =>
    track('page_viewed', { page_name: pageName, ...properties }),
  
  timeSpent: (pageName: string, durationSeconds: number) =>
    track('page_time_spent', { page_name: pageName, duration_seconds: durationSeconds }),
  
  scrollDepth: (pageName: string, depthPercent: number) =>
    track('page_scroll_depth', { page_name: pageName, depth_percent: depthPercent }),
}

// Export the raw track function for custom events
export { track }
