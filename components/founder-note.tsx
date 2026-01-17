export function FounderNote() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-medium text-accent uppercase tracking-widest mb-8">From the Founder</p>

        <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-12 text-balance">
          {'"I founded Node2 with a single vision: '}
          <em className="font-serif italic font-normal text-muted-foreground">Integrated Intelligence.</em>
          {
            ' Too many businesses struggle with fragmented tools. We bring it all together into one cohesive ecosystem."'
          }
        </blockquote>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <span className="text-xl font-semibold text-foreground">SS</span>
          </div>
          <p className="font-medium text-foreground">Shweta Sharma</p>
          <p className="text-sm text-muted-foreground">Founder & CEO</p>
        </div>
      </div>
    </section>
  )
}
