import WritingAssistant from '@/app/components/writing-assistant'

export default async function RelevantExperiencePage({
  params,
}: {
  params: Promise<{ jobId: string; themeId: string }>
}) {
  const { jobId, themeId } = await params

  return (
    <WritingAssistant
      context="relevant-experience"
      jobId={jobId}
      themeId={themeId}
      title="Relevant Experience"
      subtitle="Write your example for this theme"
      suggestedReplies={[
        { label: 'Review my draft', message: 'Please review my draft' },
      ]}
    />
  )
}
