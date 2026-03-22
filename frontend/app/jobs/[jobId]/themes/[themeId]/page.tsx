import RelevantExperienceWritingAssistant from './relevant-experience-writing-assistant'

export default async function RelevantExperiencePage({
  params,
}: {
  params: Promise<{ jobId: string; themeId: string }>
}) {
  const { jobId, themeId } = await params

  return <RelevantExperienceWritingAssistant jobId={jobId} themeId={themeId} />
}
