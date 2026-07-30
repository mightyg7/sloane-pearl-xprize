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
