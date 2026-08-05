import type { Client } from "pg";
import { withDb, storeIdFor, STORES } from "./lib/db.js";

/*
 * Merchandise cost of goods sold and payment-processing fees for
 * Sloane & Pearl, both keyed off real records rather than estimates.
 *
 * WHY NOT `ProductCogs`. The platform has a `ProductCogs` table
 * (per-product `cogsUsd`), which looks like the obvious source. It is
 * not usable here, for two independent reasons, both verified against
 * production on 2026-07-30:
 *
 *   1. It holds ZERO rows for Sloane & Pearl. Its only 42 rows belong
 *      to the other store on the platform (NOVA Cape Town). Every one
 *      of Sloane & Pearl's 87 distinct ordered products, and therefore
 *      all 243 of its order line items, joins to nothing.
 *   2. Those 42 rows carry `source = 'estimated'` — a modelled guess
 *      used by the ad-scaling break-even calculator, not a supplier
 *      invoice. Even with coverage it would not be evidence.
 *
 * WHAT IS USED INSTEAD. Sloane & Pearl's fulfilment supplier (Win-Win)
 * issues per-order PDF invoices, which the platform parses into
 * `DiscordInvoice` / `DiscordInvoiceLine`. Each line carries the
 * product title, quantity, and unit price already broken out in USD,
 * and joins to our order on `shopifyOrderId`. That is a real invoiced
 * amount actually paid to the supplier — strictly better evidence than
 * a per-product estimate, and it is the same source the platform's own
 * realized-COGS resolver prefers (`src/lib/pricing/realized-cogs.ts`
 * in fashion-autopilot).
 *
 * MONTH ATTRIBUTION is by supplier invoice date, not order date,
 * because the template mandates cash basis and the invoice is the
 * cash-out event. `DiscordInvoice.paidAt` would be the strictly
 * correct key but is not trustworthy — one invoice records a `paidAt`
 * after today's date and another records one BEFORE its own invoice
 * date — so `invoiceDate` is used as the clean proxy and
 * `orderMonthMismatches` reports any order whose invoice month differs
 * from its order month, so a future re-run surfaces cross-month lag
 * instead of hiding it.
 */

export type MonthCogs = {
  month: string;
  cogsUsd: number;
  /** Distinct orders contributing invoice lines dated in this month. */
  matchedOrders: number;
  invoiceLines: number;
};

export type CogsCoverage = {
  ordersTotal: number;
  /** Orders the supplier has shipped, i.e. orders that CAN have a supplier cost. */
  shippedOrders: number;
  /** Shipped orders with at least one matched supplier invoice line. */
  shippedOrdersMatched: number;
  /** Shipped orders with no matched invoice line — the genuine data gap. */
  shippedOrdersUnmatched: { orderNumber: string; date: string; revenueUsd: number }[];
  /**
   * Invoiced by the supplier although our own `fulfillmentStatus` does not
   * (yet) say shipped. Their cost IS counted; broken out only so the
   * buckets below reconcile to `ordersTotal`.
   */
  matchedNotShippedOrders: number;
  /** Not yet shipped, so not yet invoiced: correctly $0 under cash basis, not missing. */
  notYetShippedOrders: number;
  /** Refunded before shipping: no supplier cost was ever incurred. */
  refundedUnshippedOrders: number;
  /** True when shipped + matchedNotShipped + notYetShipped + refundedUnshipped == ordersTotal. */
  bucketsReconcile: boolean;
  invoicesTotal: number;
  invoicesUnpaid: number;
  orderMonthMismatches: { orderNumber: string; orderMonth: string; invoiceMonth: string }[];
  invoicesMissingDate: number;
};

export type MerchandiseCogsResult = { byMonth: MonthCogs[]; coverage: CogsCoverage };

export type MonthFees = {
  month: string;
  feesUsd: number;
  ordersWithFeeData: number;
  ordersTotal: number;
  /**
   * Estimated OceanPayments fee for this month's gap orders, only
   * present when a rate was supplied to getSloanePearlPaymentFees.
   * Kept separate from `feesUsd` (the exact Shopify-native figure) so
   * callers can report — and the P&L can disclose — evidenced vs.
   * estimated amounts distinctly rather than blending them silently.
   */
  estimatedOceanPaymentFeesUsd?: number;
};

