import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TeamCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeagueTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}