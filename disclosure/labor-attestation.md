# Labor Attestation

Per the official FAQ: *"If you are using employees from an existing business
entity, you must (1) attest that the work produced by the employees did not
begin prior to the start of the hackathon period and (2) outline the expenses
associated with paying the employees to work on the Project during the
hackathon period."*

## Who this applies to

A customer-service contractor (VA, hired via onlinejobs.ph) handles
Sloane & Pearl's CS tickets. She also handles NOVA Cape Town's tickets, so her
time and pay are not exclusive to Sloane & Pearl.

## Attestation: work did not begin before 2026-05-19

**Confirmed clean.** Timeline, reconstructed from the hiring conversation:

- 2026-06-23: initial outreach / role posting.
- 2026-06-24: interviewed. Explicitly **not hired** at this point — the
  candidate was told the role was filled by someone else (2026-06-25 message:
  "we've decided to move forward with another candidate").
- 2026-07-16: re-approached ("are you still available for a small task?"),
  onboarded the same day, first logged work that day (EOD report: "Answered 8
  customer support tickets for Sloane & Pearl").

Actual engagement start: **2026-07-16**, well after the 2026-05-19 cutoff.
This is well-documented (dated chat log) — the initial June interview did not
result in an engagement, so there is no ambiguity about pre-cutoff work.

## Pay disclosure

**Rate:** $7.00 USD/hour.

**First invoice, verified against the real Airwallex payout record** (not
just the operator's word — cross-checked in `AirwallexPayout`):

- Invoice #01, covering CS support for 2026-07-16 through 2026-07-31.
- Amount: **$105.00 USD**.
- Paid via Airwallex, settled **2026-08-01**.
- At $7.00/hour, $105.00 implies ~15 hours over the 16-day period —
  consistent with a part-time ramp-up in her first two weeks.

**Allocation between Sloane & Pearl and NOVA Cape Town:** she handles CS for
both stores, so her pay is not automatically a Sloane & Pearl-only cost — the
same principle as the AI token allocation in
`financials/scripts/token-cost-allocation.md`. For *this specific invoice*,
though, the allocation isn't a blended estimate: NOVA Cape Town had **zero**
orders in the exact window this invoice covers (2026-07-16–2026-07-31; Sloane
& Pearl had 97), so there was no NOVA-side ticket volume to share the cost
with in this period. The full $105.00 is attributable to Sloane & Pearl. A
later invoice covering a period where both stores have order volume would
need the pro-rata split; this one doesn't.

This feeds `COGS_PERSONNEL_JSON` in Task 6's `fill-pnl-template.ts` as
`{"2026-07": 105.00}` (no June or May component — her engagement genuinely
starts mid-July, per the attestation above).

**Still open:** any invoices covering August work (through the Aug 17
deadline) haven't been issued/paid yet — this is a live, ongoing cost, same
treatment as the ad-spend figures elsewhere in this repo. Re-check before
final submission.

## Name-disclosure preference — still PENDING

The official FAQ permits anonymizing names ("As for any names you are not
able to share, feel free to cross them out or similarly anonymize"). The
operator has not yet decided whether to use her real name or keep the
anonymized reference ("a CS contractor" / "she") already used throughout this
repo. This document and the rest of the repo use the anonymized form until
that's explicitly decided — do not infer a decision from the fact that her
real name now appears in the underlying Airwallex payment record; that's a
financial system record, not a disclosure choice.
