import { CheckCircle2 } from "lucide-react"

const features = [
  "CRA-compliant payroll processing",
  "PIPEDA-compliant data handling",
  "Automated tax calculations",
  "Real-time financial reporting",
  "Seamless integration with your systems",
  "Dedicated Canadian support team",
]

export function FinanceSection() {
  return (
    <section
      id="finance"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-accent text-accent-foreground border-t border-accent/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-sm font-medium text-accent-foreground/70 uppercase tracking-widest mb-4">
              Finance & Payroll
            </p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-8 leading-tight">
              Security. Accuracy. <br />
              <em className="font-serif italic font-normal">Canadian compliance.</em>
            </h2>
            <p className="text-lg text-accent-foreground/80 leading-relaxed mb-6">
              Your finances deserve the same level of intelligence as the rest of your business. Our financial services
              are built from the ground up for Canadian businesses.
            </p>
            <p className="text-accent-foreground/70 leading-relaxed">
              From automated bookkeeping to comprehensive payroll management, we handle the numbers so you can handle
              the growth.
            </p>
          </div>

          <div className="bg-accent-foreground/10 rounded-2xl p-8 backdrop-blur">
            <div className="grid gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-4 group">
                  <CheckCircle2 className="h-5 w-5 text-accent-foreground flex-shrink-0" />
                  <span className="text-accent-foreground/90 group-hover:text-accent-foreground transition-colors duration-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