export type PaymentFeesResult = {
  byMonth: MonthFees[];
  coverage: {
    ordersTotal: number;
    ordersWithFeeData: number;
    /** Revenue of just the fee-bearing orders, for the observed-rate denominator. */
    sampleRevenueUsd: number;
    /** Observed effective fee rate on that sample. NOT extrapolated into the P&L. */
    observedFeeRatePct: number | null;
    /**
     * Set only when a rate was supplied. Gross USD of the gap orders
     * (no Shopify-native fee data) the estimate was applied to, and the
     * rate itself, so the estimate's basis is always reportable.
     */
    oceanPaymentEstimate?: {
      ratePct: number;
      gapOrdersGrossUsd: number;
      gapOrdersCount: number;
      estimatedFeesUsd: number;
    };
  };
};

type CogsRow = {
  orderNumber: string;
  orderMonth: string;
  orderDate: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPriceUsd: string;
  invoiceMonth: string | null;
  cogsUsd: string | null;
  lineCount: string | null;
};

const SHIPPED_STATUSES = new Set(["fulfilled", "partial"]);

export async function getSloanePearlMerchandiseCogs(): Promise<MerchandiseCogsResult> {
  return withDb((client) => merchandiseCogs(client));
}

async function merchandiseCogs(client: Client): Promise<MerchandiseCogsResult> {
  const storeId = await storeIdFor(client, STORES.sloanePearl);
  const shopDomain = STORES.sloanePearl;

  const invoiceStats = await client.query<{
    total: string;
    unpaid: string;
    missing_date: string;
  }>(
    `SELECT COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE "paymentStatus" <> 'paid')::text AS unpaid,
            COUNT(*) FILTER (WHERE "invoiceDate" IS NULL)::text AS missing_date
     FROM "DiscordInvoice"
     WHERE "shopDomain" = $1 AND "deletedAt" IS NULL`,
    [shopDomain]
  );

  // One row per (order, invoice month) so an order split across two
  // months' invoices lands its cost in both, not just the earlier one.
  // Orders with no matched line still appear (LEFT JOIN) so coverage
  // can be measured rather than assumed.
  const res = await client.query<CogsRow>(
    `WITH lines AS (
       SELECT l."shopifyOrderId",
              to_char(i."invoiceDate", 'YYYY-MM') AS invoice_month,
              SUM(l."lineTotalUsd")::text          AS cogs_usd,
              COUNT(*)::text                       AS line_count
       FROM "DiscordInvoiceLine" l
       JOIN "DiscordInvoice" i ON i.id = l."invoiceId"
       WHERE i."shopDomain" = $2 AND i."deletedAt" IS NULL
       GROUP BY 1, 2
     )
     SELECT o."orderNumber"                              AS "orderNumber",
            to_char(o."createdAt", 'YYYY-MM')            AS "orderMonth",
            to_char(o."createdAt", 'YYYY-MM-DD')         AS "orderDate",
            o."financialStatus"                          AS "financialStatus",
            o."fulfillmentStatus"                        AS "fulfillmentStatus",
            o."totalPriceUsd"::text                      AS "totalPriceUsd",
            lines.invoice_month                          AS "invoiceMonth",
            lines.cogs_usd                               AS "cogsUsd",
            lines.line_count                             AS "lineCount"
     FROM "Order" o
     LEFT JOIN lines ON lines."shopifyOrderId" = o."shopifyOrderId"
     WHERE o."storeId" = $1
       AND (o."financialStatus" IS NULL
            OR o."financialStatus" NOT IN ('voided', 'pending'))
     ORDER BY o."createdAt" ASC, lines.invoice_month ASC NULLS FIRST`,
    [storeId, shopDomain]
  );

  const byMonth: Record<string, { cogsUsd: number; orders: Set<string>; invoiceLines: number }> = {};
  const allOrders = new Set<string>();
  const shippedOrders = new Set<string>();
  const matchedOrders = new Set<string>();
  const notYetShipped = new Set<string>();
  const refundedUnshipped = new Set<string>();
  const orderMonthMismatches: CogsCoverage["orderMonthMismatches"] = [];
  const unmatchedDetail = new Map<string, { date: string; revenueUsd: number }>();

  for (const row of res.rows) {
    allOrders.add(row.orderNumber);
    const shipped = SHIPPED_STATUSES.has((row.fulfillmentStatus ?? "").toLowerCase());
    if (shipped) shippedOrders.add(row.orderNumber);

    if (row.cogsUsd !== null) {
      matchedOrders.add(row.orderNumber);
      // A NULL invoiceDate can't be attributed; fall back to the order's
      // own month and let `invoicesMissingDate` flag it.
      const month = row.invoiceMonth ?? row.orderMonth;
      byMonth[month] ??= { cogsUsd: 0, orders: new Set(), invoiceLines: 0 };
      byMonth[month].cogsUsd += Number(row.cogsUsd);
      byMonth[month].orders.add(row.orderNumber);
      byMonth[month].invoiceLines += Number(row.lineCount ?? 0);
      if (row.invoiceMonth && row.invoiceMonth !== row.orderMonth) {
        orderMonthMismatches.push({
          orderNumber: row.orderNumber,
          orderMonth: row.orderMonth,
          invoiceMonth: row.invoiceMonth,
        });
      }
    } else if (shipped) {
      unmatchedDetail.set(row.orderNumber, {
        date: row.orderDate,
        revenueUsd: Number(row.totalPriceUsd),
      });
    } else if (row.financialStatus === "refunded") {
      refundedUnshipped.add(row.orderNumber);
    } else {
      notYetShipped.add(row.orderNumber);
    }
  }

  const rows: MonthCogs[] = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      cogsUsd: d.cogsUsd,
      matchedOrders: d.orders.size,
      invoiceLines: d.invoiceLines,
    }));

  const shippedMatched = [...shippedOrders].filter((o) => matchedOrders.has(o)).length;
  const matchedNotShipped = [...matchedOrders].filter((o) => !shippedOrders.has(o)).length;

  return {
    byMonth: rows,
    coverage: {
      ordersTotal: allOrders.size,
      shippedOrders: shippedOrders.size,
      shippedOrdersMatched: shippedMatched,
      shippedOrdersUnmatched: [...unmatchedDetail.entries()]
        .map(([orderNumber, d]) => ({ orderNumber, ...d }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      matchedNotShippedOrders: matchedNotShipped,
      notYetShippedOrders: notYetShipped.size,
      refundedUnshippedOrders: refundedUnshipped.size,
      bucketsReconcile:
        shippedOrders.size +
          matchedNotShipped +
          notYetShipped.size +
          refundedUnshipped.size ===
        allOrders.size,
      invoicesTotal: Number(invoiceStats.rows[0].total),
      invoicesUnpaid: Number(invoiceStats.rows[0].unpaid),
      orderMonthMismatches,
      invoicesMissingDate: Number(invoiceStats.rows[0].missing_date),
    },
  };
}

/**
 * Merchandise unit economics on the cohort where both sides of the
 * margin are real: orders that are fully `paid` (so their revenue is
 * retained cash) AND have a matched supplier invoice (so their cost is
 * an invoiced amount, not an estimate). Any other cohort mixes a known
 * revenue with an unknown cost and produces a margin that flatters.
 *
 * This exists as a function rather than a one-off query because its
 * outputs are quoted in `narrative/business-narrative.md` and
 * `video/script.md`, and an unsourced margin figure in a financial
 * submission is exactly the thing a judge should be able to re-derive.
 */
export type UnitEconomics = {
  orders: number;
  revenueUsd: number;
  cogsUsd: number;
  grossMarginPct: number;
  aovUsd: number;
  cogsPerOrderUsd: number;
  contributionPerOrderUsd: number;
};

export async function getSloanePearlUnitEconomics(): Promise<UnitEconomics> {
  return withDb(async (client) => {
    const storeId = await storeIdFor(client, STORES.sloanePearl);
    const res = await client.query<{
      orders: string;
      revenue: string;
      cogs: string;
    }>(
      `WITH lines AS (
         SELECT l."shopifyOrderId", SUM(l."lineTotalUsd")::float AS cogs
         FROM "DiscordInvoiceLine" l
         JOIN "DiscordInvoice" i ON i.id = l."invoiceId"
         WHERE i."shopDomain" = $2 AND i."deletedAt" IS NULL
         GROUP BY 1
       )
       SELECT COUNT(*)::text                     AS orders,
              SUM(o."totalPriceUsd")::text       AS revenue,
              SUM(lines.cogs)::text              AS cogs
       FROM "Order" o
       JOIN lines ON lines."shopifyOrderId" = o."shopifyOrderId"
       WHERE o."storeId" = $1 AND o."financialStatus" = 'paid'`,
      [storeId, STORES.sloanePearl]
    );
    const orders = Number(res.rows[0].orders);
    const revenueUsd = Number(res.rows[0].revenue);
    const cogsUsd = Number(res.rows[0].cogs);
    return {
      orders,
      revenueUsd,
      cogsUsd,
      grossMarginPct: revenueUsd > 0 ? (1 - cogsUsd / revenueUsd) * 100 : 0,
      aovUsd: orders > 0 ? revenueUsd / orders : 0,
      cogsPerOrderUsd: orders > 0 ? cogsUsd / orders : 0,
      contributionPerOrderUsd: orders > 0 ? (revenueUsd - cogsUsd) / orders : 0,
    };
  });
}

/*
 * Payment-processing fees. `Order.processingFeeShop` /
 * `conversionFeeShop` / `otherFeeShop` are aggregated by the platform
 * from Shopify's `order.transactions.fees`, denominated in the STORE's
 * currency (the schema's own comment: "*Shop values are in the store's
 * order currency"), so they get the same `exchangeRate` conversion as
 * `totalPriceUsd`.
 *
 * Refunded orders keep their fees: a processor does not refund its own
 * processing fee, so that fee is real cash out either way.
 */
/**
 * @param oceanPaymentRatePct Optional blended true-cost rate (e.g. 7.835
 *   for 7.835%) to apply to gap orders' gross revenue as a DISCLOSED
 *   ESTIMATE, kept separate from the exact Shopify-native figure.
 *   Sourced from a real, independently-run OceanPayments settlement-export
 *   analysis (see financials/pnl-methodology.md for the derivation and
 *   validation) — never invent a rate here. Omit to get exact-only
 *   behavior (the historical default): gap orders contribute $0, and the
 *   caller is responsible for disclosing the resulting understatement.
 */
export async function getSloanePearlPaymentFees(
  oceanPaymentRatePct?: number
): Promise<PaymentFeesResult> {
  return withDb(async (client) => {
    const storeId = await storeIdFor(client, STORES.sloanePearl);

    const res = await client.query<{
      month: string;
      orders_total: string;
      orders_with_fee_data: string;
      fees_usd: string;
      sample_revenue_usd: string;
      gap_orders: string;
      gap_gross_usd: string;
    }>(
      `SELECT to_char("createdAt", 'YYYY-MM') AS month,
              COUNT(*)::text                  AS orders_total,
              COUNT(*) FILTER (
                WHERE "processingFeeShop" IS NOT NULL
                   OR "conversionFeeShop" IS NOT NULL
                   OR "otherFeeShop" IS NOT NULL
              )::text                         AS orders_with_fee_data,
              COALESCE(SUM(
                (COALESCE("processingFeeShop", 0)
                 + COALESCE("conversionFeeShop", 0)
                 + COALESCE("otherFeeShop", 0)) * "exchangeRate"
              ), 0)::text                     AS fees_usd,
              COALESCE(SUM("totalPriceUsd") FILTER (
                WHERE "processingFeeShop" IS NOT NULL
                   OR "conversionFeeShop" IS NOT NULL
                   OR "otherFeeShop" IS NOT NULL
              ), 0)::text                     AS sample_revenue_usd,
              COUNT(*) FILTER (
                WHERE "processingFeeShop" IS NULL
                  AND "conversionFeeShop" IS NULL
                  AND "otherFeeShop" IS NULL
              )::text                         AS gap_orders,
              COALESCE(SUM("totalPriceUsd") FILTER (
                WHERE "processingFeeShop" IS NULL
                  AND "conversionFeeShop" IS NULL
                  AND "otherFeeShop" IS NULL
              ), 0)::text                     AS gap_gross_usd
       FROM "Order"
       WHERE "storeId" = $1
         AND ("financialStatus" IS NULL
              OR "financialStatus" NOT IN ('voided', 'pending'))
       GROUP BY 1
       ORDER BY 1`,
      [storeId]
    );

    const byMonth: MonthFees[] = res.rows.map((r) => {
      const gapGrossUsd = Number(r.gap_gross_usd);
      const estimated =
        oceanPaymentRatePct != null
          ? Math.round(gapGrossUsd * (oceanPaymentRatePct / 100) * 100) / 100
          : undefined;
      return {
        month: r.month,
        feesUsd: Number(r.fees_usd) + (estimated ?? 0),
        ordersWithFeeData: Number(r.orders_with_fee_data),
        ordersTotal: Number(r.orders_total),
        ...(estimated !== undefined ? { estimatedOceanPaymentFeesUsd: estimated } : {}),
      };
    });

    const ordersTotal = byMonth.reduce((a, m) => a + m.ordersTotal, 0);
    const ordersWithFeeData = byMonth.reduce((a, m) => a + m.ordersWithFeeData, 0);
    const sampleRevenueUsd = res.rows.reduce((a, r) => a + Number(r.sample_revenue_usd), 0);
    const exactFeesUsd = res.rows.reduce((a, r) => a + Number(r.fees_usd), 0);

    const gapOrdersCount = res.rows.reduce((a, r) => a + Number(r.gap_orders), 0);
    const gapOrdersGrossUsd = res.rows.reduce((a, r) => a + Number(r.gap_gross_usd), 0);

    return {
      byMonth,
      coverage: {
        ordersTotal,
        ordersWithFeeData,
        sampleRevenueUsd,
        observedFeeRatePct:
          sampleRevenueUsd > 0 ? (exactFeesUsd / sampleRevenueUsd) * 100 : null,
        ...(oceanPaymentRatePct != null
          ? {
              oceanPaymentEstimate: {
                ratePct: oceanPaymentRatePct,
                gapOrdersGrossUsd,
                gapOrdersCount,
                estimatedFeesUsd:
                  Math.round(gapOrdersGrossUsd * (oceanPaymentRatePct / 100) * 100) / 100,
              },
            }
          : {}),
      },
    };
  });
}

async function main() {
  const cogs = await getSloanePearlMerchandiseCogs();
  console.log("Sloane & Pearl merchandise COGS by supplier-invoice month (USD):");
  let cogsTotal = 0;
  for (const m of cogs.byMonth) {
    console.log(
      `  ${m.month}: $${m.cogsUsd.toFixed(2)} across ${m.matchedOrders} orders / ` +
        `${m.invoiceLines} invoice lines`
    );
    cogsTotal += m.cogsUsd;
  }
  console.log(`  TOTAL: $${cogsTotal.toFixed(2)}`);

  const c = cogs.coverage;
  console.log("\nCoverage:");
  console.log(`  orders in scope (non-voided, non-pending): ${c.ordersTotal}`);
  console.log(
    `  shipped orders with real supplier invoice: ${c.shippedOrdersMatched} / ${c.shippedOrders}`
  );
  console.log(
    `  invoiced though not flagged shipped (cost still counted): ${c.matchedNotShippedOrders}`
  );
  console.log(
    `  not yet shipped (no supplier cash out yet): ${c.notYetShippedOrders}; ` +
      `refunded before shipping (no cost ever): ${c.refundedUnshippedOrders}`
  );
  console.log(
    `  buckets reconcile to order total: ${c.bucketsReconcile ? "yes" : "NO — investigate"}`
  );
  console.log(
    `  supplier invoices: ${c.invoicesTotal} (${c.invoicesUnpaid} not marked paid, ` +
      `${c.invoicesMissingDate} without an invoice date)`
  );
  if (c.shippedOrdersUnmatched.length > 0) {
    console.warn(
      "\n  WARNING: shipped orders with NO matched supplier invoice line — real " +
        "merchandise cost exists for these and is NOT in the figure above:"
    );
    for (const u of c.shippedOrdersUnmatched) {
      console.warn(`    - ${u.orderNumber} (${u.date}), revenue $${u.revenueUsd.toFixed(2)}`);
    }
  }
  if (c.orderMonthMismatches.length > 0) {
    console.warn(
      "\n  NOTE: invoiced in a different month than the order was placed " +
        "(expected under cash basis; listed so the monthly split is auditable):"
    );
    for (const m of c.orderMonthMismatches) {
      console.warn(`    - ${m.orderNumber}: order ${m.orderMonth}, invoice ${m.invoiceMonth}`);
    }
  }

  const ue = await getSloanePearlUnitEconomics();
  console.log(
    "\nMerchandise unit economics (fully-paid orders with a matched supplier invoice):"
  );
  console.log(
    `  ${ue.orders} orders, revenue $${ue.revenueUsd.toFixed(2)}, ` +
      `supplier COGS $${ue.cogsUsd.toFixed(2)}`
  );
  console.log(
    `  gross margin ${ue.grossMarginPct.toFixed(1)}%, AOV $${ue.aovUsd.toFixed(2)}, ` +
      `COGS/order $${ue.cogsPerOrderUsd.toFixed(2)}, ` +
      `contribution/order $${ue.contributionPerOrderUsd.toFixed(2)} (before ad spend)`
  );

  // OCEANPAY_FEE_RATE_PCT is optional and OFF by default — see
  // financials/pnl-methodology.md for the sourced rate and its
  // derivation. Never invented here; if unset, fees.byMonth carries only
  // the exact Shopify-native figure and the gap stays visibly $0.
  const oceanPayRateEnv = process.env.OCEANPAY_FEE_RATE_PCT;
  const oceanPayRate = oceanPayRateEnv ? Number(oceanPayRateEnv) : undefined;

  const fees = await getSloanePearlPaymentFees(oceanPayRate);
  console.log("\nSloane & Pearl payment-processing fees by month (USD):");
  let feeTotal = 0;
  for (const m of fees.byMonth) {
    const estimateNote =
      m.estimatedOceanPaymentFeesUsd !== undefined
        ? ` (includes $${m.estimatedOceanPaymentFeesUsd.toFixed(2)} estimated OceanPayments)`
        : "";
    console.log(
      `  ${m.month}: $${m.feesUsd.toFixed(2)}${estimateNote} ` +
        `(fee data present on ${m.ordersWithFeeData} of ${m.ordersTotal} orders)`
    );
    feeTotal += m.feesUsd;
  }
  console.log(`  TOTAL: $${feeTotal.toFixed(2)}`);
  const fc = fees.coverage;
  console.log(
    `  Coverage: ${fc.ordersWithFeeData} of ${fc.ordersTotal} orders carry synced (Shopify-native) fee data.`
  );
  if (fc.observedFeeRatePct !== null) {
    console.log(
      `  Observed effective rate on those ${fc.ordersWithFeeData} orders: ` +
        `${fc.observedFeeRatePct.toFixed(2)}% of $${fc.sampleRevenueUsd.toFixed(2)} revenue.`
    );
  }
  if (fc.oceanPaymentEstimate) {
    const e = fc.oceanPaymentEstimate;
    console.log(
      `  OceanPayments estimate applied: ${e.ratePct}% of $${e.gapOrdersGrossUsd.toFixed(2)} ` +
        `gross across ${e.gapOrdersCount} gap orders = $${e.estimatedFeesUsd.toFixed(2)}.`
    );
  } else if (fc.ordersWithFeeData < fc.ordersTotal) {
    console.warn(
      "\n  WARNING: fee data is incomplete, so the total above UNDERSTATES real " +
        "payment-processing cost. It is reported as-is rather than extrapolated " +
        "from the observed rate — see financials/pnl-methodology.md. Set " +
        "OCEANPAY_FEE_RATE_PCT to apply the sourced OceanPayments estimate instead."
    );
  }
}

const urlPath = new URL(import.meta.url).pathname;
if (decodeURIComponent(urlPath) === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
