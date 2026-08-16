# AI-Native Operations Evidence

Per the judging criterion: *"Judges assess the extent to which AI is live in
production and executes key decisions."* This enumerates what's real for
Sloane & Pearl specifically, with evidence pointers, not platform-wide
capability claims.

**Store identification.** Sloane & Pearl is `ConnectedStore.id =
12a77c71-db85-43cf-8f74-64bfb23888b2` (`shop = pdmnf1-c0.myshopify.com`,
`domain = sloaneandpearl.com`), whose `metaAdAccountId` column already reads
`act_1115325060591696`, the same Meta ad account queried independently below,
cross-confirming the two queries point at the same store. Note for anyone
re-running these queries: `ShopifyProduct.storeId` is a foreign key into
`ConnectedStore`, not into the separate `ShopifyStore` table that
`shopDomain` also lives on (`ShopifyProduct.storeId` and `ShopifyStore.id`
are different id spaces; a literal `WHERE storeId = (SELECT id FROM
"ShopifyStore" WHERE ...)` join returns 0 rows, not an error, verified by
running it against the real database, catching what would otherwise be a
false "zero products" finding).

So that this stays a fixed problem rather than a warning someone has to
remember, `financials/scripts/lib/db.ts` exports both resolvers by name:
`storeIdFor()` for the `ShopifyStore` id space (orders, line items, refunds,
`ProductCogs`) and `connectedStoreIdFor()` for the `ConnectedStore` one
(products, catalog, store config). Pick the one named after the table you
are querying and the gotcha cannot bite.

## The strongest evidence: AI executing decisions with no human in the loop

These four are the clearest answer to the judging criterion's own wording,
*"executes key decisions,"* because in each case a real, dollar- or
customer-facing action happens with nobody reviewing it first.

- **Meta ad auto-kill**: a Railway cron (`cron-ticker-auto-kill`, every 5
  minutes) evaluates every live Sloane & Pearl campaign against
  spend/conversion thresholds and calls the Meta Graph API directly to pause
  it when a rule fires, no approval step between evaluation and the pause.
  This is the mechanism behind the "95 auto-killed of 127 launched" figure
  below; real, dated, dollar-specific examples (not a summary statistic
  alone) are in `evidence/agent-logs/auto-kill-log.md`. Source:
  `src/lib/meta-ads/auto-kill.ts`.
- **Angle Loop**: every night at 04:30, a scheduled job reads 30 days of
  Sloane & Pearl's real ad performance and Claude writes a new ad-strategy
  brief (which creative angles to weight up or avoid), with no human review
  before it feeds directly into the next batch of live ad copy. As of this
  writing, **Sloane & Pearl is the only account this loop currently runs
  for** on the whole platform (it defaults to the worker's configured ad
  account, which is this store's). 5 real, dated briefs with their actual
  written rationale are in `evidence/agent-logs/angle-loop-briefs.md`.
  Source: `src/lib/angle-loop/brief.ts`, consumed by
  `src/lib/meta-ads/pain-points.ts`.
- **Airwallex autonomous treasury top-up**: a worker tick forecasts this
  ad account's burn rate and, when projected runway drops below threshold,
  autonomously fires a real Airwallex bank transfer to refund it, no human
  approval per transfer, bounded by per-tick/day/week caps. 10 real,
  **settled** transfers (confirmed via the linked `AirwallexPayout` row, not
  just an intent) are in `evidence/agent-logs/treasury-topup-log.md`.
  Source: `src/lib/airwallex/topup-tick.ts`.
- **Gemini via Vertex AI, catalog-copy generation**: shipped 2026-08-13.
  Sloane & Pearl's product-import copy generation now runs through Gemini
  (`gemini-2.5-flash`) via Vertex AI instead of the platform's default
  Anthropic provider, the only store on this provider. Full technical
  write-up, real request/response, and a real production `ApiUsage` row:
  `gemini-integration/write-up.md`.

## Also currently running (as of 2026-07-30 unless noted)

- **Product import & catalog enhancement**: 2,529 products have been
  imported into Sloane & Pearl's catalog to date (`ShopifyProduct` rows for
  this store; 1,582 of them currently live/non-deleted). Each one carries
  AI-generated title and description copy from the platform's import
  pipeline (`ai-enhance` step in `/api/ai/generate-import-plan`), not the
  supplier's original listing text, sampled directly from this store's
  catalog: *"Mamie | Orthopedic Slip-On Leather Sneakers"* opens with "Meet
  the Mamie sneaker, where orthopedic support meets effortless everyday
  style. Designed for women who refuse to compromise on comfort…"; *"Celeste
  | Tie-Dye Mesh Long Sleeve Dress"* opens "The Celeste dress is a wearable
  work of art…". This is generated marketing copy, not scraped text.
  Generated via Anthropic historically; as of 2026-08-13, new imports for
  this store route through Gemini/Vertex AI instead, see above.
