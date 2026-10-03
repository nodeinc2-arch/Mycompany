import Link from "next/link"
import { changelog } from "@/lib/owner/changelog"
import { features } from "@/lib/owner/features"

export const dynamic = "force-dynamic"

export default function OwnerHome() {
  const feats = features()
  const live = feats.filter((f) => f.status === "live").length
  const building = feats.filter((f) => f.status === "building").length
  const planned = feats.filter((f) => f.status === "planned").length
  const latest = changelog.slice(0, 3)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Owner overview</h1>
        <p className="mt-2 text-muted-foreground">
          Private control room — visible only to you. What we&apos;re building, and what changed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Live" value={live} />
        <Stat label="Building" value={building} />
        <Stat label="Planned" value={planned} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-accent">Recent changes</h2>
          <Link href="/owner/changelog" className="text-sm text-muted-foreground hover:text-foreground">
            Full changelog →
          </Link>
        </div>
        <ul className="divide-y divide-border/50 rounded-lg border border-border/50">
          {latest.map((c, i) => (
            <li key={i} className="flex items-start gap-4 px-4 py-3">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">{c.date}</span>
              <span className="text-sm">{c.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 p-5">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  )
}
