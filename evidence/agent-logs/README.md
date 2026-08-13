# Agent Logs

Real, dated exports of AI executing decisions in production for Sloane &
Pearl — every figure below traces to a named table and a runnable query, not
a mockup.

- `angle-loop-briefs.md` — nightly LLM ad-strategy briefs, zero human review,
  feeding live ad-copy generation. Confirmed the only account this loop
  currently runs for.
- `auto-kill-log.md` — real Meta campaign pauses, dollar amounts and dates,
  underlying the "95 auto-killed" figure in `narrative/ai-native-operations.md`.
- `treasury-topup-log.md` — real, settled Airwallex bank transfers funding
  the ad account autonomously.

See also `../screenshots/`:
- `gcp-vertex-ai-metrics.png` — Vertex AI API traffic graph on the dedicated
  `sloane-pearl-xprize` GCP project, showing real request activity (a 403
  from initial IAM setup, then a 200 once the service-account role was
  correctly attached).
- `gcp-billing-cost-report.png` — GCP Cloud Billing report, filtered to the
  `sloane-pearl-xprize` project only (isolated from the other project on the
  same billing account), showing real spend: €0.01 for Aug 1–12, 2026.
- `gcp-billing-vertex-ai-line-item.png` — the same report's service
  breakdown, naming **Vertex AI** explicitly as the billed service — a
  third-party (Google) record, not something this codebase generated.
- `auto-kill-history-ui.png` / `auto-kill-history-ui-extended.png` — the
  real admin Kill History table at `/ads-launcher/auto-kill`, matching the
  same events documented in `auto-kill-log.md`. The table isn't store-scoped
  by default (a couple of Perla Madrid rows appear alongside Sloane &
  Pearl's), but every row's campaign name is tagged with its store, so
  attribution stays unambiguous per row.
- `schedules-overview.png` — `/schedules` summary: 23 registered cron
  schedules (6 active, 17 paused), 5 real runs in the last 24h.
- `schedules-list.png` / `schedules-list-crashguard.png` — individual
  schedule health, real next-run/last-run timestamps. Includes an honest
  detail worth keeping rather than cropping out: two schedules show
  `AUTO-DISABLED` by the worker's own crash-loop guard, with the real
  failing run id — evidence the automation fails safely rather than
  silently, not just that it succeeds.
- `schedules-run-history.png` — real completed runs from earlier today
  (2026-08-13), each with a real dollar cost (e.g. $0.7280, $2.1149) and
  phase-completion detail.
- `schedules-worker-pool.png` — the 22-slot proxy worker pool backing the
  research pipeline, for completeness on how the cron-driven scraping
  infrastructure is provisioned.

All screenshots complete for this evidence pass.
