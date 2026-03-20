import CvWritingAssistant from './cv-writing-assistant'

export default async function CvPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  return <CvWritingAssistant jobId={jobId} />
}
