import { Globe, Bot, Calculator, ArrowRight } from "lucide-react"
import Link from "next/link"

const ctas = [
  {
    icon: Globe,
    title: "Build My Site",
    description: "React & Node.js web development",
    link: "/get-started",
  },
  {
    icon: Bot,
    title: "Automate My Workflow",
    description: "OLLAMA-powered Micro AI Agents",
    link: "/get-started",
  },
  {
    icon: Calculator,
    title: "Simplify My Payroll",
    description: "Workday & financial consulting",
    link: "/get-started",
  },
]

export function CTASection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
            Ready to <em className="font-serif italic font-normal">transform</em> your business?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your starting point. We'll handle the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ctas.map((cta) => (
            <Link
              href={cta.link}
              key={cta.title}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-accent hover:bg-secondary/30 transition-all duration-500 text-left"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <cta.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                {cta.title}
              </h3>
              <p className="text-muted-foreground mb-6">{cta.description}</p>
<div className="flex items-center text-sm text-muted-foreground group-hover:text-accent transition-colors duration-300">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
