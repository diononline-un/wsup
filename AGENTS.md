# WSUP (wsup) — Projektregeln

Gilt zusätzlich zu `~/.dsh/AGENTS.md`, projektspezifisch.

## Links und Zugriff

- Jede URL an den Nutzer immer als Tailscale-Link ausgeben, nie `localhost`/`127.0.0.1` —
  der Browser läuft in der Regel auf einem anderen Rechner.
- App (SvelteKit, Port 2018): http://vmd194777.taild7e20.ts.net:2018
- PocketBase-Admin (Port 2017): http://vmd194777.taild7e20.ts.net:2017/_/
- Tailscale-IP als Fallback: 100.87.5.121.
- Beide Dev-Server binden `0.0.0.0` (`scripts/dev-pb.sh`, `web/package.json`), Vite erlaubt den
  Tailscale-Host über `server.allowedHosts` in `web/vite.config.ts`.

## Stack und Ports

- Web: SvelteKit 2 / Svelte 5 / Tailwind 4 in `web/`, Dev-Port 2018.
- Backend: PocketBase 0.40 (Binary `.tools/pocketbase`, gitignored), Port 2017, Daten in `pb_data/` (gitignored).
- Migrationen in `pb_migrations/` mit `--automigrate=false` im Dev-Script; Schemaänderungen nur über Migrationen.
- Ports: 2017 PocketBase, 2018 Web, nächster freier Ring-Port 2019.

## Auth und Seed

- PocketBase-Auth-Collection `users` mit Username-Identität; `email` ist optional und ungenutzt.
- Signup nur serverseitig über `POST /api/signup` (`web/src/routes/api/signup/+server.ts`) mit Superuser-Client.
- 25-Wort-Seed = 24 BIP39-Wörter + SHA-256-Checksumwort (`web/src/lib/seed/phrase.ts`).
- Dev-URLs laufen über HTTP: `crypto.subtle` existiert dort nicht. Seed-Hashing deshalb mit lokalem
  SHA-256 (`web/src/lib/seed/sha256.ts`), nicht mit WebCrypto. Im Browser nur `crypto.getRandomValues` nutzen.
- Recovery-Hash: scrypt in `web/src/lib/server/recovery.ts`, gespeichert in `user_secrets` (API-Rules `null`,
  nur Superuser). Seed-Wörter niemals speichern oder loggen.
- Superuser-Zugang für Server-Calls aus `web/.env` (`PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD`, gitignored).

## Marke und UI

- Produktname: **WSUP** (W-S-U-P), Beschreibung "Supplement Stack Calculator". Logo als gestapelte Balken
  (`web/src/lib/Logo.svelte`), Favicon `web/static/favicon.svg`.
- Dark Mode: System-Default plus Header-Toggle (sofortiger Wechsel Light/Dark), Auswahl im Settings-Bereich;
  Umsetzung in `web/src/lib/theme.ts`, Vorab-Anwendung per Inline-Script in `web/src/app.html`, Tailwind-Variante
  `@custom-variant dark` in `web/src/app.css`. Komponenten-Klassen `ui-*` nutzen, damit beide Modi stimmen.
- Routen: `/signup`, `/login`, `/dashboard`, `/onboarding/profile`, `/settings`.
- Account-API: `/api/signup`, `/api/account/export` (JSON-Download, ohne Recovery-Hash), `/api/account/delete`
  (Passwort-Re-Check, Superuser-Löschung, Cascades räumen Profil/Secrets/Stacks/Feeds).

## Befehle

```bash
./scripts/dev-pb.sh                      # PocketBase 0.0.0.0:2017
cd web && npm run dev                    # SvelteKit 0.0.0.0:2018
cd web && npm test                       # node --test: phrase, sha256, credentials, recovery
cd web && npm run build                  # adapter-node Build
```
