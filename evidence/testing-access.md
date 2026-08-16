# Testing Access

What judges get to test, per the submission requirement: *"Provide access to
an Entrant's working Project for judging and testing by providing a link to a
website, functioning demo, or a test build."*

**Plan: public storefront only.** sloaneandpearl.com is a live, public
storefront, no login required. This is the testable link provided on the
submission form.

**Not provided:** live admin/dashboard access to the multi-store
fashion-autopilot platform. The rules explicitly allow judging without live
testing (*"Judges are not required to test the Project and may choose to judge
based solely on the text description, images, and video provided"*), so the
video (`video/script.md`) and the evidence exports
(`narrative/ai-native-operations.md`, `evidence/agent-logs/`) carry the burden
of proving AI is live in production, rather than requiring judges to poke
around internal tooling that also exposes other stores' data.

Revisit this if the operator decides the story is stronger with a live
walkthrough: that would need a scoped, read-only demo view, not raw admin
access, and is out of scope for this repo.
