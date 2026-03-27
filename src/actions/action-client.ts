import { ZodSchema } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/types'

export function safeAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput, userId: string) => Promise<TOutput>
) {
  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const parsed = schema.safeParse(rawInput)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    try {
      const data = await handler(parsed.data, user.id)
      return { success: true, data }
    } catch (err) {
      console.error('[safeAction]', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
