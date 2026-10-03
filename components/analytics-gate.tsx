"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { getConsent, CONSENT_EVENT } from "@/components/cookie-consent"

// Loads analytics (Google Analytics + Cloudflare Web Analytics) ONLY after
// the user has accepted cookies — the enforcement side of the consent banner.
//
// Before consent, nothing analytics-related is injected, so no analytics
// cookies are set and no beacon fires. The moment the user clicks Accept, the
// banner dispatches CONSENT_EVENT and this component mounts the scripts
// without a reload. Declining keeps them off.
//
// Tokens are passed in as props from the server layout (they're public).

export function AnalyticsGate({
  gaId,
  cfToken,
}: {
  gaId: string
  cfToken?: string
}) {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    setAccepted(getConsent() === "accepted")
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setAccepted(detail === "accepted")
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!accepted) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
      {cfToken ? (
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={`{"token": "${cfToken}"}`}
        />
      ) : null}
    </>
  )
}
