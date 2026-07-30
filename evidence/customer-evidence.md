# Customer Evidence — Methodology (not raw data)

The submission requires *"contact info of real customers (name, email, phone)
and any testimonials"*. Per this repo's global constraint, **real customer PII
is never committed to this git repository** — it goes directly into the
Devpost submission form near the deadline, generated fresh from the live
order data at that time.

## What this file documents instead

- **Selection method:** at submission time, pull a representative sample from
  `financials/scripts/revenue-by-month.ts`'s underlying order data (e.g. most
  recent N paid orders, or a spread across the order history) — script to be
  extended with a `--sample` flag when needed, not built speculatively now.
- **Aggregate summary (safe to commit):** as of [DATE], Sloane & Pearl has
  [N] unique customers across [N] orders (see
  `financials/scripts/customer-overlap-check.ts` output). Geographic/other
  breakdowns can be added here in aggregate form without naming individuals.
- **Testimonials:** only already-public reviews/testimonials (e.g. from the
  storefront itself) get included by name — solicited or private feedback
  needs the customer's awareness that it's being shared, per the rule
  (*"Please ensure your users are aware that their information is being
  shared"*), which a private DB pull does not by itself satisfy.
