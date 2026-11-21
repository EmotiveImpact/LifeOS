import type { OnboardingQuestion, UserProfile, WorkStatus } from '../types/lifeos';

export function workSetupPatch(profile: UserProfile, workStatus: WorkStatus): Partial<UserProfile> {
  const taxCode = profile.countryCode === 'UK'
    ? workStatus === 'sole-trader' ? '' : profile.workStatus === 'sole-trader' ? '1257L' : profile.taxCode
    : profile.countryCode === 'US'
      ? workStatus === 'sole-trader' ? '1099-SE' : 'W2-Single'
      : profile.countryCode === 'DE' ? 'Steuerklasse I' : 'PAYE-TIN';
  return {
    workStatus,
    taxCode: profile.workStatus === workStatus && profile.taxCode ? profile.taxCode : taxCode,
    isBusinessOwner: workStatus === 'director' || workStatus === 'sole-trader',
    answeredQuestionIds: [...new Set([...profile.answeredQuestionIds.filter((id) =>
      profile.workStatus === workStatus || !['q-income', 'q-uk-paye-code', 'q-tax-compliance'].includes(id)), 'q-work-status'])],
    ...(profile.workStatus !== workStatus ? { taxReviewed: false } : {}),
  };
}

const workKnown = (profile: UserProfile) => profile.answeredQuestionIds.includes('q-work-status');
const carriesPayroll = (profile: UserProfile) => profile.workStatus === 'employed' || profile.workStatus === 'director';

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'q-destination', stepTitle: 'Direction', prompt: 'What are you working toward?',
    whyItMatters: 'This moves the most relevant tasks up your plan.',
    options: [
      { label: 'Stabilise this month', hint: 'Work out bills, income and urgent admin.', patch: { destination: 'fix-stabilize' } },
      { label: 'Build a business', hint: 'Check setup, tax reserves and funding.', patch: { destination: 'launch-business' } },
      { label: 'Buy a home', hint: 'Plan the deposit and compare total costs.', patch: { destination: 'buy-home' } },
      { label: 'Improve health', hint: 'Start with preventive care and sustainable habits.', patch: { destination: 'health-longevity' } },
      { label: 'Grow my career', hint: 'Protect focus and plan your next pay conversation.', patch: { destination: 'level-up-career' } },
    ],
  },
  {
    id: 'q-work-status', stepTitle: 'Work', prompt: 'How do you get paid now?',
    whyItMatters: 'Payroll, sole trader profits and company income use different tax and protection rules.',
    options: [
      { label: 'Through an employer', hint: 'Use payroll income and workplace benefits.', patch: { workStatus: 'employed' } },
      { label: 'Self-employed / sole trader', hint: 'Plan for tax on business profit and time off.', patch: { workStatus: 'sole-trader' } },
      { label: 'Through my own company', hint: 'Check company payroll and director pay.', patch: { workStatus: 'director' } },
      { label: 'Studying or between jobs', hint: 'Start with the cash and support available today.', patch: { workStatus: 'student-between' } },
    ],
  },
  {
    id: 'q-income', stepTitle: 'Income', prompt: 'What’s your income before tax this year?',
    whyItMatters: 'Use gross salary for payroll, net business profit for sole traders, or company profit before director pay for UK directors.',
    when: (profile) => workKnown(profile) && (profile.workStatus !== 'student-between' || profile.annualIncome > 0),
    input: { field: 'annualIncome', label: 'Annual income in your local currency' },
    options: [
      { label: 'Use the amount in my plan', hint: 'You can edit it anytime in Work & Money.', patch: {} },
      { label: 'No income to enter', hint: 'Set the income estimate to zero.', patch: { annualIncome: 0 } },
    ],
  },
  {
    id: 'q-uk-paye-code', stepTitle: 'UK payroll', prompt: 'What tax code appears on your payslip?',
    whyItMatters: 'The code helps compare PAYE deductions with your annual income-tax estimate.',
    when: (profile) => workKnown(profile) && carriesPayroll(profile) && profile.countryCode === 'UK',
    input: { field: 'taxCode', label: 'PAYE code from your payslip' },
    options: [{ label: 'I’ll check later', hint: 'Keep the payslip check in your plan.', patch: {} }],
  },
  {
    id: 'q-money-rail', stepTitle: 'Cash buffer', prompt: 'Do you have a separate pot for emergencies?',
    whyItMatters: 'Separating a buffer makes it easier to see what you can spend this month.',
    options: [
      { label: 'I still need one', hint: 'Bring the cash-buffer setup into your plan.', patch: { needsCashRunway: true } },
      { label: 'Yes, I have a separate pot', hint: 'Mark your cash-buffer account as open.', patch: { needsCashRunway: false } },
    ],
  },
  {
    id: 'q-tax-compliance', stepTitle: 'Tax review', prompt: 'Have you checked your tax and contributions for this year?',
    whyItMatters: 'Check your payslip or filing and confirm your contribution record before setting up an annual review.',
    when: (profile) => workKnown(profile),
    options: [
      { label: 'Help me check it', hint: 'Keep a tax review in the plan.', patch: { needsTaxOrDebtFix: true, taxReviewed: false } },
      { label: 'I’ve checked my records', hint: 'Mark this year reviewed.', patch: { needsTaxOrDebtFix: false, taxReviewed: true } },
    ],
  },
  {
    id: 'q-housing', stepTitle: 'Home', prompt: 'What’s your housing situation?',
    whyItMatters: 'This changes your housing steps, account options and cover.',
    options: [
      { label: 'I rent or live with someone', hint: 'Show tenant and cash-buffer steps.', patch: { housingStatus: 'renting', housingLoan: false } },
      { label: 'I’m planning my first purchase', hint: 'Check purchase and deposit options.', patch: { housingStatus: 'first-time-buyer', housingLoan: false } },
      { label: 'I own my home', hint: 'Show homeowner cover and follow-up options.', patch: { housingStatus: 'homeowner' } },
    ],
  },
  {
    id: 'q-mortgage', stepTitle: 'Mortgage', prompt: 'Do you have a mortgage on your home?',
    whyItMatters: 'A mortgage can change your cover and which housing calculator helps.',
    when: (profile) => profile.answeredQuestionIds.includes('q-housing') && profile.housingStatus === 'homeowner',
    options: [
      { label: 'Yes', hint: 'Include the loan when reviewing housing costs and cover.', patch: { housingLoan: true } },
      { label: 'No', hint: 'Review home costs and cover without a loan.', patch: { housingLoan: false } },
    ],
  },
  {
    id: 'q-dependents', stepTitle: 'People who rely on you', prompt: 'Does anyone rely on your income?',
    whyItMatters: 'This changes the order of income protection, beneficiaries and family support in your plan.',
    options: [
      { label: 'Yes', hint: 'Bring family support and continuity forward.', patch: { hasDependents: true } },
      { label: 'No', hint: 'Focus on cover for your own bills and income.', patch: { hasDependents: false } },
    ],
  },
  {
    id: 'q-health-queue', stepTitle: 'Care', prompt: 'Have you got a referral or routine care to follow up?',
    whyItMatters: 'This brings any overdue care into the plan while you still have time to act.',
    options: [
      { label: 'I’m waiting on a referral', hint: 'Bring the booking follow-up forward.', patch: { overdueRoutineCare: true, hasPendingHospitalReferral: true } },
      { label: 'A routine check is overdue', hint: 'Set up a care review.', patch: { overdueRoutineCare: true, hasPendingHospitalReferral: false } },
      { label: 'I’m up to date', hint: 'Keep the focus on your other next steps.', patch: { overdueRoutineCare: false, hasPendingHospitalReferral: false } },
    ],
  },
];