- **Ad-creative generation & campaign launch**: 127 real Meta ad campaigns
  have been launched to Sloane & Pearl's dedicated ad account
  (`act_1115325060591696`), spanning 2026-06-09 (the day the store went
  live) through 2026-07-30 (today), 32 currently active, 95 already
  auto-killed by the platform's performance rules (mechanism above). Each
  launched campaign is the terminal, verifiable output of the AI
  ad-creative pipeline (ad-clone / reimagine / collage generation,
  `src/lib/ad-clone/` et al. in the fashion-autopilot repo) that assembles
  that campaign's creative before it ships; `AdPipelineRun` itself only
  records store association inside a JSON blob column and isn't reliably
  queryable, so the launched campaign row is used here as the reliable
  evidence of a completed AI creative + launch cycle. All 127 launches run
  in Meta's Dynamic Creative mode (`creativeMode = 'dco'`), so Meta's own
  algorithm also continuously tests creative/copy combinations within each
  live campaign. Separately, the ad-clone pipeline's own vision-based judge
  autonomously compares generated video frames against the original,
  decides pass/fail per shot, and re-renders up to 3 times with AI-written
  fix instructions before a human ever picks the final asset. 30 completed
  runs, all for Sloane & Pearl, $95.10 real spend (`src/lib/ad-clone/`).
- **Pricing (import-time math)**: Variant pricing (FX conversion, charm
  pricing, discount-tier math, `buildVariantPricing` in
  `src/lib/import-flow-v2/variant-pricing.ts`) runs automatically as part of
  the same import pipeline that built this catalog. Every one of the 2,529
  imported products had its retail price computed by that automation at
  import time rather than set by hand product-by-product.
- **Pricing (autonomous post-launch repricing), built and proven, currently
  disabled.** A separate engine (`src/lib/pricing/auto-apply-tick.ts`)
  recomputes a break-even-optimal price from live COGS/FX/fee data and
  rewrites the Shopify price directly, including cuts, with no human
  review by design. It fired 24 real changes for this store
  (2026-06-12 to 07-14) before being switched off pending a data-quality fix
  to the low-sample-size COGS input that feeds it. Disclosed here rather
  than omitted: this is the honest state of a real, working mechanism that
  isn't currently armed, not a claim that it's live today.

## What's exclusively human

- **Customer service**: currently handled manually by a CS contractor (VA,
  hired via onlinejobs.ph, engagement start 2026-07-16, see
  `disclosure/labor-attestation.md`; she also handles NOVA Cape Town's
  tickets). A Gemini/Vertex AI integration for CS drafting was the
  originally planned surface for this hackathon's Gemini requirement;
  `gemini-integration/write-up.md` explains why catalog-copy generation
  shipped instead. CS drafting/triage automation remains **not built**,
  do not claim this is live. The VA reviews and sends every reply herself;
  there is no autonomous send-without-review for this store, and no plan
  to add one, the Gemini call that shipped is on the catalog side, not CS.
- Strategic decisions (pricing floors, which collections to launch, ad
  budget approval above the operator's discretionary threshold).

## Query evidence (run against production, 2026-07-30)

```sql
-- Catalog size for Sloane & Pearl (storeId is ConnectedStore.id, not
-- ShopifyStore.id, see note above)
SELECT COUNT(*) FROM "ShopifyProduct"
WHERE "storeId" = '12a77c71-db85-43cf-8f74-64bfb23888b2';
-- => 2529

SELECT COUNT(*) FROM "ShopifyProduct"
WHERE "storeId" = '12a77c71-db85-43cf-8f74-64bfb23888b2' AND "deletedAt" IS NULL;
-- => 1582

-- Ad-creative pipeline evidence: real, launched campaigns for Sloane &
-- Pearl's dedicated Meta ad account
SELECT COUNT(*), MIN("launchDate"), MAX("launchDate")
FROM "MetaCampaignLaunch" WHERE "accountId" = 'act_1115325060591696';
-- => count 127, min 2026-06-09, max 2026-07-30

SELECT COUNT(*) FILTER (WHERE killed) AS killed_count,
       COUNT(*) FILTER (WHERE NOT killed) AS active_count
FROM "MetaCampaignLaunch" WHERE "accountId" = 'act_1115325060591696';
-- => killed 95, active 32
```

## Query evidence for the "no human in the loop" section (run against production)

Full outputs, dated, in `evidence/agent-logs/`. Queries here for
independent re-verification:

```sql
-- Real, dated auto-kill events for this account
SELECT "campaignName", rule, spend, "metricValue", "thresholdDesc", "createdAt"
FROM "MetaAutoKillLog" WHERE "accountId" = 'act_1115325060591696'
ORDER BY "createdAt" DESC LIMIT 8;

-- Real, dated Angle Loop briefs (accountId confirms this is the only
-- account-scoped brief population on the platform)
SELECT version, rationale, "createdAt" FROM "AngleBrief"
WHERE "accountId" = 'act_1115325060591696' ORDER BY version DESC LIMIT 5;

-- Real, settled Airwallex top-up transfers (joined to confirm settlement,
-- not just a fire decision)
SELECT amount, currency, "firedAt", p.status AS payout_status
FROM "AirwallexTopupFire" f
LEFT JOIN "AirwallexPayout" p ON p.id = f."payoutId"
WHERE f."metaAdAccountId" = 'act_1115325060591696' AND f.decision = 'FIRED'
ORDER BY f."firedAt" DESC LIMIT 10;

-- Real Gemini/Vertex AI usage row
SELECT provider, model, "inputTokens", "outputTokens", cost, purpose, timestamp
FROM "ApiUsage" WHERE provider = 'gemini' ORDER BY timestamp DESC LIMIT 1;
-- => gemini, gemini-2.5-flash, 1412, 248, 0, product-enhancement-merged, 2026-08-12 16:58:34
```
