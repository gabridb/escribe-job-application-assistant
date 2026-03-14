import type { Job } from './jobs'

export type ThemeStatus = 'todo' | 'in-progress' | 'done'

export interface Theme {
  id: string
  jobId: string
  name: string
  description: string
  status: ThemeStatus
}

export function getMockThemes(jobId: string): Theme[] {
  const seed: Record<string, Theme[]> = {
    'job-1': [
      { id: 'theme-1-1', jobId: 'job-1', name: 'Leadership', description: 'Demonstrate your ability to lead teams and drive results.', status: 'done' },
      { id: 'theme-1-2', jobId: 'job-1', name: 'Problem Solving', description: 'Show how you approach complex technical challenges.', status: 'in-progress' },
      { id: 'theme-1-3', jobId: 'job-1', name: 'Communication', description: 'Highlight cross-functional collaboration and stakeholder management.', status: 'todo' },
      { id: 'theme-1-4', jobId: 'job-1', name: 'Technical Skills', description: 'Evidence of hands-on engineering expertise relevant to the role.', status: 'todo' },
    ],
    'job-2': [
      { id: 'theme-2-1', jobId: 'job-2', name: 'User Research', description: 'Conducting and synthesising user research to inform design.', status: 'done' },
      { id: 'theme-2-2', jobId: 'job-2', name: 'Design Systems', description: 'Building and maintaining scalable design systems.', status: 'in-progress' },
      { id: 'theme-2-3', jobId: 'job-2', name: 'Stakeholder Management', description: 'Aligning design decisions with business requirements.', status: 'todo' },
      { id: 'theme-2-4', jobId: 'job-2', name: 'Prototyping', description: 'Rapid prototyping and iterative testing with users.', status: 'todo' },
    ],
    'job-3': [
      { id: 'theme-3-1', jobId: 'job-3', name: 'Product Strategy', description: 'Defining product vision and roadmap aligned to business goals.', status: 'in-progress' },
      { id: 'theme-3-2', jobId: 'job-3', name: 'Data-Driven Decisions', description: 'Using metrics and analytics to prioritise and validate.', status: 'todo' },
      { id: 'theme-3-3', jobId: 'job-3', name: 'Cross-functional Leadership', description: 'Leading eng, design, and commercial teams without authority.', status: 'todo' },
      { id: 'theme-3-4', jobId: 'job-3', name: 'Go-to-Market', description: 'Coordinating successful product launches.', status: 'todo' },
    ],
  }
  return seed[jobId] ?? []
}

export function generateMockThemes(job: Job): Theme[] {
  const base = [
    { name: 'Leadership', description: 'Demonstrate your ability to lead teams and drive results.' },
    { name: 'Problem Solving', description: 'Show how you approach complex technical challenges.' },
    { name: 'Communication', description: 'Highlight cross-functional collaboration and stakeholder management.' },
    { name: 'Technical Skills', description: 'Evidence of hands-on expertise relevant to the role.' },
  ]
  return base.map((t, i) => ({
    id: `${job.id}-theme-${i + 1}`,
    jobId: job.id,
    name: t.name,
    description: t.description,
    status: 'todo' as ThemeStatus,
  }))
}
