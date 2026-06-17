"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight, Target, Shield, MapPin, Cpu } from "lucide-react"
import Link from "next/link"

const goals = [
  {
    icon: Cpu,
    title: "AI-native finance & payroll",
    body: "Build a locally AI-integrated finance tool that connects payroll companies and adds an intelligent auditing layer across their systems.",
  },
  {
    icon: Shield,
    title: "Private by default",
    body: "Run AI on your own infrastructure — custom local LLMs and Micro AI agents — so sensitive data never leaves your environment or goes to public cloud AI.",
  },
  {
    icon: MapPin,
    title: "Canadian-first & compliant",
    body: "Engineer locally and deploy in a PIPEDA-aware, Canadian-compliant way, so mid-sized businesses can compete globally without surrendering data or margins.",
  },
  {
    icon: Target,
    title: "Ship BuildingSync",
    body: "Bring our AI-integrated PropertyTech platform from MVP to a product that property and building operators rely on every day.",
  },
]

export default function MissionPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Mission &amp; Goals</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.05]">
              Building Canada's next <em className="font-serif italic font-normal">IT technology</em> layer
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Our mission is an independent Canadian IT layer — the platforms, AI systems, and automation tools Canadian
              businesses can actually rely on. Engineered locally, deployed privately, compliant by default.
            </p>
          </div>
        </section>

        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-8">Our goals</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {goals.map((g) => {
                const Icon = g.icon
                return (
                  <div key={g.title} className="rounded-2xl border border-border/50 bg-card p-6">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{g.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">The vision</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Too many businesses struggle with fragmented tools. Node2 brings integrated software, private AI, and
              operational systems together into one cohesive ecosystem — so technology becomes an advantage, not a tax.
            </p>
            <Link href="/get-started">
              <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                Build with us
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
