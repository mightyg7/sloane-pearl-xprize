# AI-Native Operations Evidence

Per the judging criterion: *"Judges assess the extent to which AI is live in
production and executes key decisions."* This enumerates what's real for
Sloane & Pearl specifically, with evidence pointers — not platform-wide
capability claims.

**Store identification.** Sloane & Pearl is `ConnectedStore.id =
12a77c71-db85-43cf-8f74-64bfb23888b2` (`shop = pdmnf1-c0.myshopify.com`,
`domain = sloaneandpearl.com`), whose `metaAdAccountId` column already reads
`act_1115325060591696` — the same Meta ad account queried independently below,
cross-confirming the two queries point at the same store. Note for anyone
re-running these queries: `ShopifyProduct.storeId` is a foreign key into
`ConnectedStore`, not into the separate `ShopifyStore` table that
`shopDomain` also lives on (`ShopifyProduct.storeId` and `ShopifyStore.id`
are different id spaces; a literal `WHERE storeId = (SELECT id FROM
"ShopifyStore" WHERE ...)` join returns 0 rows, not an error — verified by
running it against the real database, catching what would otherwise be a
false "zero products" finding).

## Currently running (as of 2026-07-30)

- **Product import & catalog enhancement** — 2,529 products have been
  imported into Sloane & Pearl's catalog to date (`ShopifyProduct` rows for
  this store; 1,582 of them currently live/non-deleted). Each one carries
  AI-generated title and description copy from the platform's import
  pipeline (`ai-enhance` step in `/api/ai/generate-import-plan`), not the
  supplier's original listing text — sampled directly from this store's
  catalog: *"Mamie | Orthopedic Slip-On Leather Sneakers"* opens with "Meet
  the Mamie sneaker — where orthopedic support meets effortless everyday
  style. Designed for women who refuse to c[ompromise]…"; *"Celeste |
  Tie-Dye Mesh Long Sleeve Dress"* opens "The Celeste dress is a wearable
  work of art…". This is generated marketing copy, not scraped text.
- **Ad-creative generation & campaign launch** — 127 real Meta ad campaigns
  have been launched to Sloane & Pearl's dedicated ad account
  (`act_1115325060591696`), spanning 2026-06-09 (the day the store went
  live) through 2026-07-30 (today) — 32 currently active, 95 already
  auto-killed by the platform's performance rules. Each launched campaign is
  the terminal, verifiable output of the AI ad-creative pipeline (ad-clone /
  reimagine / collage generation — `src/lib/ad-clone/` et al. in the
  fashion-autopilot repo) that assembles that campaign's creative before it
  ships; `AdPipelineRun` itself only records store association inside a JSON
  blob column and isn't reliably queryable, so the launched campaign row is
  used here as the reliable evidence of a completed AI creative + launch
  cycle. All 127 launches run in Meta's Dynamic Creative mode
  (`creativeMode = 'dco'`), so Meta's own algorithm also continuously tests
  creative/copy combinations within each live campaign.
- **Pricing** — Variant pricing (FX conversion, charm pricing, discount-tier
  math — `buildVariantPricing` in
  `src/lib/import-flow-v2/variant-pricing.ts`) runs automatically as part of
  the same import pipeline that built this catalog. Every one of the 2,529
  imported products had its retail price computed by that automation at
  import time rather than set by hand product-by-product.

## Human-handled today, AI-assisted once the Gemini integration lands

- **Customer service** — currently handled manually by a CS contractor (VA,
  hired via onlinejobs.ph, engagement start 2026-07-16 — see
  `disclosure/labor-attestation.md`; she also handles NOVA Cape Town's
  tickets). The planned Gemini/Vertex AI integration
  (`gemini-integration/write-up.md`) drafts/triages replies for her review —
  **not yet built as of this writing (2026-07-30)**. Do not claim this is
  live until it is; update this section once
  `gemini-integration/write-up.md` moves from "planned" to "shipped."

## What's exclusively human

- Strategic decisions (pricing floors, which collections to launch, ad
  budget approval above the operator's discretionary threshold).
- Customer-service sending — the VA reviews and sends every reply herself;
  there is no autonomous send-without-review for this store, before or after
  the Gemini integration lands.

## Query evidence (run against production, 2026-07-30)

```sql
-- Catalog size for Sloane & Pearl (storeId is ConnectedStore.id, not
-- ShopifyStore.id — see note above)
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
