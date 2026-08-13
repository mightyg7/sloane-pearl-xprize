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
- `evidence/` — testing-access plan, customer-evidence methodology, agent logs
  and screenshots (real, dated exports proving AI runs in production).
- `video/` — the 3-minute demo video script.
- `gemini-integration/` — write-up of the Gemini/Vertex AI integration —
  **shipped and live** as of 2026-08-13, with real production evidence.

## Where the business actually stands

**Final regenerate, 2026-08-13**: **$18,641.28** revenue, **$27,978.37**
expenses, a **net loss of $9,337.09** at a blended ROAS of **0.94x**. Stated
up front so nothing in this repo reads as a profitability claim. The store
is not currently active (paused: no new product testing, no new revenue) —
these figures reflect real, cash-basis activity through early August, not
projected or ongoing activity. Derivation and caveats:
`financials/pnl-methodology.md`.

## Open before submission

- [ ] **VA pay for August** — still not issued as of 2026-08-13 (re-checked;
  consistent with the store's paused state). If it arrives before the
  deadline, allocate per `financials/scripts/token-cost-allocation.md` and
  re-run `npm run fill-pnl`. Widens the loss further.
- [ ] **Shopify plan fee** — still not located as of this regenerate. Genuine
  omission, not a $0 claim (`disclosure/pre-existing-resources.md`).
- [ ] **Record the actual video** — `video/script.md` needs updating with
  the final numbers above before recording (loss/ROAS beat, revenue figures)
  — then real screen captures, a chosen hook line, recording itself.
- [ ] **Real customer evidence for the Devpost form** — name/email/phone go
  straight into the form near the deadline, never into this repo. Method:
  `evidence/customer-evidence.md`.
- [ ] **Fill out and submit the actual Devpost form** — using this repo's
  finalized content.

**Resolved since the last checklist:** name-disclosure decision made
(`disclosure/labor-attestation.md`); OceanPayments fee estimate now applied
in the committed P&L; the 4-order merchandise-COGS gap closed on its own
(204/204 shipped orders now have a matched invoice); Gemini/Vertex AI
shipped and verified live in production, with real evidence in
`evidence/agent-logs/` and `evidence/screenshots/`; agent-logs populated
with real DB exports and admin screenshots.

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
export OCEANPAY_FEE_RATE_PCT="7.835"                                        # see pnl-methodology.md row 23c
export COGS_TOKENS_JSON='{"2026-06":37.77,"2026-07":175.85,"2026-08":38.95}' # see token-cost-allocation.md
export COGS_PERSONNEL_JSON='{"2026-07":105.00}'                             # once an August invoice exists, add it
npm run fill-pnl
```

Writes `financials/pnl-sloane-pearl.xlsx` (committed) from a **fresh, local**
copy of the template — never commit the blank template itself, only the
filled output. `.gitignore` blocks the blank one under several filename
variants; the script prints the resulting revenue/expense/loss totals plus
every data-quality warning it found, so read its output rather than assuming
a clean run.
