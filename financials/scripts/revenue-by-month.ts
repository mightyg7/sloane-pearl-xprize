import { withDb, storeIdFor, STORES } from "./lib/db.js";

export type MonthRevenue = {
  month: string;
  /** Orders that contributed retained cash in the month. */
  count: number;
  /** Every non-voided, non-pending order in the month, refunded ones included. */
  grossOrders: number;
  /** Gross order value before refunds, USD. */
  grossRevenueUsd: number;
  /** Refunds netted back out, USD. */
  refundsUsd: number;
  /** Cash actually retained = grossRevenueUsd - refundsUsd. This is the P&L figure. */
  revenueUsd: number;
};

/** Orders whose stated status and refund mirror disagree: surfaced, not silently absorbed. */
export type RefundDiscrepancy = {
  orderNumber: string;
  totalPriceUsd: number;
  mirroredRefundUsd: number;
};

export type RevenueResult = {
  byMonth: MonthRevenue[];
  /** Statuses seen, for the record: proves what the filter did and didn't drop. */
  excludedOrders: { pending: number; voided: number };
  refundDiscrepancies: RefundDiscrepancy[];
};

/**
 * Cash-basis revenue, per the official template's own legend:
 * "You must record revenue and expenses using the 'cash basis' method."
 *
 * Three rules follow from that, all of which the first version of this
 * script got wrong:
 *
 *  1. `pending` orders are excluded: the cash has not been received.
 *     `voided` too (it never will be).
 *  2. Refunds are netted out of the month they belong to. A refunded
 *     order's cash did not stay with the business, so counting it at
 *     full value overstates revenue.
 *  3. The status filter is NULL-safe. `"financialStatus" != 'voided'`
 *     evaluates to NULL, not TRUE, for a NULL status in Postgres, so
 *     a status-less order would have been silently dropped from
 *     revenue entirely. `IS NULL OR NOT IN (...)` keeps it.
 *
 * On refund amounts: `Order.refundAmount` is denominated in the STORE's
 * currency, not USD (fashion-autopilot compares it against
 * `Order.totalPrice`, the store-currency total, see
 * `src/lib/orders/refund.ts`), so it gets the same `exchangeRate`
 * treatment `totalPriceUsd` already had applied at sync time.
 * Sloane & Pearl bills in USD at rate 1.0, so this is currently a
 * no-op, it is here so the script stays correct if that changes.
 *
 * On `financialStatus = 'refunded'`: Shopify uses `refunded` only for a
 * FULLY refunded order (a partial refund reads `partially_refunded`),
 * so a fully-refunded order retains zero cash regardless of what the
 * denormalized `refundAmount` mirror says. That mirror is best-effort
 * in fashion-autopilot and is demonstrably wrong on at least one real
 * order here (a chargeback-prevention refund landed as `amount = 0`),
 * so trusting it alone would have counted a fully refunded $114.63
 * order as retained revenue. Any such disagreement is reported in
 * `refundDiscrepancies` rather than quietly patched over.
 */
export async function getSloanePearlRevenueByMonth(): Promise<MonthRevenue[]> {
  return (await getSloanePearlRevenue()).byMonth;
}

