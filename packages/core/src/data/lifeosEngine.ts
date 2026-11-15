import {
  BankAccountRecommendation,
  ChatMessage,
  ConnectedPortal,
  DailyNote,
  EvidenceDocument,
  GameChapterSummary,
  HealthSnapshot,
  CollectiveGoal,
  LifeLevel,
  OperatingRule,
  LifeAreaId,
  LifeAreaProgress,
  LifeDestination,
  LifeImpactSummary,
  LifeLevelState,
  LifeOSStateId,
  LifeTask,
  ProtectionPolicyItem,
  PulseFeeling,
  ReadingRuleCard,
  ScoreBreakdown,
  SetupRailId,
  StateDescriptor,
  SubscriptionItem,
  ThinkerWisdom,
  UserProfile,
  WorldRuleLesson,
} from '../types/lifeos';

import { STAGE_GAMBITS } from './gambits';

export { computeIncomeBreakdown, compareUKBusinessStructures, simulateIncomeDecision } from './finance';
export { LAB_GUIDES, computeHealthTargets, interpretLabResult } from './health';
export { ONBOARDING_QUESTIONS, getNextOnboardingQuestion } from './onboarding';

export const LIFE_AREAS: Array<{
  id: LifeAreaId;
  label: string;
  questionPrompt: string;
}> = [
  { id: 'money', label: 'Money', questionPrompt: 'What is coming in, due soon, or sitting idle?' },
  { id: 'work', label: 'Work', questionPrompt: 'Are you looking for work, employed, or building a business?' },
  { id: 'home', label: 'Home', questionPrompt: 'Renting, buying a first place, or managing household bills?' },
  { id: 'health', label: 'Health', questionPrompt: 'Any pending referrals, checkups, or overdue appointments?' },
  { id: 'relationships', label: 'Relationships', questionPrompt: 'Living solo, partnering up, or supporting family?' },
  { id: 'admin', label: 'Life Admin', questionPrompt: 'Tax codes, council bills, IDs, or overdue paperwork?' },
];

export const DEFAULT_PULSE: PulseFeeling = {
  x: 0.5,
  y: 0.5,
  label: 'Balanced',
  accentHex: '#2347D8',
  bgTint: 'rgba(244, 242, 237, 0.96)',
  focusBias: 'balanced',
  guidance: 'Even pacing across urgent admin, money basics, and open opportunities.',
};

export const LIFE_DESTINATIONS: Array<{
  id: LifeDestination;
  label: string;
  shortLabel: string;
  tagline: string;
}> = [
  {
    id: 'launch-business',
    label: 'Launch & Scale Business',
    shortLabel: 'Build Business',
    tagline: 'Sovereign startup loans, SEIS investor relief & NI payroll allowances',
  },
  {
    id: 'buy-home',
    label: 'Buy First Home',
    shortLabel: 'First Home',
    tagline: '25% Lifetime ISA Treasury match, single-occupant discounts & cash deposit rails',
  },
  {
    id: 'fix-stabilize',
    label: 'Clear Chaos & Build Runway',
    shortLabel: 'Stabilize Life',
    tagline: 'Stop HMRC/tax overpayment, lock high-yield buffer & clear overdue health admin',
  },
  {
    id: 'health-longevity',
    label: 'Peak Health & Prevention',
    shortLabel: 'Health First',
    tagline: 'Protect outpatient waitlists, blood biomarker baselines & overdue dental/eye checks',
  },
  {
    id: 'level-up-career',
    label: 'Upskill & Income Leap',
    shortLabel: 'Career Leap',
    tagline: '90–100% funded national bootcamps, tax-free savings & transit subsidies',
  },
];

export const SETUP_RAILS: Array<{
  id: SetupRailId;
  title: string;
  where: string;
  why: string;
}> = [
  {
    id: 'tax-account',
    title: 'Personal Tax Account',
    where: 'Gov.uk App / IRS Transcript / ELSTER',
    why: 'Prevents emergency tax codes & catches 4 years of backdated rebates.',
  },
  {
    id: 'cash-isa',
    title: 'High-Yield Buffer Pot',
    where: '4.7%+ Easy-Access Cash ISA / HYSA',
    why: 'Moves idle cash off 0% checking so liquidity earns passively.',
  },
  {
    id: 'lisa-starter',
    title: 'First-Home Wrapper (£1)',
    where: 'Approved LISA Provider (before age 40)',
    why: 'Starts your 12-month first-home clock & captures +25% gov bonus.',
  },
  {
    id: 'gp-dentist',
    title: 'GP Online + NHS Portal',
    where: 'NHS App / Local Clinic Portal',
    why: 'Locks e-Referral UBRN slots & fast eConsult blood panels.',
  },
  {
    id: 'pension-match',
    title: 'Employer Match / SIPP',
    where: 'Workplace Pension / Roth IRA',
    why: 'Never leave free matched pre-tax retirement capital uncollected.',
  },
  {
    id: 'business-bank',
    title: 'Separate Business Rail',
    where: 'Companies House + Monzo/Starling/Mercury',
    why: 'Required proof to draw £25k–$250k state-backed startup credit.',
  },
];

export const WORLD_RULES: WorldRuleLesson[] = [
  {
    id: 'rule-sovereign-wrappers',
    category: 'Gov Schemes',
    title: 'Rule 01 · Sovereign Clocks & Free Gov Matches',
    ruleSummary:
      'Governments embed hard age gates into tax wrappers. Opening a UK Lifetime ISA even with £1 before age 40 starts the mandatory 12-month first-home timer and unlocks a 25% Treasury match every year.',
    practicalAction: 'Open eligible tax wrappers with the minimum deposit today so time works for you.',
    whereToStart: 'Gov.uk Lifetime ISA / Moneybox / Hargreaves Lansdown / IRS Roth',
    linkedTaskId: 'uk-lifetime-isa',
    countries: ['UK', 'US'],
  },
  {
    id: 'rule-good-leverage',
    category: 'Leverage & Tax',
    title: 'Rule 02 · Sovereign Capital vs. Consumer Debt',
    ruleSummary:
      'Most people take 24%–39% credit cards while sovereign agencies quietly offer fixed 6%–9% founder loans (British Business Bank, NYC SBS, KfW, LSETF) plus non-dilutive grants and tax relief.',
    practicalAction: 'Never fund growth with consumer APR when state-backed credit & SEIS tax relief exist.',
    whereToStart: 'British Business Bank Start Up Loans / NYC SBS / KfW / LSETF',
    linkedTaskId: 'uk-startup-loan',
  },
  {
    id: 'rule-sequence-defense',
    category: 'Money Mechanics',
    title: 'Rule 03 · Sequence the Game: Stabilize → Rails → Upside',
    ruleSummary:
      'Wealth builders play in order: stop silent leaks (wrong tax code, unused subscriptions, missed council discounts), move cash off 0% accounts into FSCS-shielded yield, then deploy capital toward leverage.',
    practicalAction: 'Check your Personal Tax Code (1257L) and automate a separate high-yield buffer account first.',
    whereToStart: 'Gov.uk Personal Tax Account + FSCS 4.7%+ Easy-Access Cash ISA',
    linkedTaskId: 'uk-hmrc-tax-code',
  },
  {
    id: 'rule-health-queue',
    category: 'Health Queues',
    title: 'Rule 04 · Don’t Lose Your Place in Clinical Queues',
    ruleSummary:
      'Across public health systems (NHS UBRN, German Überweisung), waiting silently cancels appointments after strict week/quarter cutoffs—putting you back at month zero unless confirmed.',
    practicalAction: 'Always confirm specialist referrals within 14 days and request baseline bloods via eConsult.',
    whereToStart: 'NHS App → Appointments → Manage Referrals / 116117 (DE)',
    linkedTaskId: 'nhs-outpatient-referral',
  },
];

export const DEFAULT_HEALTH_SNAPSHOT: HealthSnapshot = {
  dietStyle: 'high-protein',
  waterMlToday: 1250,
  waterTargetMl: 2500,
  proteinTargetG: 130,
  sleepHoursAvg: 7.1,
  zone2MinsWeek: 90,
  mealsLogged: [
    {
      id: 'meal-1',
      label: 'Greek yogurt, berries & whey',
      proteinG: 36,
      calories: 380,
      time: '08:30',
    },
    {
      id: 'meal-2',
      label: 'Salmon, quinoa & greens bowl',
      proteinG: 42,
      calories: 620,
      time: '13:10',
    },
  ],

};

export const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: 'sub-cloud', name: 'Cloud Storage & Backup', monthlyCost: 8, category: 'Software', essential: true, cancelled: false },
  { id: 'sub-mobile', name: 'SIM / Mobile Data Plan', monthlyCost: 24, category: 'Telecom', essential: true, cancelled: false },
  { id: 'sub-stream', name: 'Duplicate Streaming Bundle', monthlyCost: 18, category: 'Media', essential: false, cancelled: false },
  { id: 'sub-unused', name: 'Forgotten Software Trial', monthlyCost: 29, category: 'Software', essential: false, cancelled: false },
  { id: 'sub-gym', name: 'Unused Premium Add-on Pass', monthlyCost: 35, category: 'Fitness', essential: false, cancelled: false },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Noa',
  age: 27,
  city: 'London',
  countryCode: 'UK',
  countryName: 'United Kingdom',
  workStatus: 'director',
  annualIncome: 46000,
  taxCode: '1257L',
  monthlyPensionPct: 5,
  employerMatchPct: 3,
  isBusinessOwner: true,
  businessAgeMonths: 14,
  housingStatus: 'renting',
  hasDependents: false,
  hasPendingHospitalReferral: true,
  referralSpecialty: 'Outpatient Screening · Guy’s Hospital',
  householdSize: 1,
  pulse: DEFAULT_PULSE,
  scannedDocIds: [],
  needsTaxOrDebtFix: true,
  needsCashRunway: true,
  overdueRoutineCare: true,
  destination: 'launch-business',
  collectiveGoals: ['wealth', 'fit', 'calm', 'educated'],
  setupRails: ['business-bank'],
  openedAccountIds: ['acc-current'],
  protectedPolicyIds: [],
  answeredQuestionIds: [],
  health: DEFAULT_HEALTH_SNAPSHOT,
  subscriptions: DEFAULT_SUBSCRIPTIONS,
};

