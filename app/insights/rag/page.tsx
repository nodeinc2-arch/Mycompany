"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { RagDiagram } from "@/components/rag-diagram"

export default function RagPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              All insights
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Insights · Explainer</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-[1.08]">
              RAG: how AI answers from <em className="font-serif italic font-normal">your</em> data, not its memory
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              A language model only knows what it absorbed during training — frozen, generic, and prone to making things
              up. <strong className="text-foreground font-medium">Retrieval-augmented generation (RAG)</strong> fixes that
              by fetching the relevant facts from your own documents and handing them to the model{" "}
              <em className="font-serif italic">at the moment it answers</em>.
            </p>

            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">The problem RAG solves</h2>
                <p className="mb-4">
                  As covered in <Link href="/insights/how-llms-work" className="text-accent hover:underline">how LLMs work</Link>,
                  a model predicts <em className="font-serif italic">plausible</em> text from frozen training weights. Ask
                  it about your refund policy, last quarter's numbers, or a document it never saw, and it will confidently
                  produce something that <em className="font-serif italic">sounds</em> right — but isn't yours.
                </p>
                <p>
                  RAG closes that gap without retraining: it retrieves the actual source text and places it into the
                  model's <strong className="text-foreground font-medium">context window</strong>, so the answer is
                  grounded in real, current, specific information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">How it works, visualized</h2>
                <RagDiagram className="text-foreground" />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">The pieces</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-foreground font-medium">Chunking:</strong> your documents are split into small
                    passages so the right piece can be found and fit into context.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Embeddings:</strong> each chunk is turned into a vector
                    (a point in meaning space). So is the question.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Vector search:</strong> find the chunks whose vectors
                    are closest to the question's — i.e. the most semantically relevant text, not just keyword matches.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Augmented prompt:</strong> those top chunks are pasted
                    into the prompt alongside the question.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Generation with citations:</strong> the model answers
                    using the supplied text — and can point back to which source it used.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Why it beats just "training it on our data"</h2>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-2">
                  <p className="text-foreground">
                    Fine-tuning bakes <em className="font-serif italic">style and behaviour</em> into the model; RAG
                    supplies <em className="font-serif italic">facts</em> at answer time. You usually want RAG for
                    knowledge that changes, is private, or must be cited — update a document and the next answer reflects
                    it instantly, with no retraining.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Where it still goes wrong</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong className="text-foreground font-medium">Bad retrieval → bad answer:</strong> if the right chunk isn't found, the model fills the gap — garbage in, garbage out.</li>
                  <li><strong className="text-foreground font-medium">Chunking matters:</strong> split too coarse and you miss the detail; too fine and you lose context.</li>
                  <li><strong className="text-foreground font-medium">It's grounding, not certainty:</strong> RAG sharply reduces hallucination but doesn't eliminate it — citations let a human verify.</li>
                </ul>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
                <p className="mb-6">
                  RAG is how we make <strong className="text-foreground font-medium">local AI</strong> genuinely useful:
                  our Micro AI agents retrieve from <em className="font-serif italic">your</em> documents — on your own
                  infrastructure, never a public cloud — and answer with citations you can check. Private by default,
                  grounded by design.
                </p>
                <Link href="/get-started">
                  <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                    See what we build
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </section>

              <section className="border-t border-border/50 pt-6">
                <p className="text-sm text-muted-foreground/70">
                  This explainer is for general understanding and simplifies some details. It reflects common RAG
                  practice as of 2026.
                </p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
