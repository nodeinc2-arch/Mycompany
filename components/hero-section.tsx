import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-5xl">
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-8">
            Empowering Canadian Enterprises
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-foreground leading-[1.05] mb-8">
            The <em className="font-serif italic font-normal">intelligent</em> infrastructure for growing{" "}
            <span className="text-muted-foreground">Canadian businesses.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
            Node2 combines premium web development with Micro AI Agents and automated finance tools to put your business
            on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 px-8 h-14 text-base rounded-full group transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 h-14 text-base rounded-full border-border hover:bg-secondary/50 transition-all duration-300 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
