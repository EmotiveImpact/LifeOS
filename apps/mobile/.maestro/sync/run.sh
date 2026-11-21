#!/usr/bin/env bash
# Two-phone sync (BUILD_V26 Phase 30): phone A adds someone, phone B signs in to the same account and finds them.
#
# Needs Maestro, bun, node, and a Postgres set up as in review/phase-21/NOTES.md: MIGRATE_URL connects as the owner
# (for migrations), DATABASE_URL as the life_api role the API uses. Two booted devices (simulators or emulators) need a
# development build of Life whose EXPO_PUBLIC_LIFE_API_URL is http://localhost:8787: plain http is allowed only to
# this computer, and only in development builds.
#
#   DEVICE_A=<udid> DEVICE_B=<udid> MIGRATE_URL=postgres://owner@… DATABASE_URL=postgres://life_api@… \
#     apps/mobile/.maestro/sync/run.sh
set -euo pipefail
: "${DEVICE_A:?set DEVICE_A to the first device id}" "${DEVICE_B:?set DEVICE_B to the second device id}" "${DATABASE_URL:?set DATABASE_URL}"
here="$(cd "$(dirname "$0")" && pwd)"
api="$(cd "$here/../../../api" && pwd)"
log="$(mktemp -t life-api.XXXXXX)"
stamp="$(date +%s)"
email="sync-$stamp@example.com"
person="Sync check $stamp"

# Throwaway secrets for this run only: the local API needs them to start.
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-$(openssl rand -hex 32)}"
export TOKEN_KEY="${TOKEN_KEY:-$(openssl rand -base64 32)}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:8787}"

(cd "$api" && DATABASE_URL="${MIGRATE_URL:-$DATABASE_URL}" bun src/db/migrate.ts)
(cd "$api" && bun src/server.ts >"$log" 2>&1) & api_pid=$!
node "$here/codes.js" "$log" 8799 & codes_pid=$!
trap 'kill "$api_pid" "$codes_pid" 2>/dev/null || true; rm -f "$log"' EXIT
for _ in $(seq 1 30); do curl -sf http://localhost:8787/health >/dev/null && break; sleep 1; done

# Android emulators reach this computer's localhost through adb; iOS simulators share it already.
for device in "$DEVICE_A" "$DEVICE_B"; do adb -s "$device" reverse tcp:8787 tcp:8787 >/dev/null 2>&1 || true; done

common=(-e EMAIL="$email" -e PERSON="$person" -e CODES_URL=http://127.0.0.1:8799)
maestro --device "$DEVICE_A" test "${common[@]}" "$here/phone-a.yaml"
# Phone A sends its changes a few seconds after the last one.
sleep 8
maestro --device "$DEVICE_B" test "${common[@]}" "$here/phone-b.yaml"
echo "Sync between two phones: passed ($person)"
