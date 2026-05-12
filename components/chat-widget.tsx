"use client"

import Script from "next/script"

export function ChatWidget() {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
  if (!portalId) return null

  return (
    <Script
      id="hs-script-loader"
      strategy="afterInteractive"
      src={`//js-na3.hs-scripts.com/${portalId}.js`}
    />
  )
}
