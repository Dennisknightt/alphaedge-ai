export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="skeleton h-3 w-24 mb-3 rounded" />
      <div className="skeleton h-7 w-32 mb-1.5 rounded" />
      <div className="skeleton h-2.5 w-20 rounded" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="skeleton h-3 w-40 rounded" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="skeleton h-3 rounded flex-1" />
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="card p-4">
      <div className="skeleton h-3 w-32 mb-4 rounded" />
      <div className="skeleton h-48 w-full rounded-lg" />
    </div>
  )
}
