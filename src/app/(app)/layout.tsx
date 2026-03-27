import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserMenu } from '@/components/shared/user-menu'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email ?? ''
  const avatarUrl = user.user_metadata?.avatar_url ?? null

  return (
    <div className="app-shell-background min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
            Fastbreak
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu email={email} avatarUrl={avatarUrl} />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
