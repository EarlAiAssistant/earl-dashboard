/**
 * Feature Flags System for Call-Content
 * 
 * Supports:
 * - Static flags (defined in code)
 * - Environment-based flags
 * - User-based rollout percentages
 * - PostHog integration for remote flags
 */

// ============================================
// FEATURE FLAG DEFINITIONS
// ============================================

export type FeatureFlag =
  | 'new_onboarding'
  | 'audio_upload'
  | 'ai_templates'
  | 'team_collaboration'
  | 'api_access'
  | 'advanced_analytics'
  | 'custom_branding'
  | 'priority_processing'
  | 'beta_features'
  | 'dark_mode'
  | 'keyboard_shortcuts'
  | 'command_palette'

interface FeatureConfig {
  /** Human-readable name */
  name: string
  /** Description of the feature */
  description: string
  /** Is this feature enabled by default? */
  defaultEnabled: boolean
  /** Percentage of users to roll out to (0-100) */
  rolloutPercentage?: number
  /** Minimum subscription tier required */
  minTier?: 'starter' | 'professional' | 'agency' | 'enterprise'
  /** Environment(s) where this feature is enabled */
  environments?: ('development' | 'staging' | 'production')[]
  /** Is this a beta feature? */
  beta?: boolean
}

/**
 * Feature flag configuration
 * 
 * Modify this object to control feature availability
 */
export const FEATURE_FLAGS: Record<FeatureFlag, FeatureConfig> = {
  new_onboarding: {
    name: 'New Onboarding Flow',
    description: 'Redesigned onboarding checklist with progress tracking',
    defaultEnabled: true,
    environments: ['development', 'staging', 'production'],
  },
  audio_upload: {
    name: 'Audio Upload',
    description: 'Upload audio/video files for automatic transcription',
    defaultEnabled: true,
    environments: ['development', 'staging', 'production'],
  },
  ai_templates: {
    name: 'AI Templates',
    description: 'AI-powered custom template generation',
    defaultEnabled: false,
    rolloutPercentage: 20,
    beta: true,
  },
  team_collaboration: {
    name: 'Team Collaboration',
    description: 'Invite team members and share transcripts',
    defaultEnabled: false,
    minTier: 'agency',
  },
  api_access: {
    name: 'API Access',
    description: 'Programmatic access to Call-Content API',
    defaultEnabled: false,
    minTier: 'agency',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed usage analytics and insights',
    defaultEnabled: false,
    minTier: 'professional',
  },
  custom_branding: {
    name: 'Custom Branding',
    description: 'White-label content with your branding',
    defaultEnabled: false,
    minTier: 'agency',
  },
  priority_processing: {
    name: 'Priority Processing',
    description: 'Faster transcript and content processing',
    defaultEnabled: false,
    minTier: 'professional',
  },
  beta_features: {
    name: 'Beta Features',
    description: 'Access to experimental features',
    defaultEnabled: false,
    environments: ['development', 'staging'],
  },
  dark_mode: {
    name: 'Dark Mode',
    description: 'Dark color theme',
    defaultEnabled: true,
  },
  keyboard_shortcuts: {
    name: 'Keyboard Shortcuts',
    description: 'Navigate with keyboard shortcuts',
    defaultEnabled: true,
  },
  command_palette: {
    name: 'Command Palette',
    description: 'Quick command search with Cmd+K',
    defaultEnabled: true,
  },
}

// ============================================
// FEATURE FLAG UTILITIES
// ============================================

interface FeatureContext {
  userId?: string
  tier?: string
  environment?: string
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  context: FeatureContext = {}
): boolean {
  const config = FEATURE_FLAGS[flag]
  if (!config) return false

  const {
    userId,
    tier = 'starter',
    environment = process.env.NODE_ENV === 'production' ? 'production' : 'development',
  } = context

  // Check environment
  if (config.environments && !config.environments.includes(environment as any)) {
    return false
  }

  // Check tier requirement
  if (config.minTier) {
    const tierOrder = ['starter', 'professional', 'agency', 'enterprise']
    const userTierIndex = tierOrder.indexOf(tier)
    const requiredTierIndex = tierOrder.indexOf(config.minTier)
    if (userTierIndex < requiredTierIndex) {
      return false
    }
  }

  // Check rollout percentage
  if (config.rolloutPercentage !== undefined && userId) {
    const hash = simpleHash(userId + flag)
    const percentage = hash % 100
    if (percentage >= config.rolloutPercentage) {
      return false
    }
  }

  return config.defaultEnabled
}

