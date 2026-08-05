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

**Do not name the CS contractor** anywhere in narration or on-screen text —
the name-disclosure decision in `disclosure/labor-attestation.md` is still
pending. Refer to her only as "a CS contractor" / "she" / "our
customer-service hire."

**Never show a revenue figure without the loss beside it.** The business is
not profitable — net loss $6,222.44 on $13,979.18 of revenue, blended ROAS
0.89x (see `financials/pnl-methodology.md`). The revenue numbers and the
loss numbers travel together, in the same section, at 1:00–1:45. If a later
edit cuts for time, the loss beat is **not** the thing to cut: the P&L
judges receive states the loss plainly, and a revenue-only video would
contradict our own submitted financials.

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

- A. *"Seven weeks ago, this store didn't exist. Today: $13,979.18 in real
  sales, 2,529 products, and one AI-run catalog."*
- B. *"This is a real fashion brand. Nobody wrote its product copy or built
  its ad creative by hand. AI did — and it already created a real job."*
- C. *"$13,979.18 in sales. 127 ad campaigns. One new employee. Seven weeks.
  This is what an AI-run business actually looks like."*

A and C lead with scale; B leads with the job-creation angle that matches this
submission's category (Entrepreneurship & Job Creation) most directly —
default to B if the category framing needs to be obvious from second one.

**On-screen caption (always show, regardless of VO):** "Sloane & Pearl —
sloaneandpearl.com. Launched 2026-06-09."

**Footage needed:** 5–8s storefront homepage scroll, 5–7s product page / add
to cart. Live capture, not a screenshot slideshow.

### 0:15–1:00 — AI in production (45s)

Two beats. Do **not** include a third beat for customer service — see the
Gemini note above.

**Beat 1 — Catalog import & enhancement (~20s).** Screen-record the real
admin product tooling.

- On-screen caption: *"2,529 products imported. 1,582 live today. AI writes
  every listing."*
- Show, live in the CMS (not a text card pasted over b-roll): the AI-written
  copy on at least one real listing. Two confirmed real examples to use —
  *"Mamie | Orthopedic Slip-On Leather Sneakers"* (opens "Meet the Mamie
  sneaker — where orthopedic support meets effortless everyday style,
  designed for women who refuse to compromise on comfort…") and *"Celeste |
  Tie-Dye Mesh Long Sleeve Dress"* (opens "The Celeste dress is a wearable
  work of art…"). Neither is the supplier's original listing text.

**Beat 2 — Ad-creative generation & launch (~25s).** Screen-record the real
ad-campaign list/dashboard.

- On-screen caption: *"127 Meta ad campaigns launched since day one (2026-
  06-09 → 2026-07-30). 32 active, 95 auto-killed by AI performance rules —
  every one running Dynamic Creative."*
- Show the campaign table with launch dates visible, spanning the full
  range, plus the active/killed split. If available, cut in 3–5s of an
  actual generated ad (image or video) playing, as proof of the ad-creative
  pipeline's output — not a mockup ad.

**VO (optional, ~70 words / ~28s, leaves ~17s of visual-only headroom):**
"AI wrote and priced this store's entire catalog — 2,529 products imported,
1,582 live today, each one shipped with real marketing copy nobody typed by
hand. AI also builds every ad. 127 campaigns have launched since the store
went live, all running Meta's Dynamic Creative — the platform's own rules
have already auto-killed 95 that underperformed, and 32 are still active
today."

**Footage needed:** real admin screen recordings only, timestamps/dates
visible on screen, no staged or mocked data.

### 1:00–1:45 — The business is real (45s)

- On-screen graphic: two-bar revenue chart, June $1,958.76 vs. July
  $12,020.42 (a 6.1x jump), cumulative $13,979.18 to date. Source:
  `financials/pnl-sloane-pearl.xlsx`, Independent Sales row (real Shopify
  order data for `pdmnf1-c0.myshopify.com` only, net of refunds — these are
  cash-basis figures, not gross order value).
- On-screen caption: *"154 revenue-bearing customer orders since launch —
  28 in June, 126 in July."*
