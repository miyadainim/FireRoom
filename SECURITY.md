# Security and privacy

This is a hackathon prototype, not an audited multi-user service. Report a suspected vulnerability privately to the repository owner using GitHub private vulnerability reporting when enabled. Never include live controller tokens, session QR codes, participant footage or landmark exports in a public issue.

The phone runs inference locally. Normal transport sends numeric image/world landmarks and metadata; it does not stream raw camera video. Optional recording captures video on the phone for local download. Pose exports still contain body-derived personal data. Keep them private unless the participant has explicitly agreed to the exact release.

Use only the restricted gateway on port 8790 for a Cloudflare tunnel. Never tunnel relay 8787, runtime provisioning 9137, Appium 4723, or the debugger. The gateway serves dist, limits routes/payloads, requires controller authorization to create sessions and send recording commands, and checks session capabilities on pose access. A pairing link grants access to its session; treat it as a secret.

Controller authorization is generated at gateway startup into artifacts/phone-vega/controller-token.txt and delivered to the native wrapper over loopback/VDA reverse. Hosted requests carry it over HTTPS. Do not embed it in frontend source, publish it in a bundle, or print it. Stop the gateway to invalidate its session allowlist. Restart creates new authorization; relaunch the wrapper and re-pair. Stop the tunnel to remove public reachability.

No wildcard cleartext or TLS certificate bypass is supported. The simulator manifest allows HTTP only to its host gateway10.0.2.2; the phone uses HTTPS. Preserve these boundaries when changing deployment.

Known limitations: in-memory single-host state, no production identity/account system, no independent security audit, no rate-limit/abuse hardening guarantee, and no durable production backend. The gateway currently uses single-frame fallback rather than the relay's buffered /api/frames route.
