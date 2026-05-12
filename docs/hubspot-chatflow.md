# Node2 — Starter HubSpot Chatflow Spec

Paste these into HubSpot when you build it: **Automations → Chatflows → Create chatflow → Website**.

The chat *runtime* is already installed on the site via the script in [components/chat-widget.tsx](../components/chat-widget.tsx). The logic in this doc lives entirely in HubSpot — no code changes needed.

## Configuration

| Setting | Value |
| --- | --- |
| **Type** | Bot (live chat fallback during hours) |
| **Display on** | All pages of `www.node2.io` |
| **Trigger** | After 5 seconds on page, OR on user click of the bubble |
| **Avatar name** | `Node2` |
| **Avatar image** | Use `logo-for-dark-bg.jpg` from [branding/logos/](../branding/logos/) |
| **Reply time displayed** | "Typically replies in a few hours" |
| **Business hours** | Mon–Fri, 9:00 AM – 6:00 PM ET (Toronto). Outside → away message. |
| **Languages** | English primary. Duplicate the flow for French, filter by browser language. |

## Bot script

### Step 1 — Welcome (visible to all visitors)

> 👋 Hi, I'm the Node2 assistant. We help Canadian businesses build AI-integrated platforms, custom local LLMs, and finance automation.
>
> What brings you here today?

**Quick reply buttons (max 4):**

1. `📋 Tell me about your services`
2. `🚀 I have a project idea`
3. `🏢 Tell me about BuildingSync.app`
4. `📞 Book a 20-min intro call`

---

### Step 2 — Branch A: "Tell me about your services"

> We focus on three things — all engineered in Canada:
>
> 🌐 **AI-Integrated Web Development** — modern web apps with AI built in
> 🤖 **Custom Local LLMs** — large language models that run on your infrastructure (zero cloud)
> 💼 **Finance & Payroll** — Workday / SAP / QuickBooks consulting, CRA + PIPEDA compliant
>
> Which one is most relevant to you?

**Buttons:** `Web + AI` · `Local LLMs` · `Finance` · `All three` · `← Back`

Each leads to a 2–3 sentence detail block, then offers: `Send a project brief` (→ `/contact`) or `Book intro call`.

---

### Step 3 — Branch B: "I have a project idea"

> Great — the fastest way is to drop a quick brief. We'll respond within 24 hours.
>
> Want to share it here, or open the full project form?

**Buttons:** `📝 Open full form` (→ `/contact`) · `💬 Share here`

If "Share here":

> Quick three questions — type the answer to each:
> 1. **What are you trying to build?** (one sentence)

Use HubSpot's *Ask a question* node → save to contact property `project_idea_summary`.

> 2. **Rough timeline?** (e.g. "next quarter", "this year", "exploring")

Save to `project_timeline`.

> 3. **Best email to follow up?**

Save to `email` — creates/updates contact.

**End:**

> Got it. We'll be in touch within 24 hours at {{contact.email}}. In the meantime, feel free to look around — node2.io

---

### Step 4 — Branch C: "BuildingSync.app"

> BuildingSync.app is our upcoming SaaS PropTech platform, currently in MVP stage.
>
> It's designed to give property managers a single source of truth across building operations — synced with their existing tools instead of replacing them.
>
> Want to be on the early-access list?

**Buttons:** `✅ Yes, add me` · `Tell me more` · `← Back`

If "Yes":

- Ask for email → save to `email` + set `building_sync_early_access = true`.
- Confirmation: *"Done. We'll email you when MVP access opens up."*

---

### Step 5 — Branch D: "Book a 20-min intro call"

> The fastest way to book is via our Meetings link. It'll show times that work for you.

Insert a **HubSpot Meetings link** (Sales → Meetings → create link → 20-min discovery, attendee = `nodeinc2@gmail.com`, set availability). Paste the link in this step.

---

### Step 6 — Always-available escape hatch

Every step should include a `🙋 Talk to a human` quick reply that:

- **During business hours** → transfers to the Conversations inbox + email-pings `nodeinc2@gmail.com`
- **Outside hours** → captures email + message, replies *"We're offline (Mon–Fri 9–6 ET). We'll reply first thing tomorrow."*

---

## Custom contact properties to create first

Before publishing the chatflow, create these in **Settings → Properties → Contact properties → Create property**:

| Property | Type | Label | Used by |
| --- | --- | --- | --- |
| `project_idea_summary` | Multi-line text | "Project Idea (Chat)" | Branch B step 1 |
| `project_timeline` | Single-line text | "Timeline" | Branch B step 2 |
| `building_sync_early_access` | Single checkbox | "BuildingSync Early Access" | Branch C |
| `service_interest` | Multi-checkbox (Web+AI, Local LLMs, Finance) | "Service Interest" | Branch A |

## Lifecycle stage automation

In **Marketing → Email → Workflows**:

- **Enrollment trigger:** Contact has filled the chatflow form OR `chat_conversation_started = true`
- **Action 1:** Set lifecycle stage → `Lead`
- **Action 2:** Internal notification email to `nodeinc2@gmail.com` with the conversation transcript link

## Away message (outside hours)

> Thanks for stopping by. We're offline right now (Mon–Fri 9–6 ET, Toronto).
>
> Drop your email and a one-line note, and we'll reply first thing the next business day.

Captures email + message → creates contact + ticket.

## French variant

Duplicate the chatflow, filter by `Browser language = French`, translate each step. Trigger priority: French variant first, English fallback.

---

## Estimated build time

30–45 min once the custom properties are created.
