"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  PlayCircle,
  Sparkles,
  Server,
  Plug,
  Tag,
  Settings,
  ArrowRightLeft,
  Play,
  Banknote,
  Landmark,
  UserPlus,
  UserMinus,
  FileText,
  Globe,
  Building2,
  UserCircle,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react"

const nav = [
  { href: "/labs/payroll", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/labs/payroll" },
  { href: "/labs/payroll/get-started", label: "Get started", icon: Building2, match: (p: string) => p.startsWith("/labs/payroll/get-started") },
  { href: "/labs/payroll/migrate", label: "Migrate from…", icon: ArrowRightLeft, match: (p: string) => p.startsWith("/labs/payroll/migrate") },
  { href: "/labs/payroll/employees", label: "Employees", icon: Users, match: (p: string) => p.startsWith("/labs/payroll/employees") },
  { href: "/labs/payroll/onboarding", label: "Onboarding", icon: UserPlus, match: (p: string) => p.startsWith("/labs/payroll/onboarding") },
  { href: "/labs/payroll/runs/new", label: "Run payroll", icon: Play, match: (p: string) => p === "/labs/payroll/runs/new" },
  { href: "/labs/payroll/runs/RUN-2026-10", label: "Pay runs", icon: PlayCircle, match: (p: string) => p.startsWith("/labs/payroll/runs") && p !== "/labs/payroll/runs/new" },
  { href: "/labs/payroll/banking", label: "Connect bank", icon: Landmark, match: (p: string) => p.startsWith("/labs/payroll/banking") },
  { href: "/labs/payroll/payments", label: "Pay employees", icon: Banknote, match: (p: string) => p.startsWith("/labs/payroll/payments") },
  { href: "/labs/payroll/calendar", label: "Calendar", icon: CalendarDays, match: (p: string) => p.startsWith("/labs/payroll/calendar") },
  { href: "/labs/payroll/reports", label: "Reports", icon: FileSpreadsheet, match: (p: string) => p.startsWith("/labs/payroll/reports") },
  { href: "/labs/payroll/portal", label: "Employee portal", icon: UserCircle, match: (p: string) => p.startsWith("/labs/payroll/portal") },
  { href: "/labs/payroll/termination", label: "Termination", icon: UserMinus, match: (p: string) => p.startsWith("/labs/payroll/termination") },
  { href: "/labs/payroll/year-end", label: "Year-end", icon: FileText, match: (p: string) => p.startsWith("/labs/payroll/year-end") },
  { href: "/labs/payroll/tax-rules", label: "Tax rules", icon: Globe, match: (p: string) => p.startsWith("/labs/payroll/tax-rules") },
  { href: "/labs/payroll/assistant", label: "AI assistant", icon: Sparkles, match: (p: string) => p.startsWith("/labs/payroll/assistant") },
  { href: "/labs/payroll/mcp", label: "MCP playground", icon: Server, match: (p: string) => p.startsWith("/labs/payroll/mcp") },
  { href: "/labs/payroll#integrations", label: "Integrations", icon: Plug, match: () => false },
  { href: "/labs/payroll/pricing", label: "Pricing", icon: Tag, match: (p: string) => p.startsWith("/labs/payroll/pricing") },
  { href: "/labs/payroll/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/labs/payroll/settings") },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-[calc(100vh-2.5rem)]">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border/50 bg-card/40 px-4 py-6">
        <Link href="/labs/payroll" className="px-2 mb-8 inline-flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-semibold">
            P
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-foreground">Pay.ca</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Node2 Labs</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-accent/10 text-foreground border border-accent/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 text-[10px] text-muted-foreground leading-relaxed px-2">
          Scaffold build. No real credentials, no live CRA filings, no real money moved.
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
