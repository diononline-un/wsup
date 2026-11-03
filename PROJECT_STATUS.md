---
status: in-development
progress: 50
version: "0.1.0"
tags: [saas, supplements, peptides, sveltekit, tailwind, pocketbase, deepseek, ics]
scope: "Multi-Tenant-Cloud-SaaS fuer evidenzbasierte Supplement-/Peptid-Stacks: anonyme Auth mit 25-Wort-Recovery-Seed, Profil, Confidence Score, BYOS-Matching, Safety Override, ICS-Feeds. Basic 1 Feed, Pro 3 Feeds."
last_updated: "2026-11-03"
next_steps:
  - "Seed-Recovery-Flow (25 Woerter gegen recovery_hash), Rate-Limit fuer /api/signup, Passwort aendern"
  - "Recommendation Engine + Confidence Score (Baseline-Portfolio, spezialisierte Peptide) aufsetzen"
  - "Evidence-Daten pflegen: neue Papers pro Substanz nachziehen (research/evidence.json + Migration) und Peptid-Seiten mit vollstaendigen rejuvia-Dossiers vertiefen"
  - "BYOS-Matching und Safety-Override (Pro) inkl. Bestaetigungs-Logging"
  - "ICS-Feed-Generator /api/v1/calendar/:token.ics (1 Feed Basic, 3 Pro)"
  - "AI-Service an DeepSeek anbinden (deepseek-flash fuer Basic, deepseek-v4-pro fuer Pro, Plattform-Key serverseitig aus .env)"
---

# Supplement Stack Calculator (wsup)

SvelteKit + Tailwind (web, Port 2018), PocketBase (Port 2017) als Backend, Node AI-Service (geplant).

Stand: WSUP-Branding mit Logo, Dark Mode, anonymes Signup mit 25-Wort-Seed, Profil-Onboarding mit
Info-Tooltips und Metrik/Imperial, Settings mit Datenexport/Loeschung, Evidence-Library mit 20 Substanzen,
60 Quellen und 50 Claims (`/evidence`).

Dev-Start: `./scripts/dev-pb.sh` (PocketBase), `cd web && npm run dev`.
Links (Tailscale, immer statt localhost): App http://vmd194777.taild7e20.ts.net:2018,
PocketBase-Admin http://vmd194777.taild7e20.ts.net:2017/_/.
