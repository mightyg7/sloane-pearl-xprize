# Video Script: Sloane & Pearl (≤3 minutes)

Per submission requirements: under 3 minutes, must show the project
functioning, uploaded publicly to YouTube/Vimeo/Youku, no unlicensed
third-party trademarks or music.

Per the Farza fireside-chat advice (2026-07-30 XPRIZE session): find the
one-line hook before scripting the rest, and it's fine to be faceless/footage-
driven rather than a talking-head explainer, a real screen-recorded demo of
the product working is stronger than narration alone.

**Why this video matters more than usual here.** Per `evidence/testing-
access.md`, judges are given only the public storefront link, no live
admin/dashboard access to the fashion-autopilot platform (it exposes other
stores' data). That means this video, not a live walkthrough judges can poke
at themselves, carries most of the burden of proving AI is actually live in
production. Every screen recording called for below must be a real capture of
the real admin tooling, with real dates and numbers visible on screen, not a
mockup, not a recreated UI, not a staged demo.

**Do not show or claim as live: a Gemini-based customer-service assistant.**
That was the originally planned surface for the Gemini/Google Cloud
requirement; per `gemini-integration/write-up.md`, it shipped instead on
catalog-copy generation (0:15–1:00, Beat 2's brief mention). Customer service
remains fully human, no footage implying otherwise, ever, regardless of
what ships elsewhere.

**Do not name the CS contractor** anywhere in narration or on-screen text.
The name-disclosure decision is now made (`disclosure/labor-attestation.md`),
her real name is used there, in the private compliance doc only. The
video is public once uploaded, so it deliberately stays anonymized, a
separate decision made on purpose, not an oversight. Refer to her only as
"a CS contractor" / "she" / "our customer-service hire."

**Never show a revenue figure without the loss beside it.** The business is
not profitable, net loss $9,330.06 on $18,641.28 of revenue, blended ROAS
0.94x (see `financials/pnl-methodology.md`, final regenerate 2026-08-14).
The revenue numbers and the loss numbers travel together, in the same
section, at 1:00–1:45. If a later edit cuts for time, the loss beat is
**not** the thing to cut: the P&L judges receive states the loss plainly,
and a revenue-only video would contradict our own submitted financials.

**The store is currently paused** (no new product testing, no new revenue,
as of early August), say so plainly if the video references present-tense
activity anywhere; the figures shown are real historical activity during
the compliance window, not an ongoing trajectory.

## Structure (target: ~2:55 to leave margin)

Timings below sum to ~2:55. VO word counts are sized to roughly 150
words/min so a section's spoken line doesn't outrun its screen time, some
sections have visual-only beats (numbers/graphics on screen with no VO),
which is intentional headroom, not a gap to fill with more talking.

This version has **two on-camera segments bookending an otherwise
footage-driven middle**: the founder speaks directly to camera at the
open and close (real face, real voice: "a real human knowing who is behind
this"), but the evidence-dense core (AI decisions, real numbers) stays
undiluted by narration-over-b-roll, per the Farza advice that the demo
itself should carry the proof, not a talking-head explaining it.

### 0:00–0:12: Founder, on camera (12s)

**Shot:** You, on camera, direct to lens. Not the storefront yet, this
opens the video, before any screen recording.

**Line (~26 words / ~11s):** "I'm [name], and two months ago, this store
didn't exist. Today it's a real business, and most of the decisions
running it aren't made by me."

Adjust the exact wording once you're recording against camera. The point
of this line is the pivot from "founder talking" to "so who's making the
decisions," which the hard cut below answers.

**On-screen caption (small, lower third, not covering your face):**
"Founder, Sloane & Pearl"

### 0:12–0:27: Hook (15s)

**Shot:** Hard cut from your face straight into the live storefront,
sloaneandpearl.com, real product grid, then a real product page. The URL
should be visible in the browser bar at least once in this shot.

**On-screen caption (always show, regardless of VO):** "sloaneandpearl.com,
launched 2026-06-09."

**Footage needed:** 5–8s storefront homepage scroll, 5–7s product page /
add to cart. Live capture, not a screenshot slideshow.

### 0:27–1:10: AI in production (43s)

Two beats, chosen for the strongest evidence of *executing decisions*, not
just producing output, this directly targets the judging criterion's own
wording ("the extent to which AI is live in production and executes key
decisions"). Do **not** include a beat for customer service, see the
Gemini note above; that pipeline is human-run.

**Beat 1: Autonomous ad-kill (~20s).** Screen-record the real
`/ads-launcher/auto-kill` history table (evidence:
`evidence/agent-logs/auto-kill-log.md`, `evidence/screenshots/auto-kill-history-ui.png`).

- On-screen caption: *"Every 5 minutes, AI evaluates every live ad campaign
  and pauses the underperformers. No human approval."*
- Show the real kill-history table: campaign names, real dollar spend, real
  timestamps, the rule that fired (e.g. "$45.23 spend ≥ threshold, 0
  purchases"). This is the mechanism behind 95 of 127 launched campaigns
  being auto-killed, make that connection explicit on screen.

**Beat 2: Nightly AI ad-strategy loop (~25s).** Screen-record (or a clean
text card built from) the real Angle Loop brief
(`evidence/agent-logs/angle-loop-briefs.md`).

- On-screen caption: *"Every night, AI reads 30 days of real ad performance
  and rewrites the strategy. No human review before it goes live."*
- Show the actual, real, dated rationale text on screen verbatim, e.g.:
  *"Two proven winners — Farewell Sale and New Arrival — drive strong ROAS
  (1.84–1.86)... Avoid angles where €400+ produced zero sales."* This
  brief feeds directly into the next batch of live ad copy.
- Brief mention (VO or caption, not a full beat): the catalog-copy
  generation shown in the storefront/admin b-roll runs through **Gemini via
  Vertex AI** for this store specifically, shipped 2026-08-13, real
  evidence in `gemini-integration/write-up.md`.

**VO (optional, ~75 words / ~30s, leaves ~15s of visual-only headroom):**
"This isn't AI assisting a human. It's AI executing decisions on its own.
Every five minutes, it evaluates every live ad campaign and pauses the ones
that aren't working. No approval needed. Every night, it reads a month of
real performance and rewrites its own ad strategy before the next batch of
copy goes live. And the product copy itself runs through Google's Gemini,
via Vertex AI."

**Footage needed:** real admin screen recordings only, timestamps/dates
visible on screen, no staged or mocked data.

### 1:10–1:50: The business is real (40s)

- On-screen graphic: three-bar revenue chart, June $1,958.76, July
  $13,377.32, August $3,305.20 (partial month, before the store paused),
  cumulative $18,641.28 to date. Source: `financials/pnl-sloane-pearl.xlsx`,
  Independent Sales row (real Shopify order data for
  `pdmnf1-c0.myshopify.com` only, net of refunds, these are cash-basis
  figures, not gross order value).
- On-screen caption: *"204 revenue-bearing customer orders since launch."*
- **Then, immediately, the cost side. Do not let the revenue bar stand
  alone.** On-screen caption or a second graphic: *"$19,932.95 ad spend.
  Net loss $9,330.06. Blended ROAS 0.94x. Not profitable yet."* This has to
  appear in the same breath as the revenue graphic, not be dropped or
  buried in the close. A revenue-only chart would misrepresent the
  business, and the P&L judges receive states the loss plainly, the video
  must not contradict it.
- Cut to a beat about the CS hire, without naming or showing her
  identifiably: a real customer-service contractor, engaged 2026-07-16
  specifically for this business, reviews and sends every reply to Sloane &
  Pearl's tickets herself. This is the clearest evidence of a job created
  beyond the founding team.

**VO (optional, ~90 words / ~36s):** "This isn't a demo. It's a real
business. Since launch: $18,641.28 in retained revenue across 204 real
customer orders. It's also not profitable yet. $19,932.95 went out on ads
to buy that growth, a net loss of $9,330.06 at a blended ROAS of 0.94.
Merchandise margin is healthy, over 67 percent; what has to improve is ad
efficiency. And the growth already created a real job: a customer-service
contractor, brought on July 16th, who reviews and sends every reply
herself."

**Footage needed:** revenue graphic (built from the real figures, or a
capture of the xlsx cell), the loss/ROAS graphic beside it, order-count
caption. No identifiable footage of the contractor, video stays
anonymized per the name-disclosure decision (real name is used only in the
private compliance doc).

### 1:50–2:25: The story (35s)

Ties back to the Entrepreneurship & Job Creation category framing from
`disclosure/pre-existing-platform.md`.

- On-screen caption: *"Entrepreneurship & Job Creation: one AI-run catalog +
  ad engine, one new job already created, one more already planned."*
- B-roll: admin dashboard overview (non-sensitive view), or continue on the
  storefront.

**VO (optional, ~87 words / ~35s):** "Sloane & Pearl runs on an AI-agent
platform that existed before this business did. The rules allow that, as
long as what's built on top is genuinely new. This is: its own store,
catalog, ad account, and customers, created from zero on June 3rd. What's
next is more human roles, not fewer. The next hire is a second
customer-service contractor, then someone for supplier sourcing and quality
control. Today, customer service is fully human, she reviews and sends
every reply herself. AI executes the operational decisions; a person still
owns every judgment call a customer sees."

**Footage needed:** none new required beyond b-roll already captured; this
section can run mostly on caption + VO over continued storefront/admin
footage.

### 2:25–2:40: Real customer, real words (15s)

**Shot:** Text card / clean graphic (not a raw screenshot, to keep her
unredacted email out of frame even though it's already cropped) built from
the real testimonial: her exact words, over a subtle product-photo
background of the sandal she ordered. Per `evidence/customer-evidence.md`,
this is a genuine, unprompted, verified, consented testimonial, real order
#1152, consent obtained 2026-08-14, attributed as "Y. Young" only, not her
full name.

**On-screen text (verbatim, matches the screenshot exactly, including the
period after "!!"):** *"Wow..i didnt think I would hear from you. THANK
YOU!!. I love the sandal."* (Y. Young, verified customer)

No VO needed here, let it sit on screen for the full 15s. This is the
"proof a real stranger is really happy," placed right before the founder
returns, so the close lands on people, not just numbers.

### 2:40–2:55: Founder, on camera (15s)

**Shot:** Back to you, on camera, direct to lens, same setup as the open,
so it reads as a clean bookend.

**Line (~28 words / ~12s):** "I built this to prove AI can run a real
business, not just assist one. It's not perfect yet, and it's not
profitable yet, but it's real, and you can go see it for yourself."

**On-screen close card (last 2–3s, after you finish speaking):**
"sloaneandpearl.com"

- Reminder: no trademarked or unlicensed music under this or any other
  section of the video.

## Recording checklist (this is the final shooting script)

**Two on-camera segments (record these first, everything else cuts around them):**
- 0:00–0:12 open line and 2:40–2:55 close line. Plain background, good
  light on your face, phone/webcam is fine at 1080p+. Do a few takes of
  each, the open needs to land in one breath, the close needs to sound
  genuine, not read.
- Fill in `[name]` in the open line before recording, or drop the name
  entirely if you'd rather ("I'm the founder of Sloane & Pearl" also works).

**Screen recordings needed (real capture, not staged):**
- Storefront home + a product page + add-to-cart (0:12–0:27)
- `/ads-launcher/auto-kill` history table, real rows visible
  (0:27–~0:50), evidence already at `evidence/screenshots/auto-kill-history-ui.png`
  if you want to frame the live capture the same way
- Angle Loop brief text, either screen-record the real admin view or build
  a clean text card from `evidence/agent-logs/angle-loop-briefs.md`
  (~0:50–1:10)
- Revenue graphic and loss/ROAS graphic (1:10–1:50), build these as clean
  graphics from the real numbers rather than a raw spreadsheet screenshot,
  they'll read better on camera
- Testimonial text card (2:25–2:40), build from the verbatim quote above,
  do not screenshot `testimonial-message-thread.png` directly (keeps her
  redacted email fully out of frame, not just cropped in a screenshot)

**Before you hit export:**
- Confirm no third-party trademarked content or unlicensed music appears
  anywhere, including under the on-camera segments.
- No footage of the CS contractor's workspace, face, or voice, she's
  referred to only as "a CS contractor" / "she," never named, even though
  her real name is used in the private compliance doc
  (`disclosure/labor-attestation.md`), that's a deliberately separate
  decision.
- Total runtime under 3:00, this script targets ~2:55, leaving ~5s of
  margin; if a take runs long, trim from the "story" section (1:50–2:25)
  first, not the loss/ROAS beat or the testimonial.
- Figures are grounded in the 2026-08-14 final regenerate and the store is
  currently paused, so nothing here should need updating, if anything
  material changes before you record, re-check against
  `financials/pnl-methodology.md` first.
- Upload publicly to YouTube/Vimeo/Youku once exported, start this early,
  processing/availability can lag.
