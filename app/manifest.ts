import type { MetadataRoute } from "next"

// Web app manifest — a standard legitimacy / PWA signal (search engines and
// "add to home screen" expect it). Kept minimal and truthful.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Node2",
    short_name: "Node2",
    description:
      "Canadian software: AI-integrated web platforms, private local AI, and payroll & finance tooling.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
    lang: "en-CA",
  }
}
