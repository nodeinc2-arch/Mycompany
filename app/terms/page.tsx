"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const EFFECTIVE = "October 3, 2026"

export default function TermsPage() {
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
              Terms of <em className="font-serif italic font-normal">Service</em>
            </h1>
            <p className="text-sm text-muted-foreground mb-12">Effective {EFFECTIVE}</p>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <p>
                These Terms govern your use of the Node2 website and services. Node2 is a trade name of{" "}
                <strong className="text-foreground font-medium">1001477193 Ontario Inc.</strong> (&ldquo;Node2,&rdquo;
                &ldquo;we,&rdquo; &ldquo;us&rdquo;), incorporated in Ontario, Canada. By using this site you agree to
                these Terms. If you do not agree, please do not use the site.
              </p>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Use of the site</h2>
                <p>
                  You may use this site for lawful purposes only. You agree not to misuse it, attempt to disrupt it,
                  access it in unauthorized ways, or use it to infringe anyone&apos;s rights. We may change, suspend,
                  or discontinue any part of the site at any time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Intellectual property</h2>
                <p>
                  The site&apos;s content, branding, and software are owned by Node2 or its licensors and are
                  protected by law. You may not copy, modify, or redistribute them without permission, except as
                  allowed by applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Services and proposals</h2>
                <p>
                  Information on this site is for general purposes and is not a binding offer. Any engagement for
                  development, consulting, or other services is governed by a separate written agreement. Products
                  marked &ldquo;coming soon&rdquo; or in development are not yet generally available and their scope
                  may change.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Disclaimers and liability</h2>
                <p>
                  The site is provided &ldquo;as is,&rdquo; without warranties of any kind, to the extent permitted by
                  law. Node2 is not liable for indirect, incidental, or consequential damages arising from your use of
                  the site. Nothing in these Terms limits liability that cannot be limited under applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Governing law</h2>
                <p>
                  These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada
                  applicable there, without regard to conflict-of-laws rules. Disputes are subject to the courts
                  located in Ontario, Canada.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-medium text-foreground mb-3">Changes and contact</h2>
                <p>
                  We may update these Terms from time to time; the effective date above reflects the latest version.
                  Questions about these Terms can be sent through our{" "}
                  <Link href="/contact" className="text-foreground underline underline-offset-2">
                    contact page
                  </Link>
                  . See also our{" "}
                  <Link href="/privacy" className="text-foreground underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  .
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
