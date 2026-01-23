"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X, Linkedin, Github } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-foreground">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="#services"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Services
            </Link>
            <Link
              href="#micro-ai"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Micro AI
            </Link>
            <Link
              href="#finance"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Finance
            </Link>
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="https://ca.linkedin.com/in/shwetasharma97"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/node2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link href="/contact">
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 px-6 rounded-full transition-all duration-300"
              >
                Contact
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-6 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              <Link href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link href="#micro-ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Micro AI
              </Link>
              <Link href="#finance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Finance
              </Link>
              <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="https://ca.linkedin.com/in/shwetasharma97"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="https://github.com/node2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Link>
              </div>
              <Link href="/contact">
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 mt-2 rounded-full w-full">
                  Contact
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
