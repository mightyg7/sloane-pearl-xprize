# Pre-Existing Resources Disclosure

Per the rule: *"if any expenses correspond to the use of resources that
existed prior to the hackathon, then you must explain whatever those
resources might be."*

Sloane & Pearl runs on shared fashion-autopilot infrastructure that predates
2026-05-19. None of these are Sloane & Pearl-exclusive costs — they're
platform overhead the business rides on, and (unlike ad spend, merchandise
COGS, payment fees or AI tokens, which scale with this store's own activity
and are carried as real cost lines in `financials/pnl-sloane-pearl.xlsx`)
they don't get an invented dollar estimate, because they're fixed costs that
exist regardless of whether Sloane & Pearl specifically is running:

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

## What actually appears in the P&L

Sloane & Pearl's ad spend, its merchandise cost of goods sold (from real
supplier invoices), its payment-processing fees and its allocated AI tokens
appear as non-zero line items in `financials/pnl-sloane-pearl.xlsx`. **VA
labor does not yet** — row 15 (COGS Personnel) is still blank because her
invoice has not been issued (see `disclosure/labor-attestation.md`). It will
be added to row 15, and the P&L re-generated, once the figure exists. Row 15
being blank is a pending input, not a claim that the cost is zero.

## Recurring costs deliberately excluded, and why

Stating this explicitly so a judge can see what is missing rather than
inferring it from a blank cell:

| Cost | In the P&L? | Reasoning |
| --- | --- | --- |
| Railway hosting (web + worker) | No | Fixed platform overhead. The same two services run whether or not Sloane & Pearl exists; adding a store adds no incremental spend. |
| LLM API subscriptions/keys | Keys no, **usage yes** | The credentials are account-level and shared. The token usage they generate does scale per store and is allocated as a real cost (row 17) — see `financials/scripts/token-cost-allocation.md`. |
| Proxy infrastructure | No | No dedicated proxy is assigned to this store (`proxyIp` is null), so there is no cost to attribute. |
| Operator/founder time | No | Not exclusive to this store, and not separable from platform development. |
| **Shopify plan fee** | **No — and this one is a genuine omission** | See below. |

**The Shopify plan fee is the honest exception.** Unlike Railway hosting, it
is *not* fixed platform overhead: Sloane & Pearl is its own Shopify store
(`pdmnf1-c0.myshopify.com`, created 2026-06-03) and therefore carries its own
plan subscription. That subscription would not exist if this business did not
exist, which makes it a genuinely incremental, recurring, store-specific
cost — exactly the kind of thing that belongs in the P&L, most naturally in
row 16 (COGS Software Subscriptions).

It is currently excluded for one reason only: Shopify bills the plan to the
operator's Shopify account, and the platform's own database holds no record
of the plan tier or the amounts charged, so there is no figure here that
isn't invented. Rather than estimate a plan price from Shopify's public
pricing page and present it as an actual cash outflow, it is disclosed as a
known gap. Resolving it means pulling the real Shopify invoices for
2026-06-03 onward and entering the actual charged amounts in row 16 — it is
listed as an open item in this repo's `README.md` alongside the VA pay
figure. Its magnitude is small relative to the disclosed loss, and its
direction is the same as the other gaps: including it makes the loss
slightly **wider**, never narrower.

None of this is disclosed to inflate the case for viability — it's disclosed
because the rule requires it, and because every cost still outstanding
increases the reported loss rather than reducing it.
