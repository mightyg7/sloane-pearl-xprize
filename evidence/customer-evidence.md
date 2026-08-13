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
- **Aggregate summary (safe to commit):** as of the **2026-08-13 final
  regenerate**, Sloane & Pearl has **204 unique customer emails** across
  **214 orders** placed (source: `financials/scripts/customer-overlap-check.ts`).
  Of those 214, **204 are revenue-bearing** on a cash basis. The metric is
  unique *emails*, not verified distinct people: one person ordering from
  two addresses counts twice. Geographic/other breakdowns can be added here
  in aggregate form without naming individuals. This is intended as the
  final figure — the store is currently paused, so order volume is not
  expected to move further before the deadline; re-check only if that
  changes.
- **Testimonials:** only already-public reviews/testimonials (e.g. from the
  storefront itself) get included by name — solicited or private feedback
  needs the customer's awareness that it's being shared, per the rule
  (*"Please ensure your users are aware that their information is being
  shared"*), which a private DB pull does not by itself satisfy.
