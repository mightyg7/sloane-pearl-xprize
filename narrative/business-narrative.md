# Sloane & Pearl — Business Narrative

Sloane & Pearl (sloaneandpearl.com) is a women's fashion storefront that
opened for orders on 2026-06-09 and, in the roughly seven weeks since, has
gone from zero revenue to $12,020.42 in independent sales in July alone —
up from $1,958.76 in its first partial month, a 6.1x jump. Cumulative
revenue to date is $13,979.18 across 154 revenue-bearing customer orders.
It runs on fashion-autopilot, an AI-agent e-commerce platform that was
already operating before the submission period began; what's new is the
business itself — a distinct Shopify store (created 2026-06-03), its own
branding and catalog, its own dedicated Meta ad account, its own customer
base, and its own staffing. We're disclosing that platform reuse directly
rather than obscuring it, because the rules explicitly allow reusing
pre-existing infrastructure as long as the business running on it is
genuinely new — and this one is.

Day to day, AI does the operational lifting that would otherwise need a
merchandising team and a media buyer. The catalog — 2,529 products
imported to date, 1,582 currently live — was populated by an AI import
pipeline that writes original marketing copy for every listing rather than
reusing the supplier's text: a pair of orthopedic sneakers becomes "Meet
the Mamie sneaker — where orthopedic support meets effortless everyday
style," a tie-dye dress becomes "The Celeste dress is a wearable work of
art." The same pipeline computes every product's retail price at import
time — FX conversion, charm pricing, discount-tier math — instead of a
person pricing 2,529 SKUs by hand. On the marketing side, 127 real Meta ad
campaigns have launched to Sloane & Pearl's ad account since the store went
live, each one the output of an AI ad-creative pipeline (ad-clone,
reimagine, and collage generation) that builds the creative before it
ships; 32 are still active, 95 have already been auto-killed by the
platform's own performance rules, and every live campaign runs in Meta's
Dynamic Creative mode, so Meta's algorithm keeps testing creative and copy
combinations inside each one on top of that.

Those campaigns cost money, and the bottom line is a loss. Against
$13,979.18 of retained revenue the business spent $20,096.62 — $15,721.49
on Meta ads, $4,145.60 in real supplier invoices for merchandise, $188.26
in allocated AI tokens — for a **net loss of $6,117.44 at a blended ROAS of
0.89x**. That is deliberate early-stage spend: 127 campaigns bought the 6.1x
month-over-month curve above, and finding out which products and creatives
work costs money before it earns any. The business is not yet profitable,
and the real question for viability isn't product margin — the 130 fully
paid orders with matched supplier invoices carry a 64.6% merchandise gross
margin, about $56 of contribution per order before advertising — but whether ad
efficiency improves as it scales, because each order currently costs around
$102 in ad spend to win. That loss is a floor, not a ceiling: the CS
contractor's pay isn't in it yet, and payment-processing fee data is
incomplete — it's known for only 14 of 160 orders, all processed via
Shopify-native payment. The other 146 were processed through a different
payment processor, OceanPayments, whose fees aren't available yet, so
both gaps push the true loss wider by an amount not yet known. Full
derivation, gaps included, is in `financials/pnl-methodology.md`.

What AI does not do here is send a customer a reply or decide what to
spend. Customer service today is fully human: a CS contractor, engaged
through onlinejobs.ph, drafts and sends every reply to Sloane & Pearl's
tickets herself — there is no AI drafting step live yet. A Gemini/Vertex AI
integration is designed to draft and triage replies for her to review
before sending, but as of this writing (2026-07-30) it is not built, and we
are not claiming otherwise. Strategic calls — which collections to launch,
pricing floors, ad budget approval above the operator's day-to-day
discretion — are made by a person, not the pipeline. The honest split is:
AI generates and operates the catalog and the ad creative at scale; a human
decides strategy and owns every word that reaches a customer.

That CS contractor is also the clearest evidence of jobs this business has
created beyond its founders. She was engaged specifically for this work,
with a documented, dated hiring conversation: an initial interview in June
that did not lead to an engagement, then a second approach on 2026-07-16
that did, with her first logged ticket work — eight tickets answered — that
same day. Her role is not hypothetical; it exists because Sloane & Pearl
generates support volume that needs a person answering it, alongside a
second store on the same platform whose tickets she also covers. Scaling
this model is a real next step: as order volume grows past what one
contractor can comfortably handle, the next hire is a second CS contractor
rather than added headcount on the founding team, and as supplier
relationships mature past the initial import, sourcing and quality-control
coordination is the next kind of role this business will need a dedicated
person for.

The story of building it this way is less "we wrote an AI agent from
scratch during the hackathon" and more "we pointed an operating AI-agent
platform at a brand-new business and watched it run one." Sloane & Pearl
did not exist before 2026-06-03. Seven weeks later: a live catalog nobody
wrote copy for by hand, an ad engine nobody manually assembled creative
for, a human owning judgment and every customer-facing word, one new job
already created with the shape of the next one already visible — and a
real, disclosed loss while it buys its first customers.
