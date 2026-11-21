export type LifeOSStateId =
  | 'scanning'
  | 'hub-light'
  | 'aura-search'
  | 'orb-radar'
  | 'intake-manifesto'
  | 'intake-portal'
  | 'task-aura'
  | 'voice-dark'
  | 'task-deck'
  | 'scheme-portal'
  | 'profile-pulse'
  | 'chat'
  | 'urgent-alert';

export type ActiveFunctionOverlay =
  | null
  | 'pulse-matrix'
  | 'blur-intake'
  | 'crowd-stepper'
  | 'life-playbook'
  | 'runway-calc'
  | 'health-stack'
  | 'money-work'
  | 'levels-ateam'
  | 'today-brief'
  | 'cash-ledger'
  | 'life-plus'
  | 'growth-path'
  | 'growth-checkins';

export type LifeAreaId =
  | 'money'
  | 'work'
  | 'home'
  | 'health'
  | 'relationships'
  | 'admin';

export interface RunwaySnapshot {
  balance: number;
  expectedIncome: number;
  essentialBills: number;
  dueSoonLabel: string;
  followUpLabel: string;
  netRunway: number;
  updatedAt: string;
}

export interface RecordedOutcome {
  taskId: string;
  summary: string;
  recordedAt: string;
}

export interface LifeAreaProgress {
  id: LifeAreaId;
  label: string;
  statusText: string;
  updated: boolean;
  progressPct: number;
}

export interface ReadingRuleCard {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  accentHex: string;
}

export interface ConnectedPortal {
  id: string;
  name: string;
  subtitle: string;
  badgeText: string;
  badgeBg: string;
  railId?: SetupRailId;
  linkedTaskId?: string;
  status: 'connected' | 'setup' | 'open';
  countries?: Array<'UK' | 'US' | 'DE' | 'NG'>;
}

export interface DailyNote {
  id: string;
  title: string;
  takeaway: string;
  area: LifeAreaId;
}

export type LifeDestination =
  | 'launch-business'
  | 'buy-home'
  | 'fix-stabilize'
  | 'health-longevity'
  | 'level-up-career';

export type SetupRailId =
  | 'cash-isa'
  | 'lisa-starter'
  | 'tax-account'
  | 'gp-dentist'
  | 'pension-match'
  | 'business-bank';

export type TaskCategory = 'loan' | 'gov' | 'health' | 'tax' | 'skills';

export type TaskUrgency = 'urgent' | 'high' | 'recommended';

export type PortalTheme = 'founder' | 'horizon' | 'aura' | 'editorial';

export type PulseFocusBias =
  | 'balanced'
  | 'calm'
  | 'growth'
  | 'urgent'
  | 'explore';

export interface PulseFeeling {
  x: number; // 0..1
  y: number; // 0..1
  label: string;
  accentHex: string;
  bgTint: string;
  focusBias: PulseFocusBias;
  guidance: string;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  source: 'Camera' | 'Photos' | 'Files' | 'Generated';
  summary: string;
  scoreBonus: number;
  unlocksTaskId?: string;
  profilePatch?: Partial<UserProfile>;
}

export type WorkStatus = 'employed' | 'sole-trader' | 'director' | 'student-between';
export type CountryCode = UserProfile['countryCode'];

export type UKStudentLoanPlan = 'plan-1' | 'plan-2' | 'plan-4' | 'plan-5';
export type UKPensionMethod = 'salary-sacrifice' | 'net-pay' | 'relief-at-source';

