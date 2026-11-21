import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fix F-25. Health Connect opens Life to show why it reads health data, and Google's policy asks that this shows the
 * privacy policy. Through Android 13 it sends the rationale action to the main activity; from Android 14 it opens
 * the permission-usage alias, which also lands on the main activity. Both now open About with the policy unfolded.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('Health Connect’s question opens the privacy policy', () => {
  test('the Health Connect plugin adds both ways in to the main activity', () => {
    const plugin = read('apps/mobile/node_modules/react-native-health-connect/app.plugin.js');
    expect(plugin).toContain("'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'");
    expect(plugin).toContain("'android.intent.action.VIEW_PERMISSION_USAGE'");
    expect(plugin).toContain("'android:targetActivity': mainActivity.$['android:name']");
    expect(JSON.parse(read('apps/mobile/app.json')).expo.plugins).toContain('react-native-health-connect');
  });

  test('the phone’s own module recognises both, at launch and while Life is open', () => {
    const kotlin = read('apps/mobile/modules/life-intelligence/android/src/main/java/app/life/intelligence/LifeIntelligenceModule.kt');
    expect(kotlin).toContain('intent?.action == "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" || intent?.action == "android.intent.action.VIEW_PERMISSION_USAGE"');
    expect(kotlin).toContain('Function("launchedForHealthRationale") { isHealthRationale(appContext.currentActivity?.intent) }');
    expect(kotlin).toContain('OnNewIntent { intent -> if (isHealthRationale(intent)) sendEvent("healthRationale"');
    expect(kotlin).toContain('Events("transcript", "healthRationale", "connection")');
  });

  test('the app opens About with the privacy policy unfolded', () => {
    const service = read('apps/mobile/src/services/healthRationale.ts');
    expect(service).toContain("export const HEALTH_RATIONALE_TARGET = { screen: 'legal', params: { open: 'privacy' } } as const;");
    expect(service).toContain("Platform.OS === 'android'");
    expect(read('apps/mobile/src/app/_layout.tsx')).toContain('onHealthRationale(() => nav.go(HEALTH_RATIONALE_TARGET.screen, { ...HEALTH_RATIONALE_TARGET.params }))');
    expect(read('apps/mobile/src/screens/v26/settings.tsx')).toContain("useState<'terms' | 'privacy' | 'notices' | null>(start === 'privacy' || start === 'terms' ? start : null)");
  });

  test('the privacy policy says why Life reads health data', () => {
    const policy = read('docs/launch/privacy-policy.md');
    expect(policy).toMatch(/Health Connect/);
  });
});
