"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedEmail } from "@/components/protected-email"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const EFFECTIVE = "June 17, 2026"

export default function PrivacyPage() {
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
              Privacy <em className="font-serif italic font-normal">Policy</em>
            </h1>
            <p className="text-sm text-muted-foreground mb-12">Effective {EFFECTIVE}</p>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <p>
                Node2 (operated by 1001477193 Ontario Inc., "Node2," "we," "us") respects your privacy. This policy
                explains what we collect, why, and how we protect it. We follow the principles of Canada's{" "}
                <strong className="text-foreground font-medium">Personal Information Protection and Electronic
                Documents Act (PIPEDA)</strong>.
              </p>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">1. Information we collect</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-foreground font-medium">Information you provide</strong> — e.g. when you use
                    our contact or get-started forms: your name, email, company, and message.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Usage data</strong> — basic analytics (pages
                    visited, device/browser type) collected to improve the site.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">2. How we use it</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>To respond to your inquiries and provide our services.</li>
                  <li>To operate, secure, and improve our website.</li>
                  <li>To meet legal and regulatory obligations.</li>
                </ul>
                <p className="mt-3">We do not sell your personal information.</p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">3. AI &amp; data residency</h2>
                <p>
                  Node2 is built around <strong className="text-foreground font-medium">privacy-first, local AI</strong>.
                  Where our solutions process data with AI, we favour models that run on your own infrastructure so your
                  sensitive data does not leave your environment or get sent to public cloud AI services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">4. Sharing &amp; service providers</h2>
                <p>
                  We share information only with service providers that help us operate (e.g. analytics, email delivery,
                  hosting), under appropriate safeguards, or where required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">5. Data retention &amp; security</h2>
                <p>
                  We keep personal information only as long as needed for the purposes above, and protect it with
                  reasonable technical and organizational safeguards.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">6. Your rights</h2>
                <p>
                  Under PIPEDA you may request access to, correction of, or deletion of your personal information, and
                  withdraw consent. To exercise these rights, contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">7. Contact</h2>
                <p className="mb-3">
                  Questions about this policy or your data? Reach our team:
                </p>
                <ProtectedEmail
                  label="Email Node2's privacy team"
                  subject="Privacy inquiry"
                  className="text-accent hover:underline underline-offset-4 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </section>

              <section className="border-t border-border/50 pt-6">
                <p className="text-sm text-muted-foreground/70">
                  We may update this policy from time to time; material changes will be reflected by the effective date
                  above. This page is provided for general information and is not legal advice.
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
