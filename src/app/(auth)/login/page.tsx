'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  firstName: z.string(),
  lastName: z.string(),
  organization: z.string(),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[^A-Za-z0-9]/, 'At least one special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organization: z.string(),
})

type AuthFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [googleLoading, setGoogleLoading] = useState(false)

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(mode === 'login' ? loginSchema : signupSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '', organization: '' },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit(values: AuthFormValues) {
    if (mode === 'login') {
      const result = await loginWithEmail(values.email, values.password)
      // loginWithEmail redirects on success — only get a result back on error
      // Generic message: never reveal whether the email or password was wrong
      if (result && !result.success) {
        toast.error('Invalid email or password')
      }
    } else {
      const result = await signUpWithEmail({
        email: values.email,
        password: values.password,
        firstName: values.firstName!,
        lastName: values.lastName!,
        organization: values.organization,
      })
      // redirects to /dashboard on success, only returns on error
      if (result && !result.success) {
        toast.error(result.error)
      }
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const result = await loginWithGoogle()
    if (!result.success) {
      toast.error(result.error)
      setGoogleLoading(false)
    } else {
      window.location.href = result.data.url
    }
  }

  function switchMode() {
    const next = mode === 'login' ? 'signup' : 'login'
    setMode(next)
    form.reset({ email: '', password: '', firstName: '', lastName: '', organization: '' })
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel — hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[oklch(0.059_0.028_264)] text-white">
        <div className="text-xl font-bold tracking-tight">Fastbreak</div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Manage your sports events in one place.
          </h1>
          <p className="text-[oklch(0.78_0.14_264)] text-lg">
            Create events, track venues, and keep your team organized — across every sport.
          </p>
        </div>
        <p className="text-[oklch(0.60_0.05_264)] text-sm">
          © {new Date().getFullYear()} Fastbreak. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center">
            {/* Logo visible on mobile only */}
            <div className="lg:hidden text-xl font-bold mb-2">Fastbreak</div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Sign in to your account' : 'Get started for free'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">or</span>
            <Separator className="flex-1" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Extra fields shown only on signup */}
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Smith" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Organization <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Sports Club" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value ?? ''} />
                    </FormControl>
                    {mode === 'signup' && (
                      <p className="text-muted-foreground text-xs space-y-0.5">
                        Must be at least 8 characters with one uppercase letter, one number, and one special character.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading || googleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary underline underline-offset-4 hover:no-underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
