# Sloane & Pearl — Build with Gemini XPRIZE Submission

This repo is the **submission package** for Sloane & Pearl (sloaneandpearl.com)'s
entry to the Build with Gemini XPRIZE hackathon (Category: Entrepreneurship &
Job Creation). It is not a copy of the product code — the actual code that runs
Sloane & Pearl (customer-service agent, ad-creative pipeline, import pipeline)
lives in the private `fashion-autopilot` repo, shared separately and privately
with judges.

Full context: `docs/superpowers/specs/2026-07-30-xprize-submission-design.md`.

## Layout

- `disclosure/` — compliance narratives (pre-existing platform, related-party
  revenue, pre-existing resources, labor attestation).
- `narrative/` — the 500–1000 word submission writeup and the AI-native-operations
  evidence enumeration.
- `financials/` — the filled P&L and the scripts that produced its numbers.
- `evidence/` — testing-access plan, customer-evidence methodology, agent logs.
- `video/` — the 3-minute demo video script.
- `gemini-integration/` — write-up of the Gemini/Vertex AI integration (pending
  the follow-on build in `fashion-autopilot`).

## Running the financial scripts

```bash
npm install
export DATABASE_URL="postgresql://postgres:<password>@tramway.proxy.rlwy.net:27107/fashion_autopilot"
export META_ACCESS_TOKEN="<meta marketing api token>"
npm run revenue
npm run overlap
npm run ad-spend
```

Get `DATABASE_URL`'s password from `railway variables --service fashion-autopilot --kv`
in the `fashion-autopilot` checkout — never commit it. Get `META_ACCESS_TOKEN`
the same way (`META_ACCESS_TOKEN` var on the same service).

## Filling the official P&L

```bash
export PL_TEMPLATE_PATH="/path/to/a freshly downloaded Build with Gemini XPRIZE - PL Template.xlsx"
npm run fill-pnl
```

Writes `financials/pnl-sloane-pearl.xlsx` (committed) from a **fresh, local**
copy of the template — never commit the blank template itself, only the
filled output.
