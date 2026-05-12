# Letterhead

Editable letterhead template for business correspondence (engagement letters, partner intros, vendor agreements).

## Files

- [`letterhead.html`](./letterhead.html) — A4/Letter-friendly HTML template. Open in any browser → File → Print → "Save as PDF" to generate a sendable PDF. Set page margins to default; the stylesheet handles the rest.

## Workflow

1. Duplicate `letterhead.html` and rename (`letter-2026-05-12-acme-corp.html`).
2. Edit the placeholder fields: `[Date]`, `[Recipient]`, `[Subject]`, body paragraphs, signatory name/title.
3. (Optional) Swap the inline `Node2` wordmark for the actual logo by replacing the `<span class="wordmark">` block with `<img src="../logos/logo-for-light-bg.jpg" alt="Node2" />` and adjusting size.
4. Print → Save as PDF → file under a `sent/` subfolder (gitignored if confidential).

## Also worth adding here

- `engagement-letter-template.html` — long-form template for client engagements (scope, fees, timeline, IP, confidentiality clauses).
- `NDA-template.md` — mutual NDA in plain text, easy to fill.
- `invoice-template.html` — for billing.

These weren't created yet — add when needed.
