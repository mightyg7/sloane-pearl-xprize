# Build with Gemini XPRIZE — Sloane & Pearl Submission Design

**Date:** 2026-07-30
**Deadline:** August 17, 2026, 1:00pm PDT
**Prize:** $2,000,000 pool (1st: $500k, 2nd: $200k, 3rd–5th: $100k each, 15 runner-ups: $50k each, 5 category winners: $50k each)

## 1. What we're submitting

**The business:** Sloane & Pearl (sloaneandpearl.com), a women's fashion e-commerce
brand. Shopify store `pdmnf1-c0.myshopify.com`, created 2026-06-03, first live
orders 2026-06-09 — after the hackathon's May 19, 2026 "New Projects Only" cutoff.

**The platform it runs on:** fashion-autopilot, a pre-existing, already-operating
AI-agent e-commerce platform (import pipeline, ad-creative pipeline, customer-service
agent, order/fulfillment tracking, financial ops). Sloane & Pearl is a new brand/
storefront launched on top of that platform, not a new platform itself. This is
explicitly allowed under the "New Projects Only" rule as confirmed by the organizer
(email correspondence, 2026-07-30): *"If you used pre-existing templates, frameworks,
boilerplates, or code to build the final project, please explain how the project
utilized that pre-existing work."* We disclose this rather than obscure it.

**Category:** Entrepreneurship & Job Creation — *"Fueling the tools that help new
founders and economies thrive."* Framing: an AI agent platform autonomously launched
and operates a real, profitable retail business from near-zero human headcount — a
blueprint for what a founder can do without a team.

**Current traction (as of 2026-07-30, verified against prod DB):**
- 159 orders, 150 unique customers
- Revenue: June 2026 $2,076 (32 orders), July 2026 $11,797 (127 orders, month
  incomplete) — accelerating month over month
