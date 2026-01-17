export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Node2 Logo"
    >
      {/* Node network icon */}
      <circle cx="8" cy="16" r="3" fill="currentColor" />
      <circle cx="20" cy="8" r="2.5" fill="currentColor" />
      <circle cx="20" cy="24" r="2.5" fill="currentColor" />
      <line x1="10.5" y1="14.5" x2="17.5" y2="9.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10.5" y1="17.5" x2="17.5" y2="22.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="10.5" x2="20" y2="21.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Text: Node2 */}
      <text
        x="32"
        y="22"
        fill="currentColor"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        Node2
      </text>
    </svg>
  )
}
