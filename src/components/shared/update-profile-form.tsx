'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateProfile } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UpdateProfileForm({ currentName }: { currentName: string }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: currentName },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfile(values.displayName)
    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  )
}