- **Zero customer overlap with NOVA Cape Town** (fashion-autopilot's other store),
  checked by email and phone across all orders in both stores
- Operator-confirmed: no known friends/family/team purchases. Related-party revenue
  = $0 pending final re-check at submission time (order volume will have grown)

## 2. Repo scope

This repo (`sloane-pearl-xprize`) is the **submission package** — disclosure docs,
narrative, evidence-collection scripts, the filled P&L, and the video script. It is
**not** a copy of the product code. The actual code that runs Sloane & Pearl (CS
agent, ad pipeline, import pipeline) lives in the private `fashion-autopilot` repo,
which — per the organizer's confirmation that all reviewers sign NDAs before code
review — can be shared directly and privately with `testing@devpost.com` and
`judging@hacker.fund` via GitHub access, decided separately from this repo.

Rationale for not mirroring code here: a mirror is a second copy that drifts from
the live system the moment either changes, and the fashion-autopilot repo's own
root is full of internal notes (meeting notes, other-store data, financial handoff
docs, VA management process) that have nothing to do with Sloane & Pearl — so a
"clean mirror" would either need constant curation or leak scope. Better to point
judges at exactly the files/paths that matter (this repo does that) and let repo
access to the real code be a separate, narrower decision.

## 3. Repo structure

```
sloane-pearl-xprize/
  README.md                          — what this repo is, how to navigate it
  docs/superpowers/specs/            — this design doc + any follow-on specs
  disclosure/
    pre-existing-platform.md         — "New Projects Only" compliance narrative:
                                        what's pre-existing (the platform) vs new
                                        (the brand, the storefront, the customers)
    related-party-revenue.md         — customer-overlap findings + disclosure
    pre-existing-resources.md        — which shared costs (hosting, proxies, LLM
                                        keys, operator time) the new brand rides on
  narrative/
    business-narrative.md            — 500–1000 word submission writeup (draft)
    ai-native-operations.md          — enumerated list of AI-driven decisions in
                                        Sloane & Pearl's operation, with evidence
                                        pointers (agent logs, API records)
  financials/
    pnl-sloane-pearl.md              — filled P&L, cash-basis, by month
    scripts/
      revenue-by-month.ts            — Shopify revenue for this store only
      ad-spend-by-month.ts           — Meta ad spend for this store's ad account
      customer-overlap-check.ts      — the check already run; kept for
                                        reproducibility, re-run at submission time
      token-cost-allocation.md       — methodology for AI-spend allocation (not
                                        directly attributable per store — disclosed
                                        estimate, not fabricated precision)
  evidence/
    agent-logs/                      — exported examples: CS replies, ad launches,
                                        import runs, tied to this store
  video/
    script.md                        — 3-minute video script/storyboard
  gemini-integration/
    write-up.md                      — technical description of the Gemini/Google
                                        Cloud call once implemented (see §5)
```

## 4. Financial evidence pipeline

Two of the three P&L cost lines are cleanly attributable per store; one is not:

- **Revenue** — `Order` rows have `storeId` and `customerEmail` directly. Fully
  attributable, already verified.
- **Ad spend (SG&A)** — `MetaCampaignLaunch.accountId` maps 1:1 to Sloane & Pearl's
  dedicated Meta ad account. Fully attributable.
- **AI token spend (COGS + SG&A)** — `ApiUsage` has no `storeId` at all, only a
  free-text `purpose` field. Some calls trace indirectly to a store (e.g. via
  `FounderPortrait.conceptId` → `CreativeConcept`), but most don't. Rather than
  claim false precision, `token-cost-allocation.md` will disclose the platform's
  total AI spend for the period and an explicit, stated allocation methodology
  (e.g. pro-rata by order share or by store-count), flagged as an estimate.

The P&L follows the workshop-clarified structure exactly: Total Revenue (independent
sales only, related-party reported separately) by month; COGS (Personnel / Software
subscriptions / Tokens used, i.e. production costs); SG&A (Personnel / Software
subscriptions / Tokens used, i.e. go-to-market costs); Other Expenses; cash-basis
accounting. Any cost line traceable to pre-existing (pre-May-19) infrastructure gets
called out per the rule: *"if any expenses correspond to the use of resources that
existed prior to the hackathon, then you must explain whatever those resources
might be."*

## 5. Gemini + Google Cloud technical work (separate, in fashion-autopilot repo)

**Not part of this repo's deliverables** — tracked here as a documented dependency.
Currently Sloane & Pearl has zero Gemini usage; the only Gemini code path in the
platform is a manual, operator-clicked image-generation toggle, last used in
2026-05 on the now-deactivated NOVA Cape Town store, never on Sloane & Pearl. The
rules require *"at least one LLM call [through Gemini] in the deployed
application"* and *"at least one product from Google Cloud."*

**Confirmed, not just recommended:** at the 2026-07-30 innovation orientation
workshop, Google's own representative (Rodie) was asked on record *"Does calling
Gemini via Vertex AI satisfy the Gemini API requirement?"* and answered
*"Correct."* Vertex AI is explicitly a Google Cloud product; the plain
AI-Studio-issued `GEMINI_API_KEY` (which is what the platform's existing dormant
Gemini code uses) is not — so reactivating the old code path as-is would satisfy
the LLM requirement but **not** the Google Cloud one. The new call must genuinely
route through Vertex AI, not reuse the existing Gemini Developer API integration.

Where the call lives (surface) is still an open operator decision — "decide
later." Both candidates already discussed are explicitly validated by the rules'
own examples of "operated by AI agents": *"an AI agent used for customer
support"* (→ CS pipeline) or *"an AI tool used to create marketing assets"*
(→ ad-creative pipeline).

**Technical lift is smaller than it might sound:** per DeepMind DevRel (Paige
Bailey, technical demo session, 2026-07-30), the `google-genai` SDK is identical
for both the plain Gemini Developer API and Vertex AI — switching is "one line,"
adding a region ID and GCP project ID to the client config, not a different
integration or a rewrite of call sites. Flash-tier Gemini calls are also cheap
in practice (demoed: ~1.3¢ for a 3-minute video-analysis call, ~0.001¢ for a
simple image call), so once wired in, the new "tokens" cost line in the P&L will
be negligible, not a material swing in the disclosed estimate.

This will get its own small design/plan when the
operator is ready to decide the surface; it is out of scope for the work this
repo's implementation plan covers.

## 6. Out of scope for this repo (explicitly)

- Writing or modifying any fashion-autopilot product code (Gemini/Vertex AI wiring,
  `autoSendEnabled` toggling, etc.) — separate follow-on work in that repo.
- Actually recording/editing the 3-minute video — this repo produces the script;
  recording is a human task.
- Filling in final, submission-day numbers — scripts and templates are built now;
  the operator re-runs them close to Aug 17 for final figures.
- Deciding GitHub access to the fashion-autopilot repo for judges — a separate,
  narrower decision from this repo's existence.

## 7. Risks / open items

- AI token cost allocation methodology needs the operator's sign-off before it's
  treated as final (it's a disclosed estimate, not a precise number).
- Related-party check should be re-run at submission time (order count will have
  grown between now and Aug 17).
- Gemini/Vertex AI integration *surface* (which pipeline it lives in) is still
  undecided — the transport (Vertex AI) is organizer-confirmed, but the P&L
  "tokens" line and the AI-native-operations narrative can't be finalized until
  the surface is picked and built.
- Category framing (Entrepreneurship & Job Creation) is a judgment call, not
  dictated by the rules — the narrative needs to make the case explicitly, since
  none of the 5 categories name e-commerce outright.
