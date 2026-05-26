interface SkeletonProps { className?: string }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-card p-6 space-y-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-8 w-1/3 mt-2" />
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass rounded-card p-4 space-y-3">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-2 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 glass rounded-xl px-5 py-4">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-1/3" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}
