export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8 max-w-5xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}></div>
        ))}
      </div>

      {/* Table/List Skeleton */}
      <div className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="h-12 bg-gray-100 border-b" style={{ borderColor: 'var(--color-border)' }}></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b flex items-center px-4 space-x-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
