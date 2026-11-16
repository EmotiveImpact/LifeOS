#!/usr/bin/env bash
# Uploads an already signed Release IPA. Does not submit a public App Store release.
set -euo pipefail
: "${RUNNER_TEMP:?GitHub runner required}"
: "${ASC_KEY_ID:?App Store Connect API key ID required}"
: "${ASC_ISSUER_ID:?App Store Connect issuer ID required}"
: "${ASC_PRIVATE_KEY:?App Store Connect private key required}"
: "${ASC_APP_ID:?Numeric App Store Connect app ID required}"
: "${IPA_PATH:?Signed IPA path required}"
: "${BUNDLE_ID:?Bundle identifier required}"
: "${APP_VERSION:?App version required}"
: "${BUILD_NUMBER:?Build number required}"
[[ "$ASC_APP_ID" =~ ^[0-9]+$ ]] || { printf 'ASC_APP_ID must be the numeric Apple app ID\n' >&2; exit 1; }
[[ "$ASC_KEY_ID" =~ ^[A-Za-z0-9]+$ ]] || { printf 'Invalid API key ID\n' >&2; exit 1; }
[[ -f "$IPA_PATH" ]] || { printf 'Signed IPA missing\n' >&2; exit 1; }
API_PRIVATE_KEYS_DIR=$(mktemp -d "$RUNNER_TEMP/life-appstore.XXXXXX")
export API_PRIVATE_KEYS_DIR
trap 'rm -rf "$API_PRIVATE_KEYS_DIR"' EXIT
umask 077
printf '%s' "$ASC_PRIVATE_KEY" > "$API_PRIVATE_KEYS_DIR/AuthKey_$ASC_KEY_ID.p8"
unset ASC_PRIVATE_KEY
xcrun altool --upload-package "$IPA_PATH" --type ios \
  --apple-id "$ASC_APP_ID" --bundle-id "$BUNDLE_ID" \
  --bundle-version "$BUILD_NUMBER" --bundle-short-version-string "$APP_VERSION" \
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" --output-format json
printf '\nUploaded for App Store Connect processing. TestFlight availability, encryption-compliance answers and tester groups must be checked in App Store Connect.\n'