export const PRESET_PROFILES: Array<{ id: string; label: string; badge: string; profile: UserProfile }> = [
  {
    id: 'london-founder',
    label: 'London · Founder (27)',
    badge: 'UK · Business + NHS',
    profile: DEFAULT_PROFILE,
  },
  {
    id: 'london-fix-reset',
    label: 'London · Sole Trader Reset (28)',
    badge: 'UK · Sole Trader + BR Alert',
    profile: {
      name: 'Alex',
      age: 28,
      city: 'London',
      countryCode: 'UK',
      countryName: 'United Kingdom',
      workStatus: 'sole-trader',
      annualIncome: 38000,
      taxCode: 'BR',
      monthlyPensionPct: 0,
      employerMatchPct: 0,
      isBusinessOwner: true,
      businessAgeMonths: 6,
      housingStatus: 'renting',
      hasDependents: false,
      hasPendingHospitalReferral: true,
      referralSpecialty: 'Overdue Outpatient & GP Blood Panel',
      householdSize: 1,
      pulse: {
        x: 0.85,
        y: 0.85,
        label: 'Urgent Focus',
        accentHex: '#F97316',
        bgTint: 'rgba(255, 247, 237, 0.96)',
        focusBias: 'urgent',
        guidance: 'Prioritize urgent appointments, tax/fee leaks & cash runway first.',
      },
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: true,
      overdueRoutineCare: true,
      destination: 'fix-stabilize',
      collectiveGoals: ['wealth', 'fit', 'calm'],
      setupRails: [],
      openedAccountIds: ['acc-current'],
      protectedPolicyIds: [],
      answeredQuestionIds: [],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
  {
    id: 'london-grad',
    label: 'London · Employed (24)',
    badge: 'UK · PAYE + Pension Match',
    profile: {
      name: 'Sasha',
      age: 24,
      city: 'London',
      countryCode: 'UK',
      countryName: 'United Kingdom',
      workStatus: 'employed',
      annualIncome: 34000,
      taxCode: '1257L',
      monthlyPensionPct: 5,
      employerMatchPct: 4,
      isBusinessOwner: false,
      businessAgeMonths: 0,
      housingStatus: 'renting',
      hasDependents: false,
      hasPendingHospitalReferral: true,
      referralSpecialty: 'GP Blood & Iron Panel',
      householdSize: 2,
      pulse: DEFAULT_PULSE,
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: true,
      overdueRoutineCare: true,
      destination: 'buy-home',
      collectiveGoals: ['wealth', 'calm'],
      setupRails: ['pension-match'],
      openedAccountIds: ['acc-current'],
      protectedPolicyIds: [],
      answeredQuestionIds: ['q-destination'],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
  {
    id: 'london-senior-founder',
    label: 'Manchester · Founder (44)',
    badge: 'UK · Family + 40+ Bloods',
    profile: {
      name: 'Daniel',
      age: 44,
      city: 'Manchester',
      countryCode: 'UK',
      countryName: 'United Kingdom',
      workStatus: 'director',
      annualIncome: 82000,
      taxCode: '1257L',
      monthlyPensionPct: 8,
      employerMatchPct: 5,
      isBusinessOwner: true,
      businessAgeMonths: 28,
      housingStatus: 'first-time-buyer',
      hasDependents: true,
      hasPendingHospitalReferral: false,
      referralSpecialty: 'NHS Health Check (40–74)',
      householdSize: 4,
      pulse: DEFAULT_PULSE,
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: false,
      overdueRoutineCare: true,
      destination: 'launch-business',
      collectiveGoals: ['wealth', 'fit', 'educated'],
      setupRails: ['business-bank', 'cash-isa'],
      openedAccountIds: ['acc-current', 'acc-isa'],
      protectedPolicyIds: ['pol-life'],
      answeredQuestionIds: ['q-destination', 'q-money-rail'],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
  {
    id: 'nyc-creator',
    label: 'New York · Studio (30)',
    badge: 'US · SBS Loan + Health',
    profile: {
      name: 'Sam',
      age: 30,
      city: 'New York',
      countryCode: 'US',
      countryName: 'United States',
      workStatus: 'sole-trader',
      annualIncome: 88000,
      taxCode: '1099-SE',
      monthlyPensionPct: 6,
      employerMatchPct: 0,
      isBusinessOwner: true,
      businessAgeMonths: 18,
      housingStatus: 'renting',
      hasDependents: false,
      hasPendingHospitalReferral: true,
      referralSpecialty: 'Mount Sinai Preventive Check',
      householdSize: 2,
      pulse: DEFAULT_PULSE,
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: true,
      overdueRoutineCare: true,
      destination: 'launch-business',
      collectiveGoals: ['wealth', 'fit'],
      setupRails: ['business-bank'],
      openedAccountIds: ['acc-current'],
      protectedPolicyIds: [],
      answeredQuestionIds: [],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
  {
    id: 'berlin-founder',
    label: 'Berlin · Builder (29)',
    badge: 'DE · KfW + Vorsorge',
    profile: {
      name: 'Lukas',
      age: 29,
      city: 'Berlin',
      countryCode: 'DE',
      countryName: 'Germany',
      workStatus: 'employed',
      annualIncome: 68000,
      taxCode: 'Steuerklasse I',
      monthlyPensionPct: 9.3,
      employerMatchPct: 9.3,
      isBusinessOwner: true,
      businessAgeMonths: 9,
      housingStatus: 'renting',
      hasDependents: false,
      hasPendingHospitalReferral: true,
      referralSpecialty: 'Charité Specialist Check-Up',
      householdSize: 3,
      pulse: DEFAULT_PULSE,
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: false,
      overdueRoutineCare: true,
      destination: 'launch-business',
      collectiveGoals: ['wealth', 'fit', 'educated'],
      setupRails: ['tax-account'],
      openedAccountIds: ['acc-current'],
      protectedPolicyIds: [],
      answeredQuestionIds: [],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
  {
    id: 'lagos-founder',
    label: 'Lagos · SME Owner (26)',
    badge: 'NG · LSETF + LSHS',
    profile: {
      name: 'Tunde',
      age: 26,
      city: 'Lagos',
      countryCode: 'NG',
      countryName: 'Nigeria',
      workStatus: 'sole-trader',
      annualIncome: 14400000,
      taxCode: 'PAYE-TIN',
      monthlyPensionPct: 8,
      employerMatchPct: 10,
      isBusinessOwner: true,
      businessAgeMonths: 16,
      housingStatus: 'renting',
      hasDependents: false,
      hasPendingHospitalReferral: true,
      referralSpecialty: 'LUTH Preventive Follow-up',
      householdSize: 5,
      pulse: DEFAULT_PULSE,
      scannedDocIds: [],
      needsTaxOrDebtFix: true,
      needsCashRunway: true,
      overdueRoutineCare: true,
      destination: 'launch-business',
      collectiveGoals: ['wealth', 'fit'],
      setupRails: ['business-bank'],
      openedAccountIds: ['acc-current'],
      protectedPolicyIds: [],
      answeredQuestionIds: [],
      health: DEFAULT_HEALTH_SNAPSHOT,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
    },
  },
];

export const SAMPLE_EVIDENCE_DOCS: EvidenceDocument[] = [
  {
    id: 'doc-nhs-ubrn',
    title: 'NHS e-Referral Letter (SE1).pdf',
    source: 'Camera',
    summary: 'Detected Guy’s & St Thomas’ outpatient UBRN code — 14 days left to confirm appointment slot.',
    scoreBonus: 2,
    unlocksTaskId: 'nhs-outpatient-referral',
    profilePatch: { hasPendingHospitalReferral: true },
  },
  {
    id: 'doc-council-bill',
    title: 'Council Tax Statement — Solo.jpg',
    source: 'Photos',
    summary: 'Single-adult occupancy verified — eligible for 25% Council Tax Single Person Discount (~£450/yr).',
    scoreBonus: 2,
    unlocksTaskId: 'uk-single-person-council',
    profilePatch: { householdSize: 1 },
  },
  {
    id: 'doc-companies-house',
    title: 'Companies House Cert (14 mos).pdf',
    source: 'Files',
    summary: 'Verified <36 month UK incorporation — unlocks British Business Bank £25k Start Up Loan & SEIS.',
    scoreBonus: 2,
    unlocksTaskId: 'uk-startup-loan',
    profilePatch: { isBusinessOwner: true, businessAgeMonths: 14 },
  },
  {
    id: 'doc-30day-plan',
    title: '30-Day Life Score Action Plan',
    source: 'Generated',
    summary: 'Synthesized optimal sequence: confirm NHS slot first, then file £25k Start Up Loan & LISA top-up.',
    scoreBonus: 2,
  },
];

export const VIDEO_STATES: StateDescriptor[] = [
  {
    id: 'scanning',
    order: 1,
    label: 'Dynamic Island Scan',
    videoTimestamp: '0:00 – 0:03',
    videoScreenName: 'Dynamic Island Squircle + Chat',
    lifeosRole: 'Background regional scan (London schemes & NHS records) inside chat',
  },
  {
    id: 'hub-light',
    order: 2,
    label: 'LifeOS Hub',
    videoTimestamp: '0:03 & 0:09',
    videoScreenName: 'Genie Wishes Card (Light)',
    lifeosRole: 'Clean serif LifeOS hub holding your live score & active tasks',
  },
  {
    id: 'aura-search',
    order: 3,
    label: 'Aura Context Sweep',
    videoTimestamp: '0:04 – 0:05',
    videoScreenName: 'Liquid Mesh Gradient Search',
    lifeosRole: 'City & age context sweep where you describe goals or situations',
  },
  {
    id: 'orb-radar',
    order: 4,
    label: 'Score & Scheme Orb',
    videoTimestamp: '0:05',
    videoScreenName: 'Breathing Orb + Filter Chips',
    lifeosRole: 'Live Score Orb + category filters (Loans, Gov Schemes, Health, Tax)',
  },
  {
    id: 'intake-manifesto',
    order: 5,
    label: 'Know-You Manifesto',
    videoTimestamp: '0:05 – 0:06',
    videoScreenName: 'Minimal Manifesto + Swirl',
    lifeosRole: 'Poetic LifeOS discovery intro before calibrating your profile',
  },
  {
    id: 'intake-portal',
    order: 6,
    label: 'Life Scan Portal',
    videoTimestamp: '0:06 – 0:07',
    videoScreenName: 'Island Drop-Down Full Lens',
    lifeosRole: 'Interactive 3-tap check-in for age, city, business & health signals',
  },
  {
    id: 'task-aura',
    order: 7,
    label: 'Agent Discovery Card',
    videoTimestamp: '0:08 – 0:09',
    videoScreenName: 'Feathered Crimson Card + Blur Dissolve',
    lifeosRole: 'Explains why an eligible scheme or appointment surfaced right now',
  },
  {
    id: 'voice-dark',
    order: 8,
    label: 'Dark Voice Pulse',
    videoTimestamp: '0:10 & 0:15',
    videoScreenName: 'OLED Dark + Iridescent Bottom Glow',
    lifeosRole: 'Dark listening state to ask LifeOS about your rights, loans & care',
    darkSurface: true,
  },
  {
    id: 'task-deck',
    order: 9,
    label: 'Staged Task Deck',
    videoTimestamp: '0:12 – 0:14',
    videoScreenName: 'Unblur Action Card + Home Tab',
    lifeosRole: 'Active tasks you must complete now, with upcoming waves queued behind',
  },
  {
    id: 'scheme-portal',
    order: 10,
    label: 'Scheme Spotlight',
    videoTimestamp: '0:16 – 0:19',
    videoScreenName: 'Full-Bleed Spotlight + Island Flash',
    lifeosRole: 'Deep-dive portal for business loans & gov schemes with action steps',
    darkSurface: true,
  },
  {
    id: 'profile-pulse',
    order: 11,
    label: 'Life Portrait Score',
    videoTimestamp: '0:19 – 0:20',
    videoScreenName: 'Cobalt-Crimson Portrait Banner',
    lifeosRole: 'Personal LifeOS Score breakdown & identity snapshot',
    darkSurface: true,
  },
  {
    id: 'chat',
    order: 12,
    label: 'Chat + Inline Cards',
    videoTimestamp: '0:20 & 0:24',
    videoScreenName: 'Thread + Horizontal Card Carousel',
    lifeosRole: 'Part-chat workspace that teaches schemes & embeds tappable tasks',
  },
  {
    id: 'urgent-alert',
    order: 13,
    label: 'Urgent Alert Portal',
    videoTimestamp: '0:21 – 0:24',
    videoScreenName: 'Stacked Glass Cards + Flare Sweep',
    lifeosRole: 'Urgent hospital appointment & deadline spotlight with solar flare feedback',
    darkSurface: true,
  },
];

export const TASK_CATALOG: LifeTask[] = [
  // ============ WAVE 1: IMMEDIATE PRIORITY ============
  {
    id: 'nhs-outpatient-referral',
    title: 'Hospital Appointment',
    shortTitle: 'Hospital Referral',
    subtitle: 'NHS e-Referral · Guy’s & St Thomas’',
    provider: 'NHS England · London',
    category: 'health',
    urgency: 'urgent',
    scoreDelta: 14,
    valueBadge: '14-day window',
    headlinePrompt: 'Your hospital outpatient referral needs a confirmed date before it expires',
    insightSummary:
      'Outpatient referral issued 11 weeks ago — London Trust waitlist rules cancel unbooked referrals at week 13.',
    personalWhy:
      'Confirming your slot protects your care pathway and adds +14 pts to your Health Score immediately.',
    steps: [
      'Open NHS App or e-Referral Service with your UBRN code',
      'Select morning outpatient slot at Guy’s or St Thomas’ (SE1)',
      'Upload GP summary letter to lock appointment reminder',
    ],
    ctaLabel: 'Book NHS Slot',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 1,
    chapter: 1,
    lifeArea: 'health',
    destinations: ['health-longevity', 'fix-stabilize'],
    estimatedValueAmount: 380,
    officialSource: 'NHS App & Guy’s and St Thomas’ Outpatient Booking',
    whySurfaced: 'Matched because you flagged a pending NHS hospital referral in London.',
    stillToCheck: [
      'Your UBRN booking reference from your GP letter or NHS App',
      'Preferred morning or afternoon clinic slot before week 13',
    ],
    whereToGo: 'NHS App -> Appointments -> Manage Referrals (Guy’s & St Thomas’ SE1)',
    whatToSetup: ['NHS App biometric login', 'GP Summary Letter PDF', 'Calendar alert'],
    worldRuleTitle: 'The Week-13 Queue Reset Rule',
    worldRuleLesson:
      'Hospital Trusts quietly drop unbooked outpatient UBRN referrals after 13 weeks—forcing a fresh GP wait unless confirmed.',
    copilotDraft:
      'Subject: Confirming NHS e-Referral UBRN Appointment\n\nHello Appointments Team,\nI received an outpatient referral 11 weeks ago for Guy’s & St Thomas’ (Ref/UBRN: [Insert UBRN]). Could I please confirm the earliest morning clinic slot before the week-13 expiry cutoff?\nThank you.',
    countries: ['UK'],
    requiresReferral: true,
  },
  {
    id: 'uk-startup-loan',
    title: 'London Start Up Loan',
    shortTitle: 'Start Up Loan · £25k',
    subtitle: 'British Business Bank · 6% fixed p.a.',
    provider: 'Gov-Backed · London SME',
    category: 'loan',
    urgency: 'high',
    scoreDelta: 12,
    valueBadge: 'Up to £25,000',
    headlinePrompt: 'Government-backed founder capital unlocked for your London business',
    insightSummary:
      'UK founders trading under 36 months qualify for £500–£25,000 unsecured personal business loans at 6% fixed.',
    personalWhy:
      'Includes 12 months of free London founder mentoring and zero early-repayment fees. +12 pts Capital Score.',
    steps: [
      'Verify UK Companies House / sole-trader registration (< 36 mos)',
      'Export 12-month cashflow forecast from your LifeOS template',
      'Submit through official London Delivery Partner (Virgin / Transmit)',
    ],
    ctaLabel: 'Claim £25k Scheme',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 1,
    chapter: 3,
    lifeArea: 'work',
    destinations: ['launch-business'],
    estimatedValueAmount: 25000,
    officialSource: 'British Business Bank · Start Up Loans UK',
    whySurfaced: 'Matches your London location, age 27, and early-stage business focus.',
    stillToCheck: [
      'Confirm Companies House or sole-trader status is under 36 months',
      'Check personal credit history and prepare a 12-month cashflow note',
    ],
    whereToGo: 'startuploans.co.uk -> London Delivery Partner (Virgin StartUp / Transmit)',
    whatToSetup: ['Dedicated Business Bank Account', '12-Month Cashflow Forecast', 'UTR / Companies House ID'],
    worldRuleTitle: 'Good Leverage vs. Consumer Debt',
    worldRuleLesson:
      'Commercial credit cards charge 25%+ APR. State-backed founder schemes give 6% fixed working capital + 12 months free mentoring with zero early-exit fees.',
    copilotDraft:
      'Start Up Loan Business Case Summary (London SME):\n• Trading duration: < 36 months (Companies House active)\n• Requested amount: £15,000–£25,000 @ 6% fixed\n• Allocation: 60% working capital & revenue delivery, 25% operations/compliance, 15% cash runway buffer.',
    countries: ['UK'],
    minAge: 18,
    requiresBusiness: true,
  },
  {
    id: 'uk-lifetime-isa',
    title: 'Lifetime ISA Bonus',
    shortTitle: 'Lifetime ISA · +25%',
    subtitle: 'HM Treasury · £1,000/yr Free Bonus',
    provider: 'UK Government Scheme',
    category: 'gov',
    urgency: 'high',
    scoreDelta: 10,
    valueBadge: '+£1,000/yr bonus',
    headlinePrompt: 'Age-gated UK scheme: claim 25% free government top-up before age 40',
    insightSummary:
      'Open before age 40 and the UK Treasury adds 25% (up to £1,000/yr) toward your first home up to £450k or retirement.',
    personalWhy:
      'You are inside the 18–39 opening window and currently renting — opening with £1 starts the 12-month clock.',
    steps: [
      'Open a Stocks & Shares or Cash LISA with £1 minimum before tax year end',
      'Confirm UK residency & first-time buyer eligibility',
      'Automate monthly contribution to capture full 25% bonus',
    ],
    ctaLabel: 'Activate 25% Bonus',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 1,
    chapter: 2,
    lifeArea: 'home',
    destinations: ['buy-home', 'fix-stabilize'],
    estimatedValueAmount: 1000,
    officialSource: 'Gov.uk Lifetime ISA · Regulated ISA Providers',
    whySurfaced: 'Matches your age (under 40) and renting status in the UK.',
    stillToCheck: [
      'Confirm you have not owned property anywhere before',
      'Check if you plan to buy within 12 months (12-month maturity rule)',
    ],
    whereToGo: 'Gov.uk Lifetime ISA Guide -> Regulated Provider (Moneybox, Dodl, Hargreaves Lansdown)',
    whatToSetup: ['Lifetime ISA wrapper (£1 min deposit)', 'Payday standing order (£333/mo target)'],
    worldRuleTitle: 'The Age-40 Sovereign Clock Rule',
    worldRuleLesson:
      'You can never open a LISA after turning 40, and the 12-month maturity rule starts on the day of your first £1 deposit—not when you save big.',
    copilotDraft:
      'LISA Rule Check:\n1. Deposit £1 before tax year cutoff to start the 12-month first-home timer.\n2. Target £333/mo standing order (£4,000/yr) -> automatic £1,000 Treasury bonus.',
    countries: ['UK'],
    minAge: 18,
    maxAge: 39,
  },
  {
    id: 'uk-nhs-40plus',
    title: 'NHS Health Check',
    shortTitle: 'Free NHS Check (40+)',
    subtitle: 'Preventive Cardiovascular & Metabolic Screen',
    provider: 'NHS Primary Care · UK',
    category: 'health',
    urgency: 'urgent',
    scoreDelta: 13,
    valueBadge: 'Free · Age 40–74',
    headlinePrompt: 'Your age bracket qualifies for a free comprehensive NHS Health Check',
    insightSummary:
      'Every UK resident aged 40–74 is entitled to a free 20-minute cholesterol, blood pressure, and diabetes baseline.',
    personalWhy:
      'Establishing a 5-year clinical baseline detects silent risks early and raises your Health Score by +13 pts.',
    steps: [
      'Request your free 5-yearly NHS Health Check via GP online services',
      'Complete fasting HbA1c and lipid blood draw',
      'Review QRISK score with your practice nurse',
    ],
    ctaLabel: 'Schedule Free Check',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 1,
    countries: ['UK'],
    minAge: 40,
    maxAge: 74,
  },

  // ============ WAVE 2: COMING UP NEXT ============
  {
    id: 'uk-railcard-26-30',
    title: '26–30 Railcard',
    shortTitle: '26–30 Railcard',
    subtitle: 'National Rail · 1/3 Off Tube & Rail',
    provider: 'Department for Transport · UK',
    category: 'gov',
    urgency: 'recommended',
    scoreDelta: 6,
    valueBadge: 'Save ~£240/yr',
    headlinePrompt: 'Link a 26–30 Railcard to your Oyster for 34% off London off-peak fares',
    insightSummary:
      'Costs £30/yr and cuts off-peak Tube, Overground, Elizabeth Line, and National Rail fares by one-third.',
    personalWhy:
      'Matched strictly to your age bracket (26–30) and London transit zone.',
    steps: [
      'Verify passport / UK driving licence in the Railcard app',
      'Visit any London Underground station ticket machine to link to Oyster',
    ],
    ctaLabel: 'Link Railcard',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    countries: ['UK'],
    minAge: 26,
    maxAge: 30,
  },
  {
    id: 'london-growth-hub',
    title: 'Grow London & Rate Relief',
    shortTitle: 'London SME Relief',
    subtitle: 'GLA Business Support & Borough Grants',
    provider: 'Greater London Authority',
    category: 'loan',
    urgency: 'recommended',
    scoreDelta: 9,
    valueBadge: 'Up to £10,000 relief',
    headlinePrompt: 'London borough small business support & workspace rate relief available',
    insightSummary:
      'Small London businesses with rateable property under £15k qualify for up to 100% Small Business Rate Relief plus GLA advisory.',
    personalWhy:
      'Directly lowers fixed London operating overhead while pairing you with GLA export & procurement leads.',
    steps: [
      'Check your borough council business rates relief eligibility',
      'Enroll in Grow London Local free diagnostic clinic',
    ],
    ctaLabel: 'Explore GLA Relief',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 2,
    countries: ['UK'],
    requiresBusiness: true,
  },
  {
    id: 'seis-tax-relief',
    title: 'SEIS Investor Assurance',
    shortTitle: 'SEIS · 50% Tax Relief',
    subtitle: 'HMRC Seed Enterprise Scheme',
    provider: 'HMRC Venture Schemes',
    category: 'tax',
    urgency: 'high',
    scoreDelta: 10,
    valueBadge: '50% investor relief',
    headlinePrompt: 'Make angel fundraising 2x easier with HMRC SEIS Advance Assurance',
    insightSummary:
      'UK startups under 3 years old can give angel investors 50% income tax relief on up to £250k raised.',
    personalWhy:
      'Your company age fits inside the 3-year SEIS window — most London angels ask for Advance Assurance upfront.',
    steps: [
      'Prepare pitch deck, Articles of Association, and 3-year financial plan',
      'Submit Venture Capital Reliefs form online to HMRC',
    ],
    ctaLabel: 'Start HMRC Filing',
    portalTheme: 'aura',
    imageUrl: '/art/aura-portrait.png',
    wave: 2,
    countries: ['UK'],
    requiresBusiness: true,
  },

  // ============ WAVE 3: LATER HORIZON ============
  {
    id: 'skills-bootcamp-gov',
    title: 'Gov Funded Bootcamp',
    shortTitle: 'DfE Skills Bootcamp',
    subtitle: 'Department for Education · 90% Subsidised',
    provider: 'Gov.uk National Skills Fund',
    category: 'skills',
    urgency: 'recommended',
    scoreDelta: 7,
    valueBadge: '90–100% funded',
    headlinePrompt: 'Upskill yourself or staff for free/90% off via UK Skills Bootcamps',
    insightSummary:
      'Adults 19+ in England can access accredited AI, Cloud, Green Tech, and Leadership bootcamps subsidised by 90% for SMEs (100% for individuals).',
    personalWhy:
      'High-ROI credential boost unlocked after completing your core finance and health items.',
    steps: [
      'Browse London provider cohort dates on Gov.uk',
      'Confirm employer co-funding rate (10% SME) or zero-cost independent entry',
    ],
    ctaLabel: 'View Cohorts',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 3,
    countries: ['UK'],
    minAge: 19,
  },
  {
    id: 'nhs-dental-annual',
    title: 'NHS Dental & Eye Review',
    shortTitle: 'Annual Dental + Eye',
    subtitle: 'Preventive Care Schedule',
    provider: 'NHS Primary Care',
    category: 'health',
    urgency: 'recommended',
    scoreDelta: 6,
    valueBadge: 'Band 1 · £26.80',
    headlinePrompt: 'Complete your overdue annual dental check and eye screen',
    insightSummary:
      'Routine checkups catch inflammation and blood-pressure markers early before emergency treatment is required.',
    personalWhy:
      'Closes the remaining gap in your LifeOS Preventive Health pillar.',
    steps: [
      'Confirm active NHS dentist registration in your postcode',
      'Book annual checkup + retinal photo screen',
    ],
    ctaLabel: 'Log Appointment',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 3,
    countries: ['UK'],
  },

  // ============ US / NEW YORK ============
  {
    id: 'nyc-sbs-loan',
    title: 'NYC Opportunity Fund',
    shortTitle: 'NYC SBS Loan · $250k',
    subtitle: 'NYC Small Business Services · Low APR',
    provider: 'City of New York · SBS',
    category: 'loan',
    urgency: 'high',
    scoreDelta: 12,
    valueBadge: 'Up to $250,000',
    headlinePrompt: 'NYC Small Business Opportunity Fund unlocked for local founders',
    insightSummary:
      'New York businesses under 5 years can access fixed 4%–6% working capital loans backed by NYC SBS.',
    personalWhy:
      'Far below commercial line-of-credit rates; strengthens working capital buffer by +12 pts.',
    steps: [
      'Gather 2 years tax filings or startup cashflow projections',
      'Connect with an NYC Business Solutions Center advisor',
    ],
    ctaLabel: 'Apply via NYC SBS',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 1,
    countries: ['US'],
    requiresBusiness: true,
  },
  {
    id: 'us-preventive-care',
    title: 'Hospital Preventive Visit',
    shortTitle: 'Annual Care Screen',
    subtitle: 'Mount Sinai · $0 Preventive Copay',
    provider: 'ACA Preventive Benefit · NYC',
    category: 'health',
    urgency: 'urgent',
    scoreDelta: 14,
    valueBadge: '$0 Copay Window',
    headlinePrompt: 'Your annual in-network hospital physical & blood panel is overdue',
    insightSummary:
      'Under US preventive care rules, annual metabolic, lipid, and specialist screening carries $0 copay in-network.',
    personalWhy:
      'Prevents out-of-pocket surprises and adds +14 pts to your Health Score.',
    steps: [
      'Confirm in-network provider at Mount Sinai / NYU Langone',
      'Schedule morning fasting lab draw',
    ],
    ctaLabel: 'Book $0 Screening',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 1,
    countries: ['US'],
    requiresReferral: true,
  },
  {
    id: 'us-roth-savers',
    title: 'Roth IRA & NY 529 Match',
    shortTitle: 'Tax-Free Roth Setup',
    subtitle: 'Federal Tax-Advantaged Growth',
    provider: 'IRS / NY State',
    category: 'gov',
    urgency: 'recommended',
    scoreDelta: 9,
    valueBadge: 'Tax-free compounding',
    headlinePrompt: 'Lock in tax-free compounding before the April contribution deadline',
    insightSummary:
      'Maximize annual tax-advantaged space while inside eligible income brackets.',
    personalWhy:
      'Builds long-horizon resilience for self-employed founders.',
    steps: [
      'Verify MAGI eligibility for direct Roth or Solo 401(k)',
      'Automate monthly transfer',
    ],
    ctaLabel: 'Review Contribution',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    countries: ['US'],
  },

  // ============ GERMANY / BERLIN ============
  {
    id: 'de-kfw-startgeld',
    title: 'KfW ERP-Startgeld',
    shortTitle: 'KfW Loan · €125k',
    subtitle: 'KfW Bankengruppe · 80% Liability Waiver',
    provider: 'Federal Ministry · Berlin',
    category: 'loan',
    urgency: 'high',
    scoreDelta: 13,
    valueBadge: 'Up to €125,000',
    headlinePrompt: 'German federal startup loan with 80% state risk coverage available',
    insightSummary:
      'Berlin founders in their first 5 years qualify for up to €125,000 through house banks with reduced collateral.',
    personalWhy:
      'Tailored for early German GmbH / Freiberufler capital without giving up equity.',
    steps: [
      'Prepare IHK/Gründungszuschuss business plan',
      'Submit through local Berlin Sparkasse / Volksbank partner',
    ],
    ctaLabel: 'Prepare KfW Pack',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 1,
    countries: ['DE'],
    requiresBusiness: true,
  },
  {
    id: 'de-charite-check',
    title: 'Hospital Check-Up',
    shortTitle: 'Vorsorge Referral',
    subtitle: 'Charité / Gesetzliche Vorsorge',
    provider: 'GKV Preventive Benefit · Berlin',
    category: 'health',
    urgency: 'urgent',
    scoreDelta: 14,
    valueBadge: '100% GKV Covered',
    headlinePrompt: 'Confirm your Berlin specialist hospital referral (Überweisung) this week',
    insightSummary:
      'German Überweisungsschein specialist referrals expire at quarter end if not booked in time.',
    personalWhy:
      'Saves re-issuing your GP referral and secures your Charité / specialist window.',
    steps: [
      'Call 116117 Terminservice with your Überweisung code',
      'Lock appointment before current Quartal closes',
    ],
    ctaLabel: 'Book via 116117',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 1,
    countries: ['DE'],
    requiresReferral: true,
  },
  {
    id: 'de-exist-bafa',
    title: 'BAFA & Exist Grant',
    shortTitle: 'Berlin R&D Grant',
    subtitle: 'IBB GründungsBONUS · Up to €50k',
    provider: 'Investitionsbank Berlin',
    category: 'gov',
    urgency: 'recommended',
    scoreDelta: 9,
    valueBadge: 'Non-dilutive grant',
    headlinePrompt: 'Berlin non-repayable innovation subsidy open for applications',
    insightSummary:
      'IBB reimburses up to 50% of early Berlin startup hardware, software, and product costs.',
    personalWhy:
      'Zero equity dilution and non-repayable for qualifying Berlin entities.',
    steps: [
      'Verify Berlin registration and <18-month incorporation window',
      'Book pre-submission IBB consultation',
    ],
    ctaLabel: 'Check IBB Window',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    countries: ['DE'],
  },

  // ============ NIGERIA / LAGOS ============
  {
    id: 'ng-lsetf-loan',
    title: 'LSETF / BOI SME Loan',
    shortTitle: 'Lagos SME · 9% p.a.',
    subtitle: 'Lagos State Employment Trust Fund',
    provider: 'Lagos State · BOI',
    category: 'loan',
    urgency: 'high',
    scoreDelta: 13,
    valueBadge: 'Single-digit 9% rate',
    headlinePrompt: 'Subsidised Lagos State SME expansion loan available for registered founders',
    insightSummary:
      'Registered Lagos businesses with LASRRA ID can access working-capital loans at 9% annual interest instead of commercial 28%+.',
    personalWhy:
      'Unlocks working capital cleanly for your Lagos operations.',
    steps: [
      'Verify CAC registration & LASRRA residency card',
      'Upload 6-month business bank statements on LSETF portal',
    ],
    ctaLabel: 'Apply on LSETF',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 1,
    countries: ['NG'],
    requiresBusiness: true,
  },
  {
    id: 'ng-luth-hospital',
    title: 'Hospital Check-Up',
    shortTitle: 'Outpatient Screening',
    subtitle: 'LUTH / LSHS Health Plan',
    provider: 'Lagos State Health Scheme',
    category: 'health',
    urgency: 'urgent',
    scoreDelta: 14,
    valueBadge: 'Priority Slot',
    headlinePrompt: 'Your scheduled hospital follow-up & blood panel is due this fortnight',
    insightSummary:
      'Preventive checkup and specialist follow-up via Lagos State Health Scheme covers core diagnostics.',
    personalWhy:
      'Keeps your preventive health pillar green and avoids emergency clinic queues.',
    steps: [
      'Confirm Ilera Eko / HMO referral authorization code',
      'Book morning diagnostic slot',
    ],
    ctaLabel: 'Confirm Clinic Slot',
    portalTheme: 'horizon',
    imageUrl: '/art/horizon-urgent.png',
    wave: 1,
    countries: ['NG'],
    requiresReferral: true,
  },
  {
    id: 'ng-3mtt-scheme',
    title: '3MTT & Youth Grant',
    shortTitle: 'Federal 3MTT + Grant',
    subtitle: 'NITDA / SMEDAN Youth Enterprise',
    provider: 'Federal Gov Scheme · NG',
    category: 'gov',
    urgency: 'recommended',
    scoreDelta: 8,
    valueBadge: 'Age 18–35 eligible',
    headlinePrompt: 'Federal youth tech & MSME equipment grant open for your age group',
    insightSummary:
      'Nigerian citizens aged 18–35 qualify for federal digital skills stipends & SMEDAN matching grants.',
    personalWhy:
      'Matched to your age bracket and Lagos residency.',
    steps: [
      'Register NIN & business profile on federal portal',
      'Select Lagos cohort & equipment grant track',
    ],
    ctaLabel: 'Explore Scheme',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    countries: ['NG'],
    minAge: 18,
    maxAge: 35,
  },
  // ============ HOUSEHOLD & TEAM SIZE GATED SCHEMES ============
  {
    id: 'uk-single-person-council',
    title: '25% Council Tax Discount',
    shortTitle: '25% Council Discount',
    subtitle: 'Local Borough Single-Occupant Reduction',
    provider: 'UK Local Authority',
    category: 'gov',
    urgency: 'high',
    scoreDelta: 7,
    valueBadge: 'Save ~£450/yr',
    headlinePrompt: 'Living solo in London entitles you to 25% off your annual Council Tax bill',
    insightSummary:
      'Solo adult households in England receive an automatic 25% Council Tax reduction once declared with your borough.',
    personalWhy:
      'Triggered because your household/team size is set to 1 person.',
    steps: [
      'Open your London borough Council Tax portal',
      'Submit the 2-minute Single Person Discount declaration',
    ],
    ctaLabel: 'Claim 25% Off',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    estimatedValueAmount: 450,
    copilotDraft:
      'Subject: Council Tax Single Person Discount (25% Reduction)\n\nDear Local Authority Revenues Team,\nI confirm I am the sole adult aged 18+ resident at my London address and wish to apply the 25% Single Person Discount to my account immediately.\nThank you.',
    countries: ['UK'],
    minHousehold: 1,
    maxHousehold: 1,
  },
  {
    id: 'uk-family-childcare',
    title: 'Check Tax-Free Childcare',
    shortTitle: 'Tax-Free Childcare',
    subtitle: 'Check your household’s eligibility and compare the alternatives.',
    provider: 'GOV.UK Childcare',
    category: 'gov',
    urgency: 'high',
    scoreDelta: 9,
    valueBadge: 'Eligibility check',
    headlinePrompt: 'See which childcare support fits your household',
    insightSummary: 'Eligible families can receive a government top-up toward approved childcare. Check everyone’s circumstances before applying.',
    personalWhy: 'Someone relies on your income, so childcare support may be useful if you have an eligible child.',
    steps: ['Check each child’s age and whether the provider is approved.', 'Check both partners’ work and adjusted net income.', 'Compare Tax-Free Childcare with Universal Credit childcare and vouchers before choosing.', 'Set a reminder to reconfirm eligibility every three months if you apply.'],
    ctaLabel: 'Check childcare support',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    lifeArea: 'relationships',
    countries: ['UK'],
    requiresDependents: true,
    goals: ['calm', 'wealth'],
    whereToGo: 'GOV.UK Childcare Service and your provider.',
    whatToSetup: ['Provider registration details', 'Any reconfirmation dates'],
    stillToCheck: ['Check child age, work and residency requirements and the £100,000 adjusted net income limit per partner.'],
    sourceUrl: 'https://www.gov.uk/tax-free-childcare/check-if-youre-eligible',
  },
  {
    id: 'uk-employment-allowance',
    title: 'Employment Allowance',
    shortTitle: '£10.5k HMRC NI Relief',
    subtitle: 'HMRC Employer National Insurance Cut',
    provider: 'HM Revenue & Customs',
    category: 'tax',
    urgency: 'high',
    scoreDelta: 11,
    valueBadge: 'Up to £10,500/yr',
    headlinePrompt: 'Team size 3+ unlocks up to £10,500 off Employer National Insurance',
    insightSummary:
      'Small UK businesses running payroll for multiple staff can wipe up to £10,500 off annual Employer Class 1 NI bills.',
    personalWhy:
      'Activated by running a UK business with a team/group headcount of 3+.',
    steps: [
      'Enable Employment Allowance flag inside payroll RTI EPS submission',
      'Confirm connected companies do not exceed threshold',
    ],
    ctaLabel: 'Claim NI Relief',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 1,
    estimatedValueAmount: 10500,
    copilotDraft:
      'Payroll RTI EPS Instruction:\nTick “Employment Allowance indicator = Yes” on this month’s Employer Payment Summary to offset up to £10,500 in Class 1 Employer NI.',
    countries: ['UK'],
    requiresBusiness: true,
    minHousehold: 3,
  },

  // ============ FIX MY LIFE: CORE TRIAGE TASKS ============
  {
    id: 'uk-hmrc-tax-code',
    title: 'Check your PAYE code and eligible expenses',
    shortTitle: 'PAYE code check',
    subtitle: 'Reconcile the code, pay and deductions on your record.',
    provider: 'HM Revenue & Customs', category: 'tax', urgency: 'high', scoreDelta: 10,
    valueBadge: 'Tax review', headlinePrompt: 'Check what HMRC used to work out your deductions',
    insightSummary: 'The code reflects your allowance, other employment and adjustments. A temporary or unfamiliar code is a reason to check your record.',
    personalWhy: 'A review can catch an old job, a missing allowance or an eligible work expense.',
    steps: ['Compare your payslip and P60 with the employer, pay and tax in your Personal Tax Account.', 'Check what the code means and update HMRC with accurate details if anything has changed.', 'Use the online checker to find out whether you can claim any work expenses. Save the relevant receipts.'],
    ctaLabel: 'Review PAYE', portalTheme: 'aura', imageUrl: '/art/aura-portrait.png', wave: 1, chapter: 1,
    destinations: ['fix-stabilize', 'launch-business', 'buy-home'],
    whereToGo: 'HMRC Personal Tax Account and your employer’s payroll team.',
    whatToSetup: ['Recent payslip and P60', 'Any coding notice or expense records'],
    stillToCheck: ['Check whether you have more than one job, benefits through work or any non-cumulative coding.'],
    worldRuleTitle: 'Withholding and annual liability',
    worldRuleLesson: 'PAYE collects tax during the year based on HMRC’s instructions. Your total income determines the final amount you owe.',
    sourceUrl: 'https://www.gov.uk/tax-codes',
    copilotDraft: 'Could you help me understand my current tax code and the pay or benefits used to calculate it? My recent payslip shows [code] and my records show [what changed].',
    countries: ['UK'], workStatuses: ['employed', 'director'], requiresTaxOrDebtFix: true,
  },
  {
    id: 'uk-emergency-runway-sweep',
    title: 'Cash Buffer & Dead-Account Sweep',
    shortTitle: '4.7% Cash Buffer Sweep',
    subtitle: 'Build 3-Month Stress-Free Runway · FSCS Protected',
    provider: 'UK Savings & Debt Rescue',
    category: 'gov',
    urgency: 'high',
    scoreDelta: 9,
    valueBadge: '+£650/yr yield & relief',
    headlinePrompt: 'Move idle cash out of 0% checking and consolidate high-APR overdrafts',
    insightSummary:
      'Automating even £25/wk into a 4.7%+ easy-access Cash ISA while switching 0% balance transfers stops compounding interest leaks.',
    personalWhy:
      'Directly removes bill anxiety and raises your LifeOS resilience score even before income increases.',
    steps: [
      'Audit all recurring subscriptions and cancel unused direct debits',
      'Open an FSCS-protected 4.7%+ Cash ISA with automatic payday sweep',
      'Rank any debt by APR (avalanche order) and freeze non-essential interest',
    ],
    ctaLabel: 'Build Cash Buffer',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 1,
    chapter: 2,
    destinations: ['fix-stabilize', 'buy-home', 'level-up-career'],
    estimatedValueAmount: 650,
    whereToGo: 'Any FSCS-Protected 4.7%+ Cash ISA / Monzo or Chase Savings Pot',
    whatToSetup: ['Dedicated Bills Checking Pot', 'Easy-Access 4.7%+ Cash ISA', 'Auto Payday Sweep'],
    worldRuleTitle: 'How Liquidity Buys Freedom',
    worldRuleLesson:
      '0% checking loses purchasing power daily, while one unexpected bill pushes unbuffered accounts into 39% overdraft APR. Separators + payday automation break the cycle permanently.',
    copilotDraft:
      'Payday Automation Rule:\n1. Day of paycheck: Auto-transfer 10% (min £25/wk) -> High-Yield Cash ISA.\n2. Fixed bills bucket separated from daily spending card.\n3. Cancel top 2 dormant subscriptions today.',
    countries: ['UK'],
    requiresCashRunway: true,
  },
  {
    id: 'uk-overdue-gp-mot',
    title: 'Follow up on overdue care',
    shortTitle: 'GP care review',
    subtitle: 'Make a short note of your concerns, then contact your practice.',
    provider: 'Your GP practice', category: 'health', urgency: 'high', scoreDelta: 9,
    valueBadge: 'Care review', headlinePrompt: 'Get the right next step from your care team',
    insightSummary: 'Your symptoms, history and previous checks help your practice decide who to see and whether testing would help.',
    personalWhy: 'A short written note makes it easier to start the conversation.',
    steps: ['Write down what is overdue or what has changed, with dates if you have them.', 'Use your practice’s usual contact form or call to ask what appointment or follow-up would help.', 'Agree the next action and note when to follow up.'],
    ctaLabel: 'Plan a GP follow-up', portalTheme: 'horizon', imageUrl: '/art/horizon-urgent.png', wave: 2, chapter: 1,
    destinations: ['health-longevity', 'fix-stabilize'],
    whereToGo: 'Your GP practice or its online contact form.',
    whatToSetup: ['List of concerns, medicines and relevant previous results'],
    worldRuleTitle: 'A useful timeline',
    worldRuleLesson: 'Tracking what changed and when gives your care team the context to decide what to do next.',
    copilotDraft: 'I’d like to follow up about [what is overdue or has changed]. This started [when]. Could you let me know which appointment or next step would be appropriate?',
    countries: ['UK'], requiresOverdueCare: true,
  },
  {
    id: 'us-tax-hsa-audit',
    title: 'IRS Transcript & HSA Tax Fix',
    shortTitle: 'Tax + HSA Audit · $1.1k',
    subtitle: 'Stop Late Penalties & Claim Overdue Deductions',
    provider: 'IRS / State Comptroller',
    category: 'tax',
    urgency: 'high',
    scoreDelta: 10,
    valueBadge: 'Save ~$1,150/yr',
    headlinePrompt: 'Clean up unfiled transcripts, set IRS payment buffer & unlock HSA tax savings',
    insightSummary:
      'Catching missed estimated payments or First-Time Penalty Abatement + triple-tax-free HSA space prevents compounding notices.',
    personalWhy:
      'Gives you an exact checklist and script to clear tax overwhelm fast.',
    steps: [
      'Download IRS Account Transcript at irs.gov/individuals/get-transcript',
      'Request First-Time Penalty Abatement if charged a one-off late fee',
    ],
    ctaLabel: 'Start Tax Triage',
    portalTheme: 'aura',
    imageUrl: '/art/aura-portrait.png',
    wave: 1,
    estimatedValueAmount: 1150,
    copilotDraft:
      'IRS Penalty Abatement Request Script:\n“Hello, I have a clean 3-year filing history prior to this tax period and would like to request administrative First-Time Penalty Abatement for my return under IRM 20.1.1.3.3.2.1.”',
    countries: ['US'],
    requiresTaxOrDebtFix: true,
  },
  {
    id: 'de-steuer-vorsorge-audit',
    title: 'ELSTER Tax & Vorsorge Reset',
    shortTitle: 'Steuer Refund · ~€1,090',
    subtitle: 'Average German Income Tax Refund + Home-Office Pauschale',
    provider: 'Finanzamt · ELSTER',
    category: 'tax',
    urgency: 'high',
    scoreDelta: 10,
    valueBadge: 'Avg €1,090 refund',
    headlinePrompt: 'Claim 4 years of backdated German Steuererklärung & Home-Office deductions',
    insightSummary:
      'Voluntary tax filings in Germany yield an average €1,095 refund and can be claimed up to 4 years retroactively.',
    personalWhy:
      'Turns cluttered receipts into immediate cash back from Finanzamt.',
    steps: [
      'Activate ELSTER certificate and pre-fill Belegabruf',
      'Claim €1,260 annual Home-Office-Pauschale + Pendlerpauschale',
    ],
    ctaLabel: 'Claim €1,090 Refund',
    portalTheme: 'aura',
    imageUrl: '/art/aura-portrait.png',
    wave: 1,
    estimatedValueAmount: 1090,
    countries: ['DE'],
    requiresTaxOrDebtFix: true,
  },
  {
    id: 'ng-tin-health-shield',
    title: 'LIRS Compliance & LSHS Shield',
    shortTitle: 'Tax Clearance + Ilera Eko',
    subtitle: 'Avoid Out-of-Pocket Emergencies & Unlock Contract Bidding',
    provider: 'LIRS / Lagos State Health',
    category: 'tax',
    urgency: 'high',
    scoreDelta: 10,
    valueBadge: 'Risk + Access Shield',
    headlinePrompt: 'Lock active LSHS health cover & LIRS tax clearance in one checklist',
    insightSummary:
      'Combining an Ilera Eko annual plan with clean LIRS e-Tax status shields against sudden hospital bills and opens SME procurement.',
    personalWhy:
      'Protects both personal health and business eligibility across Lagos.',
    steps: [
      'Verify TIN & LIRS Payer ID on etax.lirs.net',
      'Activate annual Ilera Eko primary/hospital cover',
    ],
    ctaLabel: 'Verify Shield',
    portalTheme: 'aura',
    imageUrl: '/art/aura-portrait.png',
    wave: 1,
    estimatedValueAmount: 180000,
    countries: ['NG'],
    requiresTaxOrDebtFix: true,
  },
  {
    id: 'sole-trader-tax-vault',
    title: 'Separate business cash for tax',
    shortTitle: 'Business tax reserve',
    subtitle: 'Plan for actual liabilities and payment dates.',
    provider: 'Business account and local tax authority', category: 'tax', urgency: 'high', scoreDelta: 8,
    valueBadge: 'Cash reserve', headlinePrompt: 'Set aside tax when client payments reach you',
    insightSummary: 'Profit, payroll or filing status and prior advance payments change how much of your cash you can safely spend.',
    personalWhy: 'Keeping tax money separate gives you a clearer view of the cash available to draw.',
    steps: ['Enter your expected net business profit in Work & Money and check the estimate against your accountant or tax authority.', 'Check payment deadlines, advance payments and any retained amounts.', 'Set a transfer into a separate reserve as clients pay and review the balance when income changes.'],
    ctaLabel: 'Plan a tax reserve', portalTheme: 'editorial', imageUrl: '/art/editorial-card.png', wave: 2, chapter: 2,
    lifeArea: 'work', destinations: ['launch-business', 'fix-stabilize'], goals: ['wealth', 'calm'],
    whySurfaced: 'Your business cash needs to cover tax and contributions before you decide what to draw.',
    stillToCheck: ['Check local registration, invoicing and estimated payment rules for your structure.'],
    whereToGo: 'Work & Money, your business account and your local tax filing portal.',
    whatToSetup: ['Separate reserve account', 'Tax payment dates and a review reminder'],
    thinkerId: 'taleb',
    worldRuleLesson: 'Base spending decisions on what remains after foreseeable obligations.',
    workStatuses: ['sole-trader', 'director'],
  },
  {
    id: 'bloodwork-baseline-panel',
    title: 'Agree a bloodwork plan',
    shortTitle: 'Bloodwork plan',
    subtitle: 'Work out what is worth checking and when to review it.',
    provider: 'Primary care',
    category: 'health',
    urgency: 'high',
    scoreDelta: 9,
    valueBadge: 'Care plan',
    headlinePrompt: 'Decide which preventive checks fit your history',
    insightSummary: 'Your age, symptoms, family history and prior results help your GP decide which tests and intervals are useful.',
    personalWhy: 'Knowing which results matter makes it easier to ask good questions and follow through.',
    steps: ['Bring your prior results, medications and family history to a care review.', 'Ask which markers would help, how to prepare and when to repeat them.', 'Record results with their units in Health and set the review month you agreed.'],
    ctaLabel: 'Plan a care review',
    portalTheme: 'aura',
    imageUrl: '/art/aura-portrait.png',
    wave: 2,
    chapter: 2,
    lifeArea: 'health',
    destinations: ['health-longevity', 'fix-stabilize'],
    goals: ['fit'],
    whySurfaced: 'A care review can connect concerns, family history and prior results with a useful testing plan.',
    stillToCheck: ['Ask whether any test needs fasting or particular preparation.'],
    whereToGo: 'Your GP or usual clinician, then Health → Bloodwork.',
    whatToSetup: ['A list of questions for your clinician', 'The agreed follow-up date'],
    thinkerId: 'attia',
    worldRuleLesson: 'Review changes and long-term risk with a clinician while there is time to act.',
    copilotDraft: 'I’d like to review my preventive care plan. Given my history and any recent results, could we discuss which tests would help and when to follow up?',
  },
  {
    id: 'subscription-leak-purge',
    title: 'Purge Quiet Subscription Drain',
    shortTitle: 'Subscription Purge',
    subtitle: 'Cut dead apps & reallocate straight to index or buffer',
    provider: 'Conscious Spending Audit',
    category: 'skills',
    urgency: 'recommended',
    scoreDelta: 6,
    valueBadge: '+£380/yr Reclaimed',
    headlinePrompt: 'Cancel dormant subscriptions and redirect that exact amount to compounding',
    insightSummary:
      'Small £8–£25 recurring debits quietly compound outward. Reviewing 90 days of statements and cancelling just two unused trials frees hundreds annually with zero lifestyle loss.',
    personalWhy:
      'Every £35/mo reclaimed and routed automatically to a 4.7% buffer or index ISA builds effortless momentum.',
    steps: [
      'Open Money & Work Stack inside life and mark every subscription you did not use this week',
      'Cancel with the provider or in the Apple or Google subscriptions list',
      'Route the exact saved monthly amount into your automated payday transfer',
    ],
    ctaLabel: 'Audit Subscriptions',
    portalTheme: 'editorial',
    imageUrl: '/art/editorial-card.png',
    wave: 2,
    estimatedValueAmount: 380,
    chapter: 2,
    lifeArea: 'money',
    destinations: ['fix-stabilize', 'buy-home', 'level-up-career'],
    whySurfaced: 'Automated payday sweeps and low fixed overhead create permanent cashflow breathing room.',
    stillToCheck: [
      'Check annual renewals hidden in Apple/Google Play, PayPal, and broadband bundles',
    ],
    officialSource: 'iwillteachyoutoberich.com · moneyhelper.org.uk',
    whereToGo: 'Bank Scheduled Payments + iOS Settings -> Subscriptions',
    whatToSetup: [
      'Cancel dormant trials immediately',
      'Standing order moving reclaimed cash on payday +1',
    ],
    worldRuleTitle: 'Ramit Sethi · Conscious Spending',
    worldRuleLesson:
      'Spend extravagantly on the things you love, as long as you cut costs mercilessly on the things you do not care about. Automate the transfer so willpower is never required.',
  },
  {
    id: 'protection-beneficiary-audit',
    title: 'Review income cover and beneficiaries',
    shortTitle: 'Income cover and beneficiaries',
    subtitle: 'Check what happens if you’re unable to work or someone needs to act for you.',
    provider: 'Your employer, pension providers and legal adviser', category: 'gov', urgency: 'recommended', scoreDelta: 8,
    valueBadge: 'Continuity plan', headlinePrompt: 'Make it easier for the people you rely on to act',
    insightSummary: 'Your income cover, will, beneficiary forms and power of attorney documents serve different purposes.',
    personalWhy: 'Current records help people respond quickly if you become ill or your circumstances change.',
    steps: ['Check sick pay or personal cover against the bills and income your household would need.', 'List pension accounts, insurance and any accounts with a beneficiary. Review each nomination, including UK Expression of Wish forms where applicable.', 'Review your will, any guardianship wishes and health or financial powers with a local adviser.', 'Keep a secure list of where current documents are held and review after a major life change.'],
    ctaLabel: 'Review protection', portalTheme: 'horizon', imageUrl: '/art/horizon-urgent.png', wave: 3, chapter: 3,
    lifeArea: 'admin', destinations: ['fix-stabilize', 'buy-home', 'launch-business'], goals: ['calm'],
    whySurfaced: 'A continuity review makes important records easier to find and use when someone needs them.',
    stillToCheck: ['Confirm how each provider handles beneficiaries and whether they can take your nomination into account.', 'Compare any policy waiting period with your emergency fund.'],
    whereToGo: 'Your pension and insurance account settings, HR and local legal advice.',
    whatToSetup: ['Current beneficiary nominations', 'Up-to-date will and emergency contacts'],
    thinkerId: 'munger',
    worldRuleLesson: 'Make explicit plans for the small number of events that would leave someone without support.',
  },
  {
    id: 'passkey-credit-shield',
    title: 'Protect sign-in and account recovery',
    shortTitle: 'Passkeys & recovery',
    subtitle: 'Protect your primary email, carrier account and recovery codes.',
    provider: 'Account security settings',
    category: 'skills',
    urgency: 'recommended',
    scoreDelta: 6,
    valueBadge: 'Account security',
    headlinePrompt: 'Make sure you can recover your accounts after losing a phone',
    insightSummary: 'Your email often controls access to the rest of your accounts. Protect sign-in and make a separate recovery route.',
    personalWhy: 'A second way to sign in helps when the phone or number you normally rely on is unavailable.',
    steps: [
      'Turn on a passkey for primary email where offered and confirm a backup sign-in method. Use an authenticator when passkeys are unavailable.',
      'Ask the mobile carrier how to enable a transfer lock or port-out PIN on your number.',
      'Store recovery codes off the device and outside the account they recover, such as a locked place or independent encrypted backup.',
    ],
    ctaLabel: 'Review access',
    portalTheme: 'founder',
    imageUrl: '/art/founder-portal.png',
    wave: 2,
    lifeArea: 'admin',
    goals: ['calm', 'educated'],
    whySurfaced: 'Your email and phone number are used to recover many essential accounts.',
    stillToCheck: ['Verify the backup method works before removing another way to sign in.'],
    whereToGo: 'Your email security settings, password manager and carrier account.',
    whatToSetup: ['Passkey and backup sign-in', 'Carrier transfer protection', 'Off-device recovery instructions'],
    thinkerId: 'taleb',
    worldRuleLesson: 'Make sure losing one device leaves you with a second path back into your accounts.',
  },
  {
    id: 'us-credit-freeze', title: 'Freeze credit at all three bureaus', shortTitle: 'Credit freezes',
    subtitle: 'Place free security freezes at Equifax, Experian and TransUnion.',
    provider: 'Federal Trade Commission', category: 'gov', urgency: 'recommended', scoreDelta: 5,
    valueBadge: 'Identity protection', headlinePrompt: 'Limit new credit checks in your name',
    insightSummary: 'A security freeze limits access to your credit file. Each bureau manages its freeze separately.',
    personalWhy: 'A freeze can reduce the chance someone opens a new account in your name.',
    steps: ['Use the FTC links to request a freeze directly from Equifax, Experian and TransUnion.', 'Store each confirmation and recovery instructions securely.', 'Temporarily lift the freeze at the bureau a lender will use when you need to apply.'],
    ctaLabel: 'Open freeze guide', portalTheme: 'editorial', imageUrl: '/art/editorial-card.png', wave: 2,
    countries: ['US'], lifeArea: 'admin', goals: ['calm'], thinkerId: 'munger',
    whereToGo: 'Equifax, Experian and TransUnion through the FTC’s direct links.',
    whatToSetup: ['Three freeze confirmations and a secure recovery note'],
    stillToCheck: ['If you are applying for credit now, ask which bureau the lender checks and when.'],
    sourceUrl: 'https://consumer.ftc.gov/articles/credit-freezes-and-fraud-alerts',
  },
  {
    id: 'uk-lasting-power', title: 'Plan lasting powers of attorney', shortTitle: 'Powers of attorney',
    subtitle: 'Review who can make health or financial decisions if you can’t.',
    provider: 'Office of the Public Guardian', category: 'gov', urgency: 'recommended', scoreDelta: 6,
    valueBadge: 'Care and continuity', headlinePrompt: 'Put the right decision-makers in place',
    insightSummary: 'England and Wales have separate lasting powers for health and welfare and for property and financial affairs.',
    personalWhy: 'This gives you a chance to agree who should act and what matters to you.',
    steps: ['Check which power of attorney process applies where you live.', 'Talk through responsibilities with the people you would appoint and consider a replacement.', 'Use the official forms and registration process. Keep a secure note of where documents are held.'],
    ctaLabel: 'Review powers', portalTheme: 'editorial', imageUrl: '/art/editorial-card.png', wave: 2,
    countries: ['UK'], lifeArea: 'relationships', goals: ['calm'], thinkerId: 'munger',
    whereToGo: 'Office of the Public Guardian for England and Wales. Scotland and Northern Ireland use their own processes.',
    whatToSetup: ['Attorneys and replacements', 'Registered documents and emergency contacts'],
    stillToCheck: ['Ask a local adviser about capacity, signing, witnesses and jurisdiction if any are uncertain.'],
    sourceUrl: 'https://www.gov.uk/power-of-attorney',
  },
  ...STAGE_GAMBITS,
];

const GOAL_LABELS: Record<CollectiveGoal, string> = {
  wealth: 'wealth', fit: 'fitness', calm: 'calm', educated: 'learning',
};

function getContextTasks(profile: UserProfile): LifeTask[] {
  return TASK_CATALOG.filter((task) => {
    if (task.countries && !task.countries.includes(profile.countryCode)) return false;
    if (task.minAge !== undefined && profile.age < task.minAge) return false;
    if (task.maxAge !== undefined && profile.age > task.maxAge) return false;
    if (
      task.requiresBusiness &&
      !profile.isBusinessOwner &&
      profile.workStatus !== 'sole-trader' &&
      profile.workStatus !== 'director'
    ) {
      return false;
    }
    if (task.requiresReferral && !profile.hasPendingHospitalReferral) return false;
    if (task.requiresTaxOrDebtFix && !profile.needsTaxOrDebtFix) return false;
    if (task.requiresCashRunway && !profile.needsCashRunway) return false;
    if (task.requiresOverdueCare && !profile.overdueRoutineCare) return false;
    if (task.minHousehold !== undefined && profile.householdSize < task.minHousehold) return false;
    if (task.maxHousehold !== undefined && profile.householdSize > task.maxHousehold) return false;
    if (task.housing && !task.housing.includes(profile.housingStatus)) return false;
    if (task.workStatuses && !task.workStatuses.includes(profile.workStatus)) return false;
    if (task.requiresDependents && !profile.hasDependents) return false;
    if (task.calculator === 'mortgage-invest' && profile.housingLoan === false) return false;
    return true;
  });
}

function matchGoals(task: LifeTask, profile: UserProfile) {
  return profile.collectiveGoals.filter((goal) => task.goals?.includes(goal));
}

export function getEligibleTasks(profile: UserProfile, completedIds: string[] = []): LifeTask[] {
  const candidates = getContextTasks(profile);
  const { level, urgentClear } = stageReadiness(profile, candidates, completedIds);
  const bias = profile.pulse?.focusBias ?? 'balanced';
  const weight = (task: LifeTask) => {
    let score = matchGoals(task, profile).length * 7;
    if (task.urgency === 'urgent') score += 100;
    if (urgentClear && task.minLevel) score += 10 + task.minLevel * 2;
    if (task.destinations?.includes(profile.destination)) score += 6;
    if (bias === 'growth' && (task.category === 'loan' || task.category === 'tax')) score += 3;
    if (bias === 'calm' && (task.category === 'gov' || task.category === 'skills')) score += 2;
    if (bias === 'explore' && task.wave >= 2) score += 2;
    return score;
  };
  return candidates
    .filter((task) => (task.minLevel ?? 1) <= level)
    .sort((a, b) => weight(b) - weight(a) || a.wave - b.wave || b.scoreDelta - a.scoreDelta)
    .map((task) => {
      if (!task.minLevel) return task;
      const goals = matchGoals(task, profile).map((goal) => GOAL_LABELS[goal]);
      const goalText = goals.length > 1 ? `${goals.slice(0, -1).join(', ')} and ${goals[goals.length - 1]}` : goals[0];
      const reasons = goalText ? ` This supports your ${goalText} ${goals.length > 1 ? 'goals' : 'goal'}.` : '';
      return { ...task, whySurfaced: `${task.whySurfaced ?? task.personalWhy}${reasons}` };
    });
}

export function computeGameChapter(
  profile: UserProfile,
  eligible: LifeTask[],
  completedIds: string[]
): GameChapterSummary {
  const destInfo =
    LIFE_DESTINATIONS.find((d) => d.id === profile.destination) ?? LIFE_DESTINATIONS[0];
  const railsCount = profile.setupRails?.length ?? 0;
  const doneCount = eligible.filter((t) => completedIds.includes(t.id)).length;
  const ch1Open = eligible.filter(
    (t) => (t.urgency === 'urgent' || t.chapter === 1) && !completedIds.includes(t.id)
  ).length;
  const readinessPct = Math.min(
    100,
    Math.round(((railsCount * 1.2 + doneCount * 1.5) / Math.max(4, eligible.length + 3)) * 100)
  );

  if (ch1Open > 0) {
    return {
      chapterNumber: 1,
      chapterLabel: 'Chapter I · Protect & Stabilize',
      headline: `Destination: ${destInfo.shortLabel}`,
      nextUnlockText: `${ch1Open} immediate stability move${ch1Open === 1 ? '' : 's'} unlock Stage II`,
      readinessPct,
    };
  }
  if (railsCount < 3) {
    return {
      chapterNumber: 2,
      chapterLabel: 'Chapter II · Money & Care Rails',
      headline: `Destination: ${destInfo.shortLabel}`,
      nextUnlockText: `Set up ${3 - railsCount} more core account rail${3 - railsCount === 1 ? '' : 's'}`,
      readinessPct,
    };
  }
  if (doneCount < eligible.length) {
    return {
      chapterNumber: 3,
      chapterLabel: 'Chapter III · Schemes & Leverage',
      headline: `Destination: ${destInfo.shortLabel}`,
      nextUnlockText: `${eligible.length - doneCount} sovereign opportunities ready to claim`,
      readinessPct,
    };
  }
  return {
    chapterNumber: 4,
    chapterLabel: 'Chapter IV · Compounding & Mastery',
    headline: `${destInfo.shortLabel} · All Current Moves Clear`,
    nextUnlockText: 'All eligible schemes, health baselines & rails calibrated',
    readinessPct: 100,
  };
}

const CURRENCY_BY_COUNTRY: Record<UserProfile['countryCode'], string> = {
  UK: '£',
  US: '$',
  DE: '€',
  NG: '₦',
};

export function getCurrencySymbol(countryCode: UserProfile['countryCode']): string {
  return CURRENCY_BY_COUNTRY[countryCode] ?? '£';
}

export function inferTaskLifeArea(task: LifeTask): LifeAreaId {
  if (task.lifeArea) return task.lifeArea;
  if (task.category === 'health') return 'health';
  if (task.category === 'loan' || task.category === 'skills') return 'work';
  if (task.id.includes('council') || task.id.includes('isa') || task.id.includes('first-home')) {
    return 'home';
  }
  if (task.id.includes('family') || task.id.includes('childcare')) return 'relationships';
  if (task.category === 'tax') return 'money';
  return 'admin';
}

export function computeLifeAreaProgress(
  profile: UserProfile,
  eligible: LifeTask[],
  completedIds: string[]
): LifeAreaProgress[] {
  const symbol = getCurrencySymbol(profile.countryCode);
  const outcomes = profile.recordedOutcomes ?? {};

  return LIFE_AREAS.map((area) => {
    if (area.id === 'money') {
      if (profile.runway) {
        const net = profile.runway.netRunway;
        const formatted = `${net >= 0 ? '+' : '-'}${symbol}${Math.abs(net).toLocaleString()}`;
        return {
          id: 'money',
          label: 'Money',
          statusText: net >= 0 ? `30-day cover: ${formatted}` : `30-day gap: ${formatted}`,
          updated: true,
          progressPct: net >= 0 ? 85 : 58,
        };
      }
      if (outcomes['uk-hmrc-tax-code'] || completedIds.includes('uk-hmrc-tax-code')) {
        return {
          id: 'money',
          label: 'Money',
          statusText: 'Tax code & runway checked',
          updated: true,
          progressPct: 62,
        };
      }
      return {
        id: 'money',
        label: 'Money',
        statusText: 'Next 30 days not mapped yet',
        updated: false,
        progressPct: 18,
      };
    }

    if (area.id === 'work') {
      const loanDone = completedIds.includes('uk-startup-loan') || outcomes['uk-startup-loan'];
      return {
        id: 'work',
        label: 'Work',
        statusText: loanDone
          ? 'Funding route checked'
          : profile.isBusinessOwner
            ? 'Funding & grants matched'
            : 'Setting up your next income',
        updated: Boolean(loanDone),
        progressPct: loanDone ? 82 : profile.isBusinessOwner ? 42 : 28,
      };
    }

    if (area.id === 'health') {
      const healthOpen = eligible.filter(
        (t) => t.category === 'health' && !completedIds.includes(t.id)
      ).length;
      return {
        id: 'health',
        label: 'Health',
        statusText: healthOpen > 0 ? `${healthOpen} check or booking due` : 'Waitlist & checks clear',
        updated: healthOpen === 0,
        progressPct: healthOpen === 0 ? 90 : healthOpen === 1 ? 45 : 22,
      };
    }

    if (area.id === 'home') {
      const homeDone = completedIds.includes('uk-single-person-council') || completedIds.includes('uk-lifetime-isa');
      return {
        id: 'home',
        label: 'Home',
        statusText: homeDone
          ? 'Home discount / deposit set'
          : profile.housingStatus === 'renting'
            ? 'Renting · deposit & discount open'
            : 'Home checks available',
        updated: homeDone,
        progressPct: homeDone ? 78 : profile.setupRails.includes('lisa-starter') ? 55 : 24,
      };
    }

    if (area.id === 'relationships') {
      const size = profile.householdSize || 1;
      return {
        id: 'relationships',
        label: 'Relationships',
        statusText: size === 1 ? 'Solo household mapped' : `Household of ${size >= 16 ? '16+' : size} mapped`,
        updated: true,
        progressPct: 75,
      };
    }

    const doneCount = eligible.filter((t) => completedIds.includes(t.id)).length;
    return {
      id: 'admin',
      label: 'Life Admin',
      statusText: doneCount > 0 ? `${doneCount} item${doneCount === 1 ? '' : 's'} sorted` : 'Tax & council checks open',
      updated: doneCount > 0,
      progressPct: Math.min(95, 20 + doneCount * 22),
    };
  });
}

export function computeLifeImpact(
  profile: UserProfile,
  eligible: LifeTask[],
  completedIds: string[]
): LifeImpactSummary {
  const currencySymbol = getCurrencySymbol(profile.countryCode);
  const remaining = eligible.filter((t) => !completedIds.includes(t.id));
  const completed = eligible.filter((t) => completedIds.includes(t.id));

  const unclaimedAmount = remaining.reduce((sum, t) => sum + (t.estimatedValueAmount ?? 0), 0);
  const claimedAmount = completed.reduce((sum, t) => sum + (t.estimatedValueAmount ?? 0), 0);
  const urgentCount = remaining.filter((t) => t.urgency === 'urgent' || t.urgency === 'high').length;

  const unclaimedFormatted = `${currencySymbol}${unclaimedAmount.toLocaleString()}`;
  const claimedFormatted = `${currencySymbol}${claimedAmount.toLocaleString()}`;

  const fixReadyHeadline =
    remaining.length === 0
      ? 'All detected life fixes & entitlements cleared'
      : urgentCount > 0
        ? `${urgentCount} high-priority fix${urgentCount === 1 ? '' : 'es'} · ${unclaimedFormatted} waiting`
        : `${remaining.length} action${remaining.length === 1 ? '' : 's'} left · ${unclaimedFormatted} available`;

  return {
    currencySymbol,
    unclaimedAmount,
    claimedAmount,
    unclaimedFormatted,
    claimedFormatted,
    urgentCount,
    fixReadyHeadline,
  };
}

export function getCrowdUnlockSummary(count: number, profile: UserProfile): string {
  if (count <= 1) {
    return profile.countryCode === 'UK'
      ? 'Solo living unlocks 25% Council Tax Single-Person Discount (~£450/yr).'
      : 'Solo profile optimizes individual tax allowances & fast-track healthcare.';
  }
  if (count <= 2) {
    return 'Household of 2 unlocks joint tax relief & UK Tax-Free Childcare checks.';
  }
  if (count <= 6) {
    return profile.isBusinessOwner
      ? `Size ${count} unlocks HMRC Employment Allowance (up to £10.5k NI relief) + Family Care.`
      : `Household of ${count} qualifies for Family Allowances & multi-member health cover.`;
  }
  return profile.isBusinessOwner
    ? `Team of ${count >= 16 ? '16+' : count} unlocks SME Growth Grants, Payroll Relief & Apprenticeship funding.`
    : `Group of ${count >= 16 ? '16+' : count} adjusts emergency resilience targets & dependent benefits.`;
}

export function partitionTasks(eligible: LifeTask[], completedIds: string[]) {
  const completed = eligible.filter((t) => completedIds.includes(t.id));
  const remaining = eligible.filter((t) => !completedIds.includes(t.id));

  // Always show up to 2–3 active tasks right now ("tasks you have to complete")
  // and keep the rest visibly queued as "coming next"
  const active = remaining.slice(0, 2);
  const comingUp = remaining.slice(2);

  return { active, comingUp, completed };
}

export function computeLifeScore(profile: UserProfile, completedIds: string[]): ScoreBreakdown {
  const eligible = getEligibleTasks(profile, completedIds);
  const completed = eligible.filter((t) => completedIds.includes(t.id));

  // Base awareness score from knowing the user's context, verified docs, setup rails & 30-day map
  const docBonus = Math.min(4, (profile.scannedDocIds?.length ?? 0) * 1.5);
  const railBonus = Math.min(4, Math.max(0, (profile.setupRails?.length ?? 1) - 1));
  const runwayBonus = profile.runway ? 4 : 0;
  const baseProfileScore = Math.round(
    36 +
      (profile.city ? 4 : 0) +
      (profile.age > 0 ? 4 : 0) +
      (profile.isBusinessOwner ? 4 : 2) +
      (profile.householdSize ? 2 : 0) +
      docBonus +
      railBonus +
      runwayBonus
  );

  const earnedDelta = completed.reduce((sum, t) => sum + t.scoreDelta, 0);
  const maxPossibleDelta = Math.max(
    1,
    eligible.reduce((sum, t) => sum + t.scoreDelta, 0)
  );

  const scaledEarned = Math.round((earnedDelta / maxPossibleDelta) * (100 - baseProfileScore));
  const total = Math.min(100, baseProfileScore + scaledEarned);

  const pillarScore = (categories: LifeTask['category'][], base: number) => {
    const relevant = eligible.filter((t) => categories.includes(t.category));
    if (relevant.length === 0) return Math.min(95, base + 25);
    const done = relevant.filter((t) => completedIds.includes(t.id)).length;
    return Math.min(100, Math.round(base + (done / relevant.length) * (100 - base)));
  };

  const capital = pillarScore(['loan'], profile.isBusinessOwner ? 44 : 72);
  const gov = pillarScore(['gov', 'tax'], 46);
  const health = pillarScore(['health'], profile.hasPendingHospitalReferral ? 34 : 76);
  const growth = pillarScore(['skills', 'tax'], 58);

  const tierLabel =
    total >= 85
      ? 'In control'
      : total >= 68
        ? 'Taking shape'
        : total >= 50
          ? 'Finding your feet'
          : 'Starting out';

  const nextMilestone = total < 60 ? 60 : total < 80 ? 80 : 100;

  return {
    total,
    capital,
    gov,
    health,
    growth,
    tierLabel,
    nextMilestone,
  };
}

export function createInitialMessages(profile: UserProfile, eligible: LifeTask[]): ChatMessage[] {
  const topLoan = eligible.find((t) => t.category === 'loan');
  const topHealth = eligible.find((t) => t.category === 'health');
  const topGov = eligible.find((t) => t.category === 'gov');
  const featured = [topHealth, topLoan, topGov].filter((t): t is LifeTask => Boolean(t));
  const destLabel =
    LIFE_DESTINATIONS.find((d) => d.id === profile.destination)?.label ?? 'Build & Unlock Life';

  return [
    {
      id: 'm-1',
      sender: 'lifeos',
      text: `Welcome to life, ${profile.name}. Based on ${profile.city} (age ${profile.age}) and your goal (${destLabel}), I’ve mapped what to set up, where to go, and what’s unlocked right now.`,
      timestamp: '09:41',
    },
    {
      id: 'm-2',
      sender: 'user',
      text: profile.isBusinessOwner
        ? 'What should I set up first — loans, gov schemes, or urgent checks?'
        : 'Where do I go first — schemes, money setup, or hospital appointments?',
      timestamp: '09:42',
    },
    {
      id: 'm-3',
      sender: 'user',
      text: 'Teach me the rules as I go and show me step by step.',
      timestamp: '09:42',
    },
    {
      id: 'm-4',
      sender: 'lifeos',
      text: 'Start with Stage I below — each card includes exact destinations, setup rails, and the rule behind how it works:',
      timestamp: '09:43',
      cards: featured,
    },
  ];
}

export function processLifeOSMessage(
  rawText: string,
  profile: UserProfile,
  completedIds: string[],
  onUpdateProfile: (patch: Partial<UserProfile>) => void,
  onCompleteTask: (taskId: string) => void
): { replyText: string; cards: LifeTask[]; suggestedState?: LifeOSStateId } {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Multi-signal natural language extraction from user situation
  const patch: Partial<UserProfile> = {};
  const detectedUpdates: string[] = [];

  if (lower.includes('london')) {
    patch.city = 'London';
    patch.countryCode = 'UK';
    patch.countryName = 'United Kingdom';
    detectedUpdates.push('Location → London, UK');
  } else if (lower.includes('manchester')) {
    patch.city = 'Manchester';
    patch.countryCode = 'UK';
    patch.countryName = 'United Kingdom';
    detectedUpdates.push('Location → Manchester, UK');
  } else if (lower.includes('new york') || lower.includes('nyc')) {
    patch.city = 'New York';
    patch.countryCode = 'US';
    patch.countryName = 'United States';
    detectedUpdates.push('Location → New York, US');
  } else if (lower.includes('berlin')) {
    patch.city = 'Berlin';
    patch.countryCode = 'DE';
    patch.countryName = 'Germany';
    detectedUpdates.push('Location → Berlin, DE');
  } else if (lower.includes('lagos')) {
    patch.city = 'Lagos';
    patch.countryCode = 'NG';
    patch.countryName = 'Nigeria';
    detectedUpdates.push('Location → Lagos, NG');
  }

  const ageMatch = lower.match(/\b(?:i am|i'm|im|age)\s*(\d{2})\b/);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge >= 18 && parsedAge <= 85) {
      patch.age = parsedAge;
      detectedUpdates.push(`Age → ${parsedAge}`);
    }
  }

  if (
    lower.includes('run a business') ||
    lower.includes('running a business') ||
    lower.includes('founder') ||
    lower.includes('my company') ||
    lower.includes('startup')
  ) {
    patch.isBusinessOwner = true;
    detectedUpdates.push('Business Owner → Yes');
  }

  if (lower.includes('no business') || lower.includes('not a founder') || lower.includes('employed')) {
    patch.isBusinessOwner = false;
    detectedUpdates.push('Status → Employed');
  }

  if (lower.includes('live alone') || lower.includes('living alone') || lower.includes('solo')) {
    patch.householdSize = 1;
    detectedUpdates.push('Household → 1 (Solo)');
  }

  if (
    lower.includes('tax') ||
    lower.includes('hmrc') ||
    lower.includes('irs') ||
    lower.includes('debt') ||
    lower.includes('bills') ||
    lower.includes('behind')
  ) {
    patch.needsTaxOrDebtFix = true;
    detectedUpdates.push('Flagged Tax/Bills Audit');
  }

  if (
    lower.includes('broke') ||
    lower.includes('runway') ||
    lower.includes('savings') ||
    lower.includes('overdraft') ||
    lower.includes('money')
  ) {
    patch.needsCashRunway = true;
    detectedUpdates.push('Flagged Cash Runway Sweep');
  }

  if (
    lower.includes("haven't seen a doctor") ||
    lower.includes('havent seen a doctor') ||
    lower.includes('overdue') ||
    lower.includes('burnout') ||
    lower.includes('tired') ||
    lower.includes('dentist') ||
    lower.includes('gp') ||
    lower.includes('referral')
  ) {
    patch.overdueRoutineCare = true;
    if (lower.includes('hospital') || lower.includes('referral')) {
      patch.hasPendingHospitalReferral = true;
    }
    detectedUpdates.push('Flagged Preventive Care');
  }

  if (lower.includes('buy a home') || lower.includes('house') || lower.includes('deposit') || lower.includes('mortgage')) {
    patch.destination = 'buy-home';
    detectedUpdates.push('Destination → Buy First Home');
  } else if (lower.includes('scale') || lower.includes('launch') || lower.includes('grow my business')) {
    patch.destination = 'launch-business';
    patch.isBusinessOwner = true;
    detectedUpdates.push('Destination → Build Business');
  } else if (lower.includes('career') || lower.includes('upskill') || lower.includes('bootcamp')) {
    patch.destination = 'level-up-career';
    detectedUpdates.push('Destination → Career Leap');
  }

  if (Object.keys(patch).length > 0) {
    onUpdateProfile(patch);
  }

  const nextProfile: UserProfile = { ...profile, ...patch };
  const eligible = getEligibleTasks(nextProfile, completedIds);
  const { active, comingUp } = partitionTasks(eligible, completedIds);
  const impact = computeLifeImpact(nextProfile, eligible, completedIds);
  const liveScore = computeLifeScore(nextProfile, completedIds);
  const chapter = computeGameChapter(nextProfile, eligible, completedIds);

  // Check if user reports completing a task
  if (lower.includes('booked') || lower.includes('completed') || lower.includes('done') || lower.includes('applied')) {
    const target =
      lower.includes('hospital') || lower.includes('nhs') || lower.includes('doctor')
        ? eligible.find((t) => t.category === 'health' && !completedIds.includes(t.id))
        : lower.includes('loan') || lower.includes('business')
          ? eligible.find((t) => t.category === 'loan' && !completedIds.includes(t.id))
          : active[0];

    if (target) {
      onCompleteTask(target.id);
      return {
        replyText: `Marked “${target.title}” complete (+${target.scoreDelta} pts · ${chapter.chapterLabel}). Here is your next move for ${nextProfile.city}:`,
        cards: [...active.filter((t) => t.id !== target.id), ...comingUp].slice(0, 3),
        suggestedState: 'task-deck',
      };
    }
  }

  // How the world & money work / Playbook intent
  if (
    lower.includes('how does money work') ||
    lower.includes('how the world works') ||
    lower.includes('game of life') ||
    lower.includes('play the game') ||
    lower.includes('what do i set up') ||
    lower.includes('what to setup') ||
    lower.includes('where do i go')
  ) {
    const rule =
      WORLD_RULES.find((r) => !r.countries || r.countries.includes(nextProfile.countryCode)) ??
      WORLD_RULES[0];
    const focusCards = (active.length > 0 ? active : eligible).slice(0, 3);
    const firstWhere = focusCards[0]?.whereToGo ?? rule.whereToStart;
    return {
      replyText: `Welcome to life (${chapter.chapterLabel}) — Rule: ${rule.title}. ${rule.ruleSummary} Set up: Check Tax Code (1257L / transcript), open a 4.7%+ Cash Buffer & tax wrapper before chasing risky credit. Where to go next: ${firstWhere}.`,
      cards: focusCards,
    };
  }

  // Full "Fix My Life" / "Life Audit" triage intent
  if (
    lower.includes('fix my life') ||
    lower.includes('life audit') ||
    lower.includes('audit') ||
    lower.includes('overwhelmed') ||
    lower.includes('where do i start') ||
    lower.includes('mess')
  ) {
    const updatePrefix =
      detectedUpdates.length > 0 ? `Updated (${detectedUpdates.join(' · ')}). ` : '';
    const queue = [...active, ...comingUp];
    return {
      replyText: `${updatePrefix}${chapter.chapterLabel} · Life Audit ready for ${nextProfile.city} (Score ${liveScore.total}/100 · ${impact.unclaimedFormatted} waiting): 1) Protect time-gated health first, 2) Plug silent tax/cash leaks, 3) Set up sovereign wrappers & capital. Every card below tells you where to go, what to set up & includes a ready-to-copy draft:`,
      cards: (queue.length > 0 ? queue : eligible).slice(0, 3),
    };
  }

  // Topic-specific educational guidance
  if (lower.includes('hospital') || lower.includes('health') || lower.includes('doctor') || lower.includes('nhs')) {
    const healthCards = eligible.filter((t) => t.category === 'health');
    return {
      replyText:
        healthCards.length > 0
          ? `Your health check in ${nextProfile.city} shows an active priority window. Missing an outpatient referral can reset your queue — tap below to open the portal & copy-paste booking draft.`
          : `No overdue hospital referral is flagged for ${nextProfile.city} right now, though preventive checkups remain open.`,
      cards: healthCards.length > 0 ? healthCards : active.slice(0, 2),
      suggestedState: healthCards.length > 0 ? 'urgent-alert' : undefined,
    };
  }

  if (lower.includes('tax') || lower.includes('debt') || lower.includes('runway') || lower.includes('bills')) {
    const fixCards = eligible.filter((t) => t.category === 'tax' || t.requiresCashRunway);
    return {
      replyText: `I checked silent tax & money leaks in ${nextProfile.city}: open any card below to reveal your ready-to-send HMRC / savings script.`,
      cards: fixCards.length > 0 ? fixCards.slice(0, 3) : active.slice(0, 2),
    };
  }

  if (lower.includes('loan') || lower.includes('business') || lower.includes('fund') || lower.includes('grant')) {
    const loanCards = eligible.filter((t) => t.category === 'loan' || t.category === 'tax');
    return {
      replyText: nextProfile.isBusinessOwner
        ? `Because you run a business in ${nextProfile.city}, you qualify for government-backed capital and tax relief without diluting equity:`
        : `If you register a business in ${nextProfile.city}, you unlock sovereign startup loans & SME relief. Right now these schemes match your current profile:`,
      cards: loanCards.length > 0 ? loanCards : active.slice(0, 2),
      suggestedState: loanCards.length > 0 ? 'scheme-portal' : undefined,
    };
  }

  if (lower.includes('scheme') || lower.includes('gov') || lower.includes('age') || lower.includes('teach')) {
    const govCards = eligible.filter((t) => t.category === 'gov' || t.category === 'skills');
    return {
      replyText: `In ${nextProfile.countryName} at age ${nextProfile.age}, several time-bounded government entitlements apply directly to you. Tap any card to see exact rules and steps:`,
      cards: govCards.length > 0 ? govCards : eligible.slice(0, 3),
    };
  }

  const updateNote =
    detectedUpdates.length > 0 ? `Updated your plan (${detectedUpdates.join(' · ')}). ` : '';

  return {
    replyText: `${updateNote}You currently have ${active.length} active tasks to complete (${impact.unclaimedFormatted} total unlocked value) and ${comingUp.length} more coming next in ${nextProfile.city}. Tap a card below to act on it.`,
    cards: (active.length > 0 ? [...active, ...comingUp] : eligible).slice(0, 3),
  };
}

export const DAILY_PRACTICAL_NOTES: DailyNote[] = [
  {
    id: 'note-runway',
    title: 'Know your exact 30-day number first',
    takeaway: 'Guessing creates background stress. One 60-second balance + essentials tally turns vagueness into a clear gap or cover number.',
    area: 'money',
  },
  {
    id: 'note-written',
    title: 'Keep queues alive in writing',
    takeaway: 'Official systems reward one dated confirmation email. Asking clearly beats waiting silently.',
    area: 'health',
  },
  {
    id: 'note-order',
    title: 'Claim statutory entitlements before high-APR credit',
    takeaway: 'Council discounts, tax rebates, and government-backed schemes carry lower cost and zero equity loss compared to commercial borrowing.',
    area: 'admin',
  },
];

export function buildTaskReadingCards(task: LifeTask): ReadingRuleCard[] {
  const cards: ReadingRuleCard[] = [];

  cards.push({
    id: `${task.id}-eligibility`,
    eyebrow: 'Eligibility & source',
    title: task.officialSource ?? task.provider,
    detail:
      task.stillToCheck && task.stillToCheck.length > 0
        ? `Check before applying: ${task.stillToCheck[0]}`
        : task.insightSummary,
    accentHex: '#2347D8',
  });

  if (task.whereToGo || task.steps[0]) {
    cards.push({
      id: `${task.id}-where`,
      eyebrow: 'Where to go',
      title: task.provider,
      detail: task.whereToGo ?? task.steps[0],
      accentHex: '#C43929',
    });
  }

  cards.push({
    id: `${task.id}-setup`,
    eyebrow: 'What to prepare',
    title: task.whatToSetup?.[0] ?? 'Documents & ID',
    detail:
      task.whatToSetup?.length ? task.whatToSetup.join(' · ') : task.steps.slice(0, 2).join(' · '),
    accentHex: '#16794F',
  });

  cards.push({
    id: `${task.id}-rule`,
    eyebrow: 'How it works',
    title: THINKER_ATEAM.find((thinker) => thinker.id === task.thinkerId)?.name ?? task.worldRuleTitle ?? 'System rule',
    detail: task.worldRuleLesson ?? task.personalWhy,
    accentHex: '#141416',
  });

  return cards;
}

export function getConnectedPortals(
  profile: UserProfile,
  completedIds: string[]
): ConnectedPortal[] {
  const outcomes = profile.recordedOutcomes ?? {};
  const hasRail = (id: SetupRailId) => profile.setupRails.includes(id);

  if (profile.countryCode === 'US') {
    return [
      {
        id: 'portal-irs',
        name: 'IRS Transcript & Tax',
        subtitle: outcomes['us-tax-hsa-audit'] ? 'Transcript verified' : 'Check withholding & HSA credits',
        badgeText: 'IRS',
        badgeBg: '#2347D8',
        railId: 'tax-account',
        linkedTaskId: 'us-tax-hsa-audit',
        status: hasRail('tax-account') || completedIds.includes('us-tax-hsa-audit') ? 'connected' : 'setup',
      },
      {
        id: 'portal-hsa',
        name: 'Roth IRA & Saver Credit',
        subtitle: 'Up to 50% tax-credit match on buffer',
        badgeText: 'HY',
        badgeBg: '#16794F',
        railId: 'cash-isa',
        linkedTaskId: 'us-roth-savers',
        status: hasRail('cash-isa') || completedIds.includes('us-roth-savers') ? 'connected' : 'open',
      },
      {
        id: 'portal-sba',
        name: 'NYC SBS & SBA Grants',
        subtitle: profile.isBusinessOwner ? 'Matched to your entity' : 'Explore founder eligibility',
        badgeText: 'SBA',
        badgeBg: '#C43929',
        railId: 'business-bank',
        linkedTaskId: 'nyc-sbs-loan',
        status: completedIds.includes('nyc-sbs-loan') ? 'connected' : 'open',
      },
    ];
  }

  if (profile.countryCode === 'DE') {
    return [
      {
        id: 'portal-de-tax',
        name: 'ELSTER & Vorsorge',
        subtitle: 'Check tax class & overdue preventive checks',
        badgeText: 'DE',
        badgeBg: '#2347D8',
        railId: 'tax-account',
        linkedTaskId: 'de-steuer-vorsorge-audit',
        status: hasRail('tax-account') || completedIds.includes('de-steuer-vorsorge-audit') ? 'connected' : 'setup',
      },
      {
        id: 'portal-de-kfw',
        name: 'KfW StartGeld',
        subtitle: 'State-backed startup capital',
        badgeText: 'KfW',
        badgeBg: '#C43929',
        railId: 'business-bank',
        linkedTaskId: 'de-kfw-startgeld',
        status: completedIds.includes('de-kfw-startgeld') ? 'connected' : 'open',
      },
    ];
  }

  if (profile.countryCode === 'NG') {
    return [
      {
        id: 'portal-ng-tin',
        name: 'TIN & Health Shield',
        subtitle: 'Check TIN/CAC filing & clinic screening',
        badgeText: 'TIN',
        badgeBg: '#2347D8',
        railId: 'tax-account',
        linkedTaskId: 'ng-tin-health-shield',
        status: hasRail('tax-account') || completedIds.includes('ng-tin-health-shield') ? 'connected' : 'setup',
      },
      {
        id: 'portal-ng-lsetf',
        name: 'LSETF Business Loan',
        subtitle: 'State-backed SME working capital',
        badgeText: 'NG',
        badgeBg: '#C43929',
        railId: 'business-bank',
        linkedTaskId: 'ng-lsetf-loan',
        status: completedIds.includes('ng-lsetf-loan') ? 'connected' : 'open',
      },
    ];
  }

  return [
    {
      id: 'portal-gov-tax',
      name: 'GOV.UK Tax Account',
      subtitle:
        completedIds.includes('uk-hmrc-tax-code') || outcomes['uk-hmrc-tax-code']
          ? 'Tax code 1257L verified'
          : 'Check PAYE code & rebates',
      badgeText: 'GOV',
      badgeBg: '#2347D8',
      railId: 'tax-account',
      linkedTaskId: 'uk-hmrc-tax-code',
      status:
        hasRail('tax-account') || completedIds.includes('uk-hmrc-tax-code')
          ? 'connected'
          : 'setup',
    },
    {
      id: 'portal-nhs',
      name: 'NHS App & Queue',
      subtitle: profile.hasPendingHospitalReferral
        ? `${profile.referralSpecialty} referral open`
        : 'Routine GP & waitlist tracker',
      badgeText: 'NHS',
      badgeBg: '#0E5C8A',
      railId: 'gp-dentist',
      linkedTaskId: profile.hasPendingHospitalReferral ? 'nhs-outpatient-referral' : 'nhs-dental-annual',
      status:
        hasRail('gp-dentist') || completedIds.includes('nhs-outpatient-referral')
          ? 'connected'
          : 'open',
    },
    {
      id: 'portal-cash-lisa',
      name: 'Cash Buffer & LISA',
      subtitle: profile.runway
        ? '30-day figure mapped'
        : '4.7% interest + 25% home bonus',
      badgeText: '£',
      badgeBg: '#16794F',
      railId: 'cash-isa',
      linkedTaskId: 'uk-lifetime-isa',
      status: hasRail('cash-isa') || hasRail('lisa-starter') ? 'connected' : 'setup',
    },
    {
      id: 'portal-startup',
      name: 'Start Up Loans Co.',
      subtitle: profile.isBusinessOwner
        ? '6% fixed · 2 eligibility checks left'
        : 'Unlock when launching business',
      badgeText: 'SU',
      badgeBg: '#C43929',
      railId: 'business-bank',
      linkedTaskId: 'uk-startup-loan',
      status: completedIds.includes('uk-startup-loan') ? 'connected' : 'open',
    },
  ];
}

export function getAvailableBankAccounts(profile: UserProfile): BankAccountRecommendation[] {
  const opened = profile.openedAccountIds ?? [];
  const isOpened = (id: string, railMatch?: SetupRailId) =>
    opened.includes(id) || (railMatch ? (profile.setupRails ?? []).includes(railMatch) : false);

  const items: BankAccountRecommendation[] = [
    {
      id: 'acct-bills-hub',
      name: 'Everyday Bills & Spend Account',
      role: 'Zero-overdraft salary hub isolating fixed direct debits from daily spending',
      rateOrPerk: 'Instant notifications + Pots',
      priority: 'Core',
      opened: isOpened('acct-bills-hub') || opened.includes('acc-current'),
    },
    {
      id: 'acct-cash-buffer',
      name: profile.countryCode === 'US' ? 'High-Yield Savings (HYSA)' : 'Easy-Access Cash Buffer',
      role: '3–6 months essentials separated so emergencies never hit credit cards',
      rateOrPerk: 'Easy access',
      priority: 'Core',
      opened: isOpened('acct-cash-buffer', 'cash-isa'),
    },
  ];

  if (profile.workStatus === 'sole-trader' || profile.workStatus === 'director' || profile.isBusinessOwner) {
    items.push({
      id: 'acct-tax-vault',
      name: 'Dedicated Business + Tax Vault',
      role: 'Set aside your estimated tax and social contributions as client payments arrive.',
      rateOrPerk: 'Zero mixing · Auto-sweep',
      priority: 'Core',
      opened: isOpened('acct-tax-vault', 'tax-account') || isOpened('acct-tax-vault', 'business-bank'),
    });
  }

  if (profile.countryCode === 'UK' && profile.age >= 18 && profile.age <= 39 && profile.housingStatus !== 'homeowner' && (profile.destination === 'buy-home' || profile.housingStatus === 'first-time-buyer' || isOpened('acct-lisa', 'lisa-starter'))) {
    items.push({
      id: 'acct-lisa',
      name: 'Lifetime ISA (LISA)',
      role: 'Check the first-home purchase price and timing rules before putting deposit money into a Lifetime ISA.' ,
      rateOrPerk: '+25% State Bonus',
      priority: 'Core',
      opened: isOpened('acct-lisa', 'lisa-starter'),
    });
  }

  items.push({
    id: 'acct-index-wrapper',
    name:
      profile.countryCode === 'UK'
        ? 'Stocks & Shares ISA'
        : profile.countryCode === 'US'
        ? 'Roth IRA / Low-Fee Index'
        : profile.countryCode === 'DE'
        ? 'ETFs Depot (Sparplan)'
        : 'NGX / USD Money Market + Index',
    role: 'Compare costs, risks and local tax treatment for money you can leave invested for years.',
    rateOrPerk: 'Long-term investing',
    priority: 'Next',
    opened: isOpened('acct-index-wrapper'),
  });

  if (profile.workStatus === 'sole-trader' || profile.workStatus === 'director') {
    items.push({
      id: 'acct-sipp',
      name:
        profile.countryCode === 'US'
          ? 'Solo 401(k) / SEP IRA'
          : profile.countryCode === 'DE'
          ? 'Basisrente / ETF Rürup'
          : 'Personal Pension (SIPP / RSA)',
      role: 'Compare the contribution rules, tax relief and when you can access your money.',
      rateOrPerk: 'Retirement account',
      priority: 'Next',
      opened: isOpened('acct-sipp', 'pension-match'),
    });
  }

  return items;
}

export function getProtectionChecklist(profile: UserProfile): ProtectionPolicyItem[] {
  const inPlaceIds = profile.protectedPolicyIds ?? [];
  const isSelfEmployed = profile.workStatus === 'sole-trader' || profile.workStatus === 'director';
  const hasDependentsOrMortgage = profile.hasDependents || (profile.housingStatus === 'homeowner' && profile.housingLoan !== false);

  return [
    {
      id: 'prot-income',
      name: 'Income Protection Cover',
      whyNeeded: isSelfEmployed
        ? 'Compare how long your savings could cover time off with the waiting period, exclusions and payout of a policy.'
        : 'Supplements statutory sick pay once employer full-pay weeks end (match deferral to your cash runway).',
      urgency: isSelfEmployed ? 'Critical' : 'Recommended',
      inPlace: inPlaceIds.includes('prot-income'),
    },
    {
      id: 'prot-life',
      name: 'Level Term Life Insurance',
      whyNeeded: hasDependentsOrMortgage
        ? 'Estimate how much income or housing debt someone else would need to cover and for how long.'
        : 'Optional right now if nobody depends financially on your salary.',
      urgency: hasDependentsOrMortgage ? 'Critical' : 'Situation-Based',
      inPlace: inPlaceIds.includes('prot-life'),
    },
    {
      id: 'prot-will-nom',
      name: profile.countryCode === 'UK' ? 'Pension Expression of Wish and will' : 'Beneficiary nominations and will',
      whyNeeded: 'Check each plan’s nomination form and make sure your current will and beneficiaries reflect your wishes.' ,
      urgency: hasDependentsOrMortgage ? 'Critical' : 'Recommended',
      inPlace: inPlaceIds.includes('prot-will-nom'),
    },
    {
      id: 'prot-contents',
      name: profile.housingStatus === 'homeowner' ? 'Buildings + Contents Insurance' : 'Tenants Contents & Liability',
      whyNeeded: 'Covers flood/fire/theft of laptops, tools & personal possessions at low annual cost.',
      urgency: 'Recommended',
      inPlace: inPlaceIds.includes('prot-contents'),
    },
    {
      id: 'prot-lpa',
      name: 'Emergency contacts and powers of attorney',
      whyNeeded: 'Designates who can act on medical or financial accounts if incapacitated unexpectedly.',
      urgency: 'Situation-Based',
      inPlace: inPlaceIds.includes('prot-lpa'),
    },
  ];
}

export const THINKER_ATEAM: ThinkerWisdom[] = [
  {
    id: 'naval',
    name: 'Naval Ravikant',
    handleOrSource: 'naval.substack.com · Almanack',
    domain: 'Wealth & Leverage',
    coreIdea: 'Seek wealth (assets that earn while you sleep), built through specific knowledge, accountability, and permissionless leverage (code & media).',
    appliedRule: 'Identify one skill nobody can automate away, document it publicly, and move surpluses from hourly pay into compounding assets.',
    linkUrl: 'https://naval.substack.com/',
  },
  {
    id: 'taleb',
    name: 'Nassim Nicholas Taleb',
    handleOrSource: 'nntaleb.substack.com · Antifragile',
    domain: 'Risk & Antifragility',
    coreIdea: 'Barbell strategy + Via Negativa: eliminate catastrophic fragility first (uninsured illness, unreserved taxes, high-APR debt), then take capped asymmetric bets.',
    appliedRule: 'Hold 3–6 months boring T-bill/cash runway + reserve sole-trader taxes immediately before chasing upside.',
    linkUrl: 'https://nntaleb.substack.com/',
  },
  {
    id: 'attia',
    name: 'Peter Attia MD',
    handleOrSource: 'peterattiamd.com · Outlive',
    domain: 'Health & Longevity',
    coreIdea: 'Medicine 3.0 emphasizes prevention and health trends over time.',
    appliedRule: 'Discuss screening that fits your risk and schedule a follow-up for anything worth tracking.',
    linkUrl: 'https://peterattiamd.com/',
  },
  {
    id: 'huberman',
    name: 'Andrew Huberman PhD',
    handleOrSource: 'hubermanlab.com · Protocols',
    domain: 'Health & Longevity',
    coreIdea: 'Morning outdoor sunlight, consistent sleep timing, hydration in the first waking hours, and physiological sighs regulate cortisol and focus.',
    appliedRule: 'Try a consistent sleep schedule and observe how earlier caffeine affects sleep and attention.',
    linkUrl: 'https://www.hubermanlab.com/',
  },
  {
    id: 'housel',
    name: 'Morgan Housel',
    handleOrSource: 'collabfund.com/blog · Psychology of Money',
    domain: 'Money Psychology',
    coreIdea: 'The highest dividend money pays is control over your time. Reasonable math you can stick with for 20 years beats fragile spreadsheet perfection.',
    appliedRule: 'Prioritize an accessible emergency runway and automated index contributions before complex optimization.',
    linkUrl: 'https://collabfund.com/blog/',
  },
  {
    id: 'munger',
    name: 'Charlie Munger',
    handleOrSource: 'Poor Charlie’s Almanack',
    domain: 'Risk & Antifragility',
    coreIdea: 'Invert, always invert: avoid standard ways lives derail (lifestyle creep, bad contracts, missed tax/insurance basics) and respect multi-disciplinary checklists.',
    appliedRule: 'Audit blindspots — tax codes, credit freezes, sick pay, and beneficiaries — before chasing aggressive goals.',
    linkUrl: 'https://fs.blog/great-talks/psychology-human-misjudgment/',
  },
  {
    id: 'clear',
    name: 'James Clear',
    handleOrSource: 'jamesclear.com · Atomic Habits',
    domain: 'Mind & Habits',
    coreIdea: 'You do not rise to the level of your goals; you fall to the level of your systems and your current normal.',
    appliedRule: 'Once Level 1 or Level 2 rituals become automated defaults (payday sweep, water bottle on desk), operate from that new normal and climb again.',
    linkUrl: 'https://jamesclear.com/',
  },
  {
    id: 'newport',
    name: 'Cal Newport',
    handleOrSource: 'calnewport.com · Slow Productivity',
    domain: 'Mind & Habits',
    coreIdea: 'Do fewer things, work at a natural pace, and obsess over quality — attention residue from constant shallow switching destroys deep output.',
    appliedRule: 'Show only one clear Next Move at home, purge digital noise, and protect 90-minute focus blocks.',
    linkUrl: 'https://calnewport.com/blog/',
  },
  {
    id: 'sethi',
    name: 'Ramit Sethi',
    handleOrSource: 'iwillteachyoutoberich.com',
    domain: 'Money Psychology',
    coreIdea: 'A Conscious Spending Plan automates fixed costs, savings, and guilt-free spending on payday so you stop micro-managing lattes and cut big hidden drains.',
    appliedRule: 'Cancel unused subscriptions once a quarter and auto-route that exact reclaimed cash to savings/investing.',
    linkUrl: 'https://www.iwillteachyoutoberich.com/',
  },
  {
    id: 'walker',
    name: 'Matthew Walker PhD',
    handleOrSource: 'sleepdiplomat.com · Why We Sleep',
    domain: 'Health & Longevity',
    coreIdea: 'Sleep is the non-negotiable foundation under metabolic sensitivity, emotional stability, memory consolidation, and immune defense.',
    appliedRule: 'Protect 7.5–8h consistent sleep opportunity before adding high-intensity training or late-night hustle.',
    linkUrl: 'https://www.sleepdiplomat.com/',
  },
  {
    id: 'dalio',
    name: 'Ray Dalio',
    handleOrSource: 'principles.com',
    domain: 'Wealth & Leverage',
    coreIdea: 'Treat reality systematically: Pain + Reflection = Progress. Write down your repeatable decision rules so mistakes become permanent upgrades.',
    appliedRule: 'Record every completed move and outcome inside life so your personal playbook compounds over time.',
    linkUrl: 'https://www.principles.com/',
  },
  {
    id: 'aurelius',
    name: 'Marcus Aurelius',
    handleOrSource: 'Meditations · Stoicism',
    domain: 'Mind & Habits',
    coreIdea: 'Distinguish cleanly between what is inside your control (actions, preparation, response) and what is outside it (external volatility).',
    appliedRule: 'Use Check-In Pulse to calibrate calm action under uncertainty rather than panicking over headlines.',
    linkUrl: 'https://classics.mit.edu/Antoninus/meditations.html',
  },
];

export const EXHAUSTIVE_MISSING_ESSENTIALS: Array<{
  id: string;
  area: string;
  title: string;
  whyEssential: string;
  emergentAngle: string;
  overlay?: 'runway-calc' | 'health-stack' | 'money-work' | 'levels-ateam' | 'life-playbook' | 'blur-intake';
  taskId?: string;
}> = [
  {
    id: 'miss-tax-code',
    area: 'Work & Tax Code',
    title: 'Tax deductions and pension record',
    whyEssential: 'Withholding can differ from what you owe, especially after a job or business change.',
    emergentAngle: 'Compare the estimate with your payslip, reserve and contribution record.',
    overlay: 'money-work',
  },
  {
    id: 'miss-subs-bleed',
    area: 'Cashflow Hygiene',
    title: 'Silent Subscription & Trial Purge',
    whyEssential: 'Dormant £10–£30 recurring charges drain £350–£1,200/yr in compounded opportunity cost.',
    emergentAngle: 'AI-bundled SaaS & trial creep makes quarterly subscription audits mandatory.',
    overlay: 'money-work',
  },
  {
    id: 'miss-bloodwork',
    area: 'Medicine 3.0 Health',
    title: 'Bloodwork and preventive care',
    whyEssential: 'The meaning of a lab result depends on the unit, your history and the reason for the test.',
    emergentAngle: 'Keep the lab report and agree when follow-up would help.',
    overlay: 'health-stack',
  },
  {
    id: 'miss-hydration-protein',
    area: 'Daily Biology',
    title: 'Water (ml), Protein Anchor & Zone 2 Baseline',
    whyEssential: 'Mild dehydration and low protein sabotage cognition, recovery, and body composition every day.',
    emergentAngle: 'Food & hydration logging connected directly to focus, mood & training.',
    overlay: 'health-stack',
  },
  {
    id: 'miss-income-prot',
    area: 'Protection & Downside',
    title: 'Income Protection, Beneficiaries & Simple Will',
    whyEssential: 'Your future earning power is your biggest asset; sole traders have £0 employer sick pay and pensions sit outside wills.',
    emergentAngle: 'Prevent single-point family financial collapse before chasing yield.',
    overlay: 'money-work',
  },
  {
    id: 'miss-cyber-credit',
    area: 'Security & Emergent AI Era',
    title: 'Passkeys, carrier protection and recovery',
    whyEssential: 'Primary email and a phone number often help recover other accounts.',
    emergentAngle: 'Test whether you can sign in again after losing a device.',
    taskId: 'passkey-credit-shield',
  },
  {
    id: 'miss-pay-yourself',
    area: 'AI-Era Leverage & Wealth',
    title: 'Employer Pension Match + Tax-Advantaged Index + Specific Knowledge',
    whyEssential: 'Leaving employer match on the table refuses a 100% instant return; AI compresses generic labour while amplifying leveraged specialists.',
    emergentAngle: 'Build tax-sheltered passive wealth WHILE developing high-agency domain skills.',
    overlay: 'levels-ateam',
  },
  ...TASK_CATALOG.filter((task) => task.minLevel || task.id === 'uk-family-childcare' || task.id === 'us-credit-freeze' || task.id === 'uk-lasting-power')
    .map((task) => ({
      id: `audit-${task.id}`,
      area: LIFE_AREAS.find((area) => area.id === task.lifeArea)?.label ?? 'Life Admin',
      title: task.title,
      whyEssential: task.personalWhy,
      emergentAngle: task.stillToCheck?.[0] ?? task.subtitle,
      taskId: task.id,
    })),
];

function stageReadiness(profile: UserProfile, contextTasks: LifeTask[], completedIds: string[]) {
  const completed = new Set(completedIds);
  const pendingUrgent = contextTasks.find((task) => !task.minLevel && task.urgency === 'urgent' && !completed.has(task.id));
  const urgentClear = !pendingUrgent;
  const runwayMapped = Boolean(profile.runway || profile.recordedOutcomes?.['runway-30-days']);
  const taxTaskIds = ['uk-hmrc-tax-code', 'us-tax-hsa-audit', 'de-steuer-vorsorge-audit', 'ng-tin-health-shield'];
  const reviewedTax = profile.taxReviewed ?? (
    (profile.answeredQuestionIds.includes('q-tax-compliance') && !profile.needsTaxOrDebtFix)
    || taxTaskIds.some((id) => completed.has(id))
  );
  const healthReviewed = Boolean(profile.health?.baselineReviewed || completed.has('bloodwork-baseline-panel'));
  const accounts = getAvailableBankAccounts(profile);
  const accountsOpen = ['acct-bills-hub', 'acct-cash-buffer'].every((id) => accounts.some((account) => account.id === id && account.opened));
  const subsReviewed = Boolean(profile.subscriptionsReviewed || completed.has('subscription-leak-purge') || profile.subscriptions?.some((item) => item.cancelled));
  const protection = getProtectionChecklist(profile);
  const protectionReviewed = completed.has('protection-beneficiary-audit')
    || ['prot-income', 'prot-will-nom'].every((id) => protection.some((item) => item.id === id && item.inPlace));
  const stageThreeDone = STAGE_GAMBITS.some((task) => task.minLevel === 3 && completed.has(task.id));

  let level: LifeLevel = 1;
  if (runwayMapped && reviewedTax && urgentClear) level = 2;
  if (level === 2 && healthReviewed && accountsOpen && subsReviewed) level = 3;
  if (level === 3 && protectionReviewed && stageThreeDone) level = 4;
  if (profile.earnedLevel && profile.earnedLevel > level) level = profile.earnedLevel;

  return { level, runwayMapped, reviewedTax, urgentClear, pendingUrgent, healthReviewed, accountsOpen, subsReviewed, protectionReviewed, stageThreeDone };
}

export function localDateString(date = new Date()): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
}

function addCalendarMonths(date: string, months: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month + months, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1 + months, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

export function advanceOperatingRule(rule: OperatingRule, today = localDateString()) {
  return addCalendarMonths(rule.nextDueOn > today ? rule.nextDueOn : today, rule.cadenceMonths);
}

function buildOperatingRules(profile: UserProfile, readiness: ReturnType<typeof stageReadiness>, today: string) {
  const rules: Array<Omit<OperatingRule, 'nextDueOn'>> = [];
  if (readiness.level >= 2) {
    rules.push({
      id: 'payday-sweep', label: 'Payday sweep', cadenceMonths: 1, actionOverlay: 'runway-calc',
      instruction: 'Set a standing transfer at your bank for the day you get paid. Review how much to move after essential bills and tax.',
    }, {
      id: 'tax-record', label: profile.countryCode === 'UK' ? 'Annual NI and tax check' : 'Annual tax and contribution check',
      cadenceMonths: 12, actionOverlay: 'money-work',
      instruction: 'Compare last year’s tax and pension contributions with your official record and follow up on gaps.',
    });
  }
  if (readiness.level >= 3) {
    rules.push({
      id: 'care-review', label: 'Bloodwork and care review', cadenceMonths: 12, actionOverlay: 'health-stack',
      instruction: 'Use the month you agreed with your clinician. Review the plan and book tests when indicated.',
    }, {
      id: 'subscriptions', label: 'Quarterly subscription check', cadenceMonths: 3, actionOverlay: 'money-work',
      instruction: 'Check upcoming renewals and cancel unused plans with the provider.',
    });
  }
  return rules.map((rule) => {
    const saved = profile.operatingRuleDates?.[rule.id];
    return { ...rule, nextDueOn: saved && /^\d{4}-\d{2}-\d{2}$/.test(saved) ? saved : addCalendarMonths(today, rule.cadenceMonths) };
  });
}

export function computeLifeLevelState(
  profile: UserProfile,
  eligible: LifeTask[],
  completedIds: string[],
  today = localDateString()
): LifeLevelState {
  const readiness = stageReadiness(profile, eligible, completedIds);
  const currentLevel = readiness.level;
  const levelNames = ['Starting out', 'Stabilize', 'Set your routines', 'Build momentum', 'Expand your options'];
  const taglines: Record<LifeLevel, string> = {
    1: 'Know where your cash is going and handle the things that are time-sensitive.',
    2: 'Put bills, care and recurring costs on a routine you can keep.',
    3: 'Use that breathing room to make a bigger decision and protect your downside.',
    4: 'Build assets, improve your recovery plans and review what’s working.',
  };
  const unlockedGambits = eligible.filter((task) => task.minLevel && task.minLevel <= currentLevel && !completedIds.includes(task.id));
  const stageThree = unlockedGambits.find((task) => task.minLevel === 3);
  const gates: Record<LifeLevel, LifeLevelState['toAdvance']> = {
    1: [
      { id: 'adv-runway', label: 'Save your 30-day cash plan', done: readiness.runwayMapped, actionOverlay: 'runway-calc' },
      { id: 'adv-tax', label: 'Review this year’s tax and contributions', done: readiness.reviewedTax, actionOverlay: 'money-work' },
      { id: 'adv-urgent', label: readiness.pendingUrgent ? `Handle ${readiness.pendingUrgent.shortTitle}` : 'Handle time-sensitive tasks', done: readiness.urgentClear, taskId: readiness.pendingUrgent?.id },
    ],
    2: [
      { id: 'adv-health', label: 'Review your water, food and care plan', done: readiness.healthReviewed, actionOverlay: 'health-stack' },
      { id: 'adv-accounts', label: 'Set up separate bills and emergency accounts', done: readiness.accountsOpen, actionOverlay: 'money-work' },
      { id: 'adv-subs', label: 'Review subscriptions', done: readiness.subsReviewed, actionOverlay: 'money-work' },
    ],
    3: [
      { id: 'adv-prot', label: 'Review income protection and beneficiaries', done: readiness.protectionReviewed, taskId: 'protection-beneficiary-audit' },
      { id: 'adv-gambit', label: 'Complete a Stage III gambit', done: readiness.stageThreeDone, taskId: stageThree?.id },
    ],
    4: [],
  };
  const toAdvance = gates[currentLevel];

  return {
    currentLevel,
    levelName: levelNames[currentLevel],
    levelTagline: taglines[currentLevel],
    progressPct: toAdvance.length ? Math.round(toAdvance.filter((item) => item.done).length / toAdvance.length * 100) : 100,
    unlockedNormals: buildOperatingRules(profile, readiness, today),
    unlockedGambits,
    toAdvance,
    nextLevelName: currentLevel === 4 ? 'Keep your new normal working' : levelNames[currentLevel + 1],
  };
}
