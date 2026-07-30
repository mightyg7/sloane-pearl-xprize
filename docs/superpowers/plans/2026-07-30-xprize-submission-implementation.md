# Sloane & Pearl XPRIZE Submission Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `sloane-pearl-xprize` repo into a complete Build with Gemini XPRIZE submission package for Sloane & Pearl — disclosure docs, financial evidence scripts + filled P&L, narrative, video script, and evidence/testing-access docs — per the design at `docs/superpowers/specs/2026-07-30-xprize-submission-design.md`.

**Architecture:** A standalone repo with no dependency on the `fashion-autopilot` codebase. Financial scripts talk to the same Postgres database directly via the `pg` package (no Prisma client, no shared node_modules) and to the Meta Graph API directly via `fetch`. Everything else is markdown. Real customer PII never gets committed to this repo — it goes straight into the Devpost submission form at submission time, not into git history.

**Tech Stack:** Node.js + TypeScript (via `tsx`), `pg` for Postgres, native `fetch` for Meta Graph API v21.0. No framework, no test runner — verification is "run the script, check the output against known facts."

## Global Constraints

- All monetary figures in USD.
- P&L is cash-basis accounting (cash received = cash reported), per the workshop-clarified rules.
- Related-party revenue (team/family/pre-existing-customer-relationship sales) is always reported separately from independent revenue, never merged into the total.
- Any cost line that traces to pre-existing (pre-2026-05-19) shared infrastructure must be explicitly disclosed, not silently absorbed.
- AI token cost allocation across stores is a disclosed estimate with a stated methodology — never presented as precise, exact accounting.
- **Never commit real customer PII (name, email, phone) to this git repository.** Customer evidence for the submission form is generated fresh near submission time and pasted directly into the Devpost form — the repo only holds the selection methodology and aggregate/anonymized numbers.
- Sloane & Pearl = Shopify store `pdmnf1-c0.myshopify.com`, Meta ad account `act_1115325060591696`. NOVA Cape Town = `whhsw6-ps.myshopify.com` (fashion-autopilot's other, unrelated store — used only for the related-party overlap check).
- Database access: scripts read `DATABASE_URL` from the environment. Use the **public** Railway proxy URL (`tramway.proxy.rlwy.net:27107`), not the internal `Postgres.railway.internal` hostname, which is unreachable from outside Railway's network. Get the password from `railway variables --service fashion-autopilot --kv` (run from the fashion-autopilot checkout) — never hardcode it or commit it.
- Meta API access: scripts read `META_ACCESS_TOKEN` from the environment.

---

### Task 1: Repo scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Produces: an installable Node/TS project (`npm install` works, `npx tsx` runs `.ts` files) that every later task's scripts depend on.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "sloane-pearl-xprize",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Build with Gemini XPRIZE submission package for Sloane & Pearl",
  "scripts": {
    "revenue": "tsx financials/scripts/revenue-by-month.ts",
    "overlap": "tsx financials/scripts/customer-overlap-check.ts",
    "ad-spend": "tsx financials/scripts/ad-spend-by-month.ts"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/pg": "^8.11.10",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  },
  "dependencies": {
    "pg": "^8.13.1"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["financials/scripts/**/*.ts"]
}
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
.env
.env.local
*.local.csv
evidence/customer-evidence-export*.md
```

- [ ] **Step 4: Write `README.md`**

```markdown
# Sloane & Pearl — Build with Gemini XPRIZE Submission

This repo is the **submission package** for Sloane & Pearl (sloaneandpearl.com)'s
entry to the Build with Gemini XPRIZE hackathon (Category: Entrepreneurship &
Job Creation). It is not a copy of the product code — the actual code that runs
Sloane & Pearl (customer-service agent, ad-creative pipeline, import pipeline)
lives in the private `fashion-autopilot` repo, shared separately and privately
with judges.

Full context: `docs/superpowers/specs/2026-07-30-xprize-submission-design.md`.

## Layout

- `disclosure/` — compliance narratives (pre-existing platform, related-party
  revenue, pre-existing resources, labor attestation).
- `narrative/` — the 500–1000 word submission writeup and the AI-native-operations
  evidence enumeration.
- `financials/` — the filled P&L and the scripts that produced its numbers.
- `evidence/` — testing-access plan, customer-evidence methodology, agent logs.
- `video/` — the 3-minute demo video script.
- `gemini-integration/` — write-up of the Gemini/Vertex AI integration (pending
  the follow-on build in `fashion-autopilot`).

## Running the financial scripts

```bash
npm install
export DATABASE_URL="postgresql://postgres:<password>@tramway.proxy.rlwy.net:27107/fashion_autopilot"
export META_ACCESS_TOKEN="<meta marketing api token>"
npm run revenue
npm run overlap
npm run ad-spend
```

Get `DATABASE_URL`'s password from `railway variables --service fashion-autopilot --kv`
in the `fashion-autopilot` checkout — never commit it. Get `META_ACCESS_TOKEN`
the same way (`META_ACCESS_TOKEN` var on the same service).
```

- [ ] **Step 5: Install and verify**

Run: `npm install`
Expected: installs cleanly, creates `node_modules/` and `package-lock.json`, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore README.md
git commit -m "chore: scaffold repo (package.json, tsconfig, README)"
```

---

### Task 2: DB helper + `revenue-by-month.ts`

**Files:**
- Create: `financials/scripts/lib/db.ts`
- Create: `financials/scripts/revenue-by-month.ts`

**Interfaces:**
- Consumes: nothing (first script task).
- Produces: `withDb<T>(fn: (client: Client) => Promise<T>): Promise<T>` and `STORES.sloanePearl` / `STORES.novaCapeTown` domain constants from `lib/db.ts`, reused by every later script task.

- [ ] **Step 1: Write `financials/scripts/lib/db.ts`**

```typescript
import { Client } from "pg";

export const STORES = {
  sloanePearl: "pdmnf1-c0.myshopify.com",
  novaCapeTown: "whhsw6-ps.myshopify.com",
} as const;

export async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required — use the public Railway proxy URL " +
        "(tramway.proxy.rlwy.net:27107), not the internal Postgres.railway.internal host."
    );
  }
  const client = new Client({ connectionString });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function storeIdFor(client: Client, shopDomain: string): Promise<string> {
  const res = await client.query<{ id: string }>(
    `SELECT id FROM "ShopifyStore" WHERE "shopDomain" = $1`,
    [shopDomain]
  );
  if (res.rows.length === 0) {
    throw new Error(`No ShopifyStore row found for shopDomain=${shopDomain}`);
  }
  return res.rows[0].id;
}
```

- [ ] **Step 2: Write `financials/scripts/revenue-by-month.ts`**

```typescript
import { withDb, storeIdFor, STORES } from "./lib/db.js";

type MonthTotal = { count: number; revenueUsd: number };

async function main() {
  await withDb(async (client) => {
    const storeId = await storeIdFor(client, STORES.sloanePearl);

    const res = await client.query<{
      createdAt: Date;
      totalPriceUsd: string;
      financialStatus: string;
    }>(
      `SELECT "createdAt", "totalPriceUsd", "financialStatus"
       FROM "Order"
       WHERE "storeId" = $1 AND "financialStatus" != 'voided'
       ORDER BY "createdAt" ASC`,
      [storeId]
    );

    const byMonth: Record<string, MonthTotal> = {};
    for (const row of res.rows) {
      const month = row.createdAt.toISOString().slice(0, 7);
      byMonth[month] ??= { count: 0, revenueUsd: 0 };
      byMonth[month].count += 1;
      byMonth[month].revenueUsd += Number(row.totalPriceUsd);
    }

    console.log(`Sloane & Pearl (storeId=${storeId}) revenue by month:`);
    let totalCount = 0;
    let totalRevenue = 0;
    for (const [month, data] of Object.entries(byMonth).sort()) {
      console.log(`  ${month}: ${data.count} orders, $${data.revenueUsd.toFixed(2)} USD`);
      totalCount += data.count;
      totalRevenue += data.revenueUsd;
    }
    console.log(`  TOTAL: ${totalCount} orders, $${totalRevenue.toFixed(2)} USD`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Run it and verify against known facts**

Run: `DATABASE_URL="<public proxy url>" npx tsx financials/scripts/revenue-by-month.ts`
Expected: shows `2026-06` with at least 32 orders / $2076.39, and `2026-07` with at least 127 orders / $11796.56 (order volume will have grown since 2026-07-30 — more orders and higher totals than these floors is expected and correct, fewer would indicate a bug).

- [ ] **Step 4: Commit**

```bash
git add financials/scripts/lib/db.ts financials/scripts/revenue-by-month.ts
git commit -m "feat: add revenue-by-month script for Sloane & Pearl"
```

---

### Task 3: `customer-overlap-check.ts`

**Files:**
- Create: `financials/scripts/customer-overlap-check.ts`

**Interfaces:**
- Consumes: `withDb`, `storeIdFor`, `STORES` from Task 2's `lib/db.ts`.
- Produces: console output listing overlap count and unique-customer count, consumed by Task 8 (`disclosure/related-party-revenue.md`).

- [ ] **Step 1: Write `financials/scripts/customer-overlap-check.ts`**

```typescript
import { withDb, storeIdFor, STORES } from "./lib/db.js";

async function main() {
  await withDb(async (client) => {
    const sloaneId = await storeIdFor(client, STORES.sloanePearl);
    const novaId = await storeIdFor(client, STORES.novaCapeTown);

    const sloaneRes = await client.query<{
      customerEmail: string | null;
      customerPhone: string | null;
    }>(`SELECT "customerEmail", "customerPhone" FROM "Order" WHERE "storeId" = $1`, [
      sloaneId,
    ]);
    const novaRes = await client.query<{
      customerEmail: string | null;
      customerPhone: string | null;
    }>(`SELECT "customerEmail", "customerPhone" FROM "Order" WHERE "storeId" = $1`, [
      novaId,
    ]);

    const novaEmails = new Set(
      novaRes.rows.map((r) => r.customerEmail?.toLowerCase()).filter(Boolean)
    );
    const novaPhones = new Set(novaRes.rows.map((r) => r.customerPhone).filter(Boolean));

    const overlapByEmail = sloaneRes.rows.filter(
      (r) => r.customerEmail && novaEmails.has(r.customerEmail.toLowerCase())
    );
    const overlapByPhone = sloaneRes.rows.filter(
      (r) => r.customerPhone && novaPhones.has(r.customerPhone)
    );

    const uniqueEmails = new Set(
      sloaneRes.rows.map((r) => r.customerEmail?.toLowerCase()).filter(Boolean)
    );

    console.log(`Sloane & Pearl total orders: ${sloaneRes.rows.length}`);
    console.log(`Sloane & Pearl unique customer emails: ${uniqueEmails.size}`);
    console.log(`Overlap with NOVA Cape Town by email: ${overlapByEmail.length}`);
    console.log(`Overlap with NOVA Cape Town by phone: ${overlapByPhone.length}`);
    if (overlapByEmail.length > 0 || overlapByPhone.length > 0) {
      console.log(
        "WARNING: overlap found — these orders must be flagged as related-party " +
          "revenue in disclosure/related-party-revenue.md, not counted as independent revenue."
      );
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run it and verify**

Run: `DATABASE_URL="<public proxy url>" npx tsx financials/scripts/customer-overlap-check.ts`
Expected: `Overlap with NOVA Cape Town by email: 0` and `by phone: 0` (matches the check already run manually during design). If either is non-zero, stop and flag it — the related-party disclosure in Task 8 depends on this being accurate, not assumed.

- [ ] **Step 3: Commit**

```bash
git add financials/scripts/customer-overlap-check.ts
git commit -m "feat: add customer-overlap-check script"
```

---

### Task 4: `ad-spend-by-month.ts`

**Files:**
- Create: `financials/scripts/ad-spend-by-month.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (talks to Meta Graph API directly, not the DB).
- Produces: console output of monthly ad spend for Sloane & Pearl, consumed by Task 6 (the P&L).

- [ ] **Step 1: Write `financials/scripts/ad-spend-by-month.ts`**

```typescript
const SLOANE_PEARL_AD_ACCOUNT = "act_1115325060591696";
const GRAPH_API_VERSION = "v21.0";

type InsightRow = {
  spend?: string;
  date_start: string;
  date_stop: string;
};

async function main() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error("META_ACCESS_TOKEN is required");
  }

  const timeRange = JSON.stringify({ since: "2026-05-19", until: "2026-08-17" });
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${SLOANE_PEARL_AD_ACCOUNT}/insights` +
    `?time_range=${encodeURIComponent(timeRange)}` +
    `&time_increment=monthly` +
    `&fields=spend` +
    `&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Graph API error ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { data: InsightRow[] };

  console.log(`Sloane & Pearl (${SLOANE_PEARL_AD_ACCOUNT}) ad spend by month:`);
  let total = 0;
  for (const row of json.data) {
    const spend = Number(row.spend ?? 0);
    total += spend;
    console.log(`  ${row.date_start.slice(0, 7)}: $${spend.toFixed(2)} USD`);
  }
  console.log(`  TOTAL: $${total.toFixed(2)} USD`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run it and verify**

Run: `META_ACCESS_TOKEN="<token>" npx tsx financials/scripts/ad-spend-by-month.ts`
Expected: prints monthly spend rows starting from whenever the first campaign launched (per the design doc, campaigns for Sloane & Pearl started appearing mid-July 2026) through the current month, all values non-negative and non-zero for months with active campaigns. If the API returns a permissions/token error, get a fresh `META_ACCESS_TOKEN` from `railway variables --service fashion-autopilot --kv` rather than debugging the script — the account ID and query shape are already verified against real campaign data.

- [ ] **Step 3: Commit**

```bash
git add financials/scripts/ad-spend-by-month.ts
git commit -m "feat: add ad-spend-by-month script for Sloane & Pearl's Meta ad account"
```

---

### Task 5: `financials/scripts/token-cost-allocation.md`

**Files:**
- Create: `financials/scripts/token-cost-allocation.md`

**Interfaces:**
- Consumes: order counts from Task 2/3 (Sloane & Pearl vs. NOVA Cape Town order share).
- Produces: an allocation ratio and total figure consumed by Task 6 (the P&L).

- [ ] **Step 1: Query total platform AI spend for the hackathon window**

Run this ad-hoc query (via `psql "$DATABASE_URL"` or a throwaway script using the `withDb` helper from Task 2) to get the total:

```sql
SELECT SUM(cost) AS total_cost, COUNT(*) AS call_count
FROM "ApiUsage"
WHERE timestamp >= '2026-05-19' AND timestamp <= '2026-08-17';
```

- [ ] **Step 2: Determine the active-store divisor for the same window**

`ApiUsage` has no `storeId` (confirmed during design — see the design doc §4), so this cannot be resolved by direct attribution. Use order count in the same window as the allocation basis: query orders for both stores in the `2026-05-19` to `2026-08-17` range (reuse `storeIdFor` + a date-filtered `Order` query, same pattern as Task 2/3) and compute Sloane & Pearl's share of combined orders. If NOVA Cape Town has zero orders in this specific window (it may already be retired — check `ShopifyStore.isActive` / any retirement marker before assuming), Sloane & Pearl's share is 100% of store-attributable spend for the window, not the lifetime 159/(159+411) split.

- [ ] **Step 2: Write `financials/scripts/token-cost-allocation.md`**

```markdown
# AI Token Cost Allocation Methodology

`ApiUsage` (the table tracking Anthropic/Gemini/OpenAI API spend) has no
per-store attribution — no `storeId` column, only a free-text `purpose` field
that doesn't reliably encode which store a call was for. This is a platform-wide
table shared across every store fashion-autopilot operates, not just
Sloane & Pearl.

**Methodology:** rather than claim precision the data doesn't support, we
allocate total platform AI spend for the hackathon window (2026-05-19 to
2026-08-17) pro-rata by each active store's share of orders placed in that same
window. This is a disclosed estimate, not exact per-call accounting.

- Total platform `ApiUsage` cost, 2026-05-19–2026-08-17: $[FILL IN FROM STEP 1 QUERY]
- Sloane & Pearl orders in window: [FILL IN FROM STEP 2 QUERY]
- NOVA Cape Town orders in window: [FILL IN FROM STEP 2 QUERY]
- Sloane & Pearl's allocated share: [Sloane orders] / [Sloane + NOVA orders] × total cost = $[COMPUTED]

This allocated figure feeds the "Tokens used" line in `financials/pnl-sloane-pearl.md`
(split across COGS and SG&A per the workshop's P&L structure — production-related
AI calls, e.g. import/catalog enhancement, are COGS; marketing-related calls,
e.g. ad-creative generation, are SG&A. If the split between the two isn't
separable from `ApiUsage.purpose` strings, disclose the combined total under
COGS and note the SG&A portion is included there rather than inventing a
precise split the data doesn't support).
```

- [ ] **Step 3: Fill in the actual numbers from the queries in Step 1 and 2**

Replace every `[FILL IN...]` bracket with the real query results. Do not leave any bracket in the committed file — if a number genuinely cannot be determined yet, write the actual reason (e.g. "pending META token refresh") as prose, not a bracket placeholder.

- [ ] **Step 4: Commit**

```bash
git add financials/scripts/token-cost-allocation.md
git commit -m "docs: AI token cost allocation methodology and figures"
```

---

### Task 6: `financials/pnl-sloane-pearl.md`

**Files:**
- Create: `financials/pnl-sloane-pearl.md`

**Interfaces:**
- Consumes: output of Tasks 2 (revenue), 3 (related-party flags), 4 (ad spend), 5 (token allocation).
- Produces: the filled P&L referenced by the official Devpost submission form's revenue/expense fields.

- [ ] **Step 1: Run all three financial scripts fresh and record their output**

```bash
DATABASE_URL="<public proxy url>" npx tsx financials/scripts/revenue-by-month.ts
DATABASE_URL="<public proxy url>" npx tsx financials/scripts/customer-overlap-check.ts
META_ACCESS_TOKEN="<token>" npx tsx financials/scripts/ad-spend-by-month.ts
```

- [ ] **Step 2: Write `financials/pnl-sloane-pearl.md`**

```markdown
# Sloane & Pearl — P&L (Cash Basis)

Structure per the official Build with Gemini XPRIZE P&L template and the
2026-07-30 business-viability workshop's walkthrough. Figures below are from
the scripts in `financials/scripts/`, run on [DATE OF LAST RUN].

## Total Revenue (independent sales only — arms-length third-party customers)

| Month | Orders | Revenue (USD) |
|---|---|---|
| 2026-06 | [from revenue-by-month.ts] | $[from revenue-by-month.ts] |
| 2026-07 | [from revenue-by-month.ts] | $[from revenue-by-month.ts] |
| 2026-08 | [re-run close to submission] | $[re-run close to submission] |
| **Total** | | $[sum] |

## Related-Party Revenue (reported separately, per `disclosure/related-party-revenue.md`)

$0 — `customer-overlap-check.ts` found zero overlap with NOVA Cape Town (email
and phone), and the operator confirmed no known friends/family/team purchases.
Re-verified as of [DATE].

## Cost of Goods Sold (production costs)

| Line | Amount (USD) | Notes |
|---|---|---|
| Personnel | $[pending — see disclosure/labor-attestation.md] | Blocked on operator input: VA pay figure and name-disclosure preference |
| Software subscriptions | $0 | No incremental cost — runs on existing shared Railway hosting, which exists regardless of Sloane & Pearl. See `disclosure/pre-existing-resources.md`. |
| Tokens used | $[from token-cost-allocation.md] | Production-side share of the allocated AI spend |
| **Total COGS** | $[sum] | |

## SG&A (go-to-market costs)

| Line | Amount (USD) | Notes |
|---|---|---|
| Personnel | — | (VA is CS, categorized under COGS above, not SG&A — CS is a production/service cost, not marketing) |
| Software subscriptions | $0 | Same reasoning as COGS above — no incremental cost |
| Tokens used | $[from token-cost-allocation.md] | Marketing/ad-creative share of the allocated AI spend |
| Ad spend (Meta) | $[from ad-spend-by-month.ts] | Fully attributable — Sloane & Pearl's own dedicated ad account |
| **Total SG&A** | $[sum] | |

## Other Expenses

$0 unless identified otherwise — no rent, travel, or other categories apply to
this business.

## Net (Revenue − COGS − SG&A − Other Expenses)

$[computed]

---

**Pre-existing resources note:** per the rule requiring disclosure of any cost
line tied to pre-existing (pre-2026-05-19) infrastructure, see
`disclosure/pre-existing-resources.md` for what's shared vs. new.
```

- [ ] **Step 3: Fill in every bracketed value from the script outputs and the other disclosure docs**

No bracket should remain in the committed file. Where a figure is genuinely blocked (labor personnel cost), write the actual blocking reason in prose (matching Task 5's rule), not an empty bracket.

- [ ] **Step 4: Commit**

```bash
git add financials/pnl-sloane-pearl.md
git commit -m "docs: fill P&L with current script-sourced figures"
```

---

### Task 7: `disclosure/pre-existing-platform.md`

**Files:**
- Create: `disclosure/pre-existing-platform.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the disclosure text referenced by the submission form's "New Projects Only" explanation field, and by Task 12's narrative.

- [ ] **Step 1: Write `disclosure/pre-existing-platform.md`**

```markdown
# Pre-Existing Platform Disclosure

Per the "New Projects Only" rule: *"If pre-existing generic templates,
frameworks, boilerplates, or code snippets were used to build the final
project, Entrants must explain how their Project utilized pre-existing work."*
And per the official FAQ: *"'Newly created' means that the business you are
building (that operates with AI) should be newly created after the start of
the Submission Period... You may reuse pre-existing generic templates,
frameworks, boilerplates, or code snippets, but you must clearly explain how
your project utilizes any pre-existing work."*

## What's pre-existing

`fashion-autopilot` is an already-operating AI-agent e-commerce platform,
built and running before 2026-05-19. It provides the shared infrastructure any
new brand launched on it inherits: product import pipeline, ad-creative
generation pipeline, customer-service agent framework, order/fulfillment
tracking, financial operations tooling, and hosting (Railway).

## What's new

Sloane & Pearl (sloaneandpearl.com) is a distinct business created after the
cutoff:

- Shopify store `pdmnf1-c0.myshopify.com`, created 2026-06-03, first live
  orders 2026-06-09.
- Its own catalog, branding, and domain — not a feature or menu addition to
  any pre-existing store. Per the FAQ: *"a restaurant can't release a new menu
  item, and an app can't release a new feature and be considered a new
  business."* Sloane & Pearl is a wholly separate storefront, not a feature.
- Its own dedicated Meta ad account (`act_1115325060591696`) and ad campaigns,
  all launched after the cutoff.
- Its own customer base — zero overlap confirmed against fashion-autopilot's
  other store (NOVA Cape Town), see `disclosure/related-party-revenue.md`.
- Its own customer-service staffing — a VA engaged specifically for this
  operation starting 2026-07-16, see `disclosure/labor-attestation.md`.

## Why disclose rather than obscure

The framework being pre-existing is not a compliance risk when disclosed
honestly — it's exactly what the rule anticipates ("you may reuse... but you
must explain"). What matters is that the *business* — the brand, the
storefront, the customers, the revenue — is genuinely new.
```

- [ ] **Step 2: Commit**

```bash
git add disclosure/pre-existing-platform.md
git commit -m "docs: pre-existing platform disclosure"
```

---

### Task 8: `disclosure/related-party-revenue.md`

**Files:**
- Create: `disclosure/related-party-revenue.md`

**Interfaces:**
- Consumes: output of Task 3 (`customer-overlap-check.ts`).
- Produces: the disclosure text referenced by the submission form's related-party revenue field.

- [ ] **Step 1: Run the overlap check fresh**

Run: `DATABASE_URL="<public proxy url>" npx tsx financials/scripts/customer-overlap-check.ts`

- [ ] **Step 2: Write `disclosure/related-party-revenue.md`**

```markdown
# Related-Party Revenue Disclosure

Per the rules: *"Any revenue earned during the Hackathon period from team
members, family, related entities, or pre-existing customer relationships.
Reported separately in Total Revenue so judges can assess whether the
underlying business serves arms-length third-party customers."*

## Checks performed

1. **Cross-store customer overlap.** fashion-autopilot operates one other
   store, NOVA Cape Town. Checked every Sloane & Pearl order's customer email
   and phone against every NOVA Cape Town order's customer email and phone.
   Result (as of [DATE — from customer-overlap-check.ts output]): [N] orders
   overlap by email, [N] by phone, out of [TOTAL] Sloane & Pearl orders and
   [N] unique customers.

2. **Team/family/founder purchases.** Operator-confirmed (2026-07-30): no
   known purchases from friends, family, or team members. All traffic is
   ad-driven (Meta) or organic/cold.

## Disclosed related-party revenue

$[0 or the overlap amount, computed from the script output] — see
`financials/pnl-sloane-pearl.md` for how this is reflected (reported
separately from Total Revenue, not merged in).

## Re-verification

This check should be re-run close to the submission deadline (order volume
will have grown since [DATE]) — re-run
`financials/scripts/customer-overlap-check.ts` and update this doc's numbers
before final submission.
```

- [ ] **Step 3: Fill in the actual figures from the script run in Step 1**

- [ ] **Step 4: Commit**

```bash
git add disclosure/related-party-revenue.md
git commit -m "docs: related-party revenue disclosure"
```

---

### Task 9: `disclosure/pre-existing-resources.md`

**Files:**
- Create: `disclosure/pre-existing-resources.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: the explanation for why Task 6's P&L carries $0 "Software
  subscriptions" lines rather than an allocated estimate.

- [ ] **Step 1: Write `disclosure/pre-existing-resources.md`**

```markdown
# Pre-Existing Resources Disclosure

Per the rule: *"if any expenses correspond to the use of resources that
existed prior to the hackathon, then you must explain whatever those
resources might be."*

Sloane & Pearl runs on shared fashion-autopilot infrastructure that predates
2026-05-19. None of these are Sloane & Pearl-exclusive costs — they're
platform overhead the business rides on, and (unlike ad spend or AI tokens,
which scale with usage and are allocated as real cost lines in
`financials/pnl-sloane-pearl.md`) they don't get an invented dollar estimate,
because they're fixed costs that exist regardless of whether Sloane & Pearl
specifically is running:

- **Hosting** — Railway (web + worker services), shared across every store on
  the platform. Adding a new store doesn't add incremental hosting spend.
- **Proxy infrastructure** — per-store stable egress proxies used for Shopify
  Admin API access and browser automation (isolation requirement, not
  Sloane & Pearl-specific spend).
- **LLM API keys** — Anthropic, OpenAI, and (once wired in, see
  `gemini-integration/write-up.md`) Gemini/Vertex AI credentials are
  account-level, shared across the platform, not provisioned per store. Unlike
  hosting, the *usage* this generates does scale and is allocated as a real
  cost — see `financials/scripts/token-cost-allocation.md`.
- **Operator/founder time** — platform development and store operations time
  is not exclusively Sloane & Pearl's; only the VA's time (see
  `disclosure/labor-attestation.md`) is store-specific enough to itemize as a
  personnel cost.

None of this is disclosed to inflate the case for viability — it's disclosed
because the rule requires it. Sloane & Pearl's own attributable costs (ad
spend, allocated AI tokens, VA labor) are what actually appear as non-zero
line items in `financials/pnl-sloane-pearl.md`.
```

- [ ] **Step 2: Commit**

```bash
git add disclosure/pre-existing-resources.md
git commit -m "docs: pre-existing resources disclosure"
```

---

### Task 10: `disclosure/labor-attestation.md`

**Files:**
- Create: `disclosure/labor-attestation.md`

**Interfaces:**
- Consumes: nothing new (uses facts already confirmed in the design doc §1).
- Produces: the attestation text referenced by Task 6's P&L personnel line — currently blocked on two operator inputs.

- [ ] **Step 1: Write `disclosure/labor-attestation.md` with everything currently known**

```markdown
# Labor Attestation

Per the official FAQ: *"If you are using employees from an existing business
entity, you must (1) attest that the work produced by the employees did not
begin prior to the start of the hackathon period and (2) outline the expenses
associated with paying the employees to work on the Project during the
hackathon period."*

## Who this applies to

A customer-service contractor (VA, hired via onlinejobs.ph) handles
Sloane & Pearl's CS tickets. She also handles NOVA Cape Town's tickets, so her
time and pay are not exclusive to Sloane & Pearl.

## Attestation: work did not begin before 2026-05-19

**Confirmed clean.** Timeline, reconstructed from the hiring conversation:

- 2026-06-23: initial outreach / role posting.
- 2026-06-24: interviewed. Explicitly **not hired** at this point — the
  candidate was told the role was filled by someone else (2026-06-25 message:
  "we've decided to move forward with another candidate").
- 2026-07-16: re-approached ("are you still available for a small task?"),
  onboarded the same day, first logged work that day (EOD report: "Answered 8
  customer support tickets for Sloane & Pearl").

Actual engagement start: **2026-07-16**, well after the 2026-05-19 cutoff.
This is well-documented (dated chat log) — the initial June interview did not
result in an engagement, so there is no ambiguity about pre-cutoff work.

## Pay disclosure — PENDING

Not yet resolved, blocking this doc's completion:

1. **Name-disclosure preference.** The official FAQ permits anonymizing names
   ("As for any names you are not able to share, feel free to cross them out
   or similarly anonymize"). Operator has not yet decided whether to use her
   real name or an anonymized reference (e.g. "our CS contractor") in this
   document. Update this section once decided.
2. **Pay figure.** She invoices for her work (confirmed 2026-07-30: "I will
   send my invoice on Friday"). No invoice amount is available yet. Once
   received, split her pay between Sloane & Pearl and NOVA Cape Town using the
   same order-share methodology as `financials/scripts/token-cost-allocation.md`
   (not charged wholly to either store), and fill in the personnel cost line
   in `financials/pnl-sloane-pearl.md`.

This is a genuine external dependency, not an oversight — do not fabricate a
name-disclosure decision or a pay figure to close this out. Update this file
and `financials/pnl-sloane-pearl.md`'s Personnel/COGS line together once the
operator provides both inputs.
```

- [ ] **Step 2: Commit**

```bash
git add disclosure/labor-attestation.md
git commit -m "docs: labor attestation (timeline confirmed, pay disclosure pending)"
```

---

### Task 11: `narrative/ai-native-operations.md`

**Files:**
- Create: `narrative/ai-native-operations.md`

**Interfaces:**
- Consumes: real data about which AI-driven decisions run for Sloane & Pearl specifically (requires DB lookups — see Step 1).
- Produces: the evidence enumeration referenced by Task 12's narrative and by the submission form's "product evidence" field.

- [ ] **Step 1: Identify real, store-scoped AI-driven decisions**

Query for evidence tied specifically to Sloane & Pearl, not just platform-wide
capability claims. Both queries below use confirmed-real columns (verified
during design/planning — `ShopifyProduct.storeId` and
`MetaCampaignLaunch.accountId` both resolve directly, unlike `AdPipelineRun`,
which only stores store association inside a JSON blob column and isn't worth
querying directly — the *launched campaign* is the reliable, verifiable
output of that pipeline):

```sql
-- Catalog size for this store (evidence the import pipeline ran for it)
SELECT COUNT(*) FROM "ShopifyProduct" WHERE "storeId" = (
  SELECT id FROM "ShopifyStore" WHERE "shopDomain" = 'pdmnf1-c0.myshopify.com'
);
```

```typescript
// Ad-creative pipeline evidence: count of real, launched campaigns for
// Sloane & Pearl's dedicated ad account — reuse the pattern already verified
// during design (see financials/scripts/lib/db.ts's withDb helper, but query
// MetaCampaignLaunch instead of Order):
// SELECT COUNT(*), MIN("launchDate"), MAX("launchDate") FROM "MetaCampaignLaunch"
// WHERE "accountId" = 'act_1115325060591696';
```

Do not claim an AI capability is "in production" for Sloane & Pearl without a
query result backing it — the whole point of this doc is evidence, not
platform marketing copy.

- [ ] **Step 2: Write `narrative/ai-native-operations.md`**

```markdown
# AI-Native Operations Evidence

Per the judging criterion: *"Judges assess the extent to which AI is live in
production and executes key decisions."* This enumerates what's real for
Sloane & Pearl specifically, with evidence pointers — not platform-wide
capability claims.

## Currently running (as of [DATE])

- **Product import & catalog enhancement** — [fill in from Step 1 query:
  count of Sloane & Pearl products, confirmation of AI-enhanced
  descriptions/titles at import time].
- **Ad-creative generation** — [fill in from Step 1 query: count of
  AI-generated ad creatives/renders tied to Sloane & Pearl's campaigns].
- **Pricing** — [describe the store's actual pricing automation, if
  applicable, based on what's confirmed running for this store].

## Human-handled today, AI-assisted once the Gemini integration lands

- **Customer service** — currently handled manually by a VA contractor (see
  `disclosure/labor-attestation.md`). The planned Gemini/Vertex AI integration
  (`gemini-integration/write-up.md`) drafts/triages replies for her review —
  not yet built as of this writing. Do not claim this is live until it is;
  update this section once `gemini-integration/write-up.md` moves from
  "planned" to "shipped."

## What's exclusively human

- Strategic decisions (pricing floors, which collections to launch, ad budget
  approval above [threshold]).
- Customer-service sending (the VA reviews and sends every reply — no
  autonomous send-without-review for this store).
```

- [ ] **Step 3: Fill in every bracket with real query results from Step 1**

- [ ] **Step 4: Commit**

```bash
git add narrative/ai-native-operations.md
git commit -m "docs: AI-native operations evidence for Sloane & Pearl"
```

---

### Task 12: `narrative/business-narrative.md`

**Files:**
- Create: `narrative/business-narrative.md`

**Interfaces:**
- Consumes: `disclosure/pre-existing-platform.md` (Task 7), `narrative/ai-native-operations.md` (Task 11), `disclosure/labor-attestation.md` (Task 10), current revenue figures (Task 2).
- Produces: the 500–1000 word text pasted into the Devpost submission form's narrative field.

- [ ] **Step 1: Write `narrative/business-narrative.md`, hitting all four required elements**

The overview page requires the narrative cover: (1) how AI is used day-to-day,
(2) what humans do vs. what AI does, (3) jobs/economic opportunity the
business creates beyond the founding team (actual and potential), (4) the
story of building it this way. Draft 500–1000 words covering all four,
grounded in the real facts gathered — not generic AI-hackathon copy:

```markdown
# Sloane & Pearl — Business Narrative

[Draft 500-1000 words here. Required content, in whatever order reads best:

1. How AI is used day-to-day: pull the confirmed items from
   narrative/ai-native-operations.md — product import/catalog enhancement,
   ad-creative generation, and (once shipped) the Gemini-drafted CS replies.

2. Humans vs. AI: be concrete and honest. The VA reviews and sends every CS
   reply — AI drafts, a human approves. Strategic calls (what to launch, ad
   budget) are human. Content generation and catalog operations are AI-driven.

3. Jobs/economic opportunity beyond the founding team: the CS contractor's CS role is
   real, current evidence — a job created specifically for this business,
   starting 2026-07-16 (see disclosure/labor-attestation.md for the verified
   timeline). Discuss what scaling this model could mean for future hires
   (more CS contractors, supplier relationships) — actual, not just aspirational.

4. The story: Sloane & Pearl launched 2026-06-03 on top of an already-running
   AI agent platform (disclosed per disclosure/pre-existing-platform.md), went
   from zero to [current revenue from financials/pnl-sloane-pearl.md] in
   [N] weeks, accelerating month over month (June $[X] -> July $[Y]).

Keep it factual and specific — real dates, real numbers, real names (or the
agreed anonymized reference, per disclosure/labor-attestation.md) — not
marketing language. Word count target: 500-1000.]
```

- [ ] **Step 2: Replace the bracketed instructions with actual prose**

Write the real narrative, pulling the specific facts referenced above from the
other repo files. Check the word count lands between 500 and 1000.

- [ ] **Step 3: Verify**

Run: `wc -w narrative/business-narrative.md`
Expected: between 500 and 1000 (the file includes a title line, so the body
count will be a little under the file's total — check the body text alone if
close to a boundary).

- [ ] **Step 4: Commit**

```bash
git add narrative/business-narrative.md
git commit -m "docs: draft business narrative"
```

---

### Task 13: Evidence docs (testing access, customer evidence, agent logs)

**Files:**
- Create: `evidence/testing-access.md`
- Create: `evidence/customer-evidence.md`
- Create: `evidence/agent-logs/README.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: the plan referenced at actual submission time for what gets typed into the Devpost form vs. what's in this repo.

- [ ] **Step 1: Write `evidence/testing-access.md`**

```markdown
# Testing Access

What judges get to test, per the submission requirement: *"Provide access to
an Entrant's working Project for judging and testing by providing a link to a
website, functioning demo, or a test build."*

**Plan: public storefront only.** sloaneandpearl.com is a live, public
storefront — no login required. This is the testable link provided on the
submission form.

**Not provided:** live admin/dashboard access to the multi-store
fashion-autopilot platform. The rules explicitly allow judging without live
testing (*"Judges are not required to test the Project and may choose to judge
based solely on the text description, images, and video provided"*), so the
video (`video/script.md`) and the evidence exports
(`narrative/ai-native-operations.md`, `evidence/agent-logs/`) carry the burden
of proving AI is live in production, rather than requiring judges to poke
around internal tooling that also exposes other stores' data.

Revisit this if the operator decides the story is stronger with a live
walkthrough — that would need a scoped, read-only demo view, not raw admin
access, and is out of scope for this repo.
```

- [ ] **Step 2: Write `evidence/customer-evidence.md`**

```markdown
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
```

- [ ] **Step 3: Write `evidence/agent-logs/README.md`**

```markdown
# Agent Logs

Placeholder directory for exported evidence of AI running in production for
Sloane & Pearl: CS draft/triage examples (once `gemini-integration/write-up.md`
ships), ad-creative generation logs, import-pipeline enhancement examples.

Populate close to submission time with real exports (screenshots or text
dumps), each one tied to a specific, dated, real event — not illustrative
mockups. Reference the actual `ApiUsage` rows or `AdPipelineRun` records they
came from so they're independently verifiable if a judge asks.
```

- [ ] **Step 4: Commit**

```bash
git add evidence/testing-access.md evidence/customer-evidence.md evidence/agent-logs/README.md
git commit -m "docs: testing access plan, customer evidence methodology, agent-logs placeholder"
```

---

### Task 14: `video/script.md`

**Files:**
- Create: `video/script.md`

**Interfaces:**
- Consumes: `narrative/ai-native-operations.md` (Task 11), `narrative/business-narrative.md` (Task 12).
- Produces: the shooting script for the actual 3-minute video recording (a human task, out of scope for this repo per the design doc).

- [ ] **Step 1: Write `video/script.md`**

```markdown
# Video Script — Sloane & Pearl (≤3 minutes)

Per submission requirements: under 3 minutes, must show the project
functioning, uploaded publicly to YouTube/Vimeo/Youku, no unlicensed
third-party trademarks or music.

Per the Farza fireside-chat advice (2026-07-30 XPRIZE session): find the
one-line hook before scripting the rest, and it's fine to be faceless/footage-
driven rather than a talking-head explainer — a real screen-recorded demo of
the product working is stronger than narration alone.

## Structure (target: ~2:45 to leave margin)

**0:00–0:15 — Hook.** One line establishing what this is: a real fashion
brand, launched from near-zero, run by AI agents. Show the live storefront
(sloaneandpearl.com) — real products, real checkout.

**0:15–1:00 — AI in production.** Screen-recorded footage of the actual
AI-driven steps confirmed in `narrative/ai-native-operations.md` — catalog
import/enhancement, ad-creative generation, and (once shipped) the Gemini CS
draft-and-review flow. Show real timestamps/dates, not staged demos.

**1:00–1:45 — The business is real.** Revenue graph or dashboard screenshot
(from `financials/pnl-sloane-pearl.md`'s numbers), order count, the VA's role
as evidence of a job created beyond the founding team.

**1:45–2:30 — The story.** Why this platform-first approach, what's next,
tie back to the Entrepreneurship & Job Creation category framing from
`disclosure/pre-existing-platform.md`.

**2:30–2:45 — Close.** Restate the hook line, call to action / URL.

## Still needed before recording

- Final hook line (draft several, pick the one that "stops the scroll" per
  the Farza advice — write candidates directly in this file once drafted).
- Screen recordings of the actual admin flows referenced above.
- Confirm no third-party trademarked content or unlicensed music appears in
  any B-roll.
```

- [ ] **Step 2: Commit**

```bash
git add video/script.md
git commit -m "docs: video script/storyboard"
```

---

### Task 15: `gemini-integration/write-up.md`

**Files:**
- Create: `gemini-integration/write-up.md`

**Interfaces:**
- Consumes: nothing new — documents the plan already locked in at design.md §5.
- Produces: the write-up referenced by the submission form once the actual fashion-autopilot code change ships; until then, an honest "not yet built" status doc.

- [ ] **Step 1: Write `gemini-integration/write-up.md`**

```markdown
# Gemini / Google Cloud Integration

**Status: not yet built.** This describes the plan, confirmed during design,
not a shipped feature. Do not reference this as "live" anywhere else in this
repo (`narrative/ai-native-operations.md`, `narrative/business-narrative.md`)
until it actually ships in `fashion-autopilot`.

## What's planned

A real, autonomous Gemini call added to Sloane & Pearl's customer-service
pipeline: drafts/triages a reply for the VA's review (she stays the human
sender — see `disclosure/labor-attestation.md`). Routed through **Vertex AI**,
not the plain Gemini Developer API key, so the same call satisfies both the
LLM requirement (*"must use the Gemini API for at least one LLM call"*) and
the Google Cloud requirement (*"must use at least one product from Google
Cloud"*) — confirmed by Google's own representative at the 2026-07-30
innovation orientation workshop ("Does calling Gemini via Vertex AI satisfy
the Gemini API requirement?" — "Correct.").

Per DeepMind DevRel (2026-07-30 technical session), the switch from the
existing (dormant, non-Vertex) Gemini code path to Vertex AI is a small
client-config change (region ID + GCP project ID) using the same
`google-genai` SDK, not a rewrite.

## Why this matters more than "one of three criteria"

Per the official rules, judging has a Stage One pass/fail gate: *"whether the
ideas... reasonably apply the required APIs/SDKs featured in the Hackathon."*
A missing or fake Gemini/Google Cloud integration risks the whole submission
being filtered out before Business Viability is ever scored, regardless of how
strong the revenue evidence is.

## Once shipped

Update this file with: the actual code location in `fashion-autopilot`, a
sample real request/response (redacted of any customer PII), and the
resulting cost figures for `financials/scripts/token-cost-allocation.md`. Also
update `narrative/ai-native-operations.md` to move CS drafting from "planned"
to "currently running."
```

- [ ] **Step 2: Commit**

```bash
git add gemini-integration/write-up.md
git commit -m "docs: Gemini/Vertex AI integration plan (status: not yet built)"
```

---

## Self-Review Notes (for whoever executes this plan)

- Tasks 5, 6, 8, 10, 11, 12 all contain bracketed `[FILL IN...]` placeholders
  by design — they depend on live script output or on the two pending
  operator inputs (labor pay figure, name-disclosure preference). This is
  **not** the same as a lazy placeholder: every bracket has an explicit
  instruction for what real value replaces it and where that value comes
  from. Do not leave any bracket in a *committed* file without either filling
  it from a real query/script run, or replacing it with honest prose
  explaining why it's still pending (matching Task 5's and Task 10's pattern).
- Re-run Tasks 2, 3, 4 close to the actual Aug 17 submission deadline — the
  numbers committed during initial implementation will be stale by then (order
  volume grows daily). This matches the design doc §6's explicit "out of
  scope: filling in final, submission-day numbers" — this plan builds the
  *tooling*, not the final frozen numbers.
