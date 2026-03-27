import { ALL_SPORTS } from '@/lib/constants'

const SPORT_LOOKUP = new Map(
  ALL_SPORTS.map((sport) => [sport.trim().toLowerCase(), sport] as const)
)

export function toCanonicalSport(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return ''

  const matched = SPORT_LOOKUP.get(cleaned.toLowerCase())
  if (matched) return matched

  // Keep this alias for legacy rows that used mixed-case E-MLS.
  if (/^e[- ]?mls$/i.test(cleaned)) return 'E-MLS'

  return cleaned
}
