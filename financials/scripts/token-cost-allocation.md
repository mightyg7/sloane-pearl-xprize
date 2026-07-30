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
All figures in USD.

- Total platform `ApiUsage` cost, 2026-05-19–2026-08-17: $504.50 USD
- Sloane & Pearl orders in window: 159
- NOVA Cape Town orders in window: 269
- Sloane & Pearl's allocated share: 159 / (159 + 269) × $504.50 USD = $187.42 USD

This allocated figure feeds `COGS_TOKENS_JSON` / `SGA_TOKENS_JSON` in Task 6's
`fill-pnl-template.ts` run (split across COGS and SG&A per the official
template's structure — production-related AI calls, e.g. import/catalog
enhancement, are COGS; marketing-related calls, e.g. ad-creative generation,
are SG&A. If the split between the two isn't separable from
`ApiUsage.purpose` strings, disclose the combined total under COGS only
rather than inventing a precise split the data doesn't support).

## Query Results

**Total platform API cost (2026-05-19 to 2026-08-17):**
```sql
SELECT SUM(cost) AS total_cost, COUNT(*) AS call_count
FROM "ApiUsage"
WHERE timestamp >= '2026-05-19' AND timestamp <= '2026-08-17';
```
Result: $504.50 USD, 143,913 API calls

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
- cmq6ky85j0001tzm81xqmvknx (pdmnf1-c0.myshopify.com) → Sloane & Pearl: 159 orders
- cmobaoalm0001yiu7ieqhz4ka (whhsw6-ps.myshopify.com) → NOVA Cape Town: 269 orders

Total: 428 orders across both stores in the window.

**Note on NOVA Cape Town's status:** Although NOVA Cape Town was marked as retired on 2026-06-15, it continues to have orders after that date up through 2026-08-17 (269 total in-window orders). Therefore, the allocation uses the actual pro-rata split by order count rather than treating NOVA as inactive for this period.
