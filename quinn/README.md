# QUINN — Public cinematic exhibition and research record

This is a **public, static, untrusted presentation layer**, not the private QUINN runtime or a live QUINN operator interface.

## Public routes

- `/quinn/` — cinematic identity-led QUINN homepage, architecture visualizations, locally simulated operator console, and a deterministic in-browser causality lab.
- `/quinn/research/` — public research record with a reproducible synthetic oscillator dataset, local tamper detection, Python verifier and explicit evidence/provenance boundaries. **No externally validated QUINN scientific discoveries are claimed.**
- `/quinn/proof/` — existing synthetic Ed25519 fixture demonstration. A passing fixture is self-consistent with disposable bundled keys, but does not prove real identity, consent, physical execution, or third-party attestation.
- `/quinn/content/dispatches.json` — curated human-reviewed editorial record, not telemetry or a discovery feed.

No live service interfaces, private identity data, system credentials, analytics, payments, or secret keys are present. Interactive controls never send commands to QUINN's private systems.

## Verification

Run `python3 research/reproduce.py` from `quinn/` to independently recompute the synthetic research sample and compare it with the separately derived analytical solution. The browser's research instrument also checks a same-origin SHA-256 manifest and recomputes all recorded samples. **Both the manifest and dataset belong to this same public repository**; the hash alone cannot establish authorship or external trust.

The main homepage uses a SHA-256-hash-based Content-Security-Policy for its one inline CSS block and inline JavaScript. The standalone research page loads only local, same-origin CSS/JS/JSON with a self-only CSP. No external scripts, fonts, or third-party dependencies are required.

Before changing the public evidence record, review the `research/README.md`, `SECURITY.md` and `proof/SECURITY.md` publication boundaries. Do not automatically publish unreviewed research or expose private bundles, host paths, tokens, root identity material, raw receipts or logs.
