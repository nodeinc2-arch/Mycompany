import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SOLUTIONS, getSolution, SOLUTION_STATUS_LABEL } from "@/lib/solutions"

// One static route per idea, straight from the registry.
export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const solution = getSolution(slug)
  if (!solution) return {}
  const title = `${solution.name} — ${solution.tagline}`
  return {
    title,
    description: solution.summary,
    alternates: { canonical: `/solutions/${solution.slug}` },
    openGraph: { title, description: solution.summary, url: `/solutions/${solution.slug}`, type: "website" },
  }
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const solution = getSolution(slug)
  if (!solution) notFound()

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              All solutions
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm font-medium text-accent uppercase tracking-widest">{solution.tagline}</p>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider rounded-full bg-accent/15 text-accent border border-accent/30">
                {SOLUTION_STATUS_LABEL[solution.status]}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-[1.05]">
              {solution.name}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {solution.overview}
            </p>
          </div>
        </section>

        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-8">What you get</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {solution.features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border/50 bg-card p-6">
                  <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                    <Check className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-2">How it's offered</p>
            <p className="text-foreground font-medium mb-4">{solution.subscribe}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Interested in {solution.name}? Tell us about your setup and we'll scope a subscription that fits.
            </p>
            <Link href="/get-started">
              <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                Get started
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
