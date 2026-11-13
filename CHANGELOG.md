# Changelog

## 2026-11-03 — DeepSeek als AI-Provider verdrahtet

- Einheitliches Root-`.env` (gitignored) für PocketBase- und DeepSeek-Zugang; SvelteKit lädt Env über `kit.env.dir: '..'`.
- Variablen: `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL_BASIC=deepseek-flash`, `DEEPSEEK_MODEL_PRO=deepseek-v4-pro`. Key bleibt serverseitig (kein PUBLIC-Prefix).
- Key gegen DeepSeek geprüft: `/models` 200, Chat-Completion 200. `apiforenv.txt` bleibt gitignored.
- `.env.example` dokumentiert die Variablen mit Platzhaltern.

## 2026-11-03 — Evidence-Library mit Research-Database

- Neue Collection `substance_evidence` (Papers mit DOI/PMID/URL) und Research-Felder auf `substances` (`research_summary`, `evidence_note`, `claims`, `research_updated`); Evidenzskala auf A–E erweitert.
- Datensatz `research/evidence.json`: 20 Substanzen, 60 Quellen, 50 Claims. Peptid-Quellen aus dem rejuvia-Forschungspool übernommen, Stanni-Supplements mit PubMed-Recherche (Meta-Analysen, RCTs, Position Stands, DOI/PMID) belegt.
- Öffentliche Seiten `/evidence` (Kategorien, Evidenzgrade) und `/evidence/<slug>` (Summary, Claims mit Level/Status, Quellen, Interaktionen, Disclaimer), verlinkt in Navigation und Landing.
- Migration `pb_migrations/1757400003_research.js` validiert den Datensatz beim Seed; `research/evidence.test.mjs` prüft Pflichtfelder und 1:1-Mapping zu den Seed-Substanzen.
- Tests: 21 grün, Build sauber.

## 2026-11-03 — WSUP-Branding, Dark Mode, Profil-Onboarding, Settings

- Marke auf WSUP festgelegt: Logo (gestapelte Balken), Favicon, Header-Wortmarke, Titel und Footer.
- Dark Mode mit System-Erkennung, sofortigem Header-Toggle und gespeicherter Auswahl; alle Seiten nutzen die `ui-*`-Klassen.
- Profil-Onboarding `/onboarding/profile`: Körper, Lifestyle, Gesundheit, Zyklus (nur bei biologischem Geschlecht female), Info-Tooltips je Feld, Metrik/Imperial-Umschaltung, Speichern in `user_profiles`.
- Dashboard zeigt Plan-Badge, Profilstatus (Complete/Missing) und funktionierende Links; "Build your profile / Next step" führt jetzt wirklich ins Onboarding.
- Settings `/settings`: Theme-Auswahl, JSON-Export aller Account-Daten, Account-Löschung mit Passwort-Re-Check und Cascade.
- Tests auf 17 erweitert (Theme-Logik), Build sauber, Headless-Durchlauf über Tailscale grün (Signup, Profil, Dark Mode, Export, Löschung).

## 2026-11-03 — Plan-Refresh im Dashboard, Pro-Freischaltung

- Dashboard ruft `authRefresh()` auf: Tier-Änderungen (z. B. Pro-Freischaltung) sind nach dem Login sichtbar, ohne neu einzuloggen; ungültige Tokens führen zurück zum Login.
- Account `happycappy` auf `tier = pro` gesetzt (kompensiert, kein Abo/keine Zahlung, kein Ablaufdatum im Datenmodell).
- Headless geprüft: Pro-Account zeigt im Dashboard "Pro" und den Seed-Verified-Hinweis.

## 2026-11-03 — Tailscale-Zugriff und SHA-256 ohne WebCrypto

- Beide Dev-Server binden `0.0.0.0`; Vite erlaubt den Tailscale-Host über `server.allowedHosts`, PocketBase läuft im Dev-Script mit `--automigrate=false`.
- Links an den Nutzer nur noch als Tailscale-Adressen: App http://localhost:2018, PocketBase-Admin http://localhost:2017/_/.
- Seed-Checksum nutzt lokales SHA-256 (`web/src/lib/seed/sha256.ts`) statt `crypto.subtle`: HTTP über Tailscale ist ein insecure context, dort fehlt WebCrypto (nur `getRandomValues` ist verfügbar).
- Tests um SHA-256-Vektoren und `node:crypto`-Abgleich erweitert (14 Fälle), End-to-End-Signup über die Tailscale-FQDN im Headless-Browser geprüft.
- Projekt-`AGENTS.md`, globale `AGENTS.md`, Port-Ring und Memory um Links/Ports ergänzt.

## 2026-11-03 — Projekt-Gerüst, PocketBase-Schema, anonymes Signup

- SvelteKit-Web-App (Tailwind v4) unter `web/`, PocketBase unter Port 2017, Web unter 2018.
- PocketBase-Migrationen für `users` (Username-only-Auth, kein Email-Zwang), `user_profiles`, `user_secrets`, `substances`, `substance_interactions`, `user_stacks`, `calendar_feeds` inkl. 20 Seed-Substanzen und 6 Interaktionen.
- Anonymes Signup: 25-Wort-Seed (24 BIP39-Wörter + SHA-256-Checksumwort), erzwungener `.txt`-Download, 3-5-Wort-Quizz, scrypt-Hash in admin-only `user_secrets`.
- Login (Username case-insensitive), Session-Anzeige im Header, Dashboard-Gerüst; `withAdmin`-Retry bei 401 nach PocketBase-Neustart.
- Offen: Profil-Onboarding mit Info-Tooltips, Confidence Score, BYOS, ICS-Feeds, AI-Service, Seed-Recovery, Rate-Limit für Signup.
