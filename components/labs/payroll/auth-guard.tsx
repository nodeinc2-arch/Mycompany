"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"

// AuthGuard — gates the Node2 Payroll app pages behind a signed-in session.
//
// Wrap any protected page's content in <AuthGuard>. While the session is still
// hydrating from the server we show a neutral loading state (so a signed-in
// user is never briefly bounced). Once hydrated, a signed-out visitor is
// redirected to the sign-in page, carrying a `next` param so we can return them
// where they were headed after they authenticate.
//
// The guard reads only from useSession, so it's auth-provider agnostic: when
// company SSO (Google Workspace, LinkedIn, etc.) is added later, it populates
// the same session and this guard keeps working unchanged.
//
// NOTE: this is a client-side UX guard. The API routes remain the real security
// boundary — they independently verify the signed session cookie server-side
// (see lib/labs/payroll/auth/server-session.ts) and never trust the client.

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { tenant, ready } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (ready && !tenant) {
      const next = encodeURIComponent(pathname || "/labs/payroll")
      router.replace(`/labs/payroll/sign-in?next=${next}`)
    }
  }, [ready, tenant, pathname, router])

  // Session still loading — hold with a neutral state, don't flash content.
  if (!ready) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Loading your workspace…</span>
      </div>
    )
  }

  // Signed out — the effect is redirecting; render nothing meaningful meanwhile.
  if (!tenant) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Redirecting to sign in…</span>
      </div>
    )
  }

  return <>{children}</>
}
