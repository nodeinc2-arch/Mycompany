import { Globe, Bot, Calculator, ArrowUpRight } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description: "High-speed, SEO-optimized sites designed to convert Canadian traffic into loyal customers.",
    features: ["Custom Design", "Performance Optimized", "Mobile First"],
  },
  {
    icon: Bot,
    title: "Micro AI Agents",
    description: "Task-specific AI bots that handle customer service, lead gen, or data entry 24/7.",
    features: ["24/7 Availability", "Lead Generation", "Customer Support"],
  },
  {
    icon: Calculator,
    title: "Finance & Payroll",
    description:
      "Error-free bookkeeping and payroll management tailored to Canadian tax standards and PIPEDA compliance.",
    features: ["CRA Compliant", "PIPEDA Secure", "Automated Reports"],
  },
]

export function ServicePillars() {
  return (
    <section id="services" className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Our Trinity of Services</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
            One partner. <br />
            <span className="text-muted-foreground">Three pillars of growth.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border hover:bg-secondary/30 transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <service.icon className="h-6 w-6 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground font-mono">0{index + 1}</span>
              </div>

              <h3 className="text-2xl font-medium text-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                {service.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed mb-8">{service.description}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-muted-foreground group-hover:text-accent transition-colors duration-300">
                Learn more
                <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
