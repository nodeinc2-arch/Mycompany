# node2.io — global reachability & delisting playbook

**Problem:** node2.io serves `200 OK` globally from Cloudflare, but some ISPs
(e.g. Airtel in India) and corporate/school filters block it. The server is
fine — this is **domain reputation + the `.io` TLD**, filtered at the
ISP/DNS layer, not an infra issue.

**Decision on record:** stay on `.io` for now and pursue delisting +
legitimacy signals. (The highest-leverage fix remains registering
`node2.ca` and redirecting `.io` → `.ca`; revisit if delisting stalls.)

---

## What's already done in-repo (legitimacy signals filters read)

- Privacy Policy (`/privacy`), **Terms of Service (`/terms`)**, **Accessibility
  statement (`/accessibility`)** — a complete legal surface.
- **Cookie-consent banner** gating GA + Cloudflare analytics (PIPEDA/GDPR).
- **`/.well-known/security.txt`** with a security contact.
- Full company identity in the footer (1001477193 Ontario Inc., Ontario, Canada).
- robots.ts + sitemap.ts, rich JSON-LD (Organization/WebSite/FAQ).

These all help: reputation feeds score "has privacy/terms/contact/security.txt"
as legitimate-business signals.

---

## Status log

- **2026-10-03 — Netcraft correction submitted** (`report.netcraft.com`,
  "incorrectly blocked site"). Awaiting reassessment; this feed drives many
  corporate/ISP filters, so a fix should propagate. _Follow up if still
  blocked in ~1–2 weeks._

## Steps for YOU to execute (off-code)

### 1. Google Search Console — verify ownership (highest priority)
1. Go to <https://search.google.com/search-console>, add property `node2.io`.
2. Verify via DNS TXT (Cloudflare dashboard → DNS → add the TXT record Google
   gives you) or the HTML-tag method.
3. Once verified: check **Security & Manual Actions → Security Issues**. If
   Google flags anything, this is where you'll see it and can request review.

### 2. Google Safe Browsing status check
- Visit <https://transparencyreport.google.com/safe-browsing/search?url=node2.io>.
- If it says "no unsafe content found," you're clean on Google's feed (good —
  many ISPs trust it). If flagged, request a review from Search Console (step 1).

### 3. Netcraft — report a mis-categorization
- <https://report.netcraft.com/> → "Report incorrectly blocked site."
- Netcraft feeds many corporate/ISP filters; a correction propagates widely.

### 4. Web of Trust (WoT) / other reputation feeds
- Claim/verify the domain at <https://www.mywot.com/> and request reassessment
  if the rating is low or "unknown."

### 5. Airtel (and any specific ISP) reclassification
- Airtel business support / 121 → report that `node2.io` is a legitimate
  Canadian business site mis-classified as unsafe; request reclassification.
- Use the draft below.

---

## Draft text — ISP reclassification request

> Subject: Legitimate business site incorrectly blocked — node2.io
>
> Hello,
>
> Your network is currently blocking or flagging **https://node2.io** as
> unsafe. This is a mis-classification. node2.io is the official website of
> Node2, a trade name of 1001477193 Ontario Inc., a software company
> incorporated in Ontario, Canada.
>
> The site is a standard business website (company information, services,
> contact form). It is served over HTTPS via Cloudflare, has a published
> Privacy Policy, Terms of Service, and a security contact at
> https://node2.io/.well-known/security.txt. It is not listed as unsafe by
> Google Safe Browsing.
>
> Please reclassify node2.io as a safe, legitimate business site and remove
> any block. I'm happy to provide incorporation details on request.
>
> Thank you,
> [Name] · Node2 (1001477193 Ontario Inc.)

---

## Draft text — Netcraft / reputation-feed correction

> Site: https://node2.io
> Category requested: Business / Technology (software company)
> Reason: node2.io is the legitimate website of Node2 (1001477193 Ontario
> Inc.), a software company in Ontario, Canada. It is HTTPS (Cloudflare),
> publishes Privacy/Terms/security.txt, and is not flagged by Google Safe
> Browsing. It appears to have been auto-classified incorrectly, likely due
> to the .io TLD and low domain age. Please reassess as a safe business site.

---

## If delisting stalls: the real fix

Register **node2.ca** (fits the Canadian-company story and compliance),
point it at the same Cloudflare zone, and 301-redirect node2.io → node2.ca.
A `.ca`/`.com` with this same content clears nearly all TLD-reputation
filtering. Keep `.io` as a redirect so existing links still work.
