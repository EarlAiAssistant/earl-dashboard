export type TaskStatus = 'backlog' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  session_key: string | null
  started_at: string | null
  completed_at: string | null
  metadata: Record<string, any>
  position: number
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  action_type: string
  details: string | null
  status: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface Document {
  id: string
  filename: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
}

export interface OpenClawSession {
  sessionKey: string
  status: string
  startedAt: string
  completedAt?: string
  messages?: Array<{
    role: string
    content: string
    timestamp: string
  }>
  metadata?: Record<string, any>
}
