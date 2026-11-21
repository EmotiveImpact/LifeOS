import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { isSignedIn, myUserId } from './account';
import { plansFrom, purchaseOutcome, standingFrom, type Eligibility, type Plan, type PurchaseOutcome, type Standing } from './billingModel';

/**
 * Subscriptions through RevenueCat (fix F-20). Apple or Google takes the payment; RevenueCat checks the receipt and
 * tells Life's server (`POST /billing/revenuecat`), which keeps its own record. This file only talks to the SDK;
 * `billingModel.ts` turns its answers into what the screens show.
 *
 * - The keys are RevenueCat's public SDK keys, one per store, made to ship inside apps (they can only read offerings
 *   and make purchases for this phone). Secret keys stay on the server. Without a key for this platform, as in every
 *   build today and on the web, billing is off and the screens say subscriptions aren't connected.
 * - Signed in, RevenueCat knows this person by Life's own user id (a random number, never a name or email), so the
 *   server can match its events. A purchase made before signing in moves to the account when they sign in.
 */
const key = (Platform.select({ ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY, default: undefined }) ?? '').trim();

/** Whether this build can take a subscription. */
export const billingLive = key.length > 0;

let configured = false;
let identified: string | null = null;

/** Starts the SDK once, and keeps RevenueCat's idea of who this is in step with Life's sign-in. */
async function ready(): Promise<boolean> {
  if (!billingLive) return false;
  if (!configured) { Purchases.configure({ apiKey: key }); configured = true; }
  try {
    if (await isSignedIn()) {
      if (!identified) {
        const id = await myUserId();
        if (id) { await Purchases.logIn(id); identified = id; }
      }
    } else if (identified) {
      await Purchases.logOut();
      identified = null;
    }
  } catch { /* identity catches up next time; a purchase still reaches the account through RevenueCat's aliases */ }
  return true;
}

export type PlansResult = { ok: true; plans: Plan[] } | { ok: false; problem: 'not-set' | 'unavailable' };

/** The annual and monthly plans, with the store's prices and any free trial this person can have. */
export async function loadPlans(): Promise<PlansResult> {
  if (!await ready()) return { ok: false, problem: 'not-set' };
  try {
    const offering = (await Purchases.getOfferings()).current;
    const ids = offering?.availablePackages.map(p => p.product.identifier) ?? [];
    const eligibility = Platform.OS === 'ios' && ids.length ? await Purchases.checkTrialOrIntroductoryPriceEligibility(ids).catch(() => null) as Eligibility | null : null;
    const plans = plansFrom(offering, eligibility);
    return plans.length ? { ok: true, plans } : { ok: false, problem: 'unavailable' };
  } catch { return { ok: false, problem: 'unavailable' }; }
}

/** Buys a plan through the store's own sheet. */
export async function subscribe(plan: Plan): Promise<PurchaseOutcome | 'not-set'> {
  if (!await ready()) return 'not-set';
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    // Bought but not yet active (a parent approving, say) is waiting, not done.
    const { status } = standingFrom(customerInfo);
    return status === 'none' || status === 'ended' ? 'pending' : 'subscribed';
  } catch (error) { return purchaseOutcome(error); }
}

/** Finds an earlier purchase on this Apple or Google account. */
export async function restore(): Promise<'restored' | 'nothing' | 'failed' | 'not-set'> {
  if (!await ready()) return 'not-set';
  try {
    const standing = standingFrom(await Purchases.restorePurchases());
    return standing.status === 'none' || standing.status === 'ended' ? 'nothing' : 'restored';
  } catch { return 'failed'; }
}

/** Where this person stands, or null when billing is off or the store can't be reached. */
export async function loadStanding(): Promise<Standing | null> {
  if (!await ready()) return null;
  try { return standingFrom(await Purchases.getCustomerInfo()); } catch { return null; }
}

/** The store's own page for changing or cancelling. Life never cancels for anyone: the store does. */
export async function manageSubscription(standing: Standing | null): Promise<void> {
  const fallback = Platform.OS === 'android' ? 'https://play.google.com/store/account/subscriptions' : 'https://apps.apple.com/account/subscriptions';
  await Linking.openURL(standing?.manageUrl ?? fallback).catch(() => {});
}
