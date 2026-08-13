# Video Script — Sloane & Pearl (≤3 minutes)

Per submission requirements: under 3 minutes, must show the project
functioning, uploaded publicly to YouTube/Vimeo/Youku, no unlicensed
third-party trademarks or music.

Per the Farza fireside-chat advice (2026-07-30 XPRIZE session): find the
one-line hook before scripting the rest, and it's fine to be faceless/footage-
driven rather than a talking-head explainer — a real screen-recorded demo of
the product working is stronger than narration alone.

**Why this video matters more than usual here.** Per `evidence/testing-
access.md`, judges are given only the public storefront link — no live
admin/dashboard access to the fashion-autopilot platform (it exposes other
stores' data). That means this video, not a live walkthrough judges can poke
at themselves, carries most of the burden of proving AI is actually live in
production. Every screen recording called for below must be a real capture of
the real admin tooling, with real dates and numbers visible on screen — not a
mockup, not a recreated UI, not a staged demo.

**Do not show or claim as live: the Gemini/Vertex AI customer-service
integration.** Per `narrative/ai-native-operations.md`, it is designed but
**not built** as of 2026-07-30. It may be mentioned once, verbally, as a named
next step (see 1:45–2:30), explicitly framed as not yet shipped. No footage of
it, no screen implying it already exists. Update this script once
`gemini-integration/write-up.md` moves from "planned" to "shipped" — until
then, the "AI in production" section below covers only catalog import and ad
creative, the two capabilities that are actually confirmed live.

**Do not name the CS contractor** anywhere in narration or on-screen text.
The name-disclosure decision is now made (`disclosure/labor-attestation.md`)
— her real name is used there, in the private compliance doc only. The
video is public once uploaded, so it deliberately stays anonymized, a
separate decision made on purpose, not an oversight. Refer to her only as
"a CS contractor" / "she" / "our customer-service hire."

**Never show a revenue figure without the loss beside it.** The business is
not profitable — net loss $9,399.58 on $18,641.28 of revenue, blended ROAS
0.94x (see `financials/pnl-methodology.md`, final regenerate 2026-08-13).
The revenue numbers and the loss numbers travel together, in the same
section, at 1:00–1:45. If a later edit cuts for time, the loss beat is
**not** the thing to cut: the P&L judges receive states the loss plainly,
and a revenue-only video would contradict our own submitted financials.

**The store is currently paused** (no new product testing, no new revenue,
as of early August) — say so plainly if the video references present-tense
activity anywhere; the figures shown are real historical activity during
the compliance window, not an ongoing trajectory.

## Structure (target: ~2:45 to leave margin)

Timings below sum to 2:45. VO word counts are sized to roughly 150 words/min
so a section's spoken line doesn't outrun its screen time — some sections
have visual-only beats (numbers/graphics on screen with no VO), which is
intentional headroom, not a gap to fill with more talking.

### 0:00–0:15 — Hook

**Shot:** Open cold on the live storefront, sloaneandpearl.com — real product
grid, then a real product page. No logo card or title screen first; the hook
has to land inside the first 15 seconds, not after a branded intro. The URL
should be visible in the browser bar at least once in this shot.

**Hook line candidates** (pick one against the actual footage — this is the
"stops the scroll" line per the Farza advice, not finalized on paper):

- A. *"Two months ago, this store didn't exist. Since then: $18,641.28 in
  real sales, 2,529 products, and an AI that pauses its own ad spend."*
- B. *"This is a real fashion brand. AI doesn't just write its product
  copy — it decides which ads to kill, which ones to keep funding, and
  writes its own ad strategy every night. And it already created a real
  job."*
- C. *"$18,641.28 in sales. 127 ad campaigns, dozens auto-killed by AI with
  no human approval. One new employee. This is what an AI-run business
  actually looks like."*

A and C lead with scale; B leads with the job-creation angle that matches this
submission's category (Entrepreneurship & Job Creation) most directly —
default to B if the category framing needs to be obvious from second one.

**On-screen caption (always show, regardless of VO):** "Sloane & Pearl —
sloaneandpearl.com. Launched 2026-06-09."

**Footage needed:** 5–8s storefront homepage scroll, 5–7s product page / add
to cart. Live capture, not a screenshot slideshow.

### 0:15–1:00 — AI in production (45s)

Two beats, chosen for the strongest evidence of *executing decisions*, not
just producing output — this directly targets the judging criterion's own
wording ("the extent to which AI is live in production and executes key
decisions"). Do **not** include a beat for customer service — see the
Gemini note above; that pipeline is human-run.

**Beat 1 — Autonomous ad-kill (~20s).** Screen-record the real
`/ads-launcher/auto-kill` history table (evidence:
`evidence/agent-logs/auto-kill-log.md`, `evidence/screenshots/auto-kill-history-ui.png`).

- On-screen caption: *"Every 5 minutes, AI evaluates every live ad campaign
  and pauses the underperformers — no human approval."*
- Show the real kill-history table: campaign names, real dollar spend, real
  timestamps, the rule that fired (e.g. "$45.23 spend ≥ threshold, 0
  purchases"). This is the mechanism behind 95 of 127 launched campaigns
  being auto-killed — make that connection explicit on screen.

**Beat 2 — Nightly AI ad-strategy loop (~25s).** Screen-record (or a clean
text card built from) the real Angle Loop brief
(`evidence/agent-logs/angle-loop-briefs.md`).

- On-screen caption: *"Every night, AI reads 30 days of real ad performance
  and rewrites the strategy — no human review before it goes live."*
- Show the actual, real, dated rationale text on screen verbatim, e.g.:
  *"Two proven winners — Farewell Sale and New Arrival — drive strong ROAS
  (1.84–1.86)... Avoid angles where €400+ produced zero sales."* This
  brief feeds directly into the next batch of live ad copy.
- Brief mention (VO or caption, not a full beat): the catalog-copy
  generation shown in the storefront/admin b-roll runs through **Gemini via
  Vertex AI** for this store specifically, shipped 2026-08-13 — real
  evidence in `gemini-integration/write-up.md`.

**VO (optional, ~75 words / ~30s, leaves ~15s of visual-only headroom):**
"This isn't AI assisting a human — it's AI executing decisions on its own.
Every five minutes, it evaluates every live ad campaign and pauses the ones
that aren't working — no approval needed. Every night, it reads a month of
real performance and rewrites its own ad strategy before the next batch of
copy goes live. And the product copy itself runs through Google's Gemini,
via Vertex AI."

**Footage needed:** real admin screen recordings only, timestamps/dates
visible on screen, no staged or mocked data.

### 1:00–1:45 — The business is real (45s)

- On-screen graphic: three-bar revenue chart, June $1,958.76, July
  $13,653.14, August $3,029.38 (partial month, before the store paused),
  cumulative $18,641.28 to date. Source: `financials/pnl-sloane-pearl.xlsx`,
  Independent Sales row (real Shopify order data for
  `pdmnf1-c0.myshopify.com` only, net of refunds — these are cash-basis
  figures, not gross order value).
- On-screen caption: *"204 revenue-bearing customer orders since launch."*
- **Then, immediately, the cost side — do not let the revenue bar stand
  alone.** On-screen caption or a second graphic: *"$19,875.51 ad spend.
  Net loss $9,399.58. Blended ROAS 0.94x. Not profitable yet."* This has to
  appear in the same breath as the revenue graphic, not be dropped or
  buried in the close. A revenue-only chart would misrepresent the
  business, and the P&L judges receive states the loss plainly — the video
  must not contradict it.
- Cut to a beat about the CS hire, without naming or showing her
  identifiably: a real customer-service contractor, engaged 2026-07-16
  specifically for this business, reviews and sends every reply to Sloane &
  Pearl's tickets herself. This is the clearest evidence of a job created
  beyond the founding team.

**VO (optional, ~90 words / ~36s):** "This isn't a demo — it's a real
business. Since launch: $18,641.28 in retained revenue across 204 real
customer orders. It's also not profitable yet — $19,875.51 went out on ads
to buy that growth, a net loss of $9,399.58 at a blended ROAS of 0.94.
Merchandise margin is healthy, over 67 percent; what has to improve is ad
efficiency. And the growth already created a real job: a customer-service
contractor, brought on July 16th, who reviews and sends every reply
herself."

**Footage needed:** revenue graphic (built from the real figures, or a
capture of the xlsx cell), the loss/ROAS graphic beside it, order-count
caption. No identifiable footage of the contractor — video stays
anonymized per the name-disclosure decision (real name is used only in the
private compliance doc).

### 1:45–2:30 — The story (45s)

Ties back to the Entrepreneurship & Job Creation category framing from
`disclosure/pre-existing-platform.md`.

- On-screen caption: *"Entrepreneurship & Job Creation: one AI-run catalog +
  ad engine, one new job already created, one more already planned."*
- B-roll: admin dashboard overview (non-sensitive view), or continue on the
  storefront.

**VO (optional, ~104 words / ~42s):** "Sloane & Pearl runs on an AI-agent
platform that existed before this business did — the rules allow that, as
long as what's built on top is genuinely new. And this is: its own store,
catalog, ad account, and customers, created from zero on June 3rd, 2026.
What's next is more human roles, not fewer — the next hire is a second
customer-service contractor, then someone for supplier sourcing and quality
control. Customer service today is fully human — she reviews and sends
every reply herself. AI executes the operational decisions: pausing spend,
writing strategy, pricing product; a person still owns every judgment call
and every word a customer reads."

**Footage needed:** none new required beyond b-roll already captured; this
section can run mostly on caption + VO over continued storefront/admin
footage.

### 2:30–2:45 — Close (15s)

- Restate whichever hook line was chosen at 0:00.
- On-screen: URL card — "sloaneandpearl.com".
- Reminder: no trademarked or unlicensed music under this or any other
  section of the video.

**VO (optional, ~22 words / ~9s):** "Two months ago, this store didn't
exist. Today it's a real business that runs on AI making real decisions.
See it live: sloaneandpearl.com."

## Still needed before recording

- Final hook line — pick one of the three candidates above (or a close
  variant) once real footage is in hand; the "stops the scroll" test only
  means something against actual footage, not on paper.
- Real screen recordings of: the live storefront (home + PDP + cart), the
  `/ads-launcher/auto-kill` history table, the Angle Loop brief (or a clean
  text card built from `evidence/agent-logs/angle-loop-briefs.md`), the
  admin product list/detail view showing AI-generated copy live in the CMS,
  and the revenue figures (graph or xlsx capture).
- Confirm no third-party trademarked content or unlicensed music appears in
  any B-roll.
- If any beat uses footage of the CS contractor's workspace or voice, get her
  explicit consent first and keep her un-named/un-identifiable — this stays
  true even though her real name is now used in the private compliance doc;
  that was a deliberately separate decision (see `disclosure/labor-attestation.md`).
- **This script is now grounded in the 2026-08-13 final regenerate** — the
  figures above should not need updating again unless something changes
  before Aug 17 (the store is currently paused, so this is expected to be
  the last regenerate). If anything does change, re-check against
  `financials/pnl-methodology.md` before recording.
