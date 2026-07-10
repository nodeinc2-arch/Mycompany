"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { INSIGHT_POSTS as posts } from "@/lib/insights"

export default function InsightsIndexPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Insights</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Ideas on AI, <em className="font-serif italic font-normal">built</em> for the real world
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
              Clear, practical takes on where AI is heading — and what it means for Canadian businesses.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group rounded-2xl border border-border/50 bg-card p-6 hover:border-accent/40 transition-all duration-300"
                >
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent mb-4">
                    {p.tag}
                  </span>
                  <h2 className="text-xl font-medium text-foreground mb-2 leading-snug">{p.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-accent text-sm font-medium">
                    Read
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
