'use client'

import { useState } from 'react'
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
import { Upload } from 'lucide-react'

export default function UserMenu() {
  const [dialogOpen, setDialogOpen] = useState(false)

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload CV</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center cursor-pointer hover:bg-stone-100 transition-colors">
            <Upload size={24} className="text-stone-400" />
            <p className="text-sm text-stone-600">Click to upload or drag and drop</p>
            <p className="text-xs text-stone-400">PDF, DOC, DOCX or TXT (max. 10MB)</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
