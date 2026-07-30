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
