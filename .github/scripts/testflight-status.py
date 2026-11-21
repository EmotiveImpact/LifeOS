#!/usr/bin/env python3
"""Where TestFlight builds stand, and getting a new one to the internal testers.

With no argument: a read-only report of recent builds, Apple's upload records (with the reasons for any upload it
turned down), the tester groups and what the App Store profile secret allows.
With "distribute": waits for Apple to finish checking build BUILD_NUMBER, fails with Apple's reasons if it was turned
down, and otherwise adds it to each internal tester group that doesn't take new builds by itself. Nothing else.

Runs on GitHub with the App Store Connect key from the secrets. The repository is public, so it prints build
numbers and states only: no tester names or emails, no group names, nothing from the key.
Standard library and the openssl command only.
"""
import base64, json, os, plistlib, re, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request

API = 'https://api.appstoreconnect.apple.com'


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def der_to_raw(sig: bytes) -> bytes:
    """openssl writes an ECDSA signature as DER; a JWT wants r and s as 32 bytes each."""
    if sig[0] != 0x30:
        raise SystemExit('Unexpected signature format from openssl.')
    i = 2 if sig[1] < 0x80 else 2 + (sig[1] & 0x7F)
    out = b''
    for _ in range(2):
        if sig[i] != 0x02:
            raise SystemExit('Unexpected signature format from openssl.')
        length = sig[i + 1]
        out += sig[i + 2:i + 2 + length].lstrip(b'\0').rjust(32, b'\0')
        i += 2 + length
    return out


def token() -> str:
    key_id, issuer, key = os.environ['ASC_KEY_ID'], os.environ['ASC_ISSUER_ID'], os.environ['ASC_PRIVATE_KEY']
    now = int(time.time())
    head = b64url(json.dumps({'alg': 'ES256', 'kid': key_id, 'typ': 'JWT'}).encode())
    body = b64url(json.dumps({'iss': issuer, 'iat': now, 'exp': now + 600, 'aud': 'appstoreconnect-v1'}).encode())
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, 'key.p8')
        with open(os.open(path, os.O_WRONLY | os.O_CREAT, 0o600), 'w') as handle:
            handle.write(key)
        sig = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', path], input=f'{head}.{body}'.encode(),
                             capture_output=True, check=True).stdout
    return f'{head}.{body}.{b64url(der_to_raw(sig))}'