export interface TaxSettings {
  ukRegion?: 'scotland' | 'rest-of-uk';
  ukStudentLoan?: UKStudentLoanPlan;
  ukPostgraduateLoan?: boolean;
  ukPensionMethod?: UKPensionMethod;
  ukDirectorSalary?: number;
  ukOtherAdjustedIncome?: number;
  ukVoluntaryClass2?: boolean;
  ukStatePensionAgeReached?: boolean;
  ukTaxDeductedAtSource?: number;
  usQbiEligible?: boolean;
  deHealthSupplementPct?: number;
  deChildrenUnder25?: number;
  deIsParent?: boolean;
  deSaxony?: boolean;
  deUseSalaryConversion?: boolean;
  deSelfEmployedCoverAnnual?: number;
  deSelfEmployedStatutoryPensionAnnual?: number;
  ngPensionablePayPct?: number;
  ngVoluntaryPensionPct?: number;
  ngAnnualRent?: number;
  ngOtherPayrollDeductions?: number;
  ngOtherEligibleRelief?: number;
}

export type CollectiveGoal = 'wealth' | 'fit' | 'calm' | 'educated';

export type DietStyle = 'balanced' | 'high-protein' | 'mediterranean' | 'whole-food' | 'plant-forward';

export interface FoodLogEntry {
  id: string;
  label: string;
  proteinG: number;
  calories: number;
  time: string;
}

export interface BloodMarker {
  id: string;
  name: string;
  targetRange: string;
  currentValue: string;
  status: 'optimal' | 'check' | 'due';
  whyItMatters: string;
}

export type LabMarkerId = 'bw-vitd' | 'bw-apob' | 'bw-hba1c' | 'bw-ferritin' | 'bw-hscrp' | 'bw-insulin' | 'bw-tsh';

export interface LabResult {
  value: number;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
}

export interface HealthSnapshot {
  dietStyle: DietStyle;
  waterMlToday: number;
  waterTargetMl: number;
  proteinTargetG: number;
  sleepHoursAvg: number;
  zone2MinsWeek: number;
  mealsLogged: FoodLogEntry[];
  bloodwork?: BloodMarker[];
  labResults?: Partial<Record<LabMarkerId, LabResult>>;
  apoBRisk?: 'intermediate' | 'high' | 'very-high';
  ferritinContext?: 'general' | 'menstruating' | 'inflammation';
  weightKg?: number;
  trainingDays?: number;
  caffeineCutoff?: string;
  baselineReviewed?: boolean;
}

export interface PensionCredit {
  measure: 'uk-ni' | 'us-credits' | 'de-points' | 'ng-rsa';
  amount: number | null;
}

export interface DirectorSplit {
  salary: number;
  dividends: number;
  corporationTax: number;
  employerNI: number;
  dividendTax: number;
  employerPension: number;
  annualNet: number;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  monthlyCost: number;
  category: 'Media' | 'Software' | 'Fitness' | 'Telecom' | 'Other';
  essential: boolean;
  cancelled: boolean;
}

export interface IncomeBreakdown {
  grossAnnual: number;
  grossMonthly: number;
  incomeTaxMonthly: number;
  socialSecurityMonthly: number;
  pensionEmployeeMonthly: number;
  pensionEmployerMonthly: number;
  studentLoanMonthly: number;
  taxReserveMonthly: number;
  netTakeHomeMonthly: number;
  netTakeHomeAnnual: number;
  pensionAnnual: number;
  effectiveTaxRatePct: number;
  socialSecurityLabel: string;
  statePensionNote: string;
  taxYear: string;
  adjustedAnnual: number;
  taxableAnnual: number;
  incomeTaxAnnual: number;
  socialSecurityAnnual: number;
  totalTaxAnnual: number;
  pensionCredit: PensionCredit;
  assumptions: string[];
  sources: Array<{ label: string; url: string }>;
  uk?: {
    personalAllowance: number;
    extraSacrificeTo100k?: number;
    estimatedWithholdingAnnual?: number;
    paymentOnAccount: number;
    firstJanuaryBill: number;
    director?: DirectorSplit;
  };
  taxAlert?: string;
}

export interface BankAccountRecommendation {
  id: string;
  name: string;
  role: string;
  rateOrPerk: string;
  priority: 'Core' | 'Next' | 'Optional';
  opened: boolean;
}

