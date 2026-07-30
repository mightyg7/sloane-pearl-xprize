export const SLOANE_PEARL_AD_ACCOUNT = "act_1115325060591696";
const GRAPH_API_VERSION = "v21.0";

type InsightRow = {
  spend?: string;
  date_start: string;
  date_stop: string;
};

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

  return json.data.map((row) => ({
    month: row.date_start.slice(0, 7),
    spendUsd: Number(row.spend ?? 0),
  }));
}
