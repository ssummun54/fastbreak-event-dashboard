'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/types'

export async function loginWithEmail(email: string, password: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[loginWithEmail]', error.message)
    return { success: false, error: error.message }
  }

  redirect('/dashboard')
}

interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  organization?: string
}

export async function signUpWithEmail(data: SignUpData): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`,
        organization: data.organization ?? null,
      },
    },
  })

  if (error) {
    console.error('[signUpWithEmail]', error.message)
    return { success: false, error: error.message }
  }

  redirect('/dashboard')
}


export async function updateProfile(displayName: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: { full_name: displayName },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function logout(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}
