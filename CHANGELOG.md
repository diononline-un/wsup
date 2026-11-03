# Changelog

## 2026-11-03 — Projekt-Gerüst, PocketBase-Schema, anonymes Signup

- SvelteKit-Web-App (Tailwind v4) unter `web/`, PocketBase unter Port 2017, Web unter 2018.
- PocketBase-Migrationen für `users` (Username-only-Auth, kein Email-Zwang), `user_profiles`, `user_secrets`, `substances`, `substance_interactions`, `user_stacks`, `calendar_feeds` inkl. 20 Seed-Substanzen und 6 Interaktionen.
- Anonymes Signup: 25-Wort-Seed (24 BIP39-Wörter + SHA-256-Checksumwort), erzwungener `.txt`-Download, 3-5-Wort-Quizz, scrypt-Hash in admin-only `user_secrets`.
- Login (Username case-insensitive), Session-Anzeige im Header, Dashboard-Gerüst; `withAdmin`-Retry bei 401 nach PocketBase-Neustart.
- Offen: Profil-Onboarding mit Info-Tooltips, Confidence Score, BYOS, ICS-Feeds, AI-Service, Seed-Recovery, Rate-Limit für Signup.
