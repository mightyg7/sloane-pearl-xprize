# AI Token Cost Allocation Methodology

`ApiUsage` (the table tracking Anthropic/Gemini/OpenAI API spend) has no
per-store attribution — no `storeId` column, only a free-text `purpose` field
that doesn't reliably encode which store a call was for. This is a platform-wide
table shared across every store fashion-autopilot operates, not just
Sloane & Pearl.

**Methodology:** rather than claim precision the data doesn't support, we
allocate total platform AI spend for the hackathon window (2026-05-19 to
2026-08-17) pro-rata by each store's share of orders placed in that same
window. This is a disclosed estimate, not exact per-call accounting.
All figures in USD, current as of **2026-08-13** (final regenerate).

**A third store has joined the platform since the prior snapshot:** Perla
Madrid, with 1 order in the compliance window as of this run. The allocation
below is now a three-way split, not two-way — updated accordingly rather
than silently still dividing by two stores.

- Total platform `ApiUsage` cost, 2026-05-19–2026-08-17: $571.21 USD
- Sloane & Pearl orders in window: 214
- NOVA Cape Town orders in window: 269
- Perla Madrid orders in window: 1
- Sloane & Pearl's allocated share: 214 / (214 + 269 + 1) × $571.21 USD = **$252.56 USD**

This allocated figure feeds `COGS_TOKENS_JSON` in `fill-pnl-template.ts`. The
split between production-related AI calls (e.g. import/catalog enhancement,
which would be COGS) and marketing-related ones (e.g. ad-creative
generation, which would be SG&A) is **not** separable from `ApiUsage.purpose`
strings, so the combined total is disclosed under **COGS Tokens only** (row
17) rather than inventing a precise split the data doesn't support.
`SGA_TOKENS_JSON` is intentionally left unset, leaving row 21 at $0/blank.

The allocation basis is **orders placed**, not the cash-basis
revenue-bearing order count used for revenue (row 9). A refunded order still
consumed its AI tokens, so the cost it drove is real regardless of whether
the cash stayed.

## Query Results

**Total platform API cost (2026-05-19 to 2026-08-17):**
```sql
SELECT SUM(cost) AS total_cost, COUNT(*) AS call_count
FROM "ApiUsage"
WHERE timestamp >= '2026-05-19' AND timestamp <= '2026-08-17';
```
Result: $571.21 USD, 163,086 API calls

**Order counts by store (2026-05-19 to 2026-08-17):**
```sql
SELECT 
  o."storeId",
  cs.name,
  COUNT(*) as order_count
FROM "Order" o
LEFT JOIN "ShopifyStore" ss ON o."storeId" = ss.id
LEFT JOIN "ConnectedStore" cs ON cs.shop = ss."shopDomain"
WHERE o."createdAt" >= '2026-05-19' AND o."createdAt" <= '2026-08-17'
GROUP BY o."storeId", cs.name
ORDER BY order_count DESC;
```

Store mapping (ShopifyStore → ConnectedStore):
- cmobaoalm0001yiu7ieqhz4ka (whhsw6-ps.myshopify.com) → NOVA Cape Town: 269 orders
- cmq6ky85j0001tzm81xqmvknx (pdmnf1-c0.myshopify.com) → Sloane & Pearl: 214 orders
- cmshw289t0006n9m89hocelon → Perla Madrid: 1 order

Total: 484 orders across three stores in the window.

**Note on NOVA Cape Town's status:** unchanged from the prior snapshot —
although retired 2026-06-15, it continues to have real order volume through
the compliance window, so it stays in the pro-rata split rather than being
treated as inactive.

**Note on Perla Madrid:** a newly-observed store on the platform as of this
regenerate, with negligible order volume (1) in the window. Included for
accuracy rather than omitted; its effect on Sloane & Pearl's allocated share
is minor (dividing by 484 instead of 483 stores' worth of orders).

## Monthly split for `COGS_TOKENS_JSON`

The $252.56 USD figure above is a single hackathon-window total, broken out
per calendar month by Sloane & Pearl's OWN monthly order counts (not the
platform-wide three-way split above, which is a different, store-level
pro-rata used only to derive the $252.56 total in the first place):

- Sloane & Pearl orders by month: June 32, July 149, August 33 (214 total —
  matches the total used above).
- June: 32/214 × $252.56 = **$37.77**
- July: 149/214 × $252.56 = **$175.85**
- August: 33/214 × $252.56 = **$38.95**
- May: **$0** — Sloane & Pearl placed zero orders in May, same basis as
  before.
- Sum check: $37.77 + $175.85 + $38.95 = $252.57 (Sloane & Pearl's exact
  allocated share before this monthly split, 1¢ rounding).

## Re-running

This is intended as the **final** regenerate before submission — the
platform's total `ApiUsage` cost and each store's order counts will keep
moving in general, but Sloane & Pearl's own order count is expected to hold
steady given its current paused state. Re-derive only if something material
changes before Aug 17.
