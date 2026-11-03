# Supplement Stack Calculator (wsup)

Multi-tenant SaaS for evidence-based supplement and peptide stacks: anonymous accounts, profile-driven
recommendations with a confidence score, Bring Your Own Stack matching, and tokenized ICS calendar feeds.

Current milestone: PocketBase schema + anonymous signup with 25-word recovery seed.

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

Tests: `cd web && npm test` (seed phrase, credential rules, scrypt hashing).

## Auth model

- PocketBase `users` auth collection with username-only login; the email field is optional and unused.
- Signup is server-side (`POST /api/signup`): the client generates a 25-word seed (24 BIP39 words + SHA-256
  checksum word), forces the `.txt` download, then submits 3-5 randomly requested words. The server re-validates
  the phrase, checks the answers, and stores only a scrypt hash of the phrase in `user_secrets` (admin-only rules).
- No password reset yet: recovery via the seed phrase is the next auth task.

## Collections

`users` (extended), `user_secrets` (recovery hash), `user_profiles`, `substances`,
`substance_interactions`, `user_stacks`, `calendar_feeds`. Seed data: 20 substances, 6 interactions.

## Ports

2017 PocketBase, 2018 web. Next free ports in the ring: 2019+.
