'use client'

import { useRef } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNewJob } from './hooks/use-new-job'

export default function NewJobForm() {
  const { description, setDescription, handleSubmit, isLoading } = useNewJob()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDescription(reader.result as string)
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">
            Add Job Offer
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Add a new job offer
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
                disabled={isLoading}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none disabled:opacity-50"
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

            {/* File upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-900">Upload File</p>
              <div
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={24} className="text-stone-400" />
                <p className="text-sm text-stone-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-stone-400">
                  PDF, DOC, DOCX, TXT or MD (max. 10MB)
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!description.trim() || isLoading}
                style={{ backgroundColor: '#4a5c2f' }}
                className="text-white hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  '+ Add Job Offer'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
