# WSUP — Supplement Stack Calculator

Multi-tenant SaaS for evidence-based supplement and peptide stacks: anonymous accounts, profile-driven
recommendations with a confidence score, Bring Your Own Stack matching, and tokenized ICS calendar feeds.

Brand: **WSUP** (spoken: W-S-U-P). Descriptor: Supplement Stack Calculator.

## What works now

- Anonymous signup with 25-word recovery seed (download, quiz, scrypt hash) and login.
- Profile onboarding (`/onboarding/profile`): body, lifestyle, health and cycle data with "why we ask" tooltips, metric/imperial.
- Dashboard with plan badge, profile status and working links.
- Settings (`/settings`): theme (system/light/dark), JSON data export, account deletion with password re-check.
- Dark mode: follows the OS by default, toggle in the header, choice stored per browser.
- PocketBase schema for the full PRD data model plus 20 seed substances and 6 interactions.
- Evidence library (`/evidence`, `/evidence/<slug>`): research grade per substance, claim-level evidence badges and
  linked papers. 20 substances, 60 sources, 50 claims in `research/evidence.json`.

Not built yet: recommendation engine and confidence score, BYOS matching, ICS feeds, AI service,
seed recovery, password change.

## Stack

- `web/` SvelteKit 2 + Svelte 5 + Tailwind 4 (dev port **2018**)
- PocketBase 0.40 as backend and database (dev port **2017**), migrations in `pb_migrations/`
- AI service for OpenRouter is planned, not built yet

## First-time setup

```bash
# PocketBase binary (gitignored)
mkdir -p .tools/pocketbase
curl -sL -o /tmp/pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.40.6/pocketbase_0.40.6_linux_amd64.zip
python3 -c "import zipfile; zipfile.ZipFile('/tmp/pb.zip').extractall('.tools/pocketbase')"
chmod +x .tools/pocketbase/pocketbase

# migrations + dev superuser
./.tools/pocketbase/pocketbase migrate up --dir=./pb_data --migrationsDir=./pb_migrations
./.tools/pocketbase/pocketbase superuser upsert admin@wsup.local devpass-admin-2016 --dir ./pb_data

# web env + deps
cp web/.env.example web/.env    # set PB_ADMIN_PASSWORD to the superuser password
cd web && npm install && cd ..
```

## Run

```bash
./scripts/dev-pb.sh          # PocketBase, listens on 0.0.0.0:2017
cd web && npm run dev        # SvelteKit, listens on 0.0.0.0:2018
```

## Access

Both servers bind all interfaces so they are reachable through Tailscale:

- App: http://vmd194777.taild7e20.ts.net:2018 (or http://100.87.5.121:2018)
- PocketBase dashboard: http://vmd194777.taild7e20.ts.net:2017/_/

Never use `localhost` links in handoffs: the browser usually runs on another machine. Dev URLs are
plain HTTP, so the browser is an insecure context and `crypto.subtle` is unavailable; the seed checksum
uses the local SHA-256 in `web/src/lib/seed/sha256.ts` for exactly that reason. Vite dev allows the
Tailscale host via `server.allowedHosts` in `web/vite.config.ts`.

Tests: `cd web && npm test` (seed phrase, SHA-256, credential rules, scrypt hashing, theme).

## Auth model

- PocketBase `users` auth collection with username-only login; the email field is optional and unused.
- Signup is server-side (`POST /api/signup`): the client generates a 25-word seed (24 BIP39 words + SHA-256
  checksum word), forces the `.txt` download, then submits 3-5 randomly requested words. The server re-validates
  the phrase, checks the answers, and stores only a scrypt hash of the phrase in `user_secrets` (admin-only rules).
- No password reset yet: recovery via the seed phrase is the next auth task.

## Collections

`users` (extended), `user_secrets` (recovery hash), `user_profiles`, `substances`,
`substance_interactions`, `user_stacks`, `calendar_feeds`. Seed data: 20 substances, 6 interactions.

Account routes: `/signup`, `/login`, `/dashboard`, `/onboarding/profile`, `/settings`; public research:
`/evidence`, `/evidence/<slug>`; API: `/api/signup`, `/api/account/export`, `/api/account/delete`.

Research data: `research/evidence.json`, seeded by `pb_migrations/1757400003_research.js`. Peptide sources come
from the rejuvia research portal; standard supplement references were fetched from PubMed (DOIs/PMIDs in the dataset).
`research/README.md` documents the schema and the update workflow.

## Ports

2017 PocketBase, 2018 web. Next free ports in the ring: 2019+.
