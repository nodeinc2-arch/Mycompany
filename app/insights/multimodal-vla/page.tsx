"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { MultimodalDiagram } from "@/components/multimodal-diagram"

export default function MultimodalVlaPage() {
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
              Multimodal AI &amp; VLA: models that <em className="font-serif italic font-normal">see</em>, read, and act
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              A text-only model lives in a world of words. <strong className="text-foreground font-medium">Multimodal
              models</strong> take in images, documents, and screens too — and{" "}
              <strong className="text-foreground font-medium">vision-language-action (VLA)</strong> models go one step
              further: they don't just understand a scene, they decide what to <em className="font-serif italic">do</em> in it.
            </p>

            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">What "multimodal" means</h2>
                <p className="mb-4">
                  A <em className="font-serif italic">modality</em> is a type of input: text, image, audio, video. A
                  multimodal model can accept more than one at once — read a chart and answer a question about it, look at
                  a photo of a receipt and extract the total, or watch a screen and describe what's on it.
                </p>
                <p>
                  The trick is the same one behind{" "}
                  <Link href="/insights/how-llms-work" className="text-accent hover:underline">how LLMs work</Link>:
                  everything is turned into <strong className="text-foreground font-medium">embeddings</strong>. Once an
                  image and a sentence live in the <em className="font-serif italic">same</em> vector space, the model can
                  reason across them with the same attention machinery it uses for text.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">How the pieces fit together</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong className="text-foreground font-medium">Encoders per modality:</strong> a vision encoder turns an image into vectors; a text encoder does the same for words.</li>
                  <li><strong className="text-foreground font-medium">A shared embedding space:</strong> both are projected so that a picture of a dog and the word "dog" land near each other.</li>
                  <li><strong className="text-foreground font-medium">Fusion + transformer:</strong> attention mixes the modalities, so the answer can depend on the image and the text together.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">How it works, visualized</h2>
                <MultimodalDiagram className="text-foreground" />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">From VLM to VLA — adding action</h2>
                <p className="mb-4">
                  A <strong className="text-foreground font-medium">vision-language model (VLM)</strong> understands what
                  it sees. A <strong className="text-foreground font-medium">vision-language-action (VLA)</strong> model
                  adds an output: an <em className="font-serif italic">action</em>. Instead of only describing the scene,
                  it produces the next move — turn the robot arm, click the button, fill the field.
                </p>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-2">
                  <p className="text-foreground">
                    The loop: <em className="font-serif italic">see → understand → decide → act</em>, then look again.
                    It's the same idea whether the "body" is a robot in a warehouse or an agent operating a computer — the
                    model perceives, reasons, and takes a step, repeatedly.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Why it matters</h2>
                <p>
                  Most real business inputs aren't clean text — they're PDFs, scanned forms, dashboards, and screens.
                  Multimodal models let AI work with the documents people actually have. And VLA is what turns a chatbot
                  into something that can <em className="font-serif italic">complete a task</em>, not just talk about it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Where it still struggles</h2>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong className="text-foreground font-medium">Fine detail:</strong> small text, dense tables, and precise coordinates are still error-prone.</li>
                  <li><strong className="text-foreground font-medium">Grounding:</strong> like any model, it can misread an image — verification matters before acting on it.</li>
                  <li><strong className="text-foreground font-medium">Acting safely:</strong> an action has consequences, so a human check on high-stakes steps is essential.</li>
                </ul>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Where Node2 fits</h2>
                <p className="mb-6">
                  Multimodal AI lets our Micro AI agents read the documents and screens a business actually runs on — and
                  act on them, on your own infrastructure. We pair perception with a{" "}
                  <strong className="text-foreground font-medium">human check on the actions that matter</strong>, so the
                  system is capable without being reckless.
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
                  This explainer is for general understanding and simplifies some details. It reflects multimodal and VLA
                  models as of 2026. See also{" "}
                  <Link href="/how-ai-evolved" className="text-accent hover:underline">how AI evolved</Link>.
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
