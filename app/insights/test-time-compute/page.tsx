"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { TestTimeComputeDiagram } from "@/components/test-time-compute-diagram"

export default function TestTimeComputePage() {
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

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Insights · AI Frontier</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-[1.08]">
              Test-time compute: why AI now <em className="font-serif italic font-normal">thinks</em> before it answers
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              For years, "better AI" meant a bigger model trained on more data. That curve is flattening. The new frontier
              is <strong className="text-foreground font-medium">test-time compute</strong> — letting a model spend more
              effort <em className="font-serif italic">while answering</em>, not just while training.
            </p>

            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Two ways to make a model smarter</h2>
                <p className="mb-4">
                  There are two distinct "scaling" knobs:
                </p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>
                    <strong className="text-foreground font-medium">Train-time compute</strong> — the classic recipe:
                    more parameters, more data, more GPUs during training. This produced GPT-2 → GPT-3 → GPT-4.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Test-time (inference) compute</strong> — let the
                    model do more <em className="font-serif italic">work per question</em>: generate intermediate
                    reasoning, explore multiple paths, check its own work, then answer.
                  </li>
                </ul>
                <p className="mt-4">
                  The surprising 2024–2026 result: spending more at inference can beat spending more at training for hard
                  reasoning, math, and coding tasks — often dramatically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">From "next token" to "let me think"</h2>
                <p className="mb-4">
                  A standard LLM answers in one forward pass — it commits to the next token immediately. Reasoning models
                  (the o1/o3 family and their open-source counterparts) instead generate a long, hidden{" "}
                  <strong className="text-foreground font-medium">chain of thought</strong>: they break the problem into
                  steps, try approaches, backtrack, and verify before producing the final answer.
                </p>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-6">
                  <p className="text-foreground">
                    The mental model: a base LLM is{" "}
                    <em className="font-serif italic">System 1</em> — fast, intuitive, one-shot. Test-time compute adds{" "}
                    <em className="font-serif italic">System 2</em> — slow, deliberate reasoning. The longer it's allowed
                    to think, the better it does on genuinely hard problems.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">One-shot vs. thinking longer, visualized</h2>
                <TestTimeComputeDiagram className="text-foreground" />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">How models "think longer"</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong className="text-foreground font-medium">Chain-of-thought:</strong> reason step-by-step instead of jumping to an answer.</li>
                  <li><strong className="text-foreground font-medium">Self-consistency:</strong> sample many independent solutions and take the majority vote.</li>
                  <li><strong className="text-foreground font-medium">Search / best-of-N:</strong> generate several candidates and pick the best with a verifier or reward model.</li>
                  <li><strong className="text-foreground font-medium">Reflection:</strong> the model critiques and revises its own draft before committing.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Why it matters</h2>
                <p className="mb-4">
                  Test-time compute changes the economics of intelligence. Instead of paying once to train an ever-larger
                  model, you can take a capable mid-sized model and <strong className="text-foreground font-medium">dial
                  up reasoning only when the task is hard</strong> — fast and cheap for easy queries, deep and deliberate
                  for the ones that matter.
                </p>
                <p>
                  That's a powerful fit for smaller, <strong className="text-foreground font-medium">local</strong>{" "}
                  models: you don't always need a giant cloud model if a compact model can reason its way to the right
                  answer on the rare hard case.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">The trade-off</h2>
                <p>
                  Thinking longer costs latency and compute per query. The art is knowing{" "}
                  <em className="font-serif italic font-normal">when</em> to think hard. The best systems route easy work
                  to a quick pass and reserve deep reasoning for problems that justify it — exactly the kind of practical
                  engineering that separates a demo from a dependable product.
                </p>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
                <p className="mb-6">
                  Test-time compute makes <strong className="text-foreground font-medium">capable local AI</strong> more
                  realistic than ever: a compact model running on your own infrastructure can reason its way to strong
                  results — privately, without sending data to a public cloud. That's the foundation of Node2's local
                  LLMs and Micro AI agents.
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
                  This explainer is for general understanding and reflects the state of reasoning models as of 2026.
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
