# Changelog

## 2026-11-03 — Plan-Refresh im Dashboard, Pro-Freischaltung

- Dashboard ruft `authRefresh()` auf: Tier-Änderungen (z. B. Pro-Freischaltung) sind nach dem Login sichtbar, ohne neu einzuloggen; ungültige Tokens führen zurück zum Login.
- Account `happycappy` auf `tier = pro` gesetzt (kompensiert, kein Abo/keine Zahlung, kein Ablaufdatum im Datenmodell).
- Headless geprüft: Pro-Account zeigt im Dashboard "Pro" und den Seed-Verified-Hinweis.

## 2026-11-03 — Tailscale-Zugriff und SHA-256 ohne WebCrypto

- Beide Dev-Server binden `0.0.0.0`; Vite erlaubt den Tailscale-Host über `server.allowedHosts`, PocketBase läuft im Dev-Script mit `--automigrate=false`.
- Links an den Nutzer nur noch als Tailscale-Adressen: App http://vmd194777.taild7e20.ts.net:2018, PocketBase-Admin http://vmd194777.taild7e20.ts.net:2017/_/.
- Seed-Checksum nutzt lokales SHA-256 (`web/src/lib/seed/sha256.ts`) statt `crypto.subtle`: HTTP über Tailscale ist ein insecure context, dort fehlt WebCrypto (nur `getRandomValues` ist verfügbar).
- Tests um SHA-256-Vektoren und `node:crypto`-Abgleich erweitert (14 Fälle), End-to-End-Signup über die Tailscale-FQDN im Headless-Browser geprüft.
- Projekt-`AGENTS.md`, globale `AGENTS.md`, Port-Ring und Memory um Links/Ports ergänzt.

## 2026-11-03 — Projekt-Gerüst, PocketBase-Schema, anonymes Signup

- SvelteKit-Web-App (Tailwind v4) unter `web/`, PocketBase unter Port 2017, Web unter 2018.
- PocketBase-Migrationen für `users` (Username-only-Auth, kein Email-Zwang), `user_profiles`, `user_secrets`, `substances`, `substance_interactions`, `user_stacks`, `calendar_feeds` inkl. 20 Seed-Substanzen und 6 Interaktionen.
- Anonymes Signup: 25-Wort-Seed (24 BIP39-Wörter + SHA-256-Checksumwort), erzwungener `.txt`-Download, 3-5-Wort-Quizz, scrypt-Hash in admin-only `user_secrets`.
- Login (Username case-insensitive), Session-Anzeige im Header, Dashboard-Gerüst; `withAdmin`-Retry bei 401 nach PocketBase-Neustart.
- Offen: Profil-Onboarding mit Info-Tooltips, Confidence Score, BYOS, ICS-Feeds, AI-Service, Seed-Recovery, Rate-Limit für Signup.
