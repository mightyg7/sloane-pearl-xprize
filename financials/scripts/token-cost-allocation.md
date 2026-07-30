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
All figures in USD, current as of 2026-07-30.

- Total platform `ApiUsage` cost, 2026-05-19–2026-08-17: $504.76 USD
- Sloane & Pearl orders in window: 160
- NOVA Cape Town orders in window: 269
- Sloane & Pearl's allocated share: 160 / (160 + 269) × $504.76 USD = $188.26 USD

This allocated figure feeds `COGS_TOKENS_JSON` in Task 6's
`fill-pnl-template.ts` run. The split between production-related AI calls
(e.g. import/catalog enhancement, which would be COGS) and marketing-related
ones (e.g. ad-creative generation, which would be SG&A) is **not** separable
from `ApiUsage.purpose` strings, so the combined total is disclosed under
**COGS Tokens only** (row 17) rather than inventing a precise split the data
doesn't support. `SGA_TOKENS_JSON` is intentionally left unset, leaving row 21
at $0/blank.

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
Result: $504.76 USD, 144,033 API calls

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
- cmq6ky85j0001tzm81xqmvknx (pdmnf1-c0.myshopify.com) → Sloane & Pearl: 160 orders
- cmobaoalm0001yiu7ieqhz4ka (whhsw6-ps.myshopify.com) → NOVA Cape Town: 269 orders

Total: 429 orders across both stores in the window.

**Note on NOVA Cape Town's status:** Although NOVA Cape Town was marked as retired on 2026-06-15, it continues to have orders after that date up through 2026-08-17 (269 total in-window orders). Therefore, the allocation uses the actual pro-rata split by order count rather than treating NOVA as inactive for this period.

## Monthly split for `COGS_TOKENS_JSON` (Task 6)

The $188.26 USD figure above is a single hackathon-window total; Task 6's
`fill-pnl-template.ts` needs it broken out per calendar month. That split
is computed once, by hand, from Sloane & Pearl's OWN monthly order counts
(not the platform-wide 160-vs-269 split above, which is a different,
store-level pro-rata used only to derive the $188.26 total in the first
place):

- Sloane & Pearl orders by month: June 32, July 128 (160 total — matches
  the total used above).
- June: 32/160 × $188.26 = **$37.65**
- July: 128/160 × $188.26 = **$150.61**
- May: **$0** — Sloane & Pearl placed zero orders in May, so it gets zero
  share under the same order-count basis, even though the compliance
  window opens May 19.
- Sum check: $37.65 + $150.61 = $188.26 exactly.

## Re-running

Both the platform `ApiUsage` total and both stores' order counts keep
growing, so this whole allocation is a snapshot. Re-derive it — and re-pass
`COGS_TOKENS_JSON` — close to the deadline, alongside the rest of
`financials/pnl-methodology.md`'s "Regenerating" checklist.
