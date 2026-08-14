import ExcelJS from "exceljs";
import { getSloanePearlRevenue } from "./revenue-by-month.js";
import { getSloanePearlSpendByMonth } from "./lib/meta.js";
import {
  getSloanePearlMerchandiseCogs,
  getSloanePearlPaymentFees,
} from "./cogs-and-fees-by-month.js";

const MONTH_COLUMNS: Record<string, string> = {
  "2026-05": "C",
  "2026-06": "D",
  "2026-07": "E",
  "2026-08": "F",
};
const COLUMNS = ["C", "D", "E", "F"] as const;

// Sourced from disclosure/related-party-revenue.md — update together.
const RELATED_PARTY_REVENUE_BY_MONTH: Record<string, number> = {};

function parseMonthlyJson(envVar: string): Record<string, number> {
  const raw = process.env[envVar];
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, number>;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Every numeric input cell this script writes, keyed by address.
 * The formula-result computation below reads ONLY from here, so the
 * cached values can never drift from what was actually written.
 * A missing address means an empty cell, which Excel's SUM treats as 0.
 */
type Inputs = Record<string, number>;

const at = (inputs: Inputs, addr: string) => inputs[addr] ?? 0;

/**
 * Replicates, in JS, the arithmetic the template's own formulas encode,
 * so each formula cell can be written as `{formula, result}`.
 *
 * WHY: exceljs carries the template's cached formula results forward
 * verbatim, and in the blank official template every one of them is
 * `<v>0</v>`. `fullCalcOnLoad` makes Excel and Google Sheets recompute
 * on open, but anything that reads the stored values instead of
 * evaluating the formulas — macOS Quick Look, most xlsx-to-PDF
 * converters, an automated parser a judge might run — would show
 * TOTAL REVENUE, TOTAL EXPENSES and PROFIT (LOSS) as $0. Writing the
 * real computed value alongside the formula fixes the file itself
 * rather than relying on the reader to recalculate.
 *
 * Totals are computed from the ROUNDED per-month inputs (the values
 * actually in the cells), so a recalculating reader lands on exactly
 * the same number this script cached.
 */
function computeFormulaCells(inputs: Inputs): { addr: string; formula: string; result: number }[] {
  const cells: { addr: string; formula: string; result: number }[] = [];

  const rowTotal = (row: number) =>
    round2(COLUMNS.reduce((sum, col) => sum + at(inputs, `${col}${row}`), 0));

  // Row-total column G for every single-input row.
  for (const row of [9, 10, 15, 16, 17, 19, 20, 21, 23]) {
    cells.push({ addr: `G${row}`, formula: `SUM(C${row}:F${row})`, result: rowTotal(row) });
  }

  // Row 11 TOTAL REVENUE = Independent Sales + Related Party, per column.
  const totalRevenue: Record<string, number> = {};
  for (const col of COLUMNS) {
    totalRevenue[col] = round2(at(inputs, `${col}9`) + at(inputs, `${col}10`));
    cells.push({
      addr: `${col}11`,
      formula: `SUM(${col}9:${col}10)`,
      result: totalRevenue[col],
    });
  }
  const totalRevenueG = round2(rowTotal(9) + rowTotal(10));
  cells.push({ addr: "G11", formula: "SUM(G9:G10)", result: totalRevenueG });

  // Row 24 TOTAL EXPENSES = COGS (15,16,17) + SG&A (19,20,21) + Other (23).
  const expenseRows = [15, 16, 17, 19, 20, 21, 23];
  const totalExpenses: Record<string, number> = {};
  for (const col of COLUMNS) {
    totalExpenses[col] = round2(
      expenseRows.reduce((sum, row) => sum + at(inputs, `${col}${row}`), 0)
    );
    cells.push({
      addr: `${col}24`,
      formula: expenseRows.map((row) => `${col}${row}`).join("+"),
      result: totalExpenses[col],
    });
  }
  const totalExpensesG = round2(expenseRows.reduce((sum, row) => sum + rowTotal(row), 0));
  cells.push({
    addr: "G24",
    formula: expenseRows.map((row) => `G${row}`).join("+"),
    result: totalExpensesG,
  });

  // Row 26 PROFIT (LOSS) = TOTAL REVENUE - TOTAL EXPENSES, per column.
  let profitSum = 0;
  for (const col of COLUMNS) {
    const profit = round2(totalRevenue[col] - totalExpenses[col]);
    profitSum += profit;
    cells.push({ addr: `${col}26`, formula: `${col}11-${col}24`, result: profit });
  }
  cells.push({ addr: "G26", formula: "SUM(C26:F26)", result: round2(profitSum) });

  return cells;
}

async function main() {
  const templatePath = process.env.PL_TEMPLATE_PATH;
  if (!templatePath) {
    throw new Error(
      "PL_TEMPLATE_PATH is required — point it at a freshly downloaded local " +
        "copy of the official template, per the header's own warning against " +
        "duplicating the blank form."
    );
  }

  // These come from the human-decided methodology docs, not a live query —
  // see financials/scripts/token-cost-allocation.md and
  // disclosure/labor-attestation.md. Pass as JSON env vars, e.g.:
  //   COGS_TOKENS_JSON='{"2026-06":37.65,"2026-07":150.61}'
  const cogsTokens = parseMonthlyJson("COGS_TOKENS_JSON");
  const sgaTokens = parseMonthlyJson("SGA_TOKENS_JSON");
  const cogsPersonnel = parseMonthlyJson("COGS_PERSONNEL_JSON");
  // Real Shopify "Apps" billing-invoice charges — see
  // disclosure/pre-existing-resources.md. Deliberately excludes Shopify's
  // "Transaction fees" line, which overlaps with the OceanPayments blended
  // rate's own 2% "3rd-party gateway surcharge" component already applied
  // in row 23c — including both would double-count the same real cost.
  const cogsSoftware = parseMonthlyJson("COGS_SOFTWARE_JSON");

  const missing: string[] = [];
  if (Object.keys(cogsPersonnel).length === 0) {
    missing.push(
      "COGS_PERSONNEL_JSON (VA pay, see disclosure/labor-attestation.md — still pending as of design time)"
    );
  }
  if (Object.keys(cogsTokens).length === 0 && Object.keys(sgaTokens).length === 0) {
    missing.push(
      "COGS_TOKENS_JSON / SGA_TOKENS_JSON (see financials/scripts/token-cost-allocation.md)"
    );
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const sheet = workbook.getWorksheet("Template");
  if (!sheet) {
    throw new Error(
      `Sheet "Template" not found in ${templatePath} — the template's layout ` +
        "may have changed since this script was written; re-verify the row/" +
        "column mapping in this plan's Task 6 before proceeding."
    );
  }

  const inputs: Inputs = {};
  const setInput = (addr: string, value: number) => {
    const rounded = round2(value);
    inputs[addr] = rounded;
    sheet.getCell(addr).value = rounded;
  };

  const { byMonth: revenue, refundDiscrepancies } = await getSloanePearlRevenue();
  for (const { month, revenueUsd } of revenue) {
    const col = MONTH_COLUMNS[month];
    if (!col) continue; // outside the May-Aug window
    setInput(`${col}9`, revenueUsd);
    setInput(`${col}10`, RELATED_PARTY_REVENUE_BY_MONTH[month] ?? 0);
  }

  // Row 23 "Other Expenses" carries THREE components. The official
  // template's COGS block only offers Personnel / Software / Tokens, so
  // it has no home for merchandise cost of goods sold or for payment
  // processing — and the legend's instruction for row 23 is exactly
  // this case: "you must explain each expense line in your Devpost
  // submission". That explanation lives in financials/pnl-methodology.md,
  // which must be updated alongside any change here.
  const adSpend = await getSloanePearlSpendByMonth();
  const cogs = await getSloanePearlMerchandiseCogs();
  // REAL_FEES_JSON: real, exact payment-processing fees by month, sourced
  // directly from OceanPayments' own transaction-level export (real
  // per-transaction Trans Fee / SaaS Fee / Per-Transaction Fee / Refund Fee
  // columns), real withdrawal-report data ($45 flat per withdrawal), and
  // Shopify's own billing-invoice "Transaction fees" line — see
  // financials/pnl-methodology.md row 23c for the full derivation. Takes
  // precedence over OCEANPAY_FEE_RATE_PCT's estimated blended rate, which
  // was only ever a stand-in for real data that didn't exist yet.
  const realFeesEnv = process.env.REAL_FEES_JSON;
  const realFees = realFeesEnv ? (JSON.parse(realFeesEnv) as Record<string, number>) : null;

  // OCEANPAY_FEE_RATE_PCT is optional, off by default, and ignored when
  // REAL_FEES_JSON is set. Set it to apply the sourced OceanPayments
  // blended true-cost rate (see financials/pnl-methodology.md) to gap
  // orders' gross revenue as a disclosed estimate. Never invent a rate here.
  const oceanPayRateEnv = process.env.OCEANPAY_FEE_RATE_PCT;
  const oceanPayRate = oceanPayRateEnv ? Number(oceanPayRateEnv) : undefined;
  const fees = realFees ? null : await getSloanePearlPaymentFees(oceanPayRate);

  const otherExpenses: Record<string, number> = {};
  const addOther = (month: string, amount: number) => {
    otherExpenses[month] = (otherExpenses[month] ?? 0) + amount;
  };
  for (const { month, spendUsd } of adSpend) addOther(month, spendUsd);
  for (const { month, cogsUsd } of cogs.byMonth) addOther(month, cogsUsd);
  if (realFees) {
    for (const [month, amount] of Object.entries(realFees)) addOther(month, amount);
  } else if (fees) {
    for (const { month, feesUsd } of fees.byMonth) addOther(month, feesUsd);
  }

  for (const [month, amount] of Object.entries(otherExpenses)) {
    const col = MONTH_COLUMNS[month];
    if (!col) continue;
    setInput(`${col}23`, amount);
  }

  for (const [month, col] of Object.entries(MONTH_COLUMNS)) {
    if (month in cogsPersonnel) {
      setInput(`${col}15`, cogsPersonnel[month]);
    }
    if (month in cogsTokens) {
      setInput(`${col}17`, cogsTokens[month]);
    }
    if (month in sgaTokens) {
      setInput(`${col}21`, sgaTokens[month]);
    }
    // Row 16 (COGS Software Subscriptions): real Shopify "Apps" charges
    // when provided via COGS_SOFTWARE_JSON, else $0 — see
    // disclosure/pre-existing-resources.md. Row 20 (SG&A) stays $0; no
    // incremental SG&A software cost has been identified.
    setInput(`${col}16`, cogsSoftware[month] ?? 0);
    setInput(`${col}20`, 0);
  }

  // Write each formula back together with its real computed value. This
  // also expands the template's shared formulas into explicit per-cell
  // ones, which is what lets a cached result be attached to each.
  const formulaCells = computeFormulaCells(inputs);
  for (const { addr, formula, result } of formulaCells) {
    sheet.getCell(addr).value = { formula, result };
  }

  // Belt and braces: even with correct cached values, ask Excel /
  // Google Sheets to recalculate on open so an operator edit to an
  // input cell propagates immediately.
  workbook.calcProperties.fullCalcOnLoad = true;

  const outputPath = "financials/pnl-sloane-pearl.xlsx";
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Wrote ${outputPath}`);

  const sum = (rows: { month: string }[], pick: (r: any) => number) =>
    rows.filter((r) => MONTH_COLUMNS[r.month]).reduce((a, r) => a + pick(r), 0);
  const adSpendTotal = sum(adSpend, (r) => r.spendUsd);
  const cogsTotal = sum(cogs.byMonth, (r) => r.cogsUsd);
  const feesTotal = realFees
    ? Object.values(realFees).reduce((a, b) => a + b, 0)
    : sum(fees!.byMonth, (r) => r.feesUsd);
  const revenueTotal = sum(revenue, (r) => r.revenueUsd);
  const byAddr = new Map(formulaCells.map((c) => [c.addr, c.result]));

  console.log("\nFull 90 days (column G), USD:");
  console.log(`  TOTAL REVENUE (G11):  ${byAddr.get("G11")!.toFixed(2)}`);
  console.log(`  TOTAL EXPENSES (G24): ${byAddr.get("G24")!.toFixed(2)}`);
  console.log(`  PROFIT (LOSS) (G26):  ${byAddr.get("G26")!.toFixed(2)}`);
  console.log("\nRow 23 'Other Expenses' breakdown (explained in pnl-methodology.md):");
  console.log(`  Meta ad spend:            ${adSpendTotal.toFixed(2)}`);
  console.log(`  Merchandise COGS:         ${cogsTotal.toFixed(2)}`);
  console.log(`  Payment processing fees:  ${feesTotal.toFixed(2)}`);
  console.log(`  = row 23 total (G23):     ${byAddr.get("G23")!.toFixed(2)}`);
  if (revenueTotal > 0 && adSpendTotal > 0) {
    console.log(
      `\nBlended ROAS (revenue / ad spend): ${(revenueTotal / adSpendTotal).toFixed(2)}x`
    );
  }

  const warnings: string[] = [];
  if (cogs.coverage.shippedOrdersUnmatched.length > 0) {
    warnings.push(
      `merchandise COGS is missing for ${cogs.coverage.shippedOrdersUnmatched.length} ` +
        `shipped order(s) with no matched supplier invoice ` +
        `(${cogs.coverage.shippedOrdersUnmatched.map((o) => o.orderNumber).join(", ")}) — ` +
        "run `npm run cogs` for detail"
    );
  }
  if (realFees) {
    warnings.push(
      `row 23 payment-processing fees are REAL data (not an estimate): OceanPayments' ` +
        `own transaction-level export + real withdrawal-report fees + Shopify's real ` +
        `billing-invoice "Transaction fees" line — see financials/pnl-methodology.md row 23c`
    );
  } else if (fees!.coverage.oceanPaymentEstimate) {
    const e = fees!.coverage.oceanPaymentEstimate;
    warnings.push(
      `row 23 includes a $${e.estimatedFeesUsd.toFixed(2)} OceanPayments fee ESTIMATE ` +
        `(${e.ratePct}% applied to $${e.gapOrdersGrossUsd.toFixed(2)} gross across ` +
        `${e.gapOrdersCount} gap orders) — sourced rate, not the exact Shopify-native ` +
        `figure; see financials/pnl-methodology.md`
    );
  } else if (fees!.coverage.ordersWithFeeData < fees!.coverage.ordersTotal) {
    warnings.push(
      `payment fee data covers only ${fees!.coverage.ordersWithFeeData} of ` +
        `${fees!.coverage.ordersTotal} orders, so row 23 UNDERSTATES real fee cost ` +
        `(observed rate on the covered orders: ` +
        `${fees!.coverage.observedFeeRatePct?.toFixed(2)}%) — set OCEANPAY_FEE_RATE_PCT ` +
        `to apply the sourced OceanPayments estimate instead`
    );
  }
  if (refundDiscrepancies.length > 0) {
    warnings.push(
      `${refundDiscrepancies.length} fully-refunded order(s) have an understated ` +
        `refundAmount mirror (${refundDiscrepancies
          .map((d) => d.orderNumber)
          .join(", ")}); the refunded status was treated as authoritative`
    );
  }
  if (warnings.length > 0) {
    console.warn("\nDATA-QUALITY NOTES (all disclosed in financials/pnl-methodology.md):");
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  if (missing.length > 0) {
    console.warn(
      "\nWARNING: the following inputs were not provided and their cells were " +
        "left untouched (not zeroed) — this P&L is NOT submission-ready:"
    );
    for (const m of missing) console.warn(`  - ${m}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
