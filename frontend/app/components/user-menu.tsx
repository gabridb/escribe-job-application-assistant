'use client'

import { useRef, useState } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, CheckCircle2 } from 'lucide-react'
import { cvService } from '@/lib/services/cv-service'

type UploadState = 'idle' | 'success' | 'error'

export default function UserMenu() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await cvService.save({
          name: file.name,
          text: reader.result as string,
          uploadedAt: new Date().toISOString(),
        })
        setFileName(file.name)
        setUploadState('success')
      } catch {
        setUploadState('error')
      }
    }
    reader.onerror = () => setUploadState('error')
    reader.readAsText(file)
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setUploadState('idle')
      setFileName(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a5c2f]">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/gabriel-profile.jpg" alt="Profile" />
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onSelect={() => setDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Upload CV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload CV</DialogTitle>
          </DialogHeader>

          {uploadState === 'success' ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
              <CheckCircle2 size={24} className="text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">CV uploaded successfully</p>
              <p className="text-xs text-emerald-600">{fileName}</p>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center cursor-pointer hover:bg-stone-100 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={24} className="text-stone-400" />
              <p className="text-sm text-stone-600">Click to upload or drag and drop</p>
              <p className="text-xs text-stone-400">PDF, DOC, DOCX, TXT or MD (max. 10MB)</p>
              {uploadState === 'error' && (
                <p className="text-xs text-red-500 mt-1">Upload failed. Please try again.</p>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            className="hidden"
            onChange={handleFileChange}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
