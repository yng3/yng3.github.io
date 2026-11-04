# QUINN — Cinematic Public Exhibition

This directory is a static, untrusted public presentation layer. It is **not** QUINN's operating interface and has no access to private identity material, agent tools, hosts, accounts, receipts, or runtime status.

## Page structure

- `index.html`: standalone cinematic exhibition with a procedural orbital field, interactive architecture explorer, and **local demonstration-only** operator interface.
- `content/dispatches.json`: a human-reviewed public research archive, loaded from the same origin and rendered as text (not HTML).
- `proof/`: existing synthetic proof lab, retained without changes.
- `assets/`: existing static favicon and social preview assets.
- `styles.css` and `app.js`: pre-redesign assets retained for review and easy rollback; the new page does not load them.

The new page uses a narrow, SHA-256-hash-based Content-Security-Policy for its one inline CSS block and one inline script. It does not load external libraries, use telemetry, call paid APIs, or connect to QUINN services.

## Review and publication

Public URL after this branch is merged: https://yng3.github.io/quinn/

Before merging:
1. Review public-facing descriptions, confirm claims and publication boundaries.
2. Check the desktop and mobile layouts, keyboard controls, reduced-motion mode, and the journal's ALL/RESEARCH/THESIS filters.
3. Open `./proof/` to confirm the preexisting proof lab remains available.
4. Inspect all new HTML/CSS/JS for inadvertent secrets or live-runtime connectivity.

The curated records are editorial notes, not a live discovery feed. Do not publish private paths, keys, root bundles, credentials, raw logs, or unreleased findings.
