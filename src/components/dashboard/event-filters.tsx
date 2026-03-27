'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SportCount } from '@/types'

interface EventFiltersProps {
  sportCounts: SportCount[]
}

export function EventFilters({ sportCounts }: EventFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('query') ?? ''
  const sport = searchParams.get('sport') ?? ''

  // Updating the URL triggers a server re-render — the page re-fetches from the DB with new filters
  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = query || sport

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Search events..."
        value={query}
        onChange={(e) => updateParams('query', e.target.value)}
        className="sm:max-w-xs border-2 border-border/80 text-foreground placeholder:text-foreground/65 dark:border-white/25"
        aria-label="Search events by name"
      />
      <Select
        value={sport || 'All'}
        onValueChange={(val) => updateParams('sport', val === 'All' ? '' : val)}
      >
        <SelectTrigger
          className="sm:w-48 border-2 border-border/80 text-foreground dark:border-white/25"
          aria-label="Filter by sport"
        >
          <SelectValue placeholder="All sports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All sports</SelectItem>
          {sportCounts.map(({ sport, count }) => (
            <SelectItem key={sport} value={sport}>
              {sport} ({count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" onClick={() => router.push(pathname)}>
          Clear
        </Button>
      )}
    </div>
  )
}
