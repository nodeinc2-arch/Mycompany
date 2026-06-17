"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
      <div className="text-2xl sm:text-3xl font-medium text-accent">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export default function WorldModelsVsLLMsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Hero */}
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
              World models vs. LLMs: Yann LeCun's{" "}
              <em className="font-serif italic font-normal">billion-dollar</em> bet
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              The Turing Award winner just raised over $1B to argue that today's large language models are a powerful but{" "}
              <strong className="text-foreground font-medium">limited side branch</strong> of AI — and that the future
              belongs to learned <strong className="text-foreground font-medium">world models</strong> built on
              Joint-Embedding Predictive Architectures (JEPA), not generative next-token prediction.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <Stat value="$1.03B" label="Seed raised by AMI Labs (Mar 2026)" />
              <Stat value="JEPA" label="The architecture behind the bet" />
              <Stat value="~88.4%" label="DINO v3 self-supervised ImageNet accuracy" />
            </div>

            {/* Body */}
            <div className="mt-12 space-y-10 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">The big picture</h2>
                <p className="mb-4">
                  Modern deep learning exploded with convolutional nets and supervised learning — AlexNet on ImageNet
                  in 2012 being the watershed. But that approach leans heavily on{" "}
                  <strong className="text-foreground font-medium">human-labeled data</strong>, which is nothing like how
                  humans actually learn.
                </p>
                <p className="mb-4">
                  Self-supervised learning changed the game. Next-token prediction in transformers uses raw text as its
                  own label, and that unlocked the leap from GPT-1 to GPT-3 to ChatGPT. This generative, autoregressive
                  recipe works astonishingly well for language — but it hits serious problems when naively applied to
                  images and video.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Why generative video goes "blurry and wrong"</h2>
                <p className="mb-4">
                  A straightforward "GPT for video" — predicting the next frame's pixels autoregressively — quickly
                  collapses into blurry nonsense. The model has to average over many plausible futures in a gigantic
                  continuous output space.
                </p>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 my-6">
                  <p className="text-foreground">
                    Text has tens of thousands of discrete tokens. A single HD frame has on the order of{" "}
                    <span className="font-mono text-accent">10^15,000,000</span> possible configurations. You can't
                    enumerate that — and directly regressing pixels just encourages the model to{" "}
                    <em className="font-serif italic">average</em> uncertain outcomes into mush.
                  </p>
                </div>
                <p>
                  This raises the key question: do self-supervised models really need to be{" "}
                  <em className="font-serif italic font-normal">generative</em> at all — or do they just need to learn
                  useful internal representations?
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Joint embeddings (and the collapse problem)</h2>
                <p className="mb-4">
                  Joint-embedding methods encode inputs into vectors and learn to make embeddings of{" "}
                  <em className="font-serif italic font-normal">related</em> views similar — e.g. two augmentations of
                  the same image — <strong className="text-foreground font-medium">without reconstructing pixels</strong>.
                  The classic example is Siamese networks for signature verification: a contrastive loss pulls genuine
                  pairs together and pushes fraudulent ones apart in embedding space.
                </p>
                <p>
                  Done naively at scale, though, joint embeddings suffer{" "}
                  <strong className="text-foreground font-medium">representation collapse</strong>: the network can just
                  output the same vector (say, all ones) for every input — perfect similarity, zero learning.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">Barlow Twins, DINO, and the breakthrough</h2>
                <p className="mb-4">
                  Inspired by Horace Barlow's redundancy-reduction hypothesis, LeCun and collaborators introduced{" "}
                  <strong className="text-foreground font-medium">Barlow Twins</strong>: two encoders process two
                  distorted views, and the loss drives the cross-correlation matrix of their outputs toward the
                  identity. Diagonal entries → 1 (the same neuron agrees across views); off-diagonals → 0 (different
                  neurons stay decorrelated). That both avoids collapse and forces neurons to capture distinct factors
                  of variation.
                </p>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6 my-6">
                  <p className="text-foreground mb-2 font-medium">The receipts</p>
                  <ul className="space-y-1.5">
                    <li>• A frozen Barlow Twins encoder + linear probe ≈ <span className="text-accent">73%</span> ImageNet — beating the original supervised AlexNet (~59%).</li>
                    <li>• Follow-ons (VICReg, DINO) refined the idea; <span className="text-accent">DINO v3</span> reaches ~88.4% self-supervised — on par with supervised models.</li>
                    <li>• DINO v3 even learns patch-level embeddings that cleanly segment objects <em className="font-serif italic">without labels</em>.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">From representations to world models: JEPA</h2>
                <p className="mb-4">
                  In his 2022 position paper, <em className="font-serif italic font-normal">A Path Towards Autonomous
                  Machine Intelligence</em>, LeCun argued that today's systems are nowhere near human learning
                  efficiency. A teenager learns to drive in ~20 hours because they already carry rich world models of
                  physics, objects, and causality. He defines "common sense" as exactly that: a collection of world
                  models predicting what's likely, plausible, or impossible.
                </p>
                <p className="mb-4">
                  <strong className="text-foreground font-medium">JEPA (Joint-Embedding Predictive Architecture)</strong>{" "}
                  formalizes this. An encoder maps observations to states; a predictor maps the state at time{" "}
                  <span className="font-mono">t</span> (optionally plus an action) to the state at{" "}
                  <span className="font-mono">t+1</span> — <strong className="text-foreground font-medium">in
                  embedding space, not pixel space</strong>. For video, it predicts the next frame's{" "}
                  <em className="font-serif italic">embedding</em>, freeing it from chasing unpredictable details (leaves
                  in the wind) and focusing on salient structure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">JEPA for action and control</h2>
                <p className="mb-4">
                  Condition the predictor on an action (say, control signals to a robot arm) and JEPA becomes a learned
                  dynamics model: state at <span className="font-mono">t</span> + action → predicted state at{" "}
                  <span className="font-mono">t+1</span> in latent space.
                </p>
                <p>
                  In <strong className="text-foreground font-medium">V-JEPA 2</strong>, this powers robotic control:
                  encode a goal image into a goal state, then search over hypothetical action sequences using the learned
                  world model to find one whose predicted future matches the goal. It's classical optimal control —
                  planning over a dynamics model — except both the representation and the dynamics are{" "}
                  <em className="font-serif italic font-normal">learned jointly</em> instead of hand-designed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-4">LLMs vs. JEPA world models, side by side</h2>
                <div className="overflow-x-auto rounded-2xl border border-border/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/30">
                        <th className="text-left font-medium text-foreground p-4 w-[28%]">Dimension</th>
                        <th className="text-left font-medium text-foreground p-4">LLMs</th>
                        <th className="text-left font-medium text-accent p-4">JEPA / world models</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr]:border-b [&>tr]:border-border/40 [&>tr:last-child]:border-0">
                      {[
                        {
                          k: "Core training objective",
                          llm: "Minimize next-token prediction loss (cross-entropy over discrete text tokens).",
                          jepa: "Predict future embeddings (latent states), not raw pixels/tokens — with joint-embedding & decorrelation losses (Barlow Twins, VICReg, DINO).",
                        },
                        {
                          k: "Data & modality fit",
                          llm: "Natural fit for language and discrete token sequences (code, structured data) where the future is sharp and low-dimensional.",
                          jepa: "Built for high-dimensional continuous streams (video, sensor, robot data) where pixel-level generation blurs and averages over futures.",
                        },
                        {
                          k: "Representation learning",
                          llm: "Representations emerge as a byproduct of generation — good, but tightly coupled to text prediction.",
                          jepa: "Representations are the primary object — losses explicitly shape latent spaces to be informative, decorrelated, non-collapsed.",
                        },
                        {
                          k: "Planning & control",
                          llm: "Action = 'generate more tokens.' No native simulation of environment dynamics before committing.",
                          jepa: "Learns dynamics in latent space — enables model-predictive control by rolling out hypothetical actions toward a goal.",
                        },
                        {
                          k: "Common sense",
                          llm: "Encodes statistical regularities of text; approximates some common sense but lacks structured world models of physics/3D/causality.",
                          jepa: "Aims to BE the world model — predicting likely/possible futures, enabling fast skill acquisition from few trials.",
                        },
                        {
                          k: "Scaling outlook (LeCun's bet)",
                          llm: "Scales impressively for language, but diminishing returns for embodied, reliable agents without explicit world modeling.",
                          jepa: "Large-scale self-supervised world models become the backbone for safe autonomous systems — with LLMs as an interface layer, not the core.",
                        },
                      ].map((row) => (
                        <tr key={row.k} className="align-top">
                          <td className="p-4 font-medium text-foreground">{row.k}</td>
                          <td className="p-4 text-muted-foreground">{row.llm}</td>
                          <td className="p-4 text-muted-foreground">{row.jepa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-foreground mb-3">The bet against LLM-centric AGI</h2>
                <p className="mb-4">
                  LeCun's controversial claim: you can't build a truly reliable agentic system without a world model that
                  predicts the consequences of its actions <em className="font-serif italic">before</em> acting. Current
                  LLMs and vision-language-action models act via autoregressive token generation without internal
                  simulation of outcomes — so they can't natively plan with safety guarantees.
                </p>
                <p>
                  His billion-dollar bet, via the newly formed{" "}
                  <strong className="text-foreground font-medium">AMI Labs</strong> ($1.03B seed at a $3.5B pre-money
                  valuation, March 2026), is that JEPA-style world models — not ever-bigger LLMs — will be the foundation
                  for autonomous, safe, and efficient AI agents, starting in industrial, robotic, and healthcare domains
                  where hallucinations are most dangerous.
                </p>
              </section>

              {/* Node2 tie-in */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Why this matters for Node2</h2>
                <p className="mb-6">
                  Whether the future is bigger LLMs or learned world models, one principle holds: the most valuable AI is
                  the AI you can run <strong className="text-foreground font-medium">privately, on your own
                  infrastructure</strong>, grounded in your real-world data. That's what Node2 builds — AI-native finance
                  and payroll tooling, custom local LLMs, and Micro AI agents that keep your data in Canada and out of the
                  public cloud.
                </p>
                <Link href="/get-started">
                  <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                    See what we build
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </section>

              {/* Sources */}
              <section className="border-t border-border/50 pt-6">
                <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Sources & further reading</h2>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a className="hover:text-foreground underline underline-offset-4" href="https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/" target="_blank" rel="noopener noreferrer">
                      TechCrunch — Yann LeCun's AMI Labs raises $1.03B to build world models
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-foreground underline underline-offset-4" href="https://en.wikipedia.org/wiki/World_model_(artificial_intelligence)" target="_blank" rel="noopener noreferrer">
                      Wikipedia — World model (artificial intelligence)
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-foreground underline underline-offset-4" href="https://en.wikipedia.org/wiki/Yann_LeCun" target="_blank" rel="noopener noreferrer">
                      Wikipedia — Yann LeCun
                    </a>
                  </li>
                  <li className="text-muted-foreground/70">
                    LeCun, "A Path Towards Autonomous Machine Intelligence" (2022); Barlow Twins, VICReg, DINO/DINO v3,
                    and V-JEPA 2 research.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
