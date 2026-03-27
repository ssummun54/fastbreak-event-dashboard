import Link from 'next/link'
import { Plus, Calendar, MapPin } from 'lucide-react'
import { Suspense } from 'react'
import { getEvents, getSportCounts } from '@/actions/events.actions'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EventFilters } from '@/components/dashboard/event-filters'
import { DeleteEventButton } from '@/components/events/delete-event-button'
import { Event } from '@/types'

interface DashboardPageProps {
  searchParams: Promise<{ query?: string; sport?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // In Next.js 15+, searchParams is a Promise — must be awaited
  const { query, sport } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [events, sportCounts] = await Promise.all([
    getEvents(query, sport),
    getSportCounts(query),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-foreground/80">
            {events.length} event{events.length !== 1 ? 's' : ''}
            {query || sport ? ' matching your filters' : ''}
          </p>
        </div>
        <Button
          className="gap-1 font-medium text-base"
          render={<Link href="/events/new" />}
          nativeButton={false}
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* EventFilters uses useSearchParams() so it must be wrapped in Suspense */}
      <Suspense fallback={<FiltersSkeleton />}>
        <EventFilters sportCounts={sportCounts} />
      </Suspense>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-foreground">No events found</p>
          <p className="mt-1 text-base text-muted-foreground dark:text-foreground/80">
            {query || sport
              ? 'Try adjusting your filters.'
              : 'Create your first event to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} canManage={event.created_by === user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Skeleton className="h-10 sm:w-64" />
      <Skeleton className="h-10 sm:w-48" />
    </div>
  )
}

function EventCard({ event, canManage }: { event: Event; canManage: boolean }) {
  const startDate = new Date(event.starts_at)
  const endDate = new Date(event.ends_at)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedStartTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  const formattedEndTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{event.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {event.sport}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="space-y-1 text-sm text-muted-foreground dark:text-foreground/85">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate} at {formattedStartTime} - {formattedEndTime}</span>
          </div>
          {event.venues.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{event.venues.map((v) => v.name).join(', ')}</span>
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-sm line-clamp-2 text-muted-foreground dark:text-foreground/80">{event.description}</p>
        )}
        {canManage && (
          <div className="flex items-center justify-end gap-1 mt-auto pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/events/${event.id}/edit`} />}
              nativeButton={false}
            >
              Edit
            </Button>
            <DeleteEventButton id={event.id} name={event.name} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
