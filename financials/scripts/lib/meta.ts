import { getPlatformFxRate } from "./fx.js";

export const SLOANE_PEARL_AD_ACCOUNT = "act_1115325060591696";
const GRAPH_API_VERSION = "v21.0";

type InsightRow = {
  spend?: string;
  date_start: string;
  date_stop: string;
};

/**
 * The Meta Insights API's `spend` field is denominated in the ad
 * account's OWN currency, not USD — confirmed 2026-07-30 via
 * GET /act_.../?fields=currency that act_1115325060591696 bills in EUR.
 * Fetched live (not hardcoded) so a currency change on the account
 * doesn't silently go stale.
 */
export async function getAccountCurrency(accountId: string): Promise<string> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error("META_ACCESS_TOKEN is required");
  }
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}?fields=currency&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Graph API error ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { currency?: string };
  if (!json.currency) {
    throw new Error(`Meta Graph API returned no currency for ${accountId}`);
  }
  return json.currency;
}

export async function getSloanePearlSpendByMonth(): Promise<
  { month: string; spendUsd: number }[]
> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error("META_ACCESS_TOKEN is required");
  }

  const timeRange = JSON.stringify({ since: "2026-05-19", until: "2026-08-17" });
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${SLOANE_PEARL_AD_ACCOUNT}/insights` +
    `?time_range=${encodeURIComponent(timeRange)}` +
    `&time_increment=monthly` +
    `&fields=spend` +
    `&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Graph API error ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { data: InsightRow[] };

  // Convert native-currency spend to real USD before returning — see
  // getAccountCurrency's comment above. Uses the platform's own cached
  // FX rate (financials/scripts/lib/fx.ts), so this stays consistent
  // with what the main fashion-autopilot business uses for its own
  // accounting rather than inventing a separate conversion.
  const accountCurrency = await getAccountCurrency(SLOANE_PEARL_AD_ACCOUNT);
  const { rateUsd, source, fetchedAt } = await getPlatformFxRate(accountCurrency);
  if (accountCurrency !== "USD") {
    console.error(
      `[getSloanePearlSpendByMonth] converting ${accountCurrency} -> USD at rate ` +
        `${rateUsd} (source=${source}, fetchedAt=${fetchedAt.toISOString()})`
    );
  }

  return json.data.map((row) => ({
    month: row.date_start.slice(0, 7),
    spendUsd: Number(row.spend ?? 0) * rateUsd,
  }));
}
