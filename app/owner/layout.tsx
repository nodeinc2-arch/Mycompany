import { notFound } from "next/navigation"
import Link from "next/link"
import { isOwner } from "@/lib/owner/owner-auth"

// Owner-only area. Every /owner/* page is gated here: non-owners get a 404
// (not a 403 — we don't reveal the area exists). The owner proves identity
// once via /api/owner?key=<OWNER_KEY>, which sets the signed cookie isOwner()
// reads. Fails closed when OWNER_KEY is unset.
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  if (!(await isOwner())) {
    notFound()
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/owner" className="text-sm font-semibold uppercase tracking-widest text-accent">
            Node2 · Owner
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/owner" className="hover:text-foreground">Overview</Link>
            <Link href="/owner/changelog" className="hover:text-foreground">Changelog</Link>
            <Link href="/owner/features" className="hover:text-foreground">Features</Link>
            <Link href="/" className="hover:text-foreground">Site ↗</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
