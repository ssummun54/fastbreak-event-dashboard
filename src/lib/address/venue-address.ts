export type VenueAddressFields = {
  street: string
  city: string
  state: string
  zip: string
}

export function formatVenueAddress(fields: VenueAddressFields): string {
  const street = fields.street.trim()
  const city = fields.city.trim()
  const state = fields.state.trim().toUpperCase()
  const zip = fields.zip.trim()

  if (!street && !city && !state && !zip) return ''

  const cityStateZip = [city, state, zip].filter(Boolean).join(' ')
  return [street, cityStateZip].filter(Boolean).join(', ')
}

export function parseVenueAddress(address: string | null | undefined): VenueAddressFields {
  const raw = (address ?? '').trim()
  if (!raw) {
    return { street: '', city: '', state: '', zip: '' }
  }

  // Expected: "street, city, ST 12345" (or without zip)
  const match = raw.match(/^(.+?),\s*([^,]+?),\s*([A-Za-z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/)
  if (!match) {
    return { street: raw, city: '', state: '', zip: '' }
  }

  return {
    street: match[1].trim(),
    city: match[2].trim(),
    state: match[3].trim().toUpperCase(),
    zip: (match[4] ?? '').trim(),
  }
}
