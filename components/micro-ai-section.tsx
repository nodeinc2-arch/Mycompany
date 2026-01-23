import { Clock, Zap, Shield, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    title: "Save 20+ Hours Weekly",
    description: "Automate repetitive tasks and focus on what matters most.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "AI agents respond to customers in milliseconds, not minutes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays protected with enterprise-grade security.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Agents improve over time, adapting to your business needs.",
  },
]

export function MicroAISection() {
  return (
    <section id="micro-ai" className="py-32 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">The Power of Micro AI</p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              Small, <em className="font-serif italic font-normal">dedicated</em> AI agents.{" "}
              <span className="text-muted-foreground">Massive business impact.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Built on <span className="text-accent font-medium">OLLAMA</span>, our Micro AI Agents run locally on your infrastructure, ensuring complete privacy and data security. Unlike cloud-based AI, your data never leaves your servers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Think of them as tireless digital employees who never take breaks, never make errors, and never ask for a
              raise.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent/20 text-accent">OLLAMA</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Llama 2</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Mistral</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Local LLMs</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">0{index + 1}</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
