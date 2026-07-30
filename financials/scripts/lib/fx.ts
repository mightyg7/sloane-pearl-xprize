import { withDb } from "./db.js";

export type PlatformFxRate = {
  currency: string;
  rateUsd: number;
  source: string;
  fetchedAt: Date;
};

/**
 * Reads the main fashion-autopilot platform's own cached FX rate for
 * `currency` → USD from the shared `FxRate` table (same DB this repo
 * already connects to via lib/db.ts). `rateUsd` is USD per 1 unit of
 * `currency` — mirrors fashion-autopilot's src/lib/fx/get-rate.ts
 * (`getCachedRate`), whose semantics and comment ("rateUsd is USD per 1
 * unit of c") this depends on.
 *
 * Read-only by design: this standalone repo never writes to the shared
 * table, it only reuses whatever the main platform's own FX refresh cron
 * (src/lib/fx/refresh-rates.ts, Frankfurter primary / open.er-api.com
 * fallback) already cached — so a conversion done here stays consistent
 * with what the main business uses for its own accounting.
 *
 * Throws rather than inventing a rate if the platform hasn't priced this
 * currency yet — a missing row means "ask a human", not "guess".
 */
export async function getPlatformFxRate(currency: string): Promise<PlatformFxRate> {
  if (currency === "USD") {
    return { currency: "USD", rateUsd: 1, source: "identity", fetchedAt: new Date() };
  }

  return withDb(async (client) => {
    const res = await client.query<{
      rateUsd: number | string;
      source: string;
      fetchedAt: Date;
    }>(`SELECT "rateUsd", source, "fetchedAt" FROM "FxRate" WHERE currency = $1`, [
      currency,
    ]);
    if (res.rows.length === 0) {
      throw new Error(
        `No cached FxRate row for currency=${currency} in the platform's FxRate ` +
          "table — it hasn't been priced yet. Do not invent a conversion rate; " +
          "escalate instead."
      );
    }
    const row = res.rows[0];
    return {
      currency,
      rateUsd: Number(row.rateUsd),
      source: row.source,
      fetchedAt: row.fetchedAt,
    };
  });
}
