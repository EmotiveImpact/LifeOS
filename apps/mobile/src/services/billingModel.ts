import type { CustomerInfo, PurchasesOffering, PurchasesPackage, PurchasesStoreProduct } from 'react-native-purchases';

/**
 * What the paywall and Settings read from RevenueCat (fix F-20), as plain values. Kept apart from the SDK so it can be
 * tested without a phone: `services/billing.ts` calls the SDK and hands its answers here.
 *
 * Prices always come from the store, already in the person's currency, never from Life's own figures. A free trial is
 * offered only when the store says this person can have one: Google Play leaves the free phase out for someone who
 * has had it, and on iOS RevenueCat checks eligibility for each product.
 */

/** The RevenueCat entitlement that unlocks Life. The server checks the same one (`REVENUECAT_ENTITLEMENT`). */
export const ENTITLEMENT = 'life';

export type TrialLength = { unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; count: number };

export type Plan = {
  key: 'annual' | 'monthly';
  pkg: PurchasesPackage;
  /** The store's price, formatted, such as £79.99. */
  price: string;
  /** For the annual plan, the store's price a month, such as £6.67. */
  perMonth: string | null;
  /** The free trial this person can have on this plan, if any. */
  trial: TrialLength | null;
};

export type Standing = {
  /** none: never subscribed. trial: in the free trial. active: paid. grace: a payment failed and the store is retrying. ended: lapsed. */
  status: 'none' | 'trial' | 'active' | 'grace' | 'ended';
  renews: boolean;
  ends: Date | null;
  plan: 'annual' | 'monthly' | null;
  /** The store's page for changing or cancelling, when RevenueCat knows it. */
  manageUrl: string | null;
};

/** RevenueCat's intro eligibility, by product: 2 is eligible. Only iOS answers; Android filters offers itself. */
export type Eligibility = Record<string, { status: number }>;
const ELIGIBLE = 2;

const UNITS = new Set(['DAY', 'WEEK', 'MONTH', 'YEAR']);
const asLength = (unit: string | undefined, count: number | undefined): TrialLength | null =>
  unit && UNITS.has(unit) && count && count > 0 ? { unit: unit as TrialLength['unit'], count } : null;

/** The free trial on a product, if this person can have it. */
export function trialOf(product: PurchasesStoreProduct, eligibility: Eligibility | null): TrialLength | null {
  // Google Play: the default option carries a free phase only for someone who can still have it.
  const free = product.defaultOption?.freePhase?.billingPeriod;
  if (free) return asLength(free.unit, free.value);
  // App Store: a free introductory offer, and RevenueCat's word that this person is eligible.
  const intro = product.introPrice;
  if (!intro || intro.price !== 0 || eligibility?.[product.identifier]?.status !== ELIGIBLE) return null;
  return asLength(intro.periodUnit, intro.periodNumberOfUnits);
}

/** The annual and monthly plans in the current offering, annual first. */
export function plansFrom(offering: PurchasesOffering | null | undefined, eligibility: Eligibility | null = null): Plan[] {
  if (!offering) return [];
  const pick = (key: Plan['key']) => {
    const pkg = (key === 'annual' ? offering.annual : offering.monthly) ?? offering.availablePackages.find(p => p.packageType === (key === 'annual' ? 'ANNUAL' : 'MONTHLY'));
    if (!pkg) return null;
    const product = pkg.product;
    return { key, pkg, price: product.priceString, perMonth: key === 'annual' ? product.pricePerMonthString ?? null : null, trial: trialOf(product, eligibility) } satisfies Plan;
  };
  return [pick('annual'), pick('monthly')].filter((p): p is Plan => p !== null);
}

/** "7 days", "2 weeks", "a month". */
export function trialWords(trial: TrialLength): string {
  const word = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' }[trial.unit];
  return trial.count === 1 ? (trial.unit === 'DAY' ? '1 day' : `a ${word}`) : `${trial.count} ${word}s`;
}

/** The plan a product is, from its store id: Life's ids name the period (`life_annual`, `life_monthly`). */
export function planOfProduct(productId: string | null | undefined): Standing['plan'] {
  if (!productId) return null;
  if (/annual|year/i.test(productId)) return 'annual';
  if (/month/i.test(productId)) return 'monthly';
  return null;
}

/** Where this person stands, from RevenueCat's customer info. */
export function standingFrom(info: CustomerInfo | null | undefined): Standing {
  const entitlement = info?.entitlements.all[ENTITLEMENT];
  const manageUrl = info?.managementURL ?? null;
  if (!entitlement) return { status: 'none', renews: false, ends: null, plan: null, manageUrl };
  const ends = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
  const plan = planOfProduct(entitlement.productIdentifier);
  if (!entitlement.isActive) return { status: 'ended', renews: false, ends, plan, manageUrl };
  const status = entitlement.billingIssueDetectedAt ? 'grace' : entitlement.periodType === 'TRIAL' ? 'trial' : 'active';
  return { status, renews: entitlement.willRenew, ends, plan, manageUrl };
}

/**
 * Whether Life asks for Life Plus before going on (paid only, Edem, 20 Nov 2026): only on the store's definite word
 * that this person has no plan, never started or ended. Payment trouble (grace) keeps Life open while the store
 * retries, and no answer (offline, or billing off) never shuts anyone out: the server still checks paid features.
 */
export function needsPlus(standing: Standing | null | undefined): boolean {
  return !!standing && (standing.status === 'none' || standing.status === 'ended');
}

export type PurchaseOutcome = 'subscribed' | 'cancelled' | 'pending' | 'failed';

/** What a purchase error means for the person: tapping away isn't a failure, and a pending payment isn't either. */
export function purchaseOutcome(error: unknown): Exclude<PurchaseOutcome, 'subscribed'> {
  const e = error as { code?: string; userCancelled?: boolean | null } | null;
  if (e?.userCancelled || e?.code === '1') return 'cancelled';
  if (e?.code === '20') return 'pending';
  return 'failed';
}
