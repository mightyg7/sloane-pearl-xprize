import ExcelJS from "exceljs";
import { getSloanePearlRevenueByMonth } from "./revenue-by-month.js";
import { getSloanePearlSpendByMonth } from "./lib/meta.js";

const MONTH_COLUMNS: Record<string, string> = {
  "2026-05": "C",
  "2026-06": "D",
  "2026-07": "E",
  "2026-08": "F",
};

// Sourced from disclosure/related-party-revenue.md — update together.
const RELATED_PARTY_REVENUE_BY_MONTH: Record<string, number> = {};

function parseMonthlyJson(envVar: string): Record<string, number> {
  const raw = process.env[envVar];
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, number>;
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
  //   COGS_TOKENS_JSON='{"2026-06":1.20,"2026-07":4.50}'
  const cogsTokens = parseMonthlyJson("COGS_TOKENS_JSON");
  const sgaTokens = parseMonthlyJson("SGA_TOKENS_JSON");
  const cogsPersonnel = parseMonthlyJson("COGS_PERSONNEL_JSON");

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

  const revenue = await getSloanePearlRevenueByMonth();
  for (const { month, revenueUsd } of revenue) {
    const col = MONTH_COLUMNS[month];
    if (!col) continue; // outside the May-Aug window
    sheet.getCell(`${col}9`).value = Number(revenueUsd.toFixed(2));
    sheet.getCell(`${col}10`).value = RELATED_PARTY_REVENUE_BY_MONTH[month] ?? 0;
  }

  const adSpend = await getSloanePearlSpendByMonth();
  for (const { month, spendUsd } of adSpend) {
    const col = MONTH_COLUMNS[month];
    if (!col) continue;
    sheet.getCell(`${col}23`).value = Number(spendUsd.toFixed(2)); // Other Expenses = ad spend
  }

  for (const [month, col] of Object.entries(MONTH_COLUMNS)) {
    if (month in cogsPersonnel) {
      sheet.getCell(`${col}15`).value = Number(cogsPersonnel[month].toFixed(2));
    }
    if (month in cogsTokens) {
      sheet.getCell(`${col}17`).value = Number(cogsTokens[month].toFixed(2));
    }
    if (month in sgaTokens) {
      sheet.getCell(`${col}21`).value = Number(sgaTokens[month].toFixed(2));
    }
    // Software Subscriptions (rows 16, 20) intentionally left blank/$0 —
    // no incremental cost, see disclosure/pre-existing-resources.md.
    sheet.getCell(`${col}16`).value = 0;
    sheet.getCell(`${col}20`).value = 0;
  }

  const outputPath = "financials/pnl-sloane-pearl.xlsx";
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Wrote ${outputPath}`);

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
