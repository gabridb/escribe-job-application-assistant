import ThemesList from './themes-list'

export default async function ThemesPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  return <ThemesList jobId={jobId} />
}
