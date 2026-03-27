type VenueInput = {
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
}

type EventInput = {
  name: string
  sport: string
  description?: string
  starts_at: string
  ends_at: string
  venues: VenueInput[]
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function toTitleCase(value: string): string {
  const cleaned = normalizeWhitespace(value).toLowerCase()
  if (!cleaned) return ''

  return cleaned.replace(/\b([a-z])/g, (match) => match.toUpperCase())
}

function normalizeDescription(value: string): string {
  const cleaned = normalizeWhitespace(value)
  if (!cleaned) return ''

  const firstUpper = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  if (/[.!?]$/.test(firstUpper)) return firstUpper
  return `${firstUpper}.`
}

function normalizeZip(value: string): string {
  return normalizeWhitespace(value)
}

export function normalizeEventInput<T extends EventInput>(input: T): T {
  return {
    ...input,
    name: toTitleCase(input.name),
    sport: normalizeWhitespace(input.sport),
    description: normalizeDescription(input.description ?? ''),
    venues: input.venues.map((venue) => ({
      ...venue,
      name: toTitleCase(venue.name),
      street: toTitleCase(venue.street),
      city: toTitleCase(venue.city),
      state: normalizeWhitespace(venue.state).toUpperCase(),
      zip: normalizeZip(venue.zip),
      capacity: normalizeWhitespace(venue.capacity),
      indoor: !!venue.indoor,
      contact_name: toTitleCase(venue.contact_name),
      contact_email: normalizeWhitespace(venue.contact_email).toLowerCase(),
      notes: normalizeWhitespace(venue.notes),
    })),
  }
}
