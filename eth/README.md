# ETH Kraken Bot — YNG3 portfolio

This is a **public exhibition** of a Python ETH futures **paper-trading research** system. It is not a trading interface or a live metrics dashboard. The page has no account login, exchange authentication, market-data fetch, order controls, payment mechanism, telemetry, remote runtime link, or private state.

## Evidence provenance

Descriptions and historical figures are transcribed from the **ETH Kraken Bot — YNG3 Portfolio Handoff** supplied November 5, 2026, reflecting the latest documented read-only audit dated November 1, 2026. This website's author did not independently access or rerun the bot source or the project-reported historical checks. Labels distinguish:

- **Source reported**: deterministic entry/exit conditions, Python architecture, ledger controls, and historical contract configurations as described in the handoff.
- **Project-record reported**: 1,374 events, 535 decisions, 2 reconciled fills, 6,780 parity comparisons, 16 frozen-mark detections and 266 healthy snapshots. Not rerun here.
- **Historical failed shadow simulation**: $400 start, $349.758 end, 18 closed losses, 12.56% drawdown, $16.8203 fees. Not the control account or live trading.
- **Stale paper-state snapshot**: $1,004.70 collateral last updated October 8, 2026. Not verified equity or return.
- **Not established**: current equity, P&L, profitable strategy, qualified paper autonomy or live results.

The strategy interactive is a **pure logic demonstration**; checkboxes represent hypothetical Boolean conditions. It does not consume prices or execute trades. The hero's procedural canvas is abstract design and must not be construed as live market data.

## Architecture boundaries

- All page resources are inline and local except the existing YNG3 favicon, retrieved by relative path.
- CSP restricts script and style to their exact source hashes, allows no connections, and forbids frames/forms/objects.
- No operational credentials or host details have been copied from the handoff.
- Historical risk configurations are kept separate: charter v1, paper contract v3, and July qualification candidate.
- Source filenames shown on the page serve as contextual pointers from the handoff, **not publicly audited code**.

## Validation

Isolated Chromium rendering and interaction checks exercised 1440×900, 820×960, 390×844, and 320×740 layouts. Architecture tab switching and keyboard navigation, signal preset/checkbox interactions, no-JavaScript-error smoke checks and horizontal-overflow checks passed. Tests rendered HTML with `page.set_content`, because local file navigation is blocked in this environment. GitHub Pages serving and cross-page navigation still require verification after a future merge.

## Publishing

Stage with a reviewed pull request. Publication should occur only after review of all public-facing facts and claims. Do not merge the deferred YNG3 cinematic homepage proposal. The main site's selected-work list can add this page as a second project without changing its overall design.
