import { notFound } from 'next/navigation'
import { getEvent } from '@/actions/events.actions'
import { EventForm } from '@/components/events/event-form'
import { createClient } from '@/lib/supabase/server'
import { parseVenueAddress } from '@/lib/address/venue-address'

interface EditEventPageProps {
  // In Next.js 15+, params is a Promise — must be awaited
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const event = await getEvent(id)

  if (!event) notFound()
  if (!user || event.created_by !== user.id) notFound()

  // Shape the event data to match EventForm's expected defaultValues
  const defaultValues = {
    name: event.name,
    sport: event.sport,
    description: event.description ?? '',
    starts_at: event.starts_at.slice(0, 16), // datetime-local input needs "YYYY-MM-DDTHH:mm"
    ends_at: (event.ends_at ?? event.starts_at).slice(0, 16), // fallback for rows not migrated yet
    venues: event.venues.map((v) => {
      const parsed = parseVenueAddress(v.address)
      return {
        name: v.name,
        street: v.street ?? parsed.street,
        city: v.city ?? parsed.city,
        state: v.state ?? parsed.state,
        zip: v.zip ?? parsed.zip,
        capacity: v.capacity?.toString() ?? '',
        indoor: v.indoor ?? false,
        contact_name: v.contact_name ?? '',
        contact_email: v.contact_email ?? '',
        notes: v.notes ?? '',
      }
    }),
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the details for <strong>{event.name}</strong>.</p>
      </div>
      <EventForm eventId={id} defaultValues={defaultValues} />
    </div>
  )
}
