#!/usr/bin/env bash
# Start the dev PocketBase instance on port 2017 with project migrations.
set -euo pipefail
cd "$(dirname "$0")/.."
exec ./.tools/pocketbase/pocketbase serve --http=0.0.0.0:2017 --dir=./pb_data --migrationsDir=./pb_migrations --automigrate=false
