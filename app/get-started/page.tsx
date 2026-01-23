"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Globe, Bot, Calculator, ArrowRight, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

const services = [
  {
    id: "web-development",
    icon: Globe,
    title: "Web Development",
    subtitle: "React & Node.js",
    description: "Modern, high-performance websites built with React frontend and Node.js backend.",
    features: [
      "Custom React Applications",
      "Node.js & Express Backend",
      "Next.js for SSR & SEO",
      "Responsive Design",
      "API Development",
      "Database Integration",
    ],
    technologies: ["React", "Next.js", "Node.js", "Express", "PostgreSQL", "MongoDB", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "micro-ai",
    icon: Bot,
    title: "Micro AI Agents",
    subtitle: "Powered by OLLAMA",
    description: "Lightweight, task-specific AI agents built on OLLAMA for local, private AI deployment.",
    features: [
      "OLLAMA Local LLM Integration",
      "Custom Model Fine-tuning",
      "Private & Secure Processing",
      "Task Automation Bots",
      "Natural Language Processing",
      "API Integration",
    ],
    technologies: ["OLLAMA", "Llama 2", "Mistral", "Python", "LangChain", "Vector Databases", "REST APIs", "Docker"],
  },
  {
    id: "finance-payroll",
    icon: Calculator,
    title: "Finance & Payroll",
    subtitle: "Consulting & Tools",
    description: "Expert consulting on financial tools and systems for Canadian businesses.",
    features: [
      "Workday Implementation",
      "SAP Integration",
      "QuickBooks Setup",
      "Payroll System Design",
      "CRA Compliance",
      "Process Automation",
    ],
    technologies: ["Workday", "SAP", "QuickBooks", "ADP", "Ceridian", "Excel/VBA", "Power BI", "Tableau"],
  },
]

export default function GetStartedPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const selectedServiceData = services.find((s) => s.id === selectedService)

  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Get Started</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Choose your <em className="font-serif italic font-normal">path</em> to growth.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Select a service below to learn more about our offerings and how we can help transform your business.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`group relative p-8 rounded-2xl border text-left transition-all duration-500 ${
                  selectedService === service.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card border-border/50 hover:border-border hover:bg-secondary/30"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                    selectedService === service.id ? "bg-accent-foreground/20" : "bg-secondary"
                  }`}
                >
                  <service.icon className="h-6 w-6" />
                </div>
                <h3
                  className={`text-2xl font-medium mb-2 ${selectedService === service.id ? "" : "group-hover:text-accent"} transition-colors duration-300`}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-sm mb-4 ${selectedService === service.id ? "text-accent-foreground/70" : "text-accent"}`}
                >
                  {service.subtitle}
                </p>
                <p className={selectedService === service.id ? "text-accent-foreground/80" : "text-muted-foreground"}>
                  {service.description}
                </p>
                {selectedService === service.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedServiceData && (
            <div className="bg-card border border-border/50 rounded-2xl p-8 lg:p-12 animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-medium text-foreground mb-4">{selectedServiceData.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">{selectedServiceData.description}</p>

                  <h3 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">What We Offer</h3>
                  <div className="grid gap-3 mb-8">
                    {selectedServiceData.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
                  >
                    Start Your Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">
                    Technologies & Tools
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedServiceData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-secondary/50 rounded-xl">
                    <h4 className="font-medium text-foreground mb-3">Ready to discuss your project?</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Book a free consultation to explore how our {selectedServiceData.title.toLowerCase()} services can
                      help your business grow.
                    </p>
                    <a
                      href="mailto:nodeinc2@gmail.com"
                      className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      nodeinc2@gmail.com
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedService && (
            <div className="text-center py-12 bg-secondary/30 rounded-2xl">
              <p className="text-muted-foreground">Select a service above to see more details</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
