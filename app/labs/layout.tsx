import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  title: "Labs · Internal preview",
}

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.LABS_ENABLED !== "1") {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-yellow-500/15 border-b border-yellow-500/30 text-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs flex items-center justify-between gap-4">
          <span className="font-medium tracking-wide uppercase">Internal · Not for production</span>
          <span className="hidden sm:inline opacity-70">
            Mock data only — no real CRA submissions, no live integrations.
          </span>
          <Link href="/" className="opacity-70 hover:opacity-100 underline underline-offset-2">
            Back to Node2.io
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}
