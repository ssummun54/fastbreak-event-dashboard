'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction } from './action-client'
import { eventSchema, updateEventSchema } from '@/lib/validations/event.schema'
import { ActionResult, Event, SportCount } from '@/types'
import { formatVenueAddress } from '@/lib/address/venue-address'
import { normalizeEventInput } from '@/lib/text/normalize'
import { toCanonicalSport } from '@/lib/text/sport'
import { z } from 'zod'

export async function getEvents(query?: string, sport?: string): Promise<Event[]> {
  const supabase = await createClient()

  let eventsQuery = supabase
    .from('events')
    .select('*, venues(*)')
    .order('starts_at', { ascending: false })

  if (query) {
    eventsQuery = eventsQuery.ilike('name', `%${query}%`)
  }

  if (sport) {
    eventsQuery = eventsQuery.ilike('sport', sport)
  }

  const { data, error } = await eventsQuery

  if (error) {
    console.error('[getEvents]', error)
    return []
  }

  return ((data as Event[]) ?? []).map((event) => ({
    ...event,
    sport: toCanonicalSport(event.sport),
  }))
}

export async function getEvent(id: string): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*, venues(*)')
    .eq('id', id)
    .single()

  if (error) return null
  const event = data as Event
  return {
    ...event,
    sport: toCanonicalSport(event.sport),
  }
}

export async function getSportCounts(query?: string): Promise<SportCount[]> {
  const supabase = await createClient()

  let queryBuilder = supabase
    .from('events')
    .select('sport')

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('[getSportCounts]', error)
    return []
  }

  const counts = new Map<string, number>()

  for (const row of data ?? []) {
    const sport = toCanonicalSport(row.sport ?? '')
    if (!sport) continue
    counts.set(sport, (counts.get(sport) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.sport.localeCompare(b.sport)
    })
}

const _createEvent = safeAction(eventSchema, async (input, userId) => {
  const supabase = await createClient()
  const normalized = normalizeEventInput(input)

  const venueRows = normalized.venues.map((v, i) => {
    const parsedCapacity = v.capacity ? Number.parseInt(v.capacity, 10) : NaN
    return {
      sort_order: i,
      name: v.name,
      address: formatVenueAddress(v),
      street: v.street,
      city: v.city,
      state: v.state,
      zip: v.zip,
      capacity: Number.isFinite(parsedCapacity) ? parsedCapacity : null,
      indoor: v.indoor,
      contact_name: v.contact_name || null,
      contact_email: v.contact_email || null,
      notes: v.notes || null,
    }
  })

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: normalized.name,
      sport: normalized.sport,
      description: normalized.description,
      starts_at: normalized.starts_at,
      ends_at: normalized.ends_at,
      created_by: userId,
    })
    .select()
    .single()

  if (eventError) throw new Error(eventError.message)

  if (venueRows.length > 0) {
    const { error: venuesError } = await supabase.from('venues').insert(
      venueRows.map((v) => ({
        event_id: event.id,
        ...v,
      }))
    )
    if (venuesError) throw new Error(venuesError.message)
  }

  revalidatePath('/dashboard')
  return event
})

export async function createEvent(input: z.infer<typeof eventSchema>): Promise<ActionResult<unknown>> {
  return _createEvent(input)
}

const _updateEvent = safeAction(updateEventSchema, async (input, userId) => {
  const supabase = await createClient()
  const normalized = normalizeEventInput(input)

  const venueRows = normalized.venues.map((v, i) => {
    const parsedCapacity = v.capacity ? Number.parseInt(v.capacity, 10) : NaN
    return {
      sort_order: i,
      name: v.name,
      address: formatVenueAddress(v),
      street: v.street,
      city: v.city,
      state: v.state,
      zip: v.zip,
      capacity: Number.isFinite(parsedCapacity) ? parsedCapacity : null,
      indoor: v.indoor,
      contact_name: v.contact_name || null,
      contact_email: v.contact_email || null,
      notes: v.notes || null,
    }
  })

  const { error: eventError } = await supabase
    .from('events')
    .update({
      name: normalized.name,
      sport: normalized.sport,
      description: normalized.description,
      starts_at: normalized.starts_at,
      ends_at: normalized.ends_at,
    })
    .eq('id', input.id)
    .eq('created_by', userId)

  if (eventError) throw new Error(eventError.message)

  // Replace venues: delete old, insert new
  await supabase.from('venues').delete().eq('event_id', input.id)

  if (venueRows.length > 0) {
    const { error: venuesError } = await supabase.from('venues').insert(
      venueRows.map((v) => ({
        event_id: input.id,
        ...v,
      }))
    )
    if (venuesError) throw new Error(venuesError.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/events/${input.id}/edit`)
  return { id: input.id }
})

export async function updateEvent(input: z.infer<typeof updateEventSchema>): Promise<ActionResult<unknown>> {
  return _updateEvent(input)
}

const _deleteEvent = safeAction(
  z.object({ id: z.string().uuid() }),
  async (input, userId) => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', input.id)
      .eq('created_by', userId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { id: input.id }
  }
)

export async function deleteEvent(id: string): Promise<ActionResult<unknown>> {
  return _deleteEvent({ id })
}
