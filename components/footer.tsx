import Link from "next/link"
import { Logo } from "@/components/logo"
import { Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="text-foreground inline-block mb-6">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              Empowering Canadian enterprises to scale by bridging the gap between high-performance digital presence and
              automated operations.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/company/node2-io/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/node2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#services"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="#micro-ai"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  Micro AI Agents
                </Link>
              </li>
              <li>
                <Link
                  href="#finance"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  Finance & Payroll
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#about"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Node2. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built for Canadian Businesses</p>
        </div>
      </div>
    </footer>
  )
}
