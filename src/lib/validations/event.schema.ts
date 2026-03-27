import { z } from 'zod'

export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP is required'),
  capacity: z.string(),
  indoor: z.boolean(),
  contact_name: z.string(),
  contact_email: z.string(),
  notes: z.string(),
}).superRefine((value, ctx) => {
  if (!/^[A-Za-z]{2}$/.test(value.state.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['state'], message: 'Use 2-letter state (e.g. NY)' })
  }
  if (!/^\d{5}(?:-\d{4})?$/.test(value.zip.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['zip'], message: 'Use ZIP like 10001 or 10001-1234' })
  }

  if (value.contact_email.trim() && !z.string().email().safeParse(value.contact_email.trim()).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contact_email'], message: 'Use a valid email address' })
  }

  if (value.capacity.trim()) {
    const parsed = Number.parseInt(value.capacity.trim(), 10)
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capacity'], message: 'Capacity must be a non-negative number' })
    }
  }
})

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sport: z.string().min(1, 'Sport is required'),
  description: z.string(),
  starts_at: z.string().min(1, 'Start date & time is required'),
  ends_at: z.string().min(1, 'End date & time is required'),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
}).superRefine((values, ctx) => {
  if (!values.starts_at || !values.ends_at) return

  const start = new Date(values.starts_at)
  const end = new Date(values.ends_at)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ends_at'],
      message: 'End date & time must be after start date & time',
    })
  }
})

export const updateEventSchema = eventSchema.extend({
  id: z.string().uuid(),
})

export type EventSchema = z.infer<typeof eventSchema>
export type UpdateEventSchema = z.infer<typeof updateEventSchema>