export interface ProtectionPolicyItem {
  id: string;
  name: string;
  whyNeeded: string;
  urgency: 'Critical' | 'Recommended' | 'Situation-Based';
  inPlace: boolean;
}

export interface ThinkerWisdom {
  id: string;
  name: string;
  handleOrSource: string;
  domain: 'Wealth & Leverage' | 'Risk & Antifragility' | 'Health & Longevity' | 'Mind & Habits' | 'Money Psychology';
  coreIdea: string;
  appliedRule: string;
  linkUrl: string;
}

export type LifeLevel = 1 | 2 | 3 | 4;
export type OperatingRuleId = 'payday-sweep' | 'tax-record' | 'care-review' | 'subscriptions';
export type GrowthPath = 'reset' | 'goal' | 'learn';
export type GrowthCheckInId = 'preferences' | 'swot' | 'patterns' | 'eq' | 'reasoning' | 'values';
export type LessonId = 'next-step' | 'change-the-cue' | 'small-changes' | 'check-the-evidence';
export type LessonDepth = 'starter' | 'practice' | 'deep';

export interface GrowthCheckInEntry {
  on: string;
  answers: Record<string, string>;
}

export interface GrowthRecord {
  id: string;
  on: string;
  action: string;
  outcome: string;
  lessonId?: LessonId;
}

export interface GrowthPlan {
  startedOn: string;
  path?: GrowthPath;
  cadenceDays: 0 | 14 | 30 | 60;
  snoozeUntil?: string;
  skippedCheckIns?: GrowthCheckInId[];
  checkIns?: Partial<Record<GrowthCheckInId, GrowthCheckInEntry[]>>;
  direction?: { goal: string; baseline: string; measure: string };
  nextAction?: { text: string; cue: string; lessonId: LessonId };
  records?: GrowthRecord[];
  reviews?: Array<{ on: string; evidence: string; nextDirection: string }>;
  lessons?: Partial<Record<LessonId, { depth: LessonDepth; explanation: string; confidence: 'practise' | 'ready'; on: string }>>;
}

export interface OperatingRule {
  id: OperatingRuleId;
  label: string;
  instruction: string;
  cadenceMonths: number;
  nextDueOn: string;
  actionOverlay: ActiveFunctionOverlay;
}

export interface LifeLevelState {
  currentLevel: LifeLevel;
  levelName: string;
  levelTagline: string;
  progressPct: number;
  unlockedNormals: OperatingRule[];
  unlockedGambits: LifeTask[];
  toAdvance: Array<{ id: string; label: string; done: boolean; actionOverlay?: ActiveFunctionOverlay; taskId?: string }>;
  nextLevelName: string;
}

export interface UserProfile {
  name: string;
  age: number;
  city: string;
  countryCode: 'UK' | 'US' | 'DE' | 'NG';
  countryName: string;
  workStatus: WorkStatus;
  annualIncome: number;
  /** The day of the month pay arrives, when the person has said (F-37). */
  payDay?: number;
  taxCode: string;
  taxSettings?: TaxSettings;
  taxReviewed?: boolean;
  subscriptionsReviewed?: boolean;
  earnedLevel?: LifeLevel;
  housingLoan?: boolean;
  operatingRuleDates?: Partial<Record<OperatingRuleId, string>>;
  monthlyPensionPct: number;
  employerMatchPct: number;
  isBusinessOwner: boolean;
  businessAgeMonths: number;
  housingStatus: 'renting' | 'first-time-buyer' | 'homeowner';
  hasDependents: boolean;
  hasPendingHospitalReferral: boolean;
  referralSpecialty: string;
  householdSize: number; // 1..16 (16 represents 16+)
  pulse: PulseFeeling;
  scannedDocIds: string[];
  needsTaxOrDebtFix: boolean;
  needsCashRunway: boolean;
  overdueRoutineCare: boolean;
  destination: LifeDestination;
  collectiveGoals: CollectiveGoal[];
  setupRails: SetupRailId[];
  openedAccountIds: string[];
  protectedPolicyIds: string[];
  answeredQuestionIds: string[];
  focusArea?: LifeAreaId;
  runway?: RunwaySnapshot;
  health?: HealthSnapshot;
  growth?: GrowthPlan;
  subscriptions?: SubscriptionItem[];
  recordedOutcomes?: Record<string, RecordedOutcome>;
  hideBalances?: boolean;
  monthlyGambit?: string;
  savedWisdomIds?: string[];
  completedAgendaIds?: string[];
  habitStreakDays?: number;
}