def get(path: str, params: dict, jwt: str, soft: bool = False):
    url = f'{API}{path}?{urllib.parse.urlencode(params)}'
    request = urllib.request.Request(url, headers={'Authorization': f'Bearer {jwt}'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = ''
        try:
            first = json.load(error).get('errors', [{}])[0]
            detail = f": {first.get('title', '')} {first.get('detail', '')}".rstrip()
        except Exception:
            pass
        if soft:
            print(f'  (App Store Connect answered {error.code} for {path}{detail})')
            return None
        raise SystemExit(f'App Store Connect answered {error.code} for {path}{detail}')


def post(path: str, payload: dict, jwt: str) -> None:
    request = urllib.request.Request(f'{API}{path}', data=json.dumps(payload).encode(), method='POST',
                                     headers={'Authorization': f'Bearer {jwt}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=30):
            return
    except urllib.error.HTTPError as error:
        detail = ''
        try:
            first = json.load(error).get('errors', [{}])[0]
            detail = f": {first.get('title', '')} {first.get('detail', '')}".rstrip()
        except Exception:
            pass
        raise SystemExit(f'::error::App Store Connect answered {error.code} for {path}{detail}')


def upload_failure(app_id: str, number: str, jwt: str):
    """Apple's reasons, if it turned this build number down after the upload."""
    uploads = get(f'/v1/apps/{app_id}/buildUploads', {'limit': '20'}, jwt, soft=True) or {}
    for record in uploads.get('data', []):
        a = record.get('attributes', {})
        state = a.get('state') if isinstance(a.get('state'), dict) else {'state': a.get('state')}
        if str(a.get('cfBundleVersion')) == number and state.get('state') == 'FAILED':
            return [f"{item.get('code')}: {item.get('description') or item.get('message')}" for item in state.get('errors') or []]
    return None


def distribute(app_id: str) -> None:
    number = os.environ.get('BUILD_NUMBER', '')
    if not re.fullmatch(r'[0-9]+(\.[0-9]+){0,2}', number):
        raise SystemExit('BUILD_NUMBER must be the build number that was uploaded.')
    deadline, build = time.time() + 45 * 60, None
    while True:
        jwt = token()
        found = get('/v1/builds', {'filter[app]': app_id, 'filter[version]': number, 'limit': '1',
                                   'fields[builds]': 'version,processingState'}, jwt).get('data', [])
        state = found[0]['attributes'].get('processingState') if found else None
        if state == 'VALID':
            build = found[0]
            break
        reasons = upload_failure(app_id, number, jwt) if not found else None
        if state in ('FAILED', 'INVALID') or reasons is not None:
            for reason in reasons or []:
                print(f'::error title=Apple turned build {number} down::{reason}')
            raise SystemExit(f'Apple turned build {number} down after the upload ({state or "upload checks"}).')
        if time.time() > deadline:
            raise SystemExit(f'Apple had not finished checking build {number} after 45 minutes (state {state}).')
        print(f"Build {number}: {state or 'not visible yet'}, checking again in 30 seconds")
        time.sleep(30)
    print(f'Build {number} passed Apple\'s checks.')
    groups = get(f'/v1/apps/{app_id}/betaGroups', {'limit': '50', 'fields[betaGroups]': 'isInternalGroup,hasAccessToAllBuilds'}, jwt).get('data', [])
    internal = [group for group in groups if group['attributes'].get('isInternalGroup')]
    if not internal:
        print('::warning::There is no internal tester group in App Store Connect, so nobody gets this build yet.')
    for number_in_list, group in enumerate(internal, 1):
        if group['attributes'].get('hasAccessToAllBuilds'):
            print(f'Internal group {number_in_list} gets every build by itself.')
            continue
        post(f"/v1/betaGroups/{group['id']}/relationships/builds", {'data': [{'type': 'builds', 'id': build['id']}]}, jwt)
        print(f'Added build {number} to internal group {number_in_list}.')


def profile_report() -> None:
    raw = os.environ.get('IOS_PROVISION_PROFILE_BASE64', '')
    if not raw:
        print('Profile secret: missing')
        return
    data = base64.b64decode(raw)
    start, end = data.find(b'<?xml'), data.find(b'</plist>')
    if start < 0 or end < 0:
        print('Profile secret: not a readable provisioning profile')
        return
    profile = plistlib.loads(data[start:end + len(b'</plist>')])
    granted = profile.get('Entitlements', {})
    print(f"Profile secret: created {profile.get('CreationDate')}, expires {profile.get('ExpirationDate')}")
    print(f"  HealthKit: {'yes' if 'com.apple.developer.healthkit' in granted else 'no'}")
    print(f"  Push notifications: {granted.get('aps-environment', 'no')}")


def main() -> None:
    app_id = os.environ.get('ASC_APP_ID', '')
    if not re.fullmatch(r'[0-9]+', app_id):
        raise SystemExit('ASC_APP_ID must be the numeric Apple app ID.')
    if sys.argv[1:] == ['distribute']:
        distribute(app_id)
        return
    profile_report()
    jwt = token()

    builds = get('/v1/builds', {
        'filter[app]': app_id, 'sort': '-uploadedDate', 'limit': '6',
        'include': 'buildBetaDetail,preReleaseVersion',
        'fields[builds]': 'version,uploadedDate,processingState,expired,usesNonExemptEncryption,buildBetaDetail,preReleaseVersion',
        'fields[buildBetaDetails]': 'internalBuildState,externalBuildState',
        'fields[preReleaseVersions]': 'version',
    }, jwt)
    included = {(item['type'], item['id']): item.get('attributes', {}) for item in builds.get('included', [])}
    print('\nLatest uploads (newest first):')
    for build in builds.get('data', []):
        a, rel = build['attributes'], build.get('relationships', {})
        beta = included.get(('buildBetaDetails', (rel.get('buildBetaDetail', {}).get('data') or {}).get('id')), {})
        version = included.get(('preReleaseVersions', (rel.get('preReleaseVersion', {}).get('data') or {}).get('id')), {})
        print(f"  build {a.get('version')} (app version {version.get('version')}), uploaded {a.get('uploadedDate')}: "
              f"processing {a.get('processingState')}, internal testing {beta.get('internalBuildState')}, "
              f"encryption answer {a.get('usesNonExemptEncryption')}, expired {a.get('expired')}")

    # An upload Apple accepted can still fail its checks afterwards, and then never shows as a build. Upload records
    # say why (Apple also emails the account holder).
    print('\nUpload records (newest first):')
    uploads = get(f'/v1/apps/{app_id}/buildUploads', {'limit': '20'}, jwt, soft=True)
    records = sorted((uploads or {}).get('data', []), key=lambda r: r.get('attributes', {}).get('createdDate') or '', reverse=True)
    for record in records[:6]:
        a = record.get('attributes', {})
        state = a.get('state') if isinstance(a.get('state'), dict) else {'state': a.get('state')}
        print(f"  build {a.get('cfBundleVersion')} (app version {a.get('cfBundleShortVersionString')}), created {a.get('createdDate')}: "
              f"{state.get('state')}")
        for kind in ('errors', 'warnings'):
            for item in state.get(kind) or []:
                print(f"    {kind[:-1]} {item.get('code')}: {item.get('description') or item.get('message')}")

    groups = get(f'/v1/apps/{app_id}/betaGroups', {
        'limit': '50', 'fields[betaGroups]': 'isInternalGroup,hasAccessToAllBuilds'}, jwt).get('data', [])
    print(f'\nTester groups: {len(groups)}')
    for number, group in enumerate(groups, 1):
        a = group['attributes']
        testers = get(f"/v1/betaGroups/{group['id']}/betaTesters", {'limit': '200', 'fields[betaTesters]': 'inviteType'}, jwt)
        members = get(f"/v1/betaGroups/{group['id']}/builds", {'limit': '10', 'fields[builds]': 'version'}, jwt)
        print(f"  group {number}: {'internal' if a.get('isInternalGroup') else 'external'}, "
              f"{len(testers.get('data', []))} testers, gets every build automatically: {a.get('hasAccessToAllBuilds')}, "
              f"builds added: {', '.join(b['attributes']['version'] for b in members.get('data', [])) or 'none'}")


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError:
        sys.exit('openssl could not sign with the App Store Connect key.')
