export default function DashboardPage({ params }: { params: { role: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl text-primary mb-2">
          Dashboard — {params.role}
        </h1>
        <p className="text-secondary text-sm">Role dashboards coming in Prompt 10</p>
      </div>
    </div>
  )
}
