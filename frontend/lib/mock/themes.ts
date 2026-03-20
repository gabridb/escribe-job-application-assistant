export type ThemeStatus = 'todo' | 'in-progress' | 'done'

export interface Theme {
  id: string
  jobId: string
  name: string
  description: string
  status: ThemeStatus
}
