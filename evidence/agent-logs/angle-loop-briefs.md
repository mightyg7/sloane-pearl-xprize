# Angle Loop — nightly AI ad-strategy briefs (real, Sloane & Pearl-scoped)

**Mechanism:** every night at 04:30 (Europe/Amsterdam), a scheduled job reads
the last 30 days of Sloane & Pearl's real Meta ad performance and Claude
writes a new strategy brief — which creative "angles" to weight up, which to
avoid — with **no human review before it takes effect**. The brief is
consumed directly by the live ad-copy generation path
(`generatePainPoints()` in `src/lib/meta-ads/pain-points.ts`, called from the
real campaign-launch flow in `src/lib/meta-ads/abo.ts`), so it steers real,
launched ad copy the same night it's written.

**Scope confirmation:** `AngleBrief.accountId` is a Meta ad-account id, not a
generic store id. As of this export, **every account-scoped brief in the
production database belongs to Sloane & Pearl's account
(`act_1115325060591696`)** — the nightly job is wired to
`process.env.META_AD_ACCOUNT_ID` on the worker, which is set to this exact
account. No other store currently has a single account-scoped brief.

Source table: `AngleBrief`. Query:
```sql
SELECT version, rationale, "createdAt" FROM "AngleBrief"
WHERE "accountId" = 'act_1115325060591696'
ORDER BY version DESC LIMIT 5;
```

## Real briefs, most recent first

**v34 — 2026-08-12 02:31:10**
> Two proven winners — Farewell Sale and New Arrival — drive strong ROAS
> (1.84–1.86) and steady purchase volume, so they deserve the heaviest
> weights. Relatability adds profitable incremental reach. Avoid angles
> where €400+ produced zero sales (Scarcity, First Impression) and pooled
> niche creatives that click but never convert. Keeping total at 0.75
> preserves room to learn.

**v33 — 2026-08-11 02:30:58**
> Revenue is concentrated in farewell-sale (ROAS 1.86) and new-arrival
> (ROAS 1.76), with relatability punching above its weight on small spend.
> Stopping underperformers frees budget: scarcity, first-impression, and
> birthday-gift all burn cash without sales. Reserved 0.2 lets exploration
> test niche angles.

**v32 — 2026-08-10 02:31:04**
> Two angles drive nearly all profit: farewell-sale and new-arrival lead on
> ROAS, social-proof carries volume. Relatability punches above its spend.
> Avoid scarcity and first-impression—both burned €1k+ for ~0.2 ROAS. Total
> weighted 0.60, leaves 0.20 headroom.

**v31 — 2026-08-09 02:31:03**
> Top performers are clear: farewell-sale, social-proof, new-arrival, and
> relatability all deliver ROAS above 1.3 with meaningful volume. Avoid
> angles where CTR is healthy but purchases collapse — scarcity and
> first-impression burn budget without converting. Pooled niche angles with
> zero conversions add no signal, so deprioritize them and concentrate new
> generation on proven money-makers.

**v30 — 2026-08-07 02:32:20**
> Store-level data shows three clear winners — new-arrival (1.74 ROAS),
> social-proof (1.32), and relatability (1.42). Farewell-sale and
> feature-benefit underperform despite high spend. Pooled angles with zero
> purchases get avoided. Biasing 75% of the weight budget toward proven
> winners, leaving 20% for exploration.

Note the reasoning changes night to night as real spend and ROAS shift
(farewell-sale and new-arrival trade rank, scarcity gets dropped) — this is
a live model re-deriving strategy from fresh data every 24 hours, not a
static rule fired repeatedly.
