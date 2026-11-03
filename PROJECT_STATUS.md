---
status: in-development
progress: 25
version: "0.1.0"
tags: [saas, supplements, peptides, sveltekit, tailwind, pocketbase, openrouter, ics]
scope: "Multi-Tenant-Cloud-SaaS fuer evidenzbasierte Supplement-/Peptid-Stacks: anonyme Auth mit 25-Wort-Recovery-Seed, Profil, Confidence Score, BYOS-Matching, Safety Override, ICS-Feeds. Basic 1 Feed, Pro 3 Feeds."
last_updated: "2026-11-03"
next_steps:
  - "Profil-Onboarding (user_profiles Formular mit Info-Tooltips, Metrik/Imperial) bauen"
  - "Seed-Recovery-Flow (25 Woerter gegen recovery_hash) und Rate-Limit fuer /api/signup"
  - "Recommendation Engine + Confidence Score (Baseline-Portfolio, spezialisierte Peptide) aufsetzen"
  - "BYOS-Matching und Safety-Override (Pro) inkl. Bestaetigungs-Logging"
  - "ICS-Feed-Generator /api/v1/calendar/:token.ics (1 Feed Basic, 3 Pro)"
  - "Node.js AI-Service an OpenRouter anbinden (DeepSeek default, Claude Pro)"
---

# Supplement Stack Calculator (wsup)

SvelteKit + Tailwind (web, Port 2018), PocketBase (Port 2017) als Backend, Node AI-Service (geplant).

Stand: Repo-Geruest, PocketBase-Collections + Seed-Substanzen, anonyme Signup-Strecke mit
25-Wort-Recovery-Seed (Download + 3-5-Wort-Quizz), Seed-Hash in admin-only Collection.

Dev-Start: `./scripts/dev-pb.sh` (PocketBase), `cd web && npm run dev`.
