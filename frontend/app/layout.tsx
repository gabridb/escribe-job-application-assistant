import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { JobsProvider } from "./jobs-context"
import { getMockJobs } from "@/lib/mock/jobs"

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Escribe",
  description: "AI-powered job application assistant",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const seedJobs = getMockJobs()

  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased min-h-screen bg-stone-50`}>
        <JobsProvider initialJobs={seedJobs}>
          <header className="border-b border-stone-200 bg-white">
            <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
              <Link href="/" className="text-lg font-semibold text-stone-900">
                Escribe
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/experience"
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Experience Library
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </JobsProvider>
      </body>
    </html>
  )
}
