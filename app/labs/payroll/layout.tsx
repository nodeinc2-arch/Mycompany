import { Shell } from "@/components/labs/payroll/shell"
import { SessionProvider } from "@/lib/labs/payroll/auth/session"
import { PayrollComingSoon } from "@/components/labs/payroll/coming-soon"

// Pay.ca is not live yet. Until it is, every /labs/payroll/* UI route shows a
// single branded "Coming soon" screen instead of the real (still in-tree)
// app. This is a one-flag gate: set NEXT_PUBLIC_PAYROLL_LIVE=1 to un-gate.
// Only the UI is gated — API routes under /api/labs/payroll/* are untouched,
// so Stripe / billing can be wired and tested while the UI stays private.
const PAYROLL_LIVE = process.env.NEXT_PUBLIC_PAYROLL_LIVE === "1"

export default function PayrollLabsLayout({ children }: { children: React.ReactNode }) {
  if (!PAYROLL_LIVE) {
    return <PayrollComingSoon />
  }
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  )
}
