"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { AgentLoopDiagram } from "@/components/agent-loop-diagram"

export default function AiAgentsPage() {
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
              AI agents: from a model that <em className="font-serif italic font-normal">talks</em> to one that does the work
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              A chatbot answers questions. An <strong className="text-foreground font-medium">agent</strong> gets things
              done — it can look something up, run a calculation, query a database, and take the next step, over and over,
              until a goal is met. The difference isn't a smarter model. It's giving the model{" "}
              <strong className="text-foreground font-medium">tools</strong> and a <strong className="text-foreground font-medium">loop</strong>.
            </p>

            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Chat vs. agent</h2>
                <p className="mb-4">
                  As covered in <Link href="/insights/how-llms-work" className="text-accent hover:underline">how LLMs work</Link>,
                  a base model predicts text in one pass — it can't check a live number or change anything in the world.
                  An agent wraps that same model in a system that lets it <em className="font-serif italic">act</em>:
                  choose a tool, use it, read the result, and decide what to do next.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Tool calling: the key idea</h2>
                <p className="mb-4">
                  The model is given a menu of <strong className="text-foreground font-medium">tools</strong> — functions
                  it can invoke, each with a name and inputs (search the web, run a query, send an email, call an API).
                  Instead of guessing an answer, it emits a structured <em className="font-serif italic">"call this tool
                  with these arguments."</em> Your code runs the tool and hands the result back. Now the model is working
                  with <strong className="text-foreground font-medium">real data and real actions</strong>, not just its
                  training memory.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">The loop, visualized</h2>
                <AgentLoopDiagram className="text-foreground" />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">What makes it an "agent"</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong className="text-foreground font-medium">Planning:</strong> break a goal into steps rather than answering in one shot.</li>
                  <li><strong className="text-foreground font-medium">Tool use:</strong> call functions to get facts or make changes.</li>
                  <li><strong className="text-foreground font-medium">Observation:</strong> read each tool's output and adjust — retry, try another approach, or finish.</li>
                  <li><strong className="text-foreground font-medium">Memory:</strong> carry context (and sometimes notes or retrieved docs) across steps.</li>
                </ul>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-4">
                  <p className="text-foreground">
                    A common way to give an agent access to your systems is the{" "}
                    <strong className="text-foreground font-medium">Model Context Protocol (MCP)</strong> — a standard way
                    to expose tools and data to a model, under your own authentication and audit trail.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Where agents genuinely help — and where it's hype</h2>
                <p className="mb-4">
                  Agents shine on <strong className="text-foreground font-medium">multi-step, tool-shaped tasks</strong>:
                  pull data from three systems and reconcile it, triage and route a request, draft something that requires
                  looking things up first. They struggle when the loop is too open-ended — more steps mean more chances to
                  go off course.
                </p>
                <p>
                  The dependable pattern is a <em className="font-serif italic">narrow</em> agent: a clear goal, a small set
                  of well-defined tools, and hard limits — not an "autonomous do-anything" bot.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Why safety and grounding matter more here</h2>
                <p>
                  A chatbot that's wrong just says something wrong. An agent that's wrong can{" "}
                  <em className="font-serif italic">take a wrong action</em>. That's why the good ones ground their inputs
                  (see <Link href="/insights/rag" className="text-accent hover:underline">RAG</Link>), compute exact
                  numbers with tools instead of guessing, and put a{" "}
                  <strong className="text-foreground font-medium">human in the loop</strong> before anything consequential
                  — moving money, sending a message, changing a record.
                </p>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
                <p className="mb-6">
                  Our <strong className="text-foreground font-medium">Micro AI agents</strong> are the narrow kind: each
                  scoped to one job, running on your own infrastructure, using tools through your own MCP server — and
                  handing exact numbers to deterministic engines rather than guessing. Capable and accountable, with a
                  human check on the steps that matter.
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
                  This explainer is for general understanding and simplifies some details. It reflects agent and tool-use
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