export function getNextOnboardingQuestion(profile: UserProfile): OnboardingQuestion | null {
  return ONBOARDING_QUESTIONS.find((question) =>
    !profile.answeredQuestionIds.includes(question.id) && (!question.when || question.when(profile))) ?? null;
}

export function buildOnboardingAnswer(profile: UserProfile, id: string, answer: Partial<UserProfile>): Partial<UserProfile> {
  const patch = id === 'q-work-status' && answer.workStatus
    ? workSetupPatch(profile, answer.workStatus)
    : answer;
  const answered = new Set([...(patch.answeredQuestionIds ?? profile.answeredQuestionIds), id]);
  const contextual: Partial<UserProfile> = {};
  if (id === 'q-housing' && profile.housingStatus !== patch.housingStatus) {
    answered.delete('q-mortgage');
    if (patch.housingStatus === 'homeowner') contextual.housingLoan = undefined;
  }
  if (id === 'q-money-rail') {
    if (patch.needsCashRunway === false) {
      contextual.openedAccountIds = [...new Set([...profile.openedAccountIds, 'acct-cash-buffer'])];
    } else if (patch.needsCashRunway === true) {
      contextual.openedAccountIds = profile.openedAccountIds.filter((account) => account !== 'acct-cash-buffer');
      contextual.setupRails = profile.setupRails.filter((rail) => rail !== 'cash-isa');
    }
  }
  return { ...patch, ...contextual, answeredQuestionIds: [...answered] };
}
