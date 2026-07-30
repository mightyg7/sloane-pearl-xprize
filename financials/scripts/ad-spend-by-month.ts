import { getSloanePearlSpendByMonth, SLOANE_PEARL_AD_ACCOUNT } from "./lib/meta.js";

async function main() {
  const rows = await getSloanePearlSpendByMonth();
  console.log(`Sloane & Pearl (${SLOANE_PEARL_AD_ACCOUNT}) ad spend by month:`);
  let total = 0;
  for (const { month, spendUsd } of rows) {
    total += spendUsd;
    console.log(`  ${month}: $${spendUsd.toFixed(2)} USD`);
  }
  console.log(`  TOTAL: $${total.toFixed(2)} USD`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
