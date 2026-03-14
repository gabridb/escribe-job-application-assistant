import WritingAssistant from '@/app/components/writing-assistant'

export default async function CoverLetterPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  return (
    <WritingAssistant
      context="cover-letter"
      jobId={jobId}
      title="Cover Letter"
      subtitle="Write your cover letter for this role"
    />
  )
}
