#!/usr/bin/env bash
# Runs only on the ephemeral GitHub macOS runner. Never stores signing material in git.
set -euo pipefail
: "${RUNNER_TEMP:?GitHub runner required}"
: "${GITHUB_OUTPUT:?GitHub output file required}"
: "${IOS_DISTRIBUTION_P12_BASE64:?Distribution certificate secret required}"
: "${IOS_DISTRIBUTION_P12_PASSWORD:?Certificate password secret required}"
: "${IOS_PROVISION_PROFILE_BASE64:?App Store provisioning profile secret required}"
: "${BUILD_NUMBER:?Build number required}"
[[ "$BUILD_NUMBER" =~ ^[0-9]+(\.[0-9]+){0,2}$ ]] || { printf 'Invalid build number\n' >&2; exit 1; }

SIGNING_DIR=$(mktemp -d "$RUNNER_TEMP/life-signing.XXXXXX")
KEYCHAIN_PATH="$SIGNING_DIR/signing.keychain-db"
KEYCHAIN_PASSWORD=$(openssl rand -hex 24)
printf '::add-mask::%s\n' "$KEYCHAIN_PASSWORD"
PROFILE_UUID=''
cleanup() {
  security delete-keychain "$KEYCHAIN_PATH" >/dev/null 2>&1 || true
  if [[ -n "$PROFILE_UUID" ]]; then
    rm -f "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"
    rm -f "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles/$PROFILE_UUID.mobileprovision"
  fi
  rm -rf "$SIGNING_DIR"
}
trap cleanup EXIT
export SIGNING_DIR
python3 - <<'PY'
import base64, os
from pathlib import Path
root = Path(os.environ['SIGNING_DIR'])
for env, name in [('IOS_DISTRIBUTION_P12_BASE64', 'distribution.p12'), ('IOS_PROVISION_PROFILE_BASE64', 'profile.mobileprovision')]:
    path = root / name
    path.write_bytes(base64.b64decode(os.environ[env], validate=True))
    path.chmod(0o600)
PY
security cms -D -i "$SIGNING_DIR/profile.mobileprovision" > "$SIGNING_DIR/profile.plist"
python3 - <<'PY'
import datetime, json, os, plistlib, re
from pathlib import Path
root = Path(os.environ['SIGNING_DIR'])
p = plistlib.loads((root / 'profile.plist').read_bytes())
app = json.loads(Path('app.json').read_text())['expo']
team = p['TeamIdentifier'][0]
bundle = app['ios']['bundleIdentifier']
if not re.fullmatch(r'[A-Za-z0-9]{10}', team) or not re.fullmatch(r'[A-Za-z0-9]+(?:\.[A-Za-z0-9-]+)+', bundle) or not re.fullmatch(r'[A-Fa-f0-9-]{36}', p['UUID']):
    raise SystemExit('Invalid profile team, UUID or app bundle identifier.')
if p['Entitlements'].get('application-identifier') != f'{team}.{bundle}':
    raise SystemExit('Provisioning profile does not match the configured app bundle identifier.')
if p.get('ProvisionedDevices') or p.get('ProvisionsAllDevices') or p['Entitlements'].get('get-task-allow'):
    raise SystemExit('Use an App Store distribution profile, not development, ad-hoc or enterprise.')
expiry = p['ExpirationDate'].replace(tzinfo=datetime.timezone.utc)
if expiry <= datetime.datetime.now(datetime.timezone.utc):
    raise SystemExit('Provisioning profile has expired.')
if not p['Entitlements'].get('beta-reports-active'):
    raise SystemExit('Provisioning profile is not enabled for App Store/TestFlight distribution.')
(root / 'team').write_text(team)
(root / 'uuid').write_text(p['UUID'])
options = {'method':'app-store-connect','destination':'export','signingStyle':'manual','teamID':team,
           'provisioningProfiles':{bundle:p['UUID']},'manageAppVersionAndBuildNumber':False,'uploadSymbols':True}
(root / 'ExportOptions.plist').write_bytes(plistlib.dumps(options))
with open(os.environ['GITHUB_OUTPUT'], 'a') as out:
    out.write(f'bundle_id={bundle}\napp_version={app["version"]}\n')
PY
TEAM_ID=$(< "$SIGNING_DIR/team")
PROFILE_UUID=$(< "$SIGNING_DIR/uuid")
export TEAM_ID PROFILE_UUID
for directory in "$HOME/Library/MobileDevice/Provisioning Profiles" "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"; do
  mkdir -p "$directory"
  cp "$SIGNING_DIR/profile.mobileprovision" "$directory/$PROFILE_UUID.mobileprovision"
  chmod 600 "$directory/$PROFILE_UUID.mobileprovision"
