# Gemini / Google Cloud Integration

**Status: not yet built.** This describes the plan, confirmed during design,
not a shipped feature. Do not reference this as "live" anywhere else in this
repo (`narrative/ai-native-operations.md`, `narrative/business-narrative.md`)
until it actually ships in `fashion-autopilot`.

## What's planned

A real, autonomous Gemini call added to Sloane & Pearl's customer-service
pipeline: drafts/triages a reply for the VA's review (she stays the human
sender — see `disclosure/labor-attestation.md`). Routed through **Vertex AI**,
not the plain Gemini Developer API key, so the same call satisfies both the
LLM requirement (*"must use the Gemini API for at least one LLM call"*) and
the Google Cloud requirement (*"must use at least one product from Google
Cloud"*) — confirmed by Google's own representative at the 2026-07-30
innovation orientation workshop ("Does calling Gemini via Vertex AI satisfy
the Gemini API requirement?" — "Correct.").

Per DeepMind DevRel (2026-07-30 technical session), the switch from the
existing (dormant, non-Vertex) Gemini code path to Vertex AI is a small
client-config change (region ID + GCP project ID) using the same
`google-genai` SDK, not a rewrite.

## Why this matters more than "one of three criteria"

Per the official rules, judging has a Stage One pass/fail gate: *"whether the
ideas... reasonably apply the required APIs/SDKs featured in the Hackathon."*
A missing or fake Gemini/Google Cloud integration risks the whole submission
being filtered out before Business Viability is ever scored, regardless of how
strong the revenue evidence is.

## Once shipped

Update this file with: the actual code location in `fashion-autopilot`, a
sample real request/response (redacted of any customer PII), and the
resulting cost figures for `financials/scripts/token-cost-allocation.md`. Also
update `narrative/ai-native-operations.md` to move CS drafting from "planned"
to "currently running."
