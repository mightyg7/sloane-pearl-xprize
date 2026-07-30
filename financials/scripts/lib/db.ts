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

/**
 * `ShopifyStore.id` — the id space used by `Order`, `OrderLineItem`,
 * `Refund` and `ProductCogs`.
 *
 * NOT interchangeable with `connectedStoreIdFor()` below. See that
 * function's comment: mixing the two returns zero rows rather than an
 * error, which is how a "this store has no products" false negative
 * gets past review.
 */
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

/**
 * `ConnectedStore.id` — a DIFFERENT id space from `ShopifyStore.id`,
 * used by `ShopifyProduct.storeId` (and the rest of the merchant-side
 * tables) even though both tables key off the same `pdmnf1-c0.myshopify.com`
 * shop domain.
 *
 * The two ids never collide and neither table errors on a wrong-space
 * lookup — `WHERE "storeId" = <ShopifyStore.id>` against
 * `ShopifyProduct` just returns 0 rows. This helper exists so the
 * gotcha documented in prose in `narrative/ai-native-operations.md`
 * has a reusable fix: pick the function named after the table you are
 * actually querying.
 *
 * Rule of thumb:
 *   - orders / line items / refunds / product COGS -> storeIdFor()
 *   - products / catalog / store config            -> connectedStoreIdFor()
 */
export async function connectedStoreIdFor(
  client: Client,
  shopDomain: string
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `SELECT id FROM "ConnectedStore" WHERE shop = $1`,
    [shopDomain]
  );
  if (res.rows.length === 0) {
    throw new Error(`No ConnectedStore row found for shop=${shopDomain}`);
  }
  return res.rows[0].id;
}
