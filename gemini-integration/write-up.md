# Gemini / Google Cloud Integration

**Status: shipped and live (2026-08-12/13, UTC vs local date: the real
`ApiUsage` row below timestamps at 2026-08-12 16:58 UTC).** Real Gemini
calls now run through Vertex AI, in production, for Sloane & Pearl's
catalog-copy generation.

## What was actually built (differs from the original plan, see below)

`src/lib/vertex-provider.ts` (new) wraps `@google/genai` in **Vertex AI**
mode: a dedicated GCP project (`sloane-pearl-xprize`), a service account
with the `Agent Platform User` role (Google's current name for what the IAM
role picker still resolves as `roles/aiplatform.user`, i.e. the classic
"Vertex AI User" role), authenticated via a JSON service-account key set as
an env var on both the web and worker Railway services. This is distinct
from the platform's existing plain Gemini Developer API key
(`GEMINI_API_KEY`), which is **not** a Google Cloud product on its own. The
Vertex routing is what makes this call satisfy both hackathon requirements
(*"at least one LLM call through Gemini"* and *"at least one product from
Google Cloud"*) with the same call, per Google's own confirmation at the
2026-07-30 workshop.

`src/lib/ai-enhance.ts`'s `enhanceAndTranslate()`, the function that writes
Sloane & Pearl's AI-generated product titles/descriptions/bullets at import
time, now accepts an optional `provider: "anthropic" | "vertex"` param,
defaulting to `"anthropic"` (zero behavior change for every existing caller
and every other store). `src/lib/filler-import/run-collection-import.ts`
passes `provider: "vertex"` only when the import's `storeId` matches Sloane
& Pearl's `ConnectedStore.id` (`12a77c71-db85-43cf-8f74-64bfb23888b2`).
Every other store keeps generating copy via Anthropic, unchanged.

**Deviation from the original plan, disclosed:** the design spec named
customer-service drafting as the intended surface. The surface actually
shipped is catalog-copy generation instead. Reasoning: CS drafting would
have meant modifying a live, already-autonomous send pipeline (draft → judge
→ auto-send) shared across every store: a materially larger blast radius
for a change whose only purpose is satisfying a narrow API-usage
requirement. Catalog-copy generation is a single, already-isolated function
with an existing multi-provider pattern (it swaps cleanly between two
providers), scoped to one store via one id comparison, with no shared state
touched. The requirement is satisfied identically either way: *"at least
one LLM call through Gemini in the deployed application"* does not specify
which call.

## Real evidence

**Production `ApiUsage` row** (query: `SELECT * FROM "ApiUsage" WHERE
provider = 'gemini' ORDER BY timestamp DESC LIMIT 1`):

```
provider: gemini
model: gemini-2.5-flash
inputTokens: 1412
outputTokens: 248
cost: 0
purpose: product-enhancement-merged
timestamp: 2026-08-12 16:58:34.935
```

**Real request/response**, captured by calling the actual deployed
`enhanceAndTranslate()` function (not a standalone test script) against a
real product description, immediately after the Vertex build was merged and
deployed to production:

- Input: title "Coastal Linen Wrap Dress", description "A breezy linen wrap
  dress in a soft coastal print, perfect for warm-weather days."
- Output (excerpt): names `["Sofia | Breezy Linen Wrap Dress", "Léa |
  Printed Coastal Wrap Dress", "Camila | Soft Linen Midi Dress"]`;
  heroDescription "Embrace effortless elegance with the Sofia dress, a breezy
  linen wrap style adorned with a delicate coastal print. Perfect for
  sun-drenched days, its relaxed silhouette transitions seamlessly from
  beach strolls to al fresco dining."; productType "Wrap Dress".
- Response metadata: `model: "gemini-2.5-flash"`, real `usageMetadata`
  token counts from Google's own API response. The model identifier and
  field shape (`candidatesTokenCount`, `promptTokenCount`) are Gemini's own,
  not something authored by this codebase.

**GCP Console usage/billing screenshots**: captured 2026-08-14, real
Vertex AI API traffic graph, a real Cloud Billing cost report isolated to
this project (€0.01), and Google's own billing table naming Vertex AI
explicitly as the billed service. See `evidence/agent-logs/README.md` and
`evidence/screenshots/gcp-*.png`.

**GCP billing evidence for the Devpost form's upload slot**: no formal
invoice PDF exists yet for August (GCP invoices post ~5 business days after
month-end, after the deadline), so per the form's own fallback language:
*"If you used GCP Free Tier or credits, export the zero-dollar monthly
invoice or cost table statement."* The real Cost Table CSV export is used
instead: `evidence/agent-logs/gcp-cost-table-august-2026.csv`, downloaded
directly from Console → Billing → Reports, naming Vertex AI and the exact
€0.006251 unrounded subtotal.

## Cost

Negligible, as anticipated. One real call cost $0 at Flash-tier pricing
(consistent with the ~0.001¢–1.3¢ per call range DeepMind DevRel demoed
2026-07-30). This will not move `financials/scripts/token-cost-allocation.md`
in any material way; it is intentionally not broken out as a separate line
there, see that file's own methodology for why AI token spend is disclosed
as a single allocated platform total, not per-provider.

`narrative/ai-native-operations.md` reflects this as "currently running,"
scoped to catalog-copy generation only. Customer service stays fully
human, a separate and still-unbuilt piece of work; see that doc's "What's
exclusively human" section.
