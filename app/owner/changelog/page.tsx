import { changelog, type ChangeKind } from "@/lib/owner/changelog"

export const dynamic = "force-dynamic"

const KIND_STYLE: Record<ChangeKind, string> = {
  feature: "bg-accent/15 text-accent",
  fix: "bg-blue-500/15 text-blue-400",
  security: "bg-red-500/15 text-red-400",
  infra: "bg-muted text-muted-foreground",
  decision: "bg-purple-500/15 text-purple-400",
}

export default function ChangelogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Changelog</h1>
        <p className="mt-2 text-muted-foreground">What we&apos;ve built and decided, newest first.</p>
      </div>

      <ol className="space-y-5">
        {changelog.map((c, i) => (
          <li key={i} className="relative border-l-2 border-border/60 pl-6">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-accent" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">{c.date}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${KIND_STYLE[c.kind]}`}>
                {c.kind}
              </span>
            </div>
            <h3 className="mt-1 font-medium">{c.title}</h3>
            {c.detail ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.detail}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
