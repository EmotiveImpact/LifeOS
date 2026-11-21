import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENTITLEMENT, needsPlus, planOfProduct, plansFrom, purchaseOutcome, standingFrom, trialOf, trialWords } from '../../apps/mobile/src/services/billingModel';

/**
 * Fix F-20, the phone half. The paywall shows the store's own prices and a free trial only when the store says this
 * person can have one; Settings reads where they stand from RevenueCat; a build without billing never pretends to sell.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

type Product = Record<string, unknown>;
const product = (id: string, priceString: string, price: number, extra: Product = {}) => ({ identifier: id, priceString, price, pricePerMonthString: null, introPrice: null, defaultOption: null, ...extra });
const pkg = (packageType: 'ANNUAL' | 'MONTHLY', p: ReturnType<typeof product>) => ({ identifier: `$rc_${packageType.toLowerCase()}`, packageType, product: p });
const freeWeekIos = { price: 0, priceString: '£0.00', cycles: 1, period: 'P1W', periodUnit: 'WEEK', periodNumberOfUnits: 1 };
const annualIos = pkg('ANNUAL', product('life_annual', '£79.99', 79.99, { pricePerMonthString: '£6.67', introPrice: freeWeekIos }));
const monthlyIos = pkg('MONTHLY', product('life_monthly', '£7.99', 7.99, { introPrice: freeWeekIos }));
const offering = (packages: unknown[]) => ({ identifier: 'default', availablePackages: packages, annual: null, monthly: null }) as never;

describe('the paywall’s plans', () => {
  test('prices come from the store, annual first, with its price a month', () => {
    const plans = plansFrom(offering([monthlyIos, annualIos]), { life_annual: { status: 2 }, life_monthly: { status: 2 } });
    expect(plans.map(p => [p.key, p.price, p.perMonth])).toEqual([['annual', '£79.99', '£6.67'], ['monthly', '£7.99', null]]);
  });

  test('on iOS a free trial shows only when RevenueCat says this person is eligible', () => {
    expect(trialOf(annualIos.product as never, { life_annual: { status: 2 } })).toEqual({ unit: 'WEEK', count: 1 });
    expect(trialOf(annualIos.product as never, { life_annual: { status: 1 } })).toBeNull();
    expect(trialOf(annualIos.product as never, { life_annual: { status: 0 } })).toBeNull();
    expect(trialOf(annualIos.product as never, null)).toBeNull();
    // A paid introductory price isn't a free trial.
    expect(trialOf(product('life_annual', '£79.99', 79.99, { introPrice: { ...freeWeekIos, price: 39.99 } }) as never, { life_annual: { status: 2 } })).toBeNull();
  });

  test('on Google Play the free phase is the trial, and is missing for someone who has had it', () => {
    const withFree = product('life_annual:yearly', '£79.99', 79.99, { defaultOption: { freePhase: { billingPeriod: { unit: 'DAY', value: 14, iso8601: 'P14D' } } } });
    expect(trialOf(withFree as never, null)).toEqual({ unit: 'DAY', count: 14 });
    expect(trialOf(product('life_annual:yearly', '£79.99', 79.99, { defaultOption: { freePhase: null } }) as never, null)).toBeNull();
  });

  test('no offering, or one without these plans, gives nothing to sell', () => {
    expect(plansFrom(null)).toEqual([]);
    expect(plansFrom(offering([]))).toEqual([]);
  });

  test('trial lengths read naturally', () => {
    expect([trialWords({ unit: 'DAY', count: 7 }), trialWords({ unit: 'DAY', count: 1 }), trialWords({ unit: 'WEEK', count: 2 }), trialWords({ unit: 'WEEK', count: 1 }), trialWords({ unit: 'MONTH', count: 1 })])
      .toEqual(['7 days', '1 day', '2 weeks', 'a week', 'a month']);
  });
});

describe('where someone stands', () => {
  const info = (entitlement: Record<string, unknown> | null) => ({ entitlements: { all: entitlement ? { [ENTITLEMENT]: entitlement } : {}, active: {} }, managementURL: 'https://apps.apple.com/account/subscriptions' }) as never;
  const base = { identifier: ENTITLEMENT, isActive: true, willRenew: true, periodType: 'NORMAL', expirationDate: '2027-11-14T09:00:00Z', productIdentifier: 'life_annual', billingIssueDetectedAt: null };

  test('trial, paid, payment trouble, ended and never subscribed', () => {
    expect(standingFrom(info({ ...base, periodType: 'TRIAL', productIdentifier: 'life_monthly' }))).toEqual({ status: 'trial', renews: true, ends: new Date('2027-11-14T09:00:00Z'), plan: 'monthly', manageUrl: 'https://apps.apple.com/account/subscriptions' });
    expect(standingFrom(info(base))).toMatchObject({ status: 'active', renews: true, plan: 'annual' });
    expect(standingFrom(info({ ...base, willRenew: false }))).toMatchObject({ status: 'active', renews: false });
    expect(standingFrom(info({ ...base, billingIssueDetectedAt: '2027-11-14T09:00:00Z' }))).toMatchObject({ status: 'grace' });
    expect(standingFrom(info({ ...base, isActive: false }))).toMatchObject({ status: 'ended', renews: false });
    expect(standingFrom(info(null))).toMatchObject({ status: 'none', plan: null });
    expect(standingFrom(null)).toMatchObject({ status: 'none', manageUrl: null });
  });

  test('the plan comes from the store id', () => {
    expect([planOfProduct('life_annual'), planOfProduct('life_yearly'), planOfProduct('life_monthly'), planOfProduct('life_weird'), planOfProduct(null)]).toEqual(['annual', 'annual', 'monthly', null, null]);
  });

  test('tapping away isn’t a failure, and a payment waiting for approval isn’t either', () => {
    expect(purchaseOutcome({ code: '1', userCancelled: true })).toBe('cancelled');
    expect(purchaseOutcome({ code: '1' })).toBe('cancelled');
    expect(purchaseOutcome({ code: '20' })).toBe('pending');
    expect(purchaseOutcome({ code: '10' })).toBe('failed');
    expect(purchaseOutcome(new Error('offline'))).toBe('failed');
  });
});

describe('the screens and the build', () => {
  const settings = read('apps/mobile/src/screens/v26/settings.tsx');
  const service = read('apps/mobile/src/services/billing.ts');

  test('a paid-only app shows nobody a free plan', () => {
    expect(settings).not.toContain('Free · see what Life Plus adds');
    expect(settings).not.toContain('Everything free {stays free}');
    expect(settings).not.toContain("'Free plan'");
    expect(settings).toContain("'Not subscribed · see Life Plus'");
  });

  test('without billing, only the sample account is a member, and Subscribe never pretends in a real build', () => {
    expect(settings).toContain("return { on: SHOW_SAMPLES && !data.flags['plus-cancelled'], standing: null };");
    expect(settings).toContain("if (!SHOW_SAMPLES) { setNote(notConnected); feedback.warn(); return; }");
    expect(settings).toContain('Subscriptions aren’t connected in this build yet, so nothing was charged.');
    expect(settings).not.toContain("flag('plus-preview'");
  });

  test('the paywall links the terms and privacy policy, and states a trial’s length and price', () => {
    expect(settings).toContain("nav.go('legal', { open: 'terms' })");
    expect(settings).toContain("nav.go('legal', { open: 'privacy' })");
    expect(settings).toContain("start === 'privacy' || start === 'terms' ? start : null");
    expect(settings).toContain('Cancel before the trial ends and you won’t be charged.');
  });

  test('changing or cancelling opens the store, never a switch inside Life', () => {
    const live = settings.slice(settings.indexOf('function LiveSubscription'), settings.indexOf('/* ───────────────────────── life Plus (the offer)'));
    expect(live).toContain('<QuietLink label="Cancel Life Plus" onPress={() => { void manageSubscription(standing); }} />');
    expect(live).not.toContain('plus-cancelled');
    expect(service).toContain("'https://apps.apple.com/account/subscriptions'");
    expect(service).toContain("'https://play.google.com/store/account/subscriptions'");
  });

  test('the keys are RevenueCat’s public ones, set per build; RevenueCat knows the account by Life’s own id', () => {
    expect(service).toContain('process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY');
    expect(service).toContain('process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY');
    expect(service).not.toMatch(/(appl|goog|sk)_[A-Za-z0-9]{10,}/);
    expect(service).toContain('await Purchases.logIn(id)');
    expect(read('apps/mobile/src/services/account.ts')).toContain("const response = await call('/me', null, token, 'GET');");
  });

  test('the SDK is pinned, on the reference list and in the notices', () => {
    expect(JSON.parse(read('apps/mobile/package.json')).dependencies['react-native-purchases']).toBe('11.0.1');
    expect(read('IMPLEMENTATION_REFERENCES.md')).toContain('[RevenueCat/react-native-purchases](https://github.com/RevenueCat/react-native-purchases)');
    expect(read('THIRD_PARTY_NOTICES.md')).toContain('react-native-purchases 11.0.1 (MIT)');
  });

  test('phone and server use the same entitlement', () => {
    expect(ENTITLEMENT).toBe('life');
    expect(read('apps/api/src/billing.ts')).toContain("export const DEFAULT_ENTITLEMENT = 'life';");
  });
});

describe('Life Plus at the end of setup, and when a plan has ended (Edem, 21 Nov 2026)', () => {
  const settings = read('apps/mobile/src/screens/v26/settings.tsx');
  const firstopen = read('apps/mobile/src/screens/v26/firstopen.tsx');
  const gate = read('apps/mobile/src/services/plusGate.ts');
  const offer = settings.slice(settings.indexOf('export type PlusMode'), settings.indexOf('/* ───────────────────────── Welcome to life Plus'));
  const standing = (status: 'none' | 'trial' | 'active' | 'grace' | 'ended') => ({ status, renews: false, ends: null, plan: null, manageUrl: null });

  test('Life asks only on the store’s definite word that there is no plan', () => {
    expect(needsPlus(standing('none'))).toBe(true);
    expect(needsPlus(standing('ended'))).toBe(true);
    expect(needsPlus(standing('trial'))).toBe(false);
    expect(needsPlus(standing('active'))).toBe(false);
    // Payment trouble keeps Life open while the store retries; no answer (offline, billing off) never shuts anyone out.
    expect(needsPlus(standing('grace'))).toBe(false);
    expect(needsPlus(null)).toBe(false);
    expect(needsPlus(undefined)).toBe(false);
  });

  test('setup ends on Life Plus after Save your progress, and the first move follows a started plan', () => {
    const building = firstopen.slice(firstopen.indexOf('export function BuildingV26'), firstopen.indexOf('/* ───────────────────────── Where do you live?'));
    expect(building).toContain("if (asked && !was.current) nav.replace('plusstart');");
    expect(building).toContain("if (asked) nav.replace('plusstart'); else nav.go('signin');");
    expect(building).not.toContain("'firstmove'");
    expect(offer).toContain("const onward = () => nav.replace(mode === 'setup' ? 'firstmove' : 'plussuccess');");
    expect(offer).toContain("if (mode === 'setup') set({ onboardingDone: true });");
  });

  test('with billing live there is no way past but a plan, Restore, or your data and account', () => {
    expect(offer).toContain('const held = full && billingLive;');
    expect(offer).toContain("bar={held ? { kind: 'none' } : { kind: 'flow'");
    expect(offer).toContain("BackHandler.addEventListener('hardwareBackPress', () => true)");
    expect(offer).toContain("{held ? <QuietLink label=\"Your data\" onPress={() => nav.go('privacy')} /> : null}");
    expect(offer).toContain('<QuietLink label="Restore purchases"');
    expect(read('apps/mobile/src/app/(flows)/_layout.tsx')).toContain('<Stack.Screen name="plusstart" options={{ gestureEnabled: false }} />');
  });

  test('a build that can’t sell keeps Skip, so it never stops anyone using Life', () => {
    expect(offer).toContain("const skip = mode === 'setup' ? () => nav.replace('firstmove') : nav.close;");
    expect(offer).toContain("action: { kind: 'text', label: 'Skip', onPress: skip }");
  });

  test('opening Life checks again, only once billing is live, setup is done and the 18+ check passed', () => {
    expect(gate).toContain("const ready = billingLive && hydrated && data.onboardingDone && readAgeCheck(data)?.result === 'adult';");
    expect(gate).toContain('if (!live || plusGate.open || !needsPlus(standing)) return;');
    expect(gate).toContain("AppState.addEventListener('change'");
    expect(gate).toContain("router.push(`/(flows)/plusstart?why=${standing?.status === 'ended' ? 'ended' : 'start'}` as Href);");
    expect(read('apps/mobile/src/app/_layout.tsx')).toContain('<PlusGateRunner />');
  });

  test('an ended plan says the person’s things are still there, and each place has its own words', () => {
    expect(offer).toContain("if (mode === 'ended') return 'Your {Life Plus has ended}.';");
    expect(offer).toContain('Everything you’ve told Life {is still here}.');
    expect(offer).toContain("return mode === 'setup' ? `Your plan is ready. ${offer}` : offer;");
    // A trial is named only when the store offers this person one.
    expect(offer).toContain("const offer = trial ? `Try {all of Life} free for {${trialWords(trial)}}.` : '{Life Plus} opens {all of Life}.';");
  });

  test('the full screen is a route of its own in the catalogue', () => {
    expect(read('apps/mobile/src/app/(flows)/plusstart.tsx')).toContain('<SettingsScreen screen="plusstart" />');
    expect(read('apps/mobile/src/navigation/screens.ts')).toContain('"route": "/(flows)/plusstart"');
    expect(read('apps/mobile/src/screens/Settings.tsx')).toContain("case 'plusstart': return <PlusstartV26 />;");
  });
});
