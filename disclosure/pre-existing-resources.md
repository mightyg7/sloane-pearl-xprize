# Pre-Existing Resources Disclosure

Per the rule: *"if any expenses correspond to the use of resources that
existed prior to the hackathon, then you must explain whatever those
resources might be."*

Sloane & Pearl runs on shared fashion-autopilot infrastructure that predates
2026-05-19. None of these are Sloane & Pearl-exclusive costs — they're
platform overhead the business rides on, and (unlike ad spend or AI tokens,
which scale with usage and are allocated as real cost lines in
`financials/pnl-sloane-pearl.xlsx`) they don't get an invented dollar estimate,
because they're fixed costs that exist regardless of whether Sloane & Pearl
specifically is running:

- **Hosting** — Railway (web + worker services), shared across every store on
  the platform. Adding a new store doesn't add incremental hosting spend.
- **Proxy infrastructure** — Sloane & Pearl has not been assigned a dedicated
  proxy (`ConnectedStore.proxyIp` is null in the platform's records as of
  2026-07-30) and currently uses a direct/shared connection rather than a
  purchased dedicated proxy, so there is no proxy cost specifically attributable
  to this store. If a dedicated proxy is assigned to it later, that would become
  a real incremental cost requiring disclosure and a line item at that time.
- **LLM API keys** — Anthropic, OpenAI, and (once wired in, see
  `gemini-integration/write-up.md`) Gemini/Vertex AI credentials are
  account-level, shared across the platform, not provisioned per store. Unlike
  hosting, the *usage* this generates does scale and is allocated as a real
  cost — see `financials/scripts/token-cost-allocation.md`.
- **Operator/founder time** — platform development and store operations time
  is not exclusively Sloane & Pearl's; only the VA's time (see
  `disclosure/labor-attestation.md`) is store-specific enough to itemize as a
  personnel cost.

None of this is disclosed to inflate the case for viability — it's disclosed
because the rule requires it. Sloane & Pearl's own attributable costs (ad
spend, allocated AI tokens, VA labor) are what actually appear as non-zero
line items in `financials/pnl-sloane-pearl.xlsx`.
