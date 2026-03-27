'use client'

import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { eventSchema, EventSchema } from '@/lib/validations/event.schema'
import { createEvent, updateEvent } from '@/actions/events.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SPORT_GROUPS, US_STATES } from '@/lib/constants'

interface EventFormProps {
  // If eventId is provided, we're editing — otherwise creating
  eventId?: string
  defaultValues?: EventSchema
}

const DEFAULT_VALUES: EventSchema = {
  name: '',
  sport: '',
  description: '',
  starts_at: '',
  ends_at: '',
  venues: [{
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    capacity: '',
    indoor: false,
    contact_name: '',
    contact_email: '',
    notes: '',
  }],
}

export function EventForm({ eventId, defaultValues }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!eventId

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  })

  // useFieldArray manages the dynamic venues list — like a Django formset
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'venues',
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit(values: EventSchema) {
    const result = isEditing
      ? await updateEvent({ ...values, id: eventId })
      : await createEvent(values)

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong. Please try again.')
      return
    }

    toast.success(isEditing ? 'Event updated successfully.' : 'Event created successfully.')
    router.push('/dashboard')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Event name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input placeholder="Spring Chess Tournament" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Sport */}
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SPORT_GROUPS.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.options.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date & Time */}
          <FormField
            control={form.control}
            name="starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date & Time */}
          <FormField
            control={form.control}
            name="ends_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional details about the event..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Venues */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Venues</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: '',
                  street: '',
                  city: '',
                  state: '',
                  zip: '',
                  capacity: '',
                  indoor: false,
                  contact_name: '',
                  contact_email: '',
                  notes: '',
                })
              }
            >
              <Plus className="mr-1 h-3 w-3" />
              Add venue
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Venue {index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={`Remove venue ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`venues.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Madison Square Garden" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.street`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="4 Pennsylvania Plaza"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.state`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.code} value={state.code}>
                              {state.name} ({state.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.zip`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10001"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.capacity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity <span className="text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.indoor`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Type</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'Indoor')}
                        value={field.value ? 'Indoor' : 'Outdoor'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select venue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Indoor">Indoor</SelectItem>
                          <SelectItem value="Outdoor">Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.contact_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name <span className="text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jordan Smith"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`venues.${index}.contact_email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email <span className="text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="venue@example.com"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`venues.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Parking notes, setup windows, accessibility details..."
                        rows={2}
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save changes' : 'Create event'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
