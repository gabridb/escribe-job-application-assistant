'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useJobs } from '@/app/context/jobs-context'
import type { Job } from '@/lib/mock/jobs'

interface EditJobDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const { updateJob } = useJobs()
  const [title, setTitle] = useState(job.title)
  const [company, setCompany] = useState(job.company)
  const [titleTouched, setTitleTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(job.title)
      setCompany(job.company)
      setTitleTouched(false)
      setSaveError('')
    }
  }, [open, job.title, job.company])

  const titleEmpty = title.trim() === ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (titleEmpty || isSaving) return
    setIsSaving(true)
    setSaveError('')
    try {
      await updateJob(job.id, { title: title.trim(), company: company.trim() })
      onOpenChange(false)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="edit-job-title" className="text-sm font-medium text-stone-900">
              Title
            </label>
            <input
              id="edit-job-title"
              name="title"
              type="text"
              value={title}
              maxLength={255}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              disabled={isSaving}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50"
            />
            {titleTouched && titleEmpty && (
              <p className="text-xs text-red-500">Title cannot be empty.</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-job-company" className="text-sm font-medium text-stone-900">
              Company <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              id="edit-job-company"
              name="company"
              type="text"
              value={company}
              maxLength={255}
              placeholder="Unknown"
              onChange={(e) => setCompany(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50"
            />
          </div>

          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={titleEmpty || isSaving}
              style={{ backgroundColor: '#4a5c2f' }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
