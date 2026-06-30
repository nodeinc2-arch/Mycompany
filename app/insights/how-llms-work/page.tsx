"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { HowLlmsWorkDiagram } from "@/components/how-llms-work-diagram"

export default function HowLlmsWorkPage() {
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
              How a large language model actually <em className="font-serif italic font-normal">works</em>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              An LLM looks like magic and is often described like one. Underneath, it does something narrow and
              concrete: <strong className="text-foreground font-medium">predict the next piece of text</strong>, one
              step at a time. Everything else — answering questions, writing code, sounding fluent — emerges from doing
              that one job extremely well, at enormous scale.
            </p>

            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">1. Text becomes tokens</h2>
                <p className="mb-4">
                  A model doesn't see words or letters — it sees <strong className="text-foreground font-medium">tokens</strong>,
                  the chunks text is split into. A token is often a word piece: "payroll" might be one token, "unbelievable"
                  might be three (<span className="font-mono text-sm">un · believ · able</span>). Every token maps to a number,
                  so a sentence becomes a list of numbers the model can do math on.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">2. Tokens become vectors (embeddings)</h2>
                <p className="mb-4">
                  Each token is turned into a long list of numbers called an{" "}
                  <strong className="text-foreground font-medium">embedding</strong> — a position in a high-dimensional
                  "meaning space." Tokens used in similar ways end up near each other. This is why a model can tell that
                  "Toronto" and "Vancouver" are the same kind of thing, without anyone writing a rule that says so.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">3. Attention: every token looks at the others</h2>
                <p className="mb-4">
                  The core of the <strong className="text-foreground font-medium">transformer</strong> (the architecture
                  behind every modern LLM) is <strong className="text-foreground font-medium">attention</strong>. For each
                  token, the model weighs how much every other token in the context matters to it, and mixes their meaning
                  together. That's how "it" gets connected to the right noun, and how a fact mentioned 2,000 words earlier
                  can influence the next word.
                </p>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-6">
                  <p className="text-foreground">
                    The mental model: attention lets the model{" "}
                    <em className="font-serif italic">re-read the whole context</em> for every single word it produces,
                    deciding what's relevant each time. Stack that operation dozens of times and patterns of grammar,
                    facts, and reasoning start to appear.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">4. The one thing it predicts: the next token</h2>
                <p className="mb-4">
                  After all that processing, the model outputs a{" "}
                  <strong className="text-foreground font-medium">probability for every possible next token</strong>. It
                  picks one, appends it to the text, and runs the whole thing again — token by token — until the answer is
                  complete. "Writing a paragraph" is really thousands of next-token predictions in a row.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">The whole pipeline, visualized</h2>
                <HowLlmsWorkDiagram className="text-foreground" />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">5. Training vs. using the model</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-foreground font-medium">Pre-training:</strong> the model reads a vast amount of
                    text and adjusts billions of internal weights to get better at predicting the next token. This is the
                    slow, expensive part — and where it absorbs grammar, facts, and patterns.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Fine-tuning &amp; alignment:</strong> a second phase
                    (often with human feedback) shapes it to be helpful, follow instructions, and stay safe.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Inference:</strong> when you actually use it. The
                    weights are frozen; it's just running predictions over your prompt.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">6. The context window is its working memory</h2>
                <p>
                  A model can only "see" a limited amount of text at once — its{" "}
                  <strong className="text-foreground font-medium">context window</strong>. Anything outside it is invisible
                  unless you put it back in. The model has no memory between conversations on its own; techniques like
                  retrieval (RAG) work by <em className="font-serif italic">fetching the right text and placing it into the
                  context</em> so the model can attend to it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">7. Why it sometimes makes things up</h2>
                <p>
                  Because it predicts <em className="font-serif italic">plausible</em> text, not <em className="font-serif italic">true</em>{" "}
                  text. When the model is unsure, the most probable-sounding continuation can still be wrong — a{" "}
                  <strong className="text-foreground font-medium">hallucination</strong>. It isn't lying or guessing
                  randomly; it's completing a pattern. That's exactly why grounding matters: give it the real facts in
                  context, or have it call a tool that computes the real answer, instead of trusting it to recall.
                </p>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
                <p className="mb-6">
                  Understanding that an LLM predicts <em className="font-serif italic">plausible</em> text is the whole
                  reason we build the way we do: our Micro AI agents run on{" "}
                  <strong className="text-foreground font-medium">local models</strong>, grounded in your real data, and
                  hand off exact numbers to deterministic tools instead of letting the model guess. Capable, private, and
                  accountable — not magic.
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
                  This explainer is for general understanding and simplifies some details. It reflects how transformer-based
                  language models work as of 2026.
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
