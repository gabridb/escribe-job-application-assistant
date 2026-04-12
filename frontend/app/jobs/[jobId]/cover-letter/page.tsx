import CoverLetterWritingAssistant from './cover-letter-writing-assistant'

export default async function CoverLetterPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  return <CoverLetterWritingAssistant jobId={jobId} />
}
