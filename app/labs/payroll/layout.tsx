import { Shell } from "@/components/labs/payroll/shell"
import { SessionProvider } from "@/lib/labs/payroll/auth/session"

export default function PayrollLabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  )
}
