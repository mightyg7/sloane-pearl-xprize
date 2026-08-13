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

**Still to add** (needs an authenticated admin screenshot):
screenshots of `/ads-launcher/auto-kill` and `/schedules` for a visual
cross-check against the DB exports above.