done
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security import "$SIGNING_DIR/distribution.p12" -P "$IOS_DISTRIBUTION_P12_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN_PATH"
security list-keychains -d user -s "$KEYCHAIN_PATH" "$HOME/Library/Keychains/login.keychain-db"
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH" >/dev/null
unset IOS_DISTRIBUTION_P12_BASE64 IOS_DISTRIBUTION_P12_PASSWORD IOS_PROVISION_PROFILE_BASE64
# The native project is named after the app (app.json "name"), so read it from what prebuild made rather than
# assuming it: "life" became "Life" on 20 Nov and Xcode's scheme names are case-sensitive.
WORKSPACES=(ios/*.xcworkspace)
[[ ${#WORKSPACES[@]} -eq 1 && -d "${WORKSPACES[0]}" ]] || { printf 'Expected one Xcode workspace in ios/\n' >&2; exit 1; }
PROJECT_NAME=$(basename "${WORKSPACES[0]}" .xcworkspace)
[[ "$PROJECT_NAME" =~ ^[A-Za-z0-9_-]+$ && -d "ios/$PROJECT_NAME.xcodeproj" && -f "ios/$PROJECT_NAME/Info.plist" ]] || { printf 'Unexpected Xcode project layout\n' >&2; exit 1; }
export PROJECT_NAME
ruby -rxcodeproj - <<'RUBY'
p = Xcodeproj::Project.open("ios/#{ENV.fetch('PROJECT_NAME')}.xcodeproj")
apps = p.targets.select { |t| t.product_type == 'com.apple.product-type.application' }
abort('Expected one application target') unless apps.length == 1
apps.first.build_configurations.each do |config|
  config.build_settings['DEVELOPMENT_TEAM'] = ENV.fetch('TEAM_ID')
  config.build_settings['CODE_SIGN_STYLE'] = 'Manual'
  config.build_settings['CODE_SIGN_IDENTITY'] = 'Apple Distribution'
  config.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = ENV.fetch('PROFILE_UUID')
  config.build_settings['CURRENT_PROJECT_VERSION'] = ENV.fetch('BUILD_NUMBER')
end
p.save
release = apps.first.build_configurations.find { |config| config.name == 'Release' }
File.write(File.join(ENV.fetch('SIGNING_DIR'), 'entitlements'), release&.build_settings&.[]('CODE_SIGN_ENTITLEMENTS').to_s)
RUBY
# The app asks for capabilities (HealthKit, push) that the App Store profile has to grant too, or the archive stops
# (run 10, 21 Nov). A sample-life review build is signed without what the profile lacks, with a warning on the run,
# so builds keep reaching TestFlight; those features then do nothing in that build. A real build stops instead.
python3 - <<'PY'
import os, plistlib
from pathlib import Path
root = Path(os.environ['SIGNING_DIR'])
relative = (root / 'entitlements').read_text().strip()
if relative:
    if '$' in relative or relative.startswith('/') or '..' in relative.split('/'):
        raise SystemExit('Unexpected entitlements path in the Xcode project.')
    path = Path('ios') / relative
    granted = plistlib.loads((root / 'profile.plist').read_bytes())['Entitlements']
    wanted = plistlib.loads(path.read_bytes())
    # expo-notifications writes aps-environment "development"; an App Store profile grants "production".
    if isinstance(wanted.get('aps-environment'), str) and isinstance(granted.get('aps-environment'), str) \
            and wanted['aps-environment'] != granted['aps-environment']:
        wanted['aps-environment'] = granted['aps-environment']
        path.write_bytes(plistlib.dumps(wanted))
    missing = sorted(key for key in wanted if key not in granted)
    if missing:
        names = ', '.join(sorted({'Push Notifications' if key == 'aps-environment'
                                  else 'HealthKit' if key.startswith('com.apple.developer.healthkit')
                                  else key for key in missing}))
        fix = ('turn them on for the app identifier at developer.apple.com, save the App Store profile again and put '
               'the new profile in the IOS_PROVISION_PROFILE_BASE64 secret')
        if os.environ.get('EXPO_PUBLIC_SAMPLE_DATA') != '1':
            raise SystemExit(f"The App Store profile doesn't include {names}: {fix}.")
        for key in missing:
            del wanted[key]
        path.write_bytes(plistlib.dumps(wanted))
        print(f"::warning title=Signed without {names}::The App Store profile doesn't include {names}, so this "
              f"sample-life build leaves them out. To include them, {fix}.")
    signed = sorted({'Push Notifications' if key == 'aps-environment'
                     else 'HealthKit' if key.startswith('com.apple.developer.healthkit') else key for key in wanted})
    print(f"::notice title=Capabilities::Signed with {', '.join(signed) or 'no extra capabilities'}.")
PY
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "ios/$PROJECT_NAME/Info.plist"
# No account login, secrets in app code, or provisioning changes are performed here.
xcodebuild -workspace "ios/$PROJECT_NAME.xcworkspace" -scheme "$PROJECT_NAME" -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$RUNNER_TEMP/life.xcarchive" archive -quiet
xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/life.xcarchive" \
  -exportPath "$RUNNER_TEMP/life-export" -exportOptionsPlist "$SIGNING_DIR/ExportOptions.plist" -quiet
IPA_PATH=$(find "$RUNNER_TEMP/life-export" -maxdepth 1 -name '*.ipa' -print -quit)
[[ -n "$IPA_PATH" ]] || { printf 'No signed IPA was exported\n' >&2; exit 1; }
printf 'ipa_path=%s\n' "$IPA_PATH" >> "$GITHUB_OUTPUT"
