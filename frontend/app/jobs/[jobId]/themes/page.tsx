export default function ThemesPage({ params }: { params: Promise<{ jobId: string }> }) {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-900">Key Interview Themes</h1>
      <p className="mt-1 text-stone-600">Competencies extracted from the job description</p>
    </div>
  )
}
