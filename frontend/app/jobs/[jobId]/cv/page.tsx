import WritingAssistant from '@/app/components/writing-assistant'

export default async function CvPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  return (
    <WritingAssistant
      context="cv"
      jobId={jobId}
      title="Tailored CV"
      subtitle="Adapt your CV for this role"
    />
  )
}
