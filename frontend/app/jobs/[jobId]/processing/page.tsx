import ProcessingScreen from './processing-screen'

export default async function ProcessingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  return <ProcessingScreen jobId={jobId} />
}
