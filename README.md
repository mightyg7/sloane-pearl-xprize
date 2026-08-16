# Sloane & Pearl: Build with Gemini XPRIZE Submission

This repo is the **submission package** for Sloane & Pearl (sloaneandpearl.com)'s
entry to the Build with Gemini XPRIZE hackathon (Category: Entrepreneurship &
Job Creation). It is not a copy of the product code: the actual code that runs
Sloane & Pearl lives in a much larger private platform repo (`fashion-autopilot`)
that also runs unrelated stores/business lines, so it is **not** shared with
judges wholesale. Instead, a second, separate, curated repo,
[`mightyg7/sloane-pearl-code-evidence`](https://github.com/mightyg7/sloane-pearl-code-evidence),
(private), contains real, unmodified source excerpts of the specific
mechanisms this submission cites as evidence (auto-kill, Angle Loop,
ad-clone judge loop, Airwallex treasury top-up, supplier size-chart
automation, the Gemini/Vertex integration). It's shared with
`testing@devpost.com` and `judging@hacker.fund`, same as this repo.

## Layout

- `disclosure/`: compliance narratives (pre-existing platform, related-party
  revenue, pre-existing resources, labor attestation).
- `narrative/`: the 500–1000 word submission writeup and the AI-native-operations
  evidence enumeration.
- `financials/`: the filled P&L (`pnl-sloane-pearl.xlsx`), the scripts that
  produced its numbers, and the two docs a judge needs in order to read the
  spreadsheet:
  - `pnl-methodology.md`: where every line comes from, the cash-basis rules
    applied, the full breakdown of row 23 "Other Expenses" (ad spend,
    merchandise COGS, and payment fees, which the template's own legend
    requires us to explain), and every known data gap.
  - `scripts/token-cost-allocation.md`: how platform-wide AI spend is
    allocated to this one store (rows 17/21).
- `evidence/`: testing-access plan, customer-evidence methodology, agent logs
  and screenshots (real, dated exports proving AI runs in production).
- `video/`: the 3-minute demo video script.
- `gemini-integration/`: write-up of the Gemini/Vertex AI integration,
  **shipped and live** as of 2026-08-13, with real production evidence.

## Where the business actually stands

**Final regenerate, 2026-08-14**: **$18,641.28** revenue, **$27,971.34**
expenses, a **net loss of $9,330.06** at a blended ROAS of **0.94x**. Stated
up front so nothing in this repo reads as a profitability claim. The store
is not currently active (paused: no new product testing, no new revenue);
these figures reflect real, cash-basis activity through early August, not
projected or ongoing activity. Every payment-processing fee is now real,
exact data (OceanPayments' own transaction export, a real withdrawal
report, real Shopify billing invoices), no more estimated rate anywhere in
the P&L. Independently cross-checked three ways (a raw DB query, a raw Meta
API call, and the platform's own internal `/profit` dashboard). Derivation
and caveats: `financials/pnl-methodology.md`.

## STOP EDITING AFTER THE DEVPOST FORM IS SUBMITTED

Organizer, verbatim, from the Submission Success Workshop: *"Are you allowed
to change add features and bug fixes after the submission date on
GitHub?... that is a no. Please avoid any edits to anything after the
deadline... if we are getting pointed to that repo and we see edits we'll
have to raise flags."* This applies to **all three repos** judges may end up
looking at: this one (`sloane-pearl-xprize`), `sloane-pearl-code-evidence`,
and (if it ever comes up) `fashion-autopilot`. Once the form is submitted,
**no further commits to any of them**: not a typo fix, not a "just one more
number," nothing, until judging is fully over.

## Open before submission

- [ ] **VA pay for August**: still not issued as of 2026-08-14 (re-checked;
  consistent with the store's paused state). If it arrives before the
  deadline, allocate per `financials/scripts/token-cost-allocation.md` and
  re-run `npm run fill-pnl`. Widens the loss further.
- [x] **Record the actual video**: recorded and included in the submission
  as of 2026-08-17.
- [ ] **Real customer evidence for the Devpost form**: name/email/phone go
  straight into the form near the deadline, never into this repo. Method:
  `evidence/customer-evidence.md`.
- [ ] **Post the compliance-clarification question to organizers**: an
  earlier email draft was never sent; a Discord Q&A-appropriate version is
  ready to post (covers both the pre-existing-platform question and the
  curated-repo-vs-full-repo code-sharing scope).
- [x] **Fill out and submit the actual Devpost form**: submitted as of
  2026-08-17. The deadline itself hasn't passed yet, so edits here remain
  fine until then, per the edit-freeze note above.

**Resolved since the last checklist:** name-disclosure decision made
(`disclosure/labor-attestation.md`); payment-processing fees are now real,
exact data, not an estimate (`financials/pnl-methodology.md` row 23c); the
4-order merchandise-COGS gap closed on its own (204/204 shipped orders now
have a matched invoice); the Shopify plan-fee gap closed with real invoice
data, not a guess (plan subscription = $0, real Apps charges of $62.49
added, `disclosure/pre-existing-resources.md`); Gemini/Vertex AI shipped
and verified live in production, with real evidence in
`evidence/agent-logs/` and `evidence/screenshots/`; a real, consented,
verified customer testimonial secured (`evidence/customer-evidence.md`);
agent-logs populated with real DB exports and admin screenshots; corporate
ID confirmed real (IHOUMI LIMITED, HK BR No. 79710264, Live,
`disclosure/pre-existing-platform.md`); GCP billing evidence for the
Devpost form's "evidence of the project running" upload slot resolved: no
invoice PDF exists yet for August (posts after the deadline), so the
form's own named fallback is used, a real Cost Table CSV export
(`evidence/agent-logs/gcp-cost-table-august-2026.csv`); revenue-evidence
file built and uploaded to the form (real OceanPayments transaction/
withdrawal data compiled into a single PDF, not committed here, real
customer PII); `fashion-autopilot` will **not** be shared. The curated
`sloane-pearl-code-evidence` repo satisfies "the repository must contain
all necessary source code," with an explicit disclosure note added to that
repo's own README explaining why, so it reads as a deliberate, disclosed
choice rather than a gap.

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
in the `fashion-autopilot` checkout, never commit it. Get `META_ACCESS_TOKEN`
the same way (`META_ACCESS_TOKEN` var on the same service). All queries are
read-only.

## Filling the official P&L

```bash
export PL_TEMPLATE_PATH="/path/to/a freshly downloaded Build with Gemini XPRIZE - PL Template.xlsx"
export REAL_FEES_JSON='{"2026-06":105.04,"2026-07":997.68,"2026-08":292.02}' # real fees, see pnl-methodology.md row 23c
export COGS_TOKENS_JSON='{"2026-06":37.88,"2026-07":172.84,"2026-08":42.62}' # see token-cost-allocation.md
export COGS_PERSONNEL_JSON='{"2026-07":105.00}'                             # once an August invoice exists, add it
export COGS_SOFTWARE_JSON='{"2026-07":62.49}'                               # real Shopify Apps charges, see pre-existing-resources.md
npm run fill-pnl
```

Writes `financials/pnl-sloane-pearl.xlsx` (committed) from a **fresh, local**
copy of the template, never commit the blank template itself, only the
filled output. `.gitignore` blocks the blank one under several filename
variants; the script prints the resulting revenue/expense/loss totals plus
every data-quality warning it found, so read its output rather than assuming
a clean run.
