# Sloane & Pearl — Build with Gemini XPRIZE Submission

This repo is the **submission package** for Sloane & Pearl (sloaneandpearl.com)'s
entry to the Build with Gemini XPRIZE hackathon (Category: Entrepreneurship &
Job Creation). It is not a copy of the product code — the actual code that runs
Sloane & Pearl (customer-service agent, ad-creative pipeline, import pipeline)
lives in the private `fashion-autopilot` repo, shared separately and privately
with judges.

Full context: `docs/superpowers/specs/2026-07-30-xprize-submission-design.md`.

## Layout

- `disclosure/` — compliance narratives (pre-existing platform, related-party
  revenue, pre-existing resources, labor attestation).
- `narrative/` — the 500–1000 word submission writeup and the AI-native-operations
  evidence enumeration.
- `financials/` — the filled P&L (`pnl-sloane-pearl.xlsx`), the scripts that
  produced its numbers, and the two docs a judge needs in order to read the
  spreadsheet:
  - `pnl-methodology.md` — where every line comes from, the cash-basis rules
    applied, the full breakdown of row 23 "Other Expenses" (ad spend +
    merchandise COGS + payment fees, which the template's own legend requires
    us to explain), and every known data gap.
  - `scripts/token-cost-allocation.md` — how platform-wide AI spend is
    allocated to this one store (rows 17/21).
- `evidence/` — testing-access plan, customer-evidence methodology, agent logs.
- `video/` — the 3-minute demo video script.
- `gemini-integration/` — write-up of the Gemini/Vertex AI integration (pending
  the follow-on build in `fashion-autopilot`).

## Where the business actually stands

As of 2026-08-01: **$13,979.18** revenue, **$20,201.62** expenses, a **net loss
of $6,222.44** at a blended ROAS of **0.89x**. Stated up front so nothing in
this repo reads as a profitability claim. Derivation and caveats:
`financials/pnl-methodology.md`.

## Open before submission

Genuinely unresolved. None of these are blocked on writing — they need an
external input, a build, or a recording session.

- [ ] **VA pay for August** — July's invoice ($105.00, verified against the
  real Airwallex payout, 100% Sloane & Pearl since NOVA had zero orders in
  that window) is already in row 15. August's invoice hasn't been issued yet.
  Once it arrives, allocate on the order-share basis in
  `financials/scripts/token-cost-allocation.md` if NOVA has order volume that
  month, pass the share as `COGS_PERSONNEL_JSON`, re-run `npm run fill-pnl`.
  Widens the loss.
- [ ] **Name-disclosure decision for the CS contractor** — anonymized
  everywhere for now, which the official FAQ permits. Operator has not chosen
  between her real name and an anonymized reference
  (`disclosure/labor-attestation.md`). Until decided, do **not** put her name
  in any doc, the narrative, or the video.
- [ ] **Payment-processing fees are only 14/160 orders** — those 14 are the
  only orders processed via Shopify-native payment, so they're the only ones
  Shopify's fee data ever covers. The remaining 146 were processed through a
  **different payment processor, OceanPayments**, whose fee structure isn't
  known yet and won't show up from re-running Shopify's payout sync (that
  sync only ever covers Shopify-native orders). Get real OceanPayments fee
  data from the operator, then `npm run fill-pnl`. This is the single
  largest known understatement in the P&L — true magnitude unknown, not
  estimated (see `pnl-methodology.md`, row 23c).
- [ ] **Shopify plan fee** — genuinely incremental to this store and not in
  the P&L, because no invoice figure is recorded anywhere in the platform.
  Pull the real Shopify charges from 2026-06-03 onward into row 16
  (`disclosure/pre-existing-resources.md`).
- [ ] **Merchandise COGS gap on 4 shipped orders** — #1075–#1078 shipped with
  no matched supplier invoice line. Re-run `npm run cogs` closer to the
  deadline; a later invoice closes this automatically.
- [ ] **Gemini/Vertex AI build in `fashion-autopilot`** — a Stage One
  pass/fail gate per `gemini-integration/write-up.md`. Designed, **not built**.
  Until it ships, no doc, narrative or video frame may imply it is live.
- [ ] **Record the actual video** — `video/script.md` is a script, not a
  recording. Needs real screen captures (storefront, admin catalog, campaign
  table, revenue figures), a chosen hook line, and the loss/ROAS beat at
  1:00–1:45 kept in the cut.
- [ ] **Real customer evidence for the Devpost form** — name/email/phone go
  straight into the form near the deadline, never into this repo. Method:
  `evidence/customer-evidence.md`.
- [ ] **Populate `evidence/agent-logs/`** — currently a placeholder README.
- [ ] **Re-run every figure near 2026-08-17** — ad spend accrues live, the
  EUR→USD rate moves, orders and supplier invoices keep landing. See the
  "Regenerating" checklist at the end of `financials/pnl-methodology.md`.

## Running the financial scripts

```bash
npm install
export DATABASE_URL="postgresql://postgres:<password>@tramway.proxy.rlwy.net:27107/fashion_autopilot"
export META_ACCESS_TOKEN="<meta marketing api token>"
npm run revenue    # cash-basis revenue by month + refund discrepancies
npm run cogs       # merchandise COGS + payment fees, with coverage report
npm run ad-spend   # Meta spend, converted EUR -> USD
npm run overlap    # related-party / cross-store customer overlap
```

Get `DATABASE_URL`'s password from `railway variables --service fashion-autopilot --kv`
in the `fashion-autopilot` checkout — never commit it. Get `META_ACCESS_TOKEN`
the same way (`META_ACCESS_TOKEN` var on the same service). All queries are
read-only.

## Filling the official P&L

```bash
export PL_TEMPLATE_PATH="/path/to/a freshly downloaded Build with Gemini XPRIZE - PL Template.xlsx"
export COGS_TOKENS_JSON='{"2026-06":37.65,"2026-07":150.61}'   # see token-cost-allocation.md
# export COGS_PERSONNEL_JSON='{...}'                            # once the VA invoice exists
npm run fill-pnl
```

Writes `financials/pnl-sloane-pearl.xlsx` (committed) from a **fresh, local**
copy of the template — never commit the blank template itself, only the
filled output. `.gitignore` blocks the blank one under several filename
variants; the script prints the resulting revenue/expense/loss totals plus
every data-quality warning it found, so read its output rather than assuming
a clean run.
