import { features, type FeatureStatus } from "@/lib/owner/features"

export const dynamic = "force-dynamic"

const STATUS_STYLE: Record<FeatureStatus, string> = {
  live: "bg-green-500/15 text-green-400",
  building: "bg-amber-500/15 text-amber-400",
  planned: "bg-muted text-muted-foreground",
}

export default function FeaturesPage() {
  const feats = features()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Feature management</h1>
        <p className="mt-2 text-muted-foreground">
          What we&apos;re building and its live state. Flags are read from the environment, so this
          reflects the running config. Toggle a flag by setting its env var and redeploying.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Flag</th>
              <th className="px-4 py-3 font-medium">On</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {feats.map((f) => (
              <tr key={f.key} className="border-b border-border/30 last:border-0">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLE[f.status]}`}>
                    {f.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.envFlag ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={f.on ? "text-green-400" : "text-muted-foreground"}>
                    {f.on ? "● on" : "○ off"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