- **Then, immediately, the cost side — do not let the revenue bar stand
  alone.** On-screen caption or a second graphic: *"$15,721.49 ad spend.
  Net loss $6,222.44. Blended ROAS 0.89x. Not profitable yet."* This has to
  appear in the same breath as the revenue graphic, not be dropped or
  buried in the close. A revenue-only chart would misrepresent the
  business, and the P&L judges receive states the loss plainly — the video
  must not contradict it.
- Cut to a beat about the CS hire, without naming or showing her
  identifiably: a real customer-service contractor, engaged 2026-07-16
  specifically for this business, reviews and sends every reply to Sloane &
  Pearl's tickets herself. This is the clearest evidence of a job created
  beyond the founding team.

**VO (optional, ~86 words / ~34s):** "This isn't a demo — it's a real
business. June's first partial month brought in $1,958.76. July: $12,020.42,
six times as much, across 154 real customer orders. It's also not profitable
yet — $15,721.49 went out on ads to buy that growth, a net loss of $6,222.44
at a blended ROAS of 0.89. Product margin is healthy, near 65 percent; what
has to improve is ad efficiency. And the growth already created a real job: a
customer-service contractor, brought on July 16th, who reviews and sends
every reply herself."

**Footage needed:** revenue graphic (built from the two real figures, or a
capture of the xlsx cell), the loss/ROAS graphic beside it, order-count
caption. No identifiable footage of the contractor unless she has explicitly
consented — a generic/anonymized clip or a stat card is the safe default
given the pending name-disclosure decision.

### 1:45–2:30 — The story (45s)

Ties back to the Entrepreneurship & Job Creation category framing from
`disclosure/pre-existing-platform.md`.

- On-screen caption: *"Entrepreneurship & Job Creation: one AI-run catalog +
  ad engine, one new job already created, one more already planned."*
- B-roll: admin dashboard overview (non-sensitive view), or continue on the
  storefront.

**VO (optional, 108 words / ~43s):** "Sloane & Pearl runs on an AI-agent
platform that existed before this business did — the rules allow that, as
long as what's built on top is genuinely new. And this is: its own store,
catalog, ad account, and customers, created from zero on June 3rd, 2026.
What's next is more human roles, not fewer — the next hire is a second
customer-service contractor, then someone for supplier sourcing and quality
control. A Gemini-based assistant to draft and triage replies is designed,
but not built yet — we're not claiming otherwise. AI runs the catalog and the
ads; a person still owns every judgment call and every word a customer
reads."

**Footage needed:** none new required beyond b-roll already captured; this
section can run mostly on caption + VO over continued storefront/admin
footage.

### 2:30–2:45 — Close (15s)

- Restate whichever hook line was chosen at 0:00.
- On-screen: URL card — "sloaneandpearl.com".
- Reminder: no trademarked or unlicensed music under this or any other
  section of the video.

**VO (optional, ~24 words / ~10s):** "Seven weeks ago, this store didn't
exist. Today it's a real business — growing, hiring, and running on AI. See
it live: sloaneandpearl.com."

## Still needed before recording

- Final hook line — pick one of the three candidates above (or a close
  variant) once real footage is in hand; the "stops the scroll" test only
  means something against actual footage, not on paper.
- Real screen recordings of: the live storefront (home + PDP + cart), the
  admin product list/detail view showing AI-generated copy live in the CMS,
  the ad-campaign table/dashboard showing real launch dates and the
  active/killed split, and the revenue figures (graph or xlsx capture).
- Confirm no third-party trademarked content or unlicensed music appears in
  any B-roll.
- If any beat uses footage of the CS contractor's workspace or voice, get her
  explicit consent first and keep her un-named/un-identifiable, consistent
  with the pending decision in `disclosure/labor-attestation.md`.
- Re-check the revenue/order/campaign numbers **and the loss/ROAS figures**
  against the latest narrative docs at actual recording time — this script
  is grounded in the 2026-07-30 snapshot (`narrative/ai-native-operations.md`,
  `narrative/business-narrative.md`, `financials/pnl-methodology.md`); if
  recording happens later, pull fresh figures rather than reusing these
  verbatim. Ad spend accrues live and supplier invoices keep landing, so the
  loss moves more than the revenue does.
- If `gemini-integration/write-up.md` ships before recording, revisit the
  "AI in production" section (0:15–1:00) to decide whether it earns a third
  beat there instead of only the verbal mention at 1:45–2:30.
