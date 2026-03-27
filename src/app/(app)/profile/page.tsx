import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { UpdateProfileForm } from '@/components/shared/update-profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email ?? ''
  const firstName = user.user_metadata?.first_name ?? ''
  const lastName = user.user_metadata?.last_name ?? ''
  const organization = user.user_metadata?.organization ?? ''
  const avatarUrl = user.user_metadata?.avatar_url ?? null
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const initials = fullName
    ? `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account details.</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl ?? undefined} alt={email} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          {fullName && <p className="font-medium">{fullName}</p>}
          {organization && <p className="text-sm text-muted-foreground">{organization}</p>}
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-medium">Update profile</h2>
        <UpdateProfileForm currentName={fullName} />
      </div>
    </div>
  )
}
