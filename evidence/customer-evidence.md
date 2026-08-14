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
- **Aggregate summary (safe to commit):** as of the **2026-08-14 final
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

## Real testimonial secured, 2026-08-14

No public review/comment existed to use (checked the storefront and the
brand's Facebook page — the latter's organic-content permission is missing
from the Meta app, a separate real gap, not this store's fault). A search
across all 525 real inbound customer emails (filtered from ~1,800 total,
scored for genuine positive sentiment via a two-pass LLM classification,
every candidate cross-checked against real order data) surfaced exactly one
genuine, verified, unprompted testimonial — everything else was either a
business/marketing inquiry with no order on file, or too thin to use.

**Consent obtained 2026-08-14**, operator to customer, via the operator's
personal email (outside the platform) — she agreed to her feedback being
shared, with attribution as **"Y. Young"** (not her full name).

**The quote, verbatim, exactly as she wrote it** (visible in full in
`testimonial-message-thread.png`, so quoting it any other way here would
just create a mismatch a judge could spot by opening the screenshot):
*"Wow..i didnt think I would hear from you. THANK YOU!!. I love the
sandal."* [continues into a real sizing follow-up — "I wear a 7...these
look like an 11..." — omitted here as off-topic for a testimonial, not
because it says anything negative; the full message is visible unedited in
the screenshot]. Real order #1152 ($54.95, paid, delivered, 2026-07-29),
her first order with the store, unprompted follow-up after a support reply
about a sizing issue on that same order — genuine context, not hidden.

**Verification, redacted for privacy before being saved anywhere:**
- `evidence/screenshots/testimonial-order-1152.png` — the real order record
  (order #, date, amount, item, fulfillment timeline). Customer
  name/email/address panels are excluded entirely (cropped out of the
  screenshot, not merely blurred). The order's payment method still shows
  as a masked "Visa ••9183" badge — last-4-digits only, the same level of
  disclosure a receipt shows, not full card data — left visible rather than
  additionally redacted since it identifies nothing about her personally.
- `evidence/screenshots/testimonial-message-thread.png` — the real,
  timestamped email thread showing her exact words, unedited. Her email
  address is redacted from the visible sender line.

Her real name, email, and full order detail are **not** in this repo —
consistent with the same PII policy as the rest of this file. If the
Devpost form asks for her full contact info as part of the "real customers"
requirement (distinct from the testimonial itself), pull it fresh from the
order record at submission time, same as every other customer-contact
figure in this document.
