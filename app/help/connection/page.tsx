import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Wifi, Smartphone, Monitor, RefreshCw, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Trouble loading node2.io? — Connection help",
  description:
    "If node2.io won't load on your network (common on some mobile carriers), these quick DNS and connection fixes resolve it. The site is served globally via Cloudflare.",
  alternates: { canonical: "/help/connection" },
}

// Connection help page. node2.io is served globally via Cloudflare and is
// reachable worldwide (verified from India, EU, Iran, Russia, etc.), but a few
// ISPs — notably some Indian mobile carriers — occasionally mishandle the route
// to Cloudflare's IP ranges on specific connections. The fix is on the visitor's
// side (DNS/VPN), so this page gives them the steps rather than implying an
// outage.

export default function ConnectionHelpPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Connection help</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Trouble loading the site?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              node2.io is served worldwide through Cloudflare and is reachable globally. If it won&apos;t load for you,
              it&apos;s almost always your network&apos;s DNS or routing — most often on certain mobile carriers. These
              quick fixes resolve it in under a minute.
            </p>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-12 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                The most reliable fix is switching your device&apos;s DNS to a public resolver like Google
                (<code className="text-foreground">dns.google</code> / <code className="text-foreground">8.8.8.8</code>) or
                Cloudflare (<code className="text-foreground">1.1.1.1</code>).
              </p>
            </div>

            <div className="space-y-6">
              <Fix
                icon={<Smartphone className="h-5 w-5" />}
                title="On a phone (fastest)"
                steps={[
                  "Android: Settings → search “Private DNS” → choose “Private DNS provider hostname” → enter dns.google → Save.",
                  "iPhone: install a free “1.1.1.1” or “Google DNS” profile, or connect to Wi‑Fi and set DNS to 8.8.8.8 in Wi‑Fi settings.",
                  "Then reload node2.io.",
                ]}
              />
              <Fix
                icon={<Monitor className="h-5 w-5" />}
                title="On a computer"
                steps={[
                  "Open your network adapter’s DNS settings.",
                  "Set DNS servers to 1.1.1.1 and 1.0.0.1 (Cloudflare) or 8.8.8.8 and 8.8.4.4 (Google).",
                  "Save, then reload the page.",
                ]}
              />
              <Fix
                icon={<RefreshCw className="h-5 w-5" />}
                title="Quick resets to try first"
                steps={[
                  "Open the site in a private / incognito window.",
                  "Toggle Airplane mode on for 10 seconds, then off (resets a mobile connection).",
                  "Try mobile data instead of Wi‑Fi, or vice‑versa.",
                ]}
              />
              <Fix
                icon={<Wifi className="h-5 w-5" />}
                title="Still stuck?"
                steps={[
                  "Use any VPN — it routes around a carrier’s bad path entirely.",
                  "If it works on one network but not another, it’s that network’s routing, not the site.",
                ]}
              />
            </div>

            <div className="mt-12 rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm text-foreground font-medium mb-1">Still can&apos;t reach it?</p>
              <p className="text-sm text-muted-foreground">
                Let us know your country, carrier (e.g. Airtel, Jio), and the exact error you see, and we&apos;ll help.{" "}
                <Link href="/contact" className="text-accent hover:underline">Contact us</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Fix({ icon, title, steps }: { icon: React.ReactNode; title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-accent shrink-0">
          {icon}
        </span>
        <h2 className="text-lg font-medium text-foreground">{title}</h2>
      </div>
      <ol className="space-y-2 list-decimal list-inside">
        {steps.map((s, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed">{s}</li>
        ))}
      </ol>
    </div>
  )
}
