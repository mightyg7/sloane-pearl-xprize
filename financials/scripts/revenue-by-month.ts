import { withDb, storeIdFor, STORES } from "./lib/db.js";

export type MonthRevenue = { month: string; count: number; revenueUsd: number };

export async function getSloanePearlRevenueByMonth(): Promise<MonthRevenue[]> {
  return withDb(async (client) => {
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

    const byMonth: Record<string, { count: number; revenueUsd: number }> = {};
    for (const row of res.rows) {
      const month = row.createdAt.toISOString().slice(0, 7);
      byMonth[month] ??= { count: 0, revenueUsd: 0 };
      byMonth[month].count += 1;
      byMonth[month].revenueUsd += Number(row.totalPriceUsd);
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  });
}

async function main() {
  const rows = await getSloanePearlRevenueByMonth();
  console.log(`Sloane & Pearl revenue by month:`);
  let totalCount = 0;
  let totalRevenue = 0;
  for (const { month, count, revenueUsd } of rows) {
    console.log(`  ${month}: ${count} orders, $${revenueUsd.toFixed(2)} USD`);
    totalCount += count;
    totalRevenue += revenueUsd;
  }
  console.log(`  TOTAL: ${totalCount} orders, $${totalRevenue.toFixed(2)} USD`);
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
