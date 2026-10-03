"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// Cookie-consent banner — PIPEDA (Canada) + GDPR (EU) friendly.
//
// Node2 runs Google Analytics and Cloudflare Web Analytics, which set
// cookies / collect usage data. Under PIPEDA's consent principle and the
// GDPR, non-essential analytics should not run until the user agrees. This
// banner captures that choice and stores it; the analytics scripts in the
// root layout only load once consent === "accepted" (see AnalyticsGate).
//
// Design: non-blocking (doesn't trap the page), remembers the choice for a
// year, and is re-openable from the footer ("Cookie settings") by clearing
// the stored value. Accessible: labelled region, keyboard-reachable buttons.

export const CONSENT_KEY = "n2_cookie_consent" // "accepted" | "declined"
export const CONSENT_EVENT = "n2-consent-change"

export function getConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(CONSENT_KEY)
  return v === "accepted" || v === "declined" ? v : null
}

function setConsent(value: "accepted" | "declined") {
  window.localStorage.setItem(CONSENT_KEY, value)
  // Let the AnalyticsGate react without a reload.
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show only if no choice has been made yet.
    if (getConsent() === null) setVisible(true)
    // Allow the footer link to re-open the banner.
    const reopen = () => setVisible(true)
    window.addEventListener("n2-open-cookie-settings", reopen)
    return () => window.removeEventListener("n2-open-cookie-settings", reopen)
  }, [])

  if (!visible) return null

  const choose = (value: "accepted" | "declined") => {
    setConsent(value)
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border/60 bg-background/95 p-5 shadow-lg backdrop-blur sm:flex sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use essential cookies to run the site, and optional analytics
          (Google &amp; Cloudflare) to understand usage. Analytics load only if
          you accept. See our{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex shrink-0 items-center gap-3 sm:mt-0">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