export interface LifeTask {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  provider: string;
  category: TaskCategory;
  urgency: TaskUrgency;
  scoreDelta: number;
  valueBadge: string;
  headlinePrompt: string;
  insightSummary: string;
  personalWhy: string;
  steps: string[];
  ctaLabel: string;
  portalTheme: PortalTheme;
  imageUrl: string;
  wave: 1 | 2 | 3;
  estimatedValueAmount?: number;
  copilotDraft?: string;
  whereToGo?: string;
  whatToSetup?: string[];
  worldRuleTitle?: string;
  worldRuleLesson?: string;
  chapter?: 1 | 2 | 3;
  destinations?: LifeDestination[];
  lifeArea?: LifeAreaId;
  whySurfaced?: string;
  stillToCheck?: string[];
  officialSource?: string;
  sourceUrl?: string;
  thinkerId?: string;
  minLevel?: LifeLevel;
  goals?: CollectiveGoal[];
  calculator?: 'rent-buy' | 'mortgage-invest';
  housing?: UserProfile['housingStatus'][];
  workStatuses?: WorkStatus[];
  requiresDependents?: boolean;
  // Eligibility conditions
  countries?: Array<'UK' | 'US' | 'DE' | 'NG'>;
  minAge?: number;
  maxAge?: number;
  requiresBusiness?: boolean;
  requiresReferral?: boolean;
  minHousehold?: number;
  maxHousehold?: number;
  requiresTaxOrDebtFix?: boolean;
  requiresCashRunway?: boolean;
  requiresOverdueCare?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lifeos';
  text: string;
  timestamp: string;
  cards?: LifeTask[];
}

export interface ScoreBreakdown {
  total: number;
  capital: number;
  gov: number;
  health: number;
  growth: number;
  tierLabel: string;
  nextMilestone: number;
}

export interface LifeImpactSummary {
  currencySymbol: string;
  unclaimedAmount: number;
  claimedAmount: number;
  unclaimedFormatted: string;
  claimedFormatted: string;
  urgentCount: number;
  fixReadyHeadline: string;
}

export interface StateDescriptor {
  id: LifeOSStateId;
  order: number;
  label: string;
  videoTimestamp: string;
  videoScreenName: string;
  lifeosRole: string;
  darkSurface?: boolean;
}

export interface WorldRuleLesson {
  id: string;
  category: 'Money Mechanics' | 'Gov Schemes' | 'Leverage & Tax' | 'Health Queues';
  title: string;
  ruleSummary: string;
  practicalAction: string;
  whereToStart: string;
  linkedTaskId?: string;
  countries?: Array<'UK' | 'US' | 'DE' | 'NG'>;
}

export interface OnboardingQuestion {
  id: string;
  stepTitle: string;
  prompt: string;
  whyItMatters: string;
  when?: (profile: UserProfile) => boolean;
  input?: { field: 'annualIncome' | 'taxCode'; label: string };
  options: Array<{
    label: string;
    hint: string;
    patch: Partial<UserProfile>;
  }>;
}

export interface GameChapterSummary {
  chapterNumber: 1 | 2 | 3 | 4;
  chapterLabel: string;
  headline: string;
  nextUnlockText: string;
  readinessPct: number;
}
