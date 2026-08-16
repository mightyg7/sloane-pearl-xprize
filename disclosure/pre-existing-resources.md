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
- **LLM API keys** — Anthropic, OpenAI, and (since 2026-08-13, see
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
labor partially does** — row 15 (COGS Personnel) carries her real, verified
July pay ($105.00, see `disclosure/labor-attestation.md`); August's cell is
a genuine $0 in the filed P&L, since no August invoice has been issued as
of the 2026-08-14 final regenerate — see `financials/pnl-methodology.md`
for how that's treated.

## Recurring costs deliberately excluded, and why

Stating this explicitly so a judge can see what is missing rather than
inferring it from a blank cell:

| Cost | In the P&L? | Reasoning |
| --- | --- | --- |
| Railway hosting (web + worker) | No | Fixed platform overhead. The same two services run whether or not Sloane & Pearl exists; adding a store adds no incremental spend. |
| LLM API subscriptions/keys | Keys no, **usage yes** | The credentials are account-level and shared. The token usage they generate does scale per store and is allocated as a real cost (row 17) — see `financials/scripts/token-cost-allocation.md`. |
| Proxy infrastructure | No | No dedicated proxy is assigned to this store (`proxyIp` is null), so there is no cost to attribute. |
| Operator/founder time | No | Not exclusive to this store, and not separable from platform development. |
| **Shopify plan fee** | **Resolved 2026-08-14 — real data, not an estimate** | See below. |

**The Shopify plan fee gap is closed, with real invoice data — not a
guess.** Sloane & Pearl's own Shopify billing invoices were located in the
Shopify-billing notification emails Shopify sends to the store's connected
mailbox account (found via a real search of AgentMail message history, not
inferred). Two real findings:

1. **The base plan subscription itself costs $0 real cash.** Every invoice
   shows a $1.00 "Subscription" charge immediately offset by a $1.00
   "Subscription credit" — a promotional credit is genuinely covering it.
   This confirms the earlier caution about guessing a public list price was
   warranted: the real answer ($0, credit-covered) would have differed from
   any list-price guess.
2. **Real "Apps" charges exist and are now in the P&L**: $27.50 (Jul 2) +
   $34.99 (Jul 11) = **$62.49**, row 16 (COGS Software Subscriptions). These
   are Shopify App Store subscription charges, unrelated to payment
   processing, so they carry no double-counting risk with any other line.

**Update, 2026-08-14: Shopify's "Transaction fees" charges are now
included, not excluded.** (~$372.56 across the same invoices) — these are
Shopify's surcharge for using a non-Shopify-Payments gateway. As of the
2026-08-13 regenerate this was deliberately excluded, on the reasoning that
it duplicated a component of the OceanPayments *estimated blended rate*
(7.835%) already applied to row 23c. That estimate has since been fully
replaced with real, exact fee data (see `financials/pnl-methodology.md`
row 23c) — a real per-transaction export from OceanPayments itself, which
naturally does not include Shopify's own separate surcharge (charged by a
different party, never something OceanPayments' own fee columns would
carry). With the estimate gone, the double-counting risk is gone too, so
this real charge is now included on its own merits.

None of this is disclosed to inflate the case for viability — it's disclosed
because the rule requires it, and it's why the loss moved the small amount
it did (partly wider from the Apps charge, partly narrower from the real
fee data coming in lower than the estimate it replaced).
