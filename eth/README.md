# ETH Kraken Bot — trading research portfolio

This is a **public, static exhibition** of the Python ETH futures **paper-trading research** project. It documents the project's reported architecture, deterministic strategy rules, qualification status, historical risk configurations, audit evidence, and research limitations. It is **not** the bot's runtime, an exchange client, a trading interface, a source of real-time prices, or an account dashboard.

## Presentation and synthetic chart

The distinct trading-terminal visual system uses dark data panels, candlesticks, a decision-gate display, and audit tables. The chart is locally generated and **synthetic**: numbers represent a unitless relative index, not ETH prices, paper-control P&L, actual trades, strategy forecasts, or live market data. Switching 24, 48, or 72 bars simply displays a different length of the same deterministic illustrative series. No data is fetched from the network.

The architecture control and the six-condition strategy example are also local illustrations. They do not access Kraken, execute orders, access the trading bot, or infer a live entry signal. The app does not use emojis or promotional slogans.

## Factual boundaries

Details are taken from the **ETH Kraken Bot — YNG3 Portfolio Handoff** provided November 5, 2026. The private repository and historical tests were **not independently audited** for this portfolio. The latest available project audit dated 2026-11-01 reports that **paper autonomy and live trading were not qualified**. No current equity, valid paper return, live result, or profitability is established.

- **Project record reported:** 1,374 ledger events; 535 strategy decisions; 2 reconciled fills; 6,780 pinned-reference comparisons without mismatch; 16 frozen marks detected in a historical replay, with 266 healthy snapshots and zero false positives. These checks were not rerun for this page.
- **Stale paper-state file:** $1,004.70 saved collateral, last updated October 8. Not validated current equity; never calculate return from this value.
- **Failed isolated shadow simulation:** $400 to $349.758; 18 losing closes; 12.56% max drawdown; $16.8203 recorded fees. Not paper control or live trading.
- **Historical contract variants:** charter v1 baseline, paper contract v3 aggressive, and July qualification candidate are separate past documents, not asserted current configurations.

## Files and security

- `index.html`: semantic layout and the complete factual content.
- `design.css`: original trading-terminal visual system, responsive without web fonts.
- `app.js`: keyboard-accessible architecture tabs and deterministic condition toggles.
- `chart.js`: zero-network, deterministic synthetic OHLC-like chart (no orders or forecasting).

The page enforces a strict Content Security Policy with same-origin scripts and styles, `connect-src 'none'`, and no inline JS or external libraries, telemetry, cookies, exchange credentials, forms, payments, or private endpoint connections. The existing YNG3 favicon is the only reference outside this directory.

The public homepage keeps QUINN and ETH Kraken Bot only in the lower `Selected work` portfolio section; the original homepage is otherwise unchanged. The deferred complete YNG3 homepage redesign must remain unmerged.

## Validation

Validated via isolated Chromium rendering at viewport widths 1440, 1024, 820, 390, and 320px. Confirmed architecture tab selection and keyboard Home navigation, simulated condition presets, 24/48/72 chart controls and canvas rendering, absence of detected JavaScript errors, no horizontal overflow, and matching dark styles. GitHub Pages routing and any production deployment should be inspected after merge.

Research-software demonstration only. Not investment advice or evidence of qualified live trading.

## Trading interface refinements — November 5, 2026

The second portfolio iteration strengthens the interface while leaving the private bot and its factual claims unchanged:

- Synthetic chart now supports 24/48/72 generated-bar windows, candle/close-line views, pointer and keyboard inspection of individual bars, and unitless open/high/low/close/volume readouts. Downloaded CSV data is generated locally and is **not** an export of Kraken data, executed trades, or performance history.
- The five-stage architecture explorer now has a corresponding five-node diagram. Stages for the paper adapter and reconciliation no longer share the same diagram node.
- A source/evidence classification panel distinguishes implementation described in the handoff, project-record-reported tests, the isolated failed shadow simulation, and unestablished performance claims.
- Mobile navigation retains all section links, with visible focus styles and a dedicated screen-reader announcement for keyboard-based chart inspection.
- No external data sources, accounts, order controls, API keys, LLM dependencies, or analytics were introduced. The site uses static HTML, CSS, and browser-local JavaScript.

### Verification scope

Playwright Chromium interaction tests covered widths of 320, 390, 820, 1024, and 1440 px. Tested chart modes, all ranges, keyboard/step selection, local CSV download containing a header and 72 rows, stage selection, strategy presets, and horizontal overflow. Tests used an in-memory page with bundled local assets because direct `file://` navigation is restricted in the test environment; normal GitHub Pages serving and cross-page navigation remain deployment checks. Content Security Policy retains `connect-src 'none'` and same-origin asset restrictions.

The underlying facts still derive from the November 5 handoff and historical project records, not a newly verified code audit. No additional performance claims are made.
