"use client"

/**
 * ProtectedEmail — renders a clickable "email us" affordance without ever
 * placing the address as a contiguous string in the DOM/markup, so harvesting
 * bots can't scrape it. The address is assembled from parts only at click time.
 *
 * Visually it shows an obfuscated label by default (e.g. "node…inc2 [at] gmail
 * [dot] com" is NOT used — instead we show a friendly label) and opens the
 * mail client on click.
 */
export function ProtectedEmail({
  label = "Email us",
  className = "",
  subject,
}: {
  label?: string
  className?: string
  subject?: string
}) {
  function handleClick() {
    const user = ["node", "inc2"].join("")
    const domain = ["gmail", "com"].join(".")
    const q = subject ? `?subject=${encodeURIComponent(subject)}` : ""
    window.location.href = `mailto:${user}@${domain}${q}`
  }

  return (
    <button type="button" onClick={handleClick} className={className} aria-label={label}>
      {label}
    </button>
  )
}
