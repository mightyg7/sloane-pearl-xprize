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

**Still to add** (needs an authenticated admin screenshot, not a DB export):
GCP Console usage/billing screenshot for the Vertex AI integration once
merged and fired for real; screenshots of `/ads-launcher/auto-kill` and
`/schedules` for a visual cross-check against the DB exports above.
