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

## Pay disclosure — PENDING

Not yet resolved, blocking this doc's completion:

1. **Name-disclosure preference.** The official FAQ permits anonymizing names
   ("As for any names you are not able to share, feel free to cross them out
   or similarly anonymize"). Operator has not yet decided whether to use her
   real name or an anonymized reference (e.g. "our CS contractor") in this
   document. Update this section once decided.
2. **Pay figure.** She invoices for her work (confirmed 2026-07-30: "I will
   send my invoice on Friday"). No invoice amount is available yet. Once
   received, split her pay between Sloane & Pearl and NOVA Cape Town using the
   same order-share methodology as `financials/scripts/token-cost-allocation.md`
   (not charged wholly to either store), then pass the Sloane & Pearl share as
   `COGS_PERSONNEL_JSON` the next time Task 6's `fill-pnl-template.ts` runs.

This is a genuine external dependency, not an oversight — do not fabricate a
name-disclosure decision or a pay figure to close this out. Update this file
and re-run `fill-pnl-template.ts` together once the operator provides both
inputs.
