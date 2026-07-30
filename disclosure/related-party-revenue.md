# Related-Party Revenue Disclosure

Per the rules: *"Any revenue earned during the Hackathon period from team
members, family, related entities, or pre-existing customer relationships.
Reported separately in Total Revenue so judges can assess whether the
underlying business serves arms-length third-party customers."*

## Checks performed

1. **Cross-store customer overlap.** fashion-autopilot operates one other
   store, NOVA Cape Town. Checked every Sloane & Pearl order's customer email
   and phone against every NOVA Cape Town order's customer email and phone.
   Result (as of 2026-07-30 from customer-overlap-check.ts output): 0 orders
   overlap by email, 0 by phone, out of 160 Sloane & Pearl orders and
   151 unique customer emails. "Unique customer emails" is precisely what
   the script measures — distinct normalized email addresses on the order
   records — not verified distinct human beings. One person ordering twice
   from two addresses would read as two; the same person reusing one address
   reads as one. That distinction matters in a related-party disclosure
   specifically, so the metric is named for what it counts.

2. **Team/family/founder purchases.** Operator-confirmed (2026-07-30): no
   known purchases from friends, family, or team members. All traffic is
   ad-driven (Meta) or organic/cold.

## Disclosed related-party revenue

$0 — this is what feeds `RELATED_PARTY_REVENUE_BY_MONTH` in Task 6's
`fill-pnl-template.ts`, written into row 10 of `financials/pnl-sloane-pearl.xlsx`
separately from row 9's Independent Sales.

## Re-verification

This check should be re-run close to the submission deadline (order volume
will have grown since 2026-07-30) — re-run
`financials/scripts/customer-overlap-check.ts` and update this doc's numbers
before final submission.
