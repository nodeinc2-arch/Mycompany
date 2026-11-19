"use client"

import { useEffect } from "react"

/**
 * Registers the service worker (public/sw.js) so the app is an installable PWA
 * with an offline shell. Registration only runs in the browser, in production,
 * and when the API is supported — it's a no-op otherwise, so it never interferes
 * with dev or unsupported browsers.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal — the app still works online */
      })
    }

    // Register after load so it never competes with first paint.
    if (document.readyState === "complete") register()
    else window.addEventListener("load", register, { once: true })
  }, [])

  return null
}
