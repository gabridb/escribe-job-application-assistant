export type JobStatus = 'active' | 'archived'

export interface Job {
  id: string
  title: string
  company: string
  description: string
  status: JobStatus
  createdAt: string
}
