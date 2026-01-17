import Link from "next/link"
import { Linkedin, Github, MapPin, Briefcase } from "lucide-react"

const experiences = [
  {
    title: "Founder & CEO",
    company: "Node2",
    description: "Building intelligent infrastructure for Canadian businesses",
  },
  {
    title: "Software Engineer",
    company: "Technology Sector",
    description: "Experience in web development and AI solutions",
  },
  {
    title: "Business Operations",
    company: "Finance & Payroll",
    description: "Expertise in Canadian compliance and business systems",
  },
]

const skills = [
  "Web Development",
  "AI & Automation",
  "Business Strategy",
  "Canadian Compliance",
  "Team Leadership",
  "Client Relations",
]

export function AboutSection() {
  return (
    <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">About the Founder</p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              Meet <em className="font-serif italic font-normal">Shweta Sharma</em>
            </h2>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">SS</span>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground">Shweta Sharma</h3>
                <p className="text-muted-foreground">Founder & CEO, Node2</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>Canada</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Shweta Sharma is a technology entrepreneur passionate about empowering Canadian businesses through
              intelligent automation and modern web solutions. With expertise spanning software engineering, AI
              development, and business operations, she founded Node2 to bridge the gap between complex technology and
              practical business needs.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              Her vision is to make enterprise-grade technology accessible to mid-sized Canadian businesses, helping
              them compete on a global scale while maintaining local compliance and values.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link
                href="https://ca.linkedin.com/in/shwetasharma97"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-300"
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/node2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-300"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
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
                    className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-foreground">{exp.title}</h5>
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
              <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 text-sm rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-300"
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
