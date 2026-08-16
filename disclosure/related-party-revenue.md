# Related-Party Revenue Disclosure

Per the rules: *"Any revenue earned during the Hackathon period from team
members, family, related entities, or pre-existing customer relationships.
Reported separately in Total Revenue so judges can assess whether the
underlying business serves arms-length third-party customers."*

## Checks performed

1. **Cross-store customer overlap, NOVA Cape Town:** fashion-autopilot's
   longest-running other store. Checked every Sloane & Pearl order's
   customer email and phone against every NOVA Cape Town order's. Result
   (as of the 2026-08-14 final regenerate, `customer-overlap-check.ts`):
   **0 orders overlap by email, 0 by phone**, out of 214 Sloane & Pearl
   orders and 204 unique customer emails. "Unique customer emails" is
   precisely what the script measures: distinct normalized email addresses
   on the order records, not verified distinct human beings. One person
   ordering twice from two addresses would read as two; the same person
   reusing one address reads as one. That distinction matters in a
   related-party disclosure specifically, so the metric is named for what
   it counts.

2. **The other two stores now on the platform.** Two more stores have
   appeared since the original overlap check was written, disclosed for
   completeness rather than silently omitted, since both are now visible in
   this repo's own evidence screenshots:
   - **Perla Madrid**: a genuinely active, separate store (5 real orders,
     2026-08-11 through 2026-08-14). Manually checked: none of its 5
     customer emails appear anywhere in Sloane & Pearl's 204. Not run
     through the automated script (which is hard-coded to NOVA Cape Town
     only), but the same zero-overlap conclusion holds by direct query.
   - **Céleste & Rose**: a dormant/pre-launch store (`debuf1-qa.myshopify.com`,
     the domain name itself signals pre-launch), confirmed to have **zero
     orders** in the compliance window. No overlap is possible with zero
     orders.

3. **Team/family/founder purchases.** Operator-confirmed (2026-07-30): no
   known purchases from friends, family, or team members. All traffic is
   ad-driven (Meta) or organic/cold.

## Disclosed related-party revenue

$0. This is what feeds `RELATED_PARTY_REVENUE_BY_MONTH` in Task 6's
`fill-pnl-template.ts`, written into row 10 of `financials/pnl-sloane-pearl.xlsx`
separately from row 9's Independent Sales.

## Re-verification

This is intended as the final check before submission. The store's
current paused state means order volume for Sloane & Pearl specifically is
not expected to move further. Re-run
`financials/scripts/customer-overlap-check.ts` only if that changes.
