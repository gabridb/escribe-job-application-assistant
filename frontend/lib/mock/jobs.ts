export type JobStatus = 'active' | 'archived'

export interface Job {
  id: string
  title: string
  company: string
  description: string
  status: JobStatus
  createdAt: string
}

const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    description:
      'We are looking for a Senior Frontend Developer with 5+ years of experience in React and TypeScript. You will be responsible for building and maintaining our core product UI.',
    status: 'active',
    createdAt: '2026-03-15',
  },
  {
    id: 'job-2',
    title: 'UX Designer',
    company: 'Design Studio',
    description:
      'Join our design team to craft intuitive user experiences. You will work closely with product and engineering to ship delightful interfaces.',
    status: 'active',
    createdAt: '2026-03-10',
  },
  {
    id: 'job-3',
    title: 'Product Manager',
    company: 'StartupXYZ',
    description:
      'We need a Product Manager to lead our growth initiatives. Strong analytical skills and a customer-first mindset are required.',
    status: 'archived',
    createdAt: '2026-03-05',
  },
]

export function getMockJobs(): Job[] {
  return MOCK_JOBS
}

export function getMockJob(id: string): Job | undefined {
  return MOCK_JOBS.find((job) => job.id === id)
}