/**
 * Get all enabled features for a user
 */
export function getEnabledFeatures(context: FeatureContext = {}): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter((flag) =>
    isFeatureEnabled(flag, context)
  )
}

/**
 * Get feature config
 */
export function getFeatureConfig(flag: FeatureFlag): FeatureConfig | undefined {
  return FEATURE_FLAGS[flag]
}

/**
 * Check if user has access to a feature (for UI display)
 */
export function hasFeatureAccess(
  flag: FeatureFlag,
  tier: string
): { hasAccess: boolean; reason?: string } {
  const config = FEATURE_FLAGS[flag]
  if (!config) return { hasAccess: false, reason: 'Feature not found' }

  if (config.minTier) {
    const tierOrder = ['starter', 'professional', 'agency', 'enterprise']
    const userTierIndex = tierOrder.indexOf(tier)
    const requiredTierIndex = tierOrder.indexOf(config.minTier)
    
    if (userTierIndex < requiredTierIndex) {
      return {
        hasAccess: false,
        reason: `Requires ${config.minTier} plan or higher`,
      }
    }
  }

  if (config.beta) {
    return {
      hasAccess: config.defaultEnabled,
      reason: config.defaultEnabled ? 'Beta feature' : 'Beta feature (not yet available)',
    }
  }

  return { hasAccess: config.defaultEnabled }
}

/**
 * Simple hash function for consistent rollout
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// ============================================
// REACT INTEGRATION
// ============================================

import { createContext, useContext, ReactNode } from 'react'

interface FeatureFlagsContextType {
  isEnabled: (flag: FeatureFlag) => boolean
  features: FeatureFlag[]
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined)

/**
 * Feature Flags Provider
 * 
 * Usage:
 * ```
 * <FeatureFlagsProvider userId={user.id} tier={user.tier}>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export function FeatureFlagsProvider({
  children,
  userId,
  tier,
}: {
  children: ReactNode
  userId?: string
  tier?: string
}) {
  const context: FeatureContext = { userId, tier }
  
  const isEnabled = (flag: FeatureFlag) => isFeatureEnabled(flag, context)
  const features = getEnabledFeatures(context)

  return (
    <FeatureFlagsContext.Provider value={{ isEnabled, features }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

/**
 * Hook to check feature flags
 * 
 * Usage:
 * ```
 * const { isEnabled } = useFeatureFlags()
 * if (isEnabled('new_onboarding')) {
 *   // Show new onboarding
 * }
 * ```
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    // Return default behavior if not in provider
    return {
      isEnabled: (flag: FeatureFlag) => isFeatureEnabled(flag),
      features: getEnabledFeatures(),
    }
  }
  return context
}

/**
 * Component that conditionally renders based on feature flag
 * 
 * Usage:
 * ```
 * <Feature flag="new_onboarding">
 *   <NewOnboarding />
 * </Feature>
 * 
 * <Feature flag="team_collaboration" fallback={<UpgradePrompt />}>
 *   <TeamFeatures />
 * </Feature>
 * ```
 */
export function Feature({
  flag,
  children,
  fallback = null,
}: {
  flag: FeatureFlag
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isEnabled } = useFeatureFlags()
  return <>{isEnabled(flag) ? children : fallback}</>
}

/**
 * Badge to indicate beta/new features
 */
export function FeatureBadge({ flag }: { flag: FeatureFlag }) {
  const config = FEATURE_FLAGS[flag]
  if (!config) return null

  if (config.beta) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
        Beta
      </span>
    )
  }

  if (config.minTier) {
    const tierColors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      agency: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tierColors[config.minTier] || ''}`}>
        {config.minTier.charAt(0).toUpperCase() + config.minTier.slice(1)}
      </span>
    )
  }

  return null
}
