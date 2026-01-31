export interface OnboardingStatus {
  id: string
  user_id: string
  has_uploaded_transcript: boolean
  has_generated_content: boolean
  has_exported_content: boolean
  is_completed: boolean
  is_dismissed: boolean
  started_at: string
  completed_at: string | null
  dismissed_at: string | null
  steps_completed: number
  total_steps: number
  time_to_complete_seconds: number | null
  created_at: string
  updated_at: string
}

export type OnboardingStep = 
  | 'has_uploaded_transcript'
  | 'has_generated_content'
  | 'has_exported_content'
