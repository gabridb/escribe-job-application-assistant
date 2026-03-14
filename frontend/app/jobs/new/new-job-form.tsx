'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNewJob } from './hooks/use-new-job'

export default function NewJobForm() {
  const { description, setDescription, isSubmitting, handleSubmit } =
    useNewJob()

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">
            Add a new job offer
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Copy &amp; Paste your new offer or upload it from a file
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Job offer textarea */}
            <div className="space-y-2">
              <label
                htmlFor="job-description"
                className="text-sm font-medium text-stone-900"
              >
                Job Offer
              </label>
              <textarea
                id="job-description"
                name="job-description"
                rows={6}
                placeholder="Paste or type a job offer here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-xs font-medium uppercase tracking-widest text-stone-400">
                or
              </span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            {/* File upload (V1: UI only, non-functional) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-900">Upload File</p>
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
                <Upload size={24} className="text-stone-400" />
                <p className="text-sm text-stone-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-stone-400">
                  PDF, DOC, DOCX or TXT (max. 10MB)
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                style={{ backgroundColor: '#4a5c2f' }}
                className="text-white hover:opacity-90 disabled:opacity-50"
              >
                + Add Job Offer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
