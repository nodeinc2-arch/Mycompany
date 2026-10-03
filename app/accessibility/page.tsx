"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const EFFECTIVE = "October 3, 2026"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Legal</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-4 leading-tight">
              Accessibility <em className="font-serif italic font-normal">Statement</em>
            </h1>
            <p className="text-sm text-muted-foreground mb-12">Last updated {EFFECTIVE}</p>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <p>
                Node2 is committed to making this site usable by everyone, including people who rely on assistive
                technology. We aim to meet the{" "}
                <strong className="text-foreground font-medium">Web Content Accessibility Guidelines (WCAG) 2.1 at
                Level AA</strong>{" "}
                and to align with the Accessibility for Ontarians with Disabilities Act (AODA).
              </p>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">What we&apos;ve built in</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    An <strong className="text-foreground font-medium">accessibility toolbar</strong> for adjusting
                    text size, contrast, and reduced motion, plus light / dark / system themes.
                  </li>
                  <li>A &ldquo;skip to main content&rdquo; link for keyboard and screen-reader users.</li>
                  <li>Semantic landmarks and ARIA labels on interactive controls.</li>
                  <li>Keyboard-reachable navigation and visible focus states.</li>
                  <li>Respect for the operating-system &ldquo;reduce motion&rdquo; setting on animated content.</li>
                  <li>Colour choices intended to maintain readable contrast in both themes.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Ongoing work</h2>
                <p>
                  Accessibility is continuous. We test with keyboard and screen readers and fix issues as we find
                  them. Some third-party or embedded content may not yet fully conform; we work to improve or replace
                  it over time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Tell us about a barrier</h2>
                <p>
                  If you run into an accessibility barrier on this site, please let us know through our{" "}
                  <Link href="/contact" className="text-foreground underline underline-offset-2">
                    contact page
                  </Link>
                  . Describe the page and the problem, and we&apos;ll respond and work to resolve it. We welcome your
                  feedback.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
