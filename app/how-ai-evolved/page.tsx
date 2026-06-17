"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AiEvolutionTimeline } from "@/components/ai-evolution-timeline"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HowAiEvolvedPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Insights</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.05]">
              How <em className="font-serif italic font-normal">AI</em> evolved
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              From recognizing handwritten digits to generating language, images, and action — a short tour of the
              breakthroughs that took AI from <strong className="text-foreground font-medium">discriminative</strong>{" "}
              models to the <strong className="text-foreground font-medium">generative</strong> era powering today's
              tools.
            </p>
          </div>
        </section>

        {/* Interactive timeline */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto rounded-3xl border border-border/50 bg-secondary/20 p-6 sm:p-10">
            <AiEvolutionTimeline className="text-foreground" />
          </div>
        </section>

        {/* Narrative */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
                The discriminative era: teaching machines to <em className="font-serif italic font-normal">see</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Early AI focused on <strong className="text-foreground font-medium">discrimination</strong> — telling
                things apart. Given an input, predict a label. The convolutional neural network (CNN), pioneered in
                1989, learned visual features automatically instead of relying on hand-crafted rules. LeNet-5 turned
                that idea into a practical system reading bank cheques, and in 2012 AlexNet shattered the ImageNet
                benchmark using GPUs — the spark that ignited the modern deep-learning boom.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These models were brilliant classifiers, but they didn't{" "}
                <em className="font-serif italic font-normal">create</em> anything. That was about to change.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
                The generative era: teaching machines to <em className="font-serif italic font-normal">create</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Starting with GANs in 2014, models learned to generate — first pixels, then language. GPT-1 (2018)
                introduced generative pre-training for text; scaling it produced GPT-2 and GPT-3, which could perform
                new tasks from a prompt alone. Diffusion models overtook GANs for images and video, and
                instruction-tuning turned raw models into the helpful assistants we now call modern LLMs. The frontier
                today — Vision-Language-Action (VLA) — fuses perception, language, and action so AI can operate in the
                physical world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Tap through the milestones above to see how each step built on the last.
              </p>
            </div>

            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The same modern LLMs at the end of this timeline now run small and private enough to deploy{" "}
                <strong className="text-foreground font-medium">locally, on your own infrastructure</strong>. That's
                exactly what Node2 builds — AI-native finance and payroll tooling, custom local LLMs, and Micro AI
                agents that keep your data in Canada and out of the public cloud.
              </p>
              <Link href="/get-started">
                <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                  See what we build
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
