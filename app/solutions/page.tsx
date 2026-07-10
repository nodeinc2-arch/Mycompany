import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SOLUTIONS, SOLUTION_STATUS_LABEL } from "@/lib/solutions"

export const metadata = {
  title: "Solutions — subscribable payroll, API & agentic AI products",
  description:
    "Node2's product lines companies subscribe to: AI-native Payroll, a unified finance & payroll API, and locally-run Agentic AI. Private by default, engineered in Canada.",
  alternates: { canonical: "/solutions" },
}

export default function SolutionsHubPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Solutions</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Products companies <em className="font-serif italic font-normal">subscribe</em> to
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
              Focused product lines Canadian teams can subscribe to — each one private by default, engineered locally,
              and built to run on your own infrastructure.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/solutions/${s.slug}`}
                  className="group rounded-2xl border border-border/50 bg-card p-6 hover:border-accent/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
                      {SOLUTION_STATUS_LABEL[s.status]}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{s.tagline}</span>
                  </div>
                  <h2 className="text-xl font-medium text-foreground mb-2 leading-snug">{s.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.summary}</p>
                  <span className="inline-flex items-center gap-2 text-accent text-sm font-medium">
                    Explore
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
