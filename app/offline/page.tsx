import Link from "next/link"
import { Logo } from "@/components/logo"

export const metadata = {
  title: "Offline — Node2",
  robots: { index: false, follow: false },
}

// Offline fallback shown by the service worker when a navigation fails with no
// network. Deliberately static and self-contained (no live data).
export default function OfflinePage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 text-foreground inline-block" aria-label="Node2 home">
        <Logo className="h-9 w-auto" />
      </Link>
      <h1 className="text-3xl font-medium text-foreground mb-3">You&apos;re offline</h1>
      <p className="max-w-md text-muted-foreground leading-relaxed">
        This page needs a connection. Your payroll data is never stored on the device for privacy — reconnect and
        it&apos;ll load again.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Try again
      </Link>
    </main>
  )
}
