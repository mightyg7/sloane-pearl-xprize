# Airwallex autonomous treasury top-up — real, settled money (Sloane & Pearl)

**Mechanism:** a worker interval tick forecasts Sloane & Pearl's dedicated
Meta ad account's (`act_1115325060591696`) burn rate against its remaining
balance and, when projected runway drops below threshold, autonomously
initiates a real Airwallex bank transfer to top it up — **no human approval
per transfer**, bounded by per-tick/day/week caps. Source:
`src/lib/airwallex/topup-tick.ts`, `topup-executor.ts`.

Source tables: `AirwallexTopupFire` joined to `AirwallexPayout` (for real
settlement confirmation, not just a fire decision). Query:
```sql
SELECT amount, currency, decision, "firedAt", p.status AS payout_status
FROM "AirwallexTopupFire" f
LEFT JOIN "AirwallexPayout" p ON p.id = f."payoutId"
WHERE f."metaAdAccountId" = 'act_1115325060591696' AND f.decision = 'FIRED'
ORDER BY f."firedAt" DESC LIMIT 10;
```

## Real, settled transfers, most recent first

| Amount | Currency | Fired at (UTC) | Payout status |
|---|---|---|---|
| 550.00 | EUR | 2026-08-03 15:34:09 | settled |
| 6,000.00 | HKD | 2026-08-02 08:40:47 | settled |
| 11,000.00 | HKD | 2026-07-30 14:13:23 | settled |
| 1,000.00 | USD | 2026-07-29 23:12:25 | settled |
| 7,800.00 | HKD | 2026-07-27 14:11:21 | settled |
| 1,500.00 | USD | 2026-07-25 12:52:58 | settled |
| 3,700.00 | HKD | 2026-07-12 22:21:59 | settled |
| 10,000.00 | HKD | 2026-07-09 14:47:55 | settled |
| 300.00 | HKD | 2026-07-09 13:29:27 | settled |
| 10,000.00 | HKD | 2026-07-05 21:20:12 | settled |

Every row above has `payout_status = settled`, meaning the money genuinely
moved — this table only records a `FIRED` decision, but the join to
`AirwallexPayout` confirms it wasn't just an intent that stalled. (A parallel
`SKIPPED`/`STUCK` population also exists in this table, including a real
2026-07-25 HKD-balance-shortfall incident — the system fails loudly rather
than silently when it can't fund a top-up, which is itself evidence this
isn't a rubber-stamp loop.)
