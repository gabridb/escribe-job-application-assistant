'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useJobs } from './context/jobs-context'
import NewJobDialog from './components/new-job-dialog'

export default function JobsList() {
  const { jobs, deleteJob } = useJobs()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Job Offers</h1>
          <p className="mt-1 text-stone-600">Manage your job offer applications</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          style={{ backgroundColor: '#4a5c2f' }}
          className="text-white hover:opacity-90"
        >
          + Add Job Offer
        </Button>
      </div>

      {/* Jobs table */}
      {jobs.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white px-6 py-16 text-center">
          <p className="text-stone-600">No job offers yet.</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-4 text-white hover:opacity-90"
            style={{ backgroundColor: '#4a5c2f' }}
          >
            Add your first job offer
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-600">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Key Themes</th>
                <th className="px-4 py-3 font-medium">Cover Letter</th>
                <th className="px-4 py-3 font-medium">CV</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {job.title}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{job.company}</td>
                  <td className="px-4 py-3 text-stone-600">{job.createdAt}</td>
                  <td className="px-4 py-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-stone-700 border-stone-300"
                    >
                      <Link href={`/jobs/${job.id}/themes`}>Key Themes</Link>
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-stone-700 border-stone-300"
                    >
                      <Link href={`/jobs/${job.id}/cover-letter`}>View Letter</Link>
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-stone-700 border-stone-300"
                    >
                      <Link href={`/jobs/${job.id}/cv`}>View CV</Link>
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      aria-label={`Delete ${job.title}`}
                      onClick={() => deleteJob(job.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewJobDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
