# QUINN public research record

**Scope:** Public, static and untrusted educational evidence showcase. This is **not a live QUINN system feed**, agent control interface, operational dashboard, or report of independently verified scientific discovery.

## Included artifacts

- `catalog.json`: human-curated list of public demonstration artifacts, including SHA-256 of the raw sample JSON. This manifest is served from the **same site**: it is a consistency check, **not an authenticated independent trust anchor**.
- `data/synthetic-oscillator-001.json`: deterministic 401-row synthetic demonstration over 12 seconds. No measurements, no private QUINN research outputs, no model learned by QUINN.
- `reproduce.py`: Python 3 standard-library verifier checks checksum, every recorded sample by recomputation, the analytical solution and the aggregate RMSE. Run `python3 reproduce.py` from any working directory after downloading the same folder hierarchy.
- `index.html`, `style.css`, `app.js`: static research reading interface with browser-side local verification and in-memory tamper detection. No external scripts, telemetry, paid APIs, or connections to the private runtime.

### Mathematical setup

Reference system (mass 2 kg, stiffness 5 N/m, damping 0.6 N s/m):

`a = -2.5*x - 0.3*v + 0.5*F`

Illustrative fixed approximate candidate:

`a = -2.38*x - 0.26*v + 0.48*F`

Both use RK4 integration, time step 0.03 s, 401 samples, initial displacement 0.8 m, zero initial velocity, and zero applied force. The reference is independently compared with the closed-form underdamped harmonic oscillator solution. Comparing numerical and analytical solutions validates numerical fidelity *for this synthetic problem*, not a scientific finding or private QUINN capability.

## Evidence policy

A future QUINN scientific result must have an explicitly identified source and provenance, the original conditions and limitations, independently executable code, evidence for an independent audit or replication when claimed, and human editorial review before publication. No private paths, keys, identity roots, tokens, endpoints, user logs, or sensitive research material may be added to this public repository.

The separate `../proof/` lab uses disposable keys to test self-consistent Ed25519 fixtures; these fixtures do **not** establish real-world identity, consent, execution provenance, or authenticated trust.

## Testing

From the repository's `quinn/research/` folder run:

```
python3 reproduce.py
```

For an actual interactive page, use an HTTPS static server such as GitHub Pages (because the browser needs WebCrypto and fetch access to local JSON). Opening `index.html` directly as `file://` may not permit data fetch or WebCrypto.

The checks may be falsified by anyone controlling both the manifest and the artifact; compare against a separately trusted commit or independently pinned hash when evaluating authorship or immutable provenance.
