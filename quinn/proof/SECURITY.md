# Demo security and provenance

This static code is a research demonstration, not a security appliance.

- There is no secret root or operational QUINN identity key anywhere in the site.
- Public sample controller/worker keys were generated transiently in-memory and
  never represent production agents or externally authenticated principals.
- A passing verification means the synthetic fixture's own fields are
  self-consistent with the supplied public keys, nothing more.
- No external verifier trust, replay protection backed by a shared journal,
  certificate validation, trusted consent source, budget transaction, or host
  attestation is performed by this browser page.
- The public site never accepts payment or performs work.
- No data is transmitted by client JavaScript to any endpoint other than a
  same-origin GET for the public synthetic fixture.
- Avoid pasting real receipts or secrets into browser dev tools; the demo does
  not accept user-controlled production receipts.
