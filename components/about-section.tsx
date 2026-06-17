import Link from "next/link"
import Image from "next/image"
import { Linkedin, Github, MapPin, Briefcase, Sparkles } from "lucide-react"

const experiences = [
  {
    title: "Founder & CEO",
    company: "Node2",
    description: "Building intelligent infrastructure for Canadian businesses",
  },
  {
    title: "Payroll Specialist",
    company: "Finance & Payroll Consulting",
    description: "Leads Node2's payroll practice — Workday, integrations, auditing, and compliance",
  },
  {
    title: "Business Operations",
    company: "Finance & Payroll",
    description: "Expertise in Canadian compliance and business systems",
  },
]

const skills = [
  "AI-Native Finance",
  "Payroll & Auditing",
  "Local LLMs",
  "AI & Automation",
  "Canadian Compliance",
  "Business Strategy",
  "Team Leadership",
  "Client Relations",
]

const stats = [
  { value: "2", label: "Offices (Toronto · Pune)" },
  { value: "EN / FR", label: "Bilingual delivery" },
  { value: "PIPEDA", label: "Compliant by default" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border/50 relative overflow-hidden">
      {/* decorative accent glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left: bio */}
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">About the Founder</p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              Meet <em className="font-serif italic font-normal">Shweta Sharma</em>
            </h2>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/40 to-transparent blur-sm" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-accent/30">
                  <Image
                    src="/shweta-sharma.jpeg"
                    alt="Shweta Sharma - Founder & CEO of Node2"
                    width={176}
                    height={176}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Shweta Sharma</h3>
                <p className="text-sm text-accent">Founder &amp; CEO · Payroll Specialist</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>Canada</span>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
              Shweta Sharma is a technology entrepreneur on a mission to build IT technology in Canada — the platforms,
              AI systems, and automation tools that Canadian enterprise will rely on. A payroll specialist by
              background, she pairs deep finance &amp; payroll expertise with software engineering and AI development to
              close the gap between deep technology and the practical needs of Canadian businesses.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
              The vision: an independent Canadian IT layer — engineered locally, deployed privately, compliant by
              default — that lets mid-sized Canadian businesses compete globally without surrendering their data or
              their margins to foreign platforms.
            </p>

            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                  <div className="text-base sm:text-lg font-medium text-accent">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/company/node2-io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/node2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Right: experience + skills + quote */}
          <div className="space-y-8">
            {/* Quote highlight */}
            <blockquote className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
              <Sparkles className="h-5 w-5 text-accent mb-3" />
              <p className="text-foreground font-serif italic text-lg leading-relaxed">
                "Too many businesses struggle with fragmented tools. We bring it all together into one cohesive
                ecosystem — integrated intelligence."
              </p>
            </blockquote>

            {/* Experience */}
            <div>
              <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience
              </h4>
              <div className="space-y-4">
                {experiences.map((exp, index) => (
                  <div
                    key={exp.title}
                    className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/40 hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-foreground group-hover:text-accent transition-colors duration-300">
                        {exp.title}
                      </h5>
                      <span className="text-xs text-muted-foreground font-mono">0{index + 1}</span>
                    </div>
                    <p className="text-sm text-accent mb-2">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Skills &amp; Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 text-sm rounded-full bg-secondary text-foreground hover:bg-accent/15 hover:text-accent transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
