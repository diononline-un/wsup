# WSUP (wsup) — Projektregeln

Gilt zusätzlich zu `~/.dsh/AGENTS.md`, projektspezifisch.

## Links und Zugriff

- Jede URL an den Nutzer immer als Tailscale-Link ausgeben, nie `localhost`/`127.0.0.1` —
  der Browser läuft in der Regel auf einem anderen Rechner.
- App (SvelteKit, Port 2018): http://localhost:2018
- PocketBase-Admin (Port 2017): http://localhost:2017/_/
- Tailscale-IP als Fallback: localhost.
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
- Superuser-Zugang für Server-Calls aus dem Root-`.env` (`PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD`, gitignored); `web/svelte.config.js` lädt Env über `kit.env.dir: '..'`.

## Marke und UI

- Produktname: **WSUP** (W-S-U-P), Beschreibung "Supplement Stack Calculator". Logo als gestapelte Balken
  (`web/src/lib/Logo.svelte`), Favicon `web/static/favicon.svg`.
- Dark Mode: System-Default plus Header-Toggle (sofortiger Wechsel Light/Dark), Auswahl im Settings-Bereich;
  Umsetzung in `web/src/lib/theme.ts`, Vorab-Anwendung per Inline-Script in `web/src/app.html`, Tailwind-Variante
  `@custom-variant dark` in `web/src/app.css`. Komponenten-Klassen `ui-*` nutzen, damit beide Modi stimmen.
- Routen: `/signup`, `/login`, `/dashboard`, `/onboarding/profile`, `/settings`.
- Account-API: `/api/signup`, `/api/account/export` (JSON-Download, ohne Recovery-Hash), `/api/account/delete`
  (Passwort-Re-Check, Superuser-Löschung, Cascades räumen Profil/Secrets/Stacks/Feeds).

## AI / DeepSeek

- Ein einziges Root-`.env` (gitignored) enthält `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL=https://api.deepseek.com`,
  `DEEPSEEK_MODEL_BASIC=deepseek-flash`, `DEEPSEEK_MODEL_PRO=deepseek-v4-pro`. SvelteKit liest es per `kit.env.dir: '..'`.
- Der Key ist Plattform-Key: Pro-Nutzer werden serverseitig darüber versorgt. Niemals mit `PUBLIC_` prefixen und nie
  aus dem Browser gegen DeepSeek rufen; nur Server-Routen/Services lesen `$env/dynamic/private`.
- Key-Rohdatei `apiforenv.txt` ist gitignored; kein Secret committen (auch nicht in `.env.example`).

## Research / Evidence

- Dataset: `research/evidence.json` (Quelle der Wahrheit), Schema + Provenienz in `research/README.md`.
- Migration `pb_migrations/1757400003_research.js` liest die Datei per `$os.readFile("research/evidence.json")` —
  PocketBase muss aus dem Repo-Root gestartet werden (`./scripts/dev-pb.sh`). `$os.readFile` liefert Bytes:
  mit `String.fromCharCode` in einen String wandeln, nicht direkt an `JSON.parse` geben.
- Peptid-Quellen: aus `./src/lib/forschung/subjects/` extrahiert (dort mit PMID/DOI geprüft).
  Stanni-Quellen: PubMed E-utilities, Metadaten mit DOI/PMID im Datensatz.
- Evidenzskala A-E (A stärkste), Claims brauchen `level` + `status`; `web && npm test` prüft 1:1-Mapping zu
  den Seed-Substanzen und alle Pflichtfelder.
- Öffentliche Seiten `/evidence` und `/evidence/<slug>` lesen per Server-Loader (PocketBase public read).

## Befehle

```bash
./scripts/dev-pb.sh                      # PocketBase 0.0.0.0:2017
cd web && npm run dev                    # SvelteKit 0.0.0.0:2018
cd web && npm test                       # node --test: phrase, sha256, credentials, recovery
cd web && npm run build                  # adapter-node Build
```
