# Meta ad auto-kill — real, autonomous campaign pauses (Sloane & Pearl)

**Mechanism:** a Railway cron (`cron-ticker-auto-kill`, every 5 minutes)
evaluates every live Sloane & Pearl Meta campaign against spend/conversion
thresholds and, when a rule fires, calls the Meta Graph API directly to set
`status: PAUSED` on the campaign — **no human approval between evaluation
and the pause**. Source: `src/lib/meta-ads/auto-kill.ts`.

Source table: `MetaAutoKillLog`. Query:
```sql
SELECT "campaignName", rule, spend, "metricName", "metricValue",
       "thresholdDesc", "createdAt"
FROM "MetaAutoKillLog"
WHERE "accountId" = 'act_1115325060591696'
ORDER BY "createdAt" DESC LIMIT 8;
```

## Real kills, most recent first

| Campaign | Rule | Spend | Threshold | When (UTC) |
|---|---|---|---|---|
| 4/8 - CBO - [Sloane & Pearl] - Cristina \| Tummy-Control Midi Dress | atc | $20.35 | $20.35 spend, 0 ATC (shopify) | 2026-08-04 14:30:44 |
| 4/8 - CBO - [Sloane & Pearl] - Saylor | collection_sale | $45.23 | $45.23 spend ≥ $44.55 (55% of $81/day budget), 0 purchases | 2026-08-04 13:54:20 |
| 4/8 - CBO - [Sloane & Pearl] - Shirts & Tops | collection_sale | $45.26 | $45.26 spend ≥ $44.55 (55% of $81/day budget), 0 purchases | 2026-08-04 13:01:05 |
| 2/8 - CBO - [Sloane & Pearl] - Chic Summer Sandals | collection_sale | $44.85 | $44.85 spend ≥ $44.55 (55% of $81/day budget), 0 purchases | 2026-08-02 17:46:29 |
| 1/8 - CBO - [Sloane & Pearl] - Midi & Maxi Dress Sale | collection_sale | $74.46 | $74.46 spend ≥ $74.25 (55% of $135/day budget), 0 purchases | 2026-08-01 16:01:23 |
| 1/8 - CBO - [Sloane & Pearl] - Matching Sets | collection_sale | $60.08 | $60.08 spend, 0 purchases | 2026-07-31 17:46:20 |
| 29/7 - CBO - [Sloane & Pearl] - Carolann \| Orthopedic Braid-Strap Sandals | atc | $20.67 | $20.67 spend, 0 ATC (shopify) | 2026-07-29 18:45:06 |
| 29/7 - ABO - [Sloane & Pearl] - Matching Sets › Hot Wedding Guest No Outfit | abo_cpv | $23.13 | $23.13 spend, 0 visitors | 2026-07-29 14:46:14 |

This directly explains the "95 auto-killed of 127 launched campaigns" figure
already cited in `narrative/ai-native-operations.md` — these are eight of
those real events, with real dollar amounts and Meta-attributed reasons, not
a summary statistic standing alone.
