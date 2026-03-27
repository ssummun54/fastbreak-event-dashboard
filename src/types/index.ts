export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export type Venue = {
  id: string
  event_id: string
  name: string
  address: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  capacity: number | null
  indoor: boolean | null
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  sort_order: number
}

export type Event = {
  id: string
  created_by: string
  name: string
  sport: string
  description: string | null
  starts_at: string
  ends_at: string
  created_at: string
  updated_at: string
  venues: Venue[]
}

export type EventFormValues = {
  name: string
  sport: string
  description: string
  starts_at: string
  ends_at: string
  venues: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    capacity: string
    indoor: boolean
    contact_name: string
    contact_email: string
    notes: string
  }[]
}

export type SportCount = {
  sport: string
  count: number
}
