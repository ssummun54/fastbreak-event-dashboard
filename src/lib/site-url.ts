import { headers } from 'next/headers'

function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    return url.origin
  } catch {
    return null
  }
}

function fromEnvironment(): string | null {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.SITE_URL) ??
    normalizeOrigin(process.env.VERCEL_URL) ??
    null
  )
}

export async function getSiteOrigin(): Promise<string> {
  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = forwardedHost ?? requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto')

  if (host) {
    const protocol = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https')
    const derivedOrigin = normalizeOrigin(`${protocol}://${host}`)
    if (derivedOrigin) {
      return derivedOrigin
    }
  }

  return fromEnvironment() ?? 'http://localhost:3000'
}