export async function getSloanePearlRevenue(): Promise<RevenueResult> {
  return withDb(async (client) => {
    const storeId = await storeIdFor(client, STORES.sloanePearl);

    const excluded = await client.query<{ financialstatus: string; n: string }>(
      `SELECT "financialStatus" AS financialstatus, COUNT(*)::text AS n
       FROM "Order"
       WHERE "storeId" = $1 AND "financialStatus" IN ('voided', 'pending')
       GROUP BY 1`,
      [storeId]
    );
    const excludedOrders = { pending: 0, voided: 0 };
    for (const row of excluded.rows) {
      if (row.financialstatus === "pending") excludedOrders.pending = Number(row.n);
      if (row.financialstatus === "voided") excludedOrders.voided = Number(row.n);
    }

    const res = await client.query<{
      orderNumber: string;
      createdAt: Date;
      totalPriceUsd: string;
      refundAmount: string;
      exchangeRate: string;
      financialStatus: string | null;
    }>(
      `SELECT "orderNumber", "createdAt", "totalPriceUsd", "refundAmount",
              "exchangeRate", "financialStatus"
       FROM "Order"
       WHERE "storeId" = $1
         AND ("financialStatus" IS NULL
              OR "financialStatus" NOT IN ('voided', 'pending'))
       ORDER BY "createdAt" ASC`,
      [storeId]
    );

    const byMonth: Record<string, Omit<MonthRevenue, "month">> = {};
    const refundDiscrepancies: RefundDiscrepancy[] = [];

    for (const row of res.rows) {
      const month = row.createdAt.toISOString().slice(0, 7);
      byMonth[month] ??= {
        count: 0,
        grossOrders: 0,
        grossRevenueUsd: 0,
        refundsUsd: 0,
        revenueUsd: 0,
      };

      const grossUsd = Number(row.totalPriceUsd);
      const rate = Number(row.exchangeRate) || 1;
      const mirroredRefundUsd = Number(row.refundAmount) * rate;

      // A `refunded` status is authoritative over the refund mirror.
      const fullyRefunded = row.financialStatus === "refunded";
      const refundUsd = fullyRefunded
        ? Math.max(grossUsd, mirroredRefundUsd)
        : Math.min(grossUsd, mirroredRefundUsd);

      if (fullyRefunded && mirroredRefundUsd < grossUsd - 0.01) {
        refundDiscrepancies.push({
          orderNumber: row.orderNumber,
          totalPriceUsd: grossUsd,
          mirroredRefundUsd,
        });
      }

      const retained = Math.max(0, grossUsd - refundUsd);
      const m = byMonth[month];
      m.grossOrders += 1;
      m.grossRevenueUsd += grossUsd;
      m.refundsUsd += refundUsd;
      m.revenueUsd += retained;
      if (retained > 0) m.count += 1;
    }

    const rows = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    return { byMonth: rows, excludedOrders, refundDiscrepancies };
  });
}

async function main() {
  const { byMonth, excludedOrders, refundDiscrepancies } = await getSloanePearlRevenue();
  console.log("Sloane & Pearl revenue by month (cash basis, USD):");
  let totalCount = 0;
  let totalGrossOrders = 0;
  let totalGross = 0;
  let totalRefunds = 0;
  let totalRevenue = 0;
  for (const m of byMonth) {
    console.log(
      `  ${m.month}: ${m.count} revenue-bearing orders (${m.grossOrders} placed), ` +
        `gross $${m.grossRevenueUsd.toFixed(2)} - refunds $${m.refundsUsd.toFixed(2)} ` +
        `= $${m.revenueUsd.toFixed(2)}`
    );
    totalCount += m.count;
    totalGrossOrders += m.grossOrders;
    totalGross += m.grossRevenueUsd;
    totalRefunds += m.refundsUsd;
    totalRevenue += m.revenueUsd;
  }
  console.log(
    `  TOTAL: ${totalCount} revenue-bearing orders (${totalGrossOrders} placed), ` +
      `gross $${totalGross.toFixed(2)} - refunds $${totalRefunds.toFixed(2)} ` +
      `= $${totalRevenue.toFixed(2)}`
  );
  console.log(
    `  Excluded as no-cash-received: ${excludedOrders.pending} pending, ` +
      `${excludedOrders.voided} voided`
  );
  if (refundDiscrepancies.length > 0) {
    console.warn(
      "\nNOTE: these orders are marked fully `refunded` by Shopify but their " +
        "denormalized refundAmount mirror is lower. The status is treated as " +
        "authoritative (retained revenue = $0); the mirror is understating the " +
        "refund, not the other way around:"
    );
    for (const d of refundDiscrepancies) {
      console.warn(
        `  - ${d.orderNumber}: total $${d.totalPriceUsd.toFixed(2)}, ` +
          `mirror says $${d.mirroredRefundUsd.toFixed(2)}`
      );
    }
  }
}

// Only run as a CLI report when executed directly, not when imported by
// fill-pnl-template.ts (Task 6).
const urlPath = new URL(import.meta.url).pathname;
const argvPath = process.argv[1];
if (decodeURIComponent(urlPath) === argvPath) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
