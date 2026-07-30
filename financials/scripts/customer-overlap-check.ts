import { withDb, storeIdFor, STORES } from "./lib/db.js";

// Normalize phone by stripping all non-digit characters
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits ? digits : null;
}

// Normalize email by trimming whitespace and converting to lowercase
function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().trim() || null;
}

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
      novaRes.rows.map((r) => normalizeEmail(r.customerEmail)).filter(Boolean)
    );
    const novaPhones = new Set(
      novaRes.rows.map((r) => normalizePhone(r.customerPhone)).filter(Boolean)
    );

    const overlapByEmail = sloaneRes.rows.filter(
      (r) => r.customerEmail && novaEmails.has(normalizeEmail(r.customerEmail))
    );
    const overlapByPhone = sloaneRes.rows.filter(
      (r) => r.customerPhone && novaPhones.has(normalizePhone(r.customerPhone))
    );

    const uniqueEmails = new Set(
      sloaneRes.rows.map((r) => normalizeEmail(r.customerEmail)).filter(Boolean)
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
