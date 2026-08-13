# Sloane & Pearl — Business Narrative

Sloane & Pearl (sloaneandpearl.com) is a women's fashion storefront that
opened for orders on 2026-06-09 and, across the roughly two months since,
generated $18,641.28 in cumulative independent sales across 204
revenue-bearing customer orders — before the operator paused active
operation of the store in early August. It runs on fashion-autopilot, an
AI-agent e-commerce platform that was already operating before the
submission period began; what's new is the business itself — a distinct
Shopify store (created 2026-06-03), its own branding and catalog, its own
dedicated Meta ad account, its own customer base, and its own staffing.
We're disclosing that platform reuse directly rather than obscuring it,
because the rules explicitly allow reusing pre-existing infrastructure as
long as the business running on it is genuinely new — and this one is.

Day to day, AI does the operational lifting that would otherwise need a
merchandising team and a media buyer, and it does so by making real
decisions with no human in the loop, not just producing drafts for one. A
Meta ad auto-kill engine evaluates every live campaign every five minutes
against spend and conversion thresholds and pauses underperformers directly
via the Graph API — real, dated events, dollar-specific, no approval step
between the evaluation and the pause. A nightly job reads 30 days of this
account's own ad performance and has an LLM write a fresh strategy brief —
which creative angles to weight up or abandon — that feeds directly into
the next batch of live ad copy with no human review; Sloane & Pearl is
currently the only account on the platform this loop runs for. A vision-
based judge inside the ad-creative pipeline compares generated video frames
against the ad it's cloning, decides pass/fail per shot, and autonomously
re-renders with AI-written fix instructions before a human ever picks the
final asset. The catalog itself — 2,529 products imported to date — was
populated by an AI import pipeline that writes original marketing copy for
every listing rather than reusing the supplier's text, and as of 2026-08-13
that pipeline runs through Gemini via Vertex AI specifically for this store,
verified by a real production API-usage record, not just a code path.

Those campaigns cost money, and the bottom line is a loss. Against
$18,641.28 of retained revenue the business spent $27,978.37 — $19,875.51
on Meta ads, $6,222.82 in real supplier invoices for merchandise, $1,522.46
in payment-processing fees, $252.57 in allocated AI tokens, and $105.00 in
verified CS-contractor pay for her first two weeks — for a **net loss of
$9,337.09 at a blended ROAS of 0.94x**. That is deliberate early-stage
spend, not a hidden problem: 201 fully paid, fully invoiced orders carry a
67.5% merchandise gross margin, about $62 of contribution per order before
advertising, so the shortfall is an ad-efficiency problem, not a
product-margin one — each order currently costs about $97 in ad spend to
win against that $62 of contribution. Every figure above, including the
payment-processing estimate for orders processed outside Shopify's native
rails, is disclosed with its methodology and its caveats in
`financials/pnl-methodology.md` rather than smoothed over.

What AI does not do here is send a customer a reply or make the final call
on strategy. Customer service today is fully human: a CS contractor,
engaged through onlinejobs.ph, drafts and sends every reply to Sloane &
Pearl's tickets herself. A Gemini-based CS drafting assistant was the
originally planned surface for this hackathon's Gemini requirement; it
shipped instead on the catalog side, for reasons explained in
`gemini-integration/write-up.md` — CS remains entirely human-run, and we
are not claiming otherwise. Strategic calls — which collections to launch,
pricing floors, ad budget approval above the operator's day-to-day
discretion — are made by a person. The honest split is: AI executes real,
consequential decisions at the operational layer — pausing spend, steering
ad strategy, judging its own creative output, pricing product — while a
human owns strategy and every word that reaches a customer.

That CS contractor is also the clearest evidence of a job this business has
created beyond its founders. She was engaged specifically for this work,
with a documented, dated hiring conversation: an initial interview in June
that did not lead to an engagement, then a second approach on 2026-07-16
that did, with her first logged ticket work — eight tickets answered — that
same day. Her role is not hypothetical; it exists because Sloane & Pearl
generated support volume that needed a person answering it, alongside a
second store on the same platform whose tickets she also covers.

We're disclosing the current state plainly rather than presenting only the
growth curve: the operator paused active testing and new revenue generation
for this store in early August, so the figures above are real, retained
cash from real activity during the compliance window, not an ongoing or
projected trajectory. The story of building it this way is less "we wrote
an AI agent from scratch during the hackathon" and more "we pointed an
operating AI-agent platform at a brand-new business and watched it make
real decisions with real money." Sloane & Pearl did not exist before
2026-06-03. In the two months since: a catalog and ad engine nobody
manually assembled, autonomous systems that paused real spend and wrote
real strategy with no one reviewing them first, one new job already
created, a human owning judgment and every customer-facing word — and a
real, disclosed loss while it bought its first customers.
