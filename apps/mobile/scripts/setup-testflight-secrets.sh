#!/usr/bin/env bash
# Interactive, local setup: uploads credentials directly to the user's private repo.
# Do not paste private keys/passwords into chat or commit them to the project.
set -euo pipefail
REPO='EmotiveImpact/LifeOS'
[[ -t 0 ]] || { printf 'Run this interactively in your own terminal.\n' >&2; exit 1; }
read -r -p 'Path to Apple Distribution .p12 (without surrounding quotes): ' P12
read -r -s -p 'Password for that .p12: ' P12_PASSWORD
printf '\n'
read -r -p 'Path to App Store distribution .mobileprovision: ' PROFILE
read -r -p 'Path to App Store Connect AuthKey_XXXXXXXXXX.p8: ' API_KEY
read -r -p 'App Store Connect API key ID: ' KEY_ID
read -r -p 'App Store Connect issuer ID: ' ISSUER_ID
read -r -p 'Numeric Apple app ID from App Store Connect: ' APP_ID
for name in P12 PROFILE API_KEY; do
  value=${!name}
  if [[ "$value" == '~/'* ]]; then value="$HOME/${value:2}"; printf -v "$name" '%s' "$value"; fi
  [[ -f "$value" ]] || { printf 'File not found for %s\n' "$name" >&2; exit 1; }
done
[[ -n "$P12_PASSWORD" && "$APP_ID" =~ ^[0-9]+$ && "$KEY_ID" =~ ^[A-Za-z0-9]+$ && "$ISSUER_ID" =~ ^[A-Za-z0-9-]+$ ]] || { printf 'Check the password and Apple IDs.\n' >&2; exit 1; }
printf '\nThis uploads the selected signing certificate/profile and API key into GitHub Actions Secrets for %s.\nNo key contents are printed; nothing is copied into git.\n' "$REPO"
read -r -p 'Upload these credentials to that private repository? Type YES: ' CONFIRM
[[ "$CONFIRM" == YES ]] || { printf 'Cancelled; no secrets uploaded.\n'; exit 0; }
base64 < "$P12" | tr -d '\n' | gh secret set IOS_DISTRIBUTION_P12_BASE64 --repo "$REPO"
printf '%s' "$P12_PASSWORD" | gh secret set IOS_DISTRIBUTION_P12_PASSWORD --repo "$REPO"
base64 < "$PROFILE" | tr -d '\n' | gh secret set IOS_PROVISION_PROFILE_BASE64 --repo "$REPO"
gh secret set ASC_PRIVATE_KEY --repo "$REPO" < "$API_KEY"
printf '%s' "$KEY_ID" | gh secret set ASC_KEY_ID --repo "$REPO"
printf '%s' "$ISSUER_ID" | gh secret set ASC_ISSUER_ID --repo "$REPO"
gh variable set ASC_APP_ID --repo "$REPO" --body "$APP_ID"
unset P12_PASSWORD
printf '\nSigning configuration saved. This did NOT trigger a build or upload to Apple.\n'
