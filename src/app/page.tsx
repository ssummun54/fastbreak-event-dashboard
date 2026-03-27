import { redirect } from 'next/navigation'

// Root route — middleware handles auth redirects, but this catches any direct visits to "/"
export default function RootPage() {
  redirect('/dashboard')
}
