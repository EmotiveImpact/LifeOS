import { DEFAULT_PULSE } from '@life/core/engine';
import type { UserProfile } from '@life/core/types';
import type { Area } from '@/design/tokens';
import type { seedKnowledge } from './seed';
import type { SeedData } from './SeedProvider';

/**
 * Where a real account starts (release builds): nothing known yet. Life fills these in from onboarding, the age
 * check, talks and the things people confirm. Numbers are 0 until told, and every "needs" flag is off, so the engine
 * never suggests a stranger's tax fix or hospital referral.
 *
 * `destination` must be one of the engine's; onboarding shows "Select" until it's chosen (`choices['setup-want']`).
 */
export const emptyProfile: UserProfile = {
  name: '', age: 0, city: '', countryCode: 'UK', countryName: 'United Kingdom',
  workStatus: 'employed', annualIncome: 0, taxCode: '', monthlyPensionPct: 0, employerMatchPct: 0,
  isBusinessOwner: false, businessAgeMonths: 0, housingStatus: 'renting', hasDependents: false,
  hasPendingHospitalReferral: false, referralSpecialty: '', householdSize: 1, pulse: DEFAULT_PULSE,
  scannedDocIds: [], needsTaxOrDebtFix: false, needsCashRunway: false, overdueRoutineCare: false,
  destination: 'fix-stabilize', collectiveGoals: [], setupRails: [], openedAccountIds: [], protectedPolicyIds: [],
  answeredQuestionIds: [], subscriptions: [],
};

/** How much Life knows: nothing yet. */
export function emptyKnowledge(): typeof seedKnowledge {
  return { overall: 0, recordCount: 0, areas: { you: 0, home: 0, work: 0, money: 0, health: 0, goal: 0 } as Record<Area, number> };
}

/** The parts of a life that are the person's own: Ama's in development and preview builds, empty in release builds. */
export type LifeContent = Pick<SeedData, 'profile' | 'aim' | 'records' | 'proposals' | 'knowledge' | 'selectedMission' | 'pulseLog' | 'people' | 'meal' | 'habits' | 'weightKg' | 'heightCm' | 'waistCm' | 'memories'>;

/**
 * A real person's life before they've told Life anything. Body numbers are 0 until they're given, and screens show
 * the board's empty states rather than a stranger's figures.
 */
export function emptyLife(): LifeContent {
  return {
    profile: emptyProfile, aim: null, records: [], proposals: [], knowledge: emptyKnowledge(), selectedMission: '', pulseLog: [], people: [],
    meal: [], habits: [], weightKg: 0, heightCm: 0, waistCm: 0, memories: [],
  };
}
