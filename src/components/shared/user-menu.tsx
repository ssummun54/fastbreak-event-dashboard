'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { logout } from '@/actions/auth.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  email: string
  avatarUrl?: string | null
}

export function UserMenu({ email, avatarUrl }: UserMenuProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const initials = email.split('@')[0].slice(0, 2).toUpperCase()

  async function handleLogout() {
    setLoading(true)
    const result = await logout()

    if (!result.success) {
      toast.error(result.error || 'Failed to sign out')
      setLoading(false)
      return
    }

    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="cursor-pointer rounded-full hover:opacity-80 transition-opacity"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar>
          <AvatarImage src={avatarUrl ?? undefined} alt={email} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="text-destructive focus:text-destructive"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
