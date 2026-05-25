import JobOverview from './job-overview'

export default async function JobOverviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  return <JobOverview jobId={jobId} />
}
