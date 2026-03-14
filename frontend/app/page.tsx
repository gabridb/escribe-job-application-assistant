import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Job Offers</h1>
        <p className="mt-1 text-stone-600">Manage your job applications</p>
      </div>
      <Button>Add Job Offer</Button>
    </div>
  )
}
