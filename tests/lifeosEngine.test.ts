import { describe, expect, test } from 'bun:test';
import {
  advanceOperatingRule, computeIncomeBreakdown, computeLifeLevelState, DEFAULT_HEALTH_SNAPSHOT, DEFAULT_PROFILE,
  getAvailableBankAccounts, getEligibleTasks, getProtectionChecklist, TASK_CATALOG,
} from '../packages/core/src/data/lifeosEngine';
import { compareUKBusinessStructures, computeUKPaymentOnAccount, monthlyFutureValue, simulateIncomeDecision } from '../packages/core/src/data/finance';
import { computeHealthTargets, DIET_GUIDES, interpretLabResult, migrateLabResults } from '../packages/core/src/data/health';
import { compareMortgageAndInvest, compareRentAndBuy, mortgagePayment } from '../packages/core/src/data/housing';
import { buildOnboardingAnswer, getNextOnboardingQuestion } from '../packages/core/src/data/onboarding';
import { getGrowthTimeline, isGrowthProgressReviewDue, preferenceSnapshot, saveGrowthCheckIn, snoozeGrowthReview, startGrowthPlan } from '../packages/core/src/data/growth';
import type { LabMarkerId, LabResult, UKStudentLoanPlan, UserProfile } from '../packages/core/src/types/lifeos';

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    ...DEFAULT_PROFILE,
    workStatus: 'employed',
    monthlyPensionPct: 0,
    employerMatchPct: 0,
    isBusinessOwner: false,
    hasPendingHospitalReferral: false,
    overdueRoutineCare: false,
    needsCashRunway: false,
    needsTaxOrDebtFix: false,
    setupRails: [],
    openedAccountIds: [],
    ...overrides,
  };
}

describe('UK 2026/27 income', () => {
  test('tapers the allowance, restores it at £100k and applies the additional-rate band', () => {
    const before = computeIncomeBreakdown(profile({ annualIncome: 110_000 }));
    const restored = computeIncomeBreakdown(profile({ annualIncome: 100_000 }));
    const atEnd = computeIncomeBreakdown(profile({ annualIncome: 125_140 }));
    expect(before.uk?.personalAllowance).toBe(7_570);
    expect(before.uk?.extraSacrificeTo100k).toBe(10_000);
    expect(restored.uk?.personalAllowance).toBe(12_570);
    expect(before.incomeTaxAnnual - restored.incomeTaxAnnual).toBeCloseTo(6_000, 2);
    expect(atEnd.uk?.personalAllowance).toBe(0);
    expect(computeIncomeBreakdown(profile({ annualIncome: 126_140 })).incomeTaxAnnual - atEnd.incomeTaxAnnual).toBeCloseTo(450, 2);
  });

  test('applies Scottish bands and the Scottish taper to wages', () => {
    const uk = computeIncomeBreakdown(profile({ annualIncome: 110_000, taxCode: 'S1257L' }));
    const below = computeIncomeBreakdown(profile({ annualIncome: 100_000, taxSettings: { ukRegion: 'scotland' } }));
    expect(uk.incomeTaxAnnual - below.incomeTaxAnnual).toBeCloseTo(6_750, 2);
  });

  test('uses adjusted income after each pension method and keeps NI consistent with payroll', () => {
    const base = profile({ annualIncome: 120_000, monthlyPensionPct: 10, taxSettings: { ukOtherAdjustedIncome: 2_000 } });
    const netPay = computeIncomeBreakdown(base);
    const sacrifice = computeIncomeBreakdown({ ...base, taxSettings: { ...base.taxSettings, ukPensionMethod: 'salary-sacrifice' } });
    const atSource = computeIncomeBreakdown({ ...base, taxSettings: { ...base.taxSettings, ukPensionMethod: 'relief-at-source' } });
    expect(netPay.adjustedAnnual).toBe(110_000);
    expect(sacrifice.adjustedAnnual).toBe(110_000);
    expect(atSource.adjustedAnnual).toBe(110_000);
    expect(sacrifice.socialSecurityAnnual).toBeCloseTo(netPay.socialSecurityAnnual - 240, 2);
    expect(atSource.pensionEmployeeMonthly).toBe(800);
    expect(atSource.pensionEmployerMonthly).toBe(200);
    expect(atSource.netTakeHomeMonthly).toBe(netPay.netTakeHomeMonthly);
  });

  test('shows BR and 0T withholding separately from annual income tax', () => {
    const br = computeIncomeBreakdown(profile({ annualIncome: 60_000, taxCode: 'BR' }));
    const zeroT = computeIncomeBreakdown(profile({ annualIncome: 60_000, taxCode: '0T' }));
    expect(br.uk?.estimatedWithholdingAnnual).toBe(12_000);
    expect(zeroT.uk?.estimatedWithholdingAnnual).toBe(16_460);
    expect(br.incomeTaxAnnual).toBe(11_432);
    expect(br.netTakeHomeMonthly).toBe(zeroT.netTakeHomeMonthly);
  });

  const loanPlans: Array<[UKStudentLoanPlan, number]> = [
    ['plan-1', 26_900], ['plan-2', 29_385], ['plan-4', 33_795], ['plan-5', 25_000],
  ];
  for (const [plan, threshold] of loanPlans) {
    test(`${plan} uses its threshold and 9% above it`, () => {
      const setup = { taxSettings: { ukStudentLoan: plan } };
      expect(computeIncomeBreakdown(profile({ ...setup, annualIncome: threshold })).studentLoanMonthly).toBe(0);
      expect(computeIncomeBreakdown(profile({ ...setup, annualIncome: threshold + 1_000 })).studentLoanMonthly).toBe(7.5);
    });
  }

  test('adds the independent postgraduate repayment and uses post-sacrifice pay', () => {
    const pgOnly = computeIncomeBreakdown(profile({ annualIncome: 22_000, taxSettings: { ukPostgraduateLoan: true } }));
    expect(pgOnly.studentLoanMonthly).toBe(5);
    const withBoth = computeIncomeBreakdown(profile({ annualIncome: 50_000, taxSettings: { ukPostgraduateLoan: true, ukStudentLoan: 'plan-2' } }));
    expect(withBoth.studentLoanMonthly).toBe(299.61);
    const withSacrifice = computeIncomeBreakdown(profile({
      annualIncome: 50_000, monthlyPensionPct: 10,
      taxSettings: { ukStudentLoan: 'plan-2', ukPostgraduateLoan: true, ukPensionMethod: 'salary-sacrifice' },
    }));
    expect(withSacrifice.studentLoanMonthly).toBeCloseTo(237.11, 2);
  });

  test('uses Class 4 thresholds and separates first January cash needs from tax', () => {
    const result = computeIncomeBreakdown(profile({ annualIncome: 30_000, workStatus: 'sole-trader' }));
    expect(result.socialSecurityAnnual).toBeCloseTo(1_045.8, 2);
    expect(result.uk?.paymentOnAccount).toBeCloseTo(2_265.9, 2);
    expect(result.uk?.firstJanuaryBill).toBeCloseTo(6_797.7, 2);
    expect(result.taxReserveMonthly).toBe(377.65);
    expect(computeIncomeBreakdown(profile({ annualIncome: 60_000, workStatus: 'sole-trader' })).socialSecurityAnnual).toBeCloseTo(2_456.6, 2);
  });

  test('checks student loans and withholding independently of payments on account', () => {
    expect(computeUKPaymentOnAccount(999)).toBe(0);
    expect(computeUKPaymentOnAccount(1_000)).toBe(500);
    expect(computeUKPaymentOnAccount(6_000, 4_800)).toBe(600);
    expect(computeUKPaymentOnAccount(6_000, 4_801)).toBe(0);
    const withoutLoan = computeIncomeBreakdown(profile({ annualIncome: 40_000, workStatus: 'sole-trader' }));
    const withLoan = computeIncomeBreakdown(profile({ annualIncome: 40_000, workStatus: 'sole-trader', taxSettings: { ukStudentLoan: 'plan-5' } }));
    expect(withLoan.uk?.paymentOnAccount).toBe(withoutLoan.uk?.paymentOnAccount);
    expect(withLoan.uk!.firstJanuaryBill - withoutLoan.uk!.firstJanuaryBill).toBeCloseTo(1_350, 2);
  });

  test('detects uncredited years, credited years and voluntary Class 2', () => {
    expect(computeIncomeBreakdown(profile({ annualIncome: 6_707 })).pensionCredit.amount).toBe(0);
    expect(computeIncomeBreakdown(profile({ annualIncome: 6_708 })).pensionCredit.amount).toBe(1);
    expect(computeIncomeBreakdown(profile({ annualIncome: 7_104, workStatus: 'sole-trader' })).pensionCredit.amount).toBe(0);
    const credited = computeIncomeBreakdown(profile({ annualIncome: 7_105, workStatus: 'sole-trader' }));
    expect(credited.pensionCredit.amount).toBe(1);
    expect(credited.socialSecurityAnnual).toBe(0);
    const voluntary = computeIncomeBreakdown(profile({ annualIncome: 6_000, workStatus: 'sole-trader', taxSettings: { ukVoluntaryClass2: true } }));
    expect(voluntary.pensionCredit.amount).toBe(1);
    expect(voluntary.socialSecurityAnnual).toBeCloseTo(189.8, 2);
  });

  test('prices salary, dividends, employer NI and corporation tax for a director', () => {
    const setup = profile({ annualIncome: 50_000, workStatus: 'director', taxSettings: { ukDirectorSalary: 12_570 } });
    const { director, soleTrader } = compareUKBusinessStructures(setup);
    const split = director.uk!.director!;
    expect(split.salary).toBe(12_570);
    expect(split.employerNI).toBeCloseTo(1_135.5, 2);
    expect(split.corporationTax).toBeCloseTo(6_895.955, 3);
    expect(split.dividends).toBeCloseTo(29_398.545, 3);
    expect(split.dividendTax).toBeCloseTo((split.dividends - 500) * 0.1075, 3);
    expect(director.netTakeHomeMonthly).toBeCloseTo(split.annualNet / 12, 2);
    expect(director.pensionCredit.amount).toBe(1);
    expect(soleTrader.pensionCredit.amount).toBe(1);
    const lowSalary = computeIncomeBreakdown({ ...setup, taxSettings: { ukDirectorSalary: 6_707 } });
    expect(lowSalary.pensionCredit.amount).toBe(0);
  });

  test('uses company marginal relief and protects the LEL in the automatic model', () => {
    const result = computeIncomeBreakdown(profile({ annualIncome: 100_000, workStatus: 'director', taxSettings: { ukDirectorSalary: 0 } }));
    expect(result.uk?.director?.corporationTax).toBe(22_750);
    const setup = profile({ annualIncome: 46_000, workStatus: 'director', monthlyPensionPct: 5 });
    const best = computeIncomeBreakdown(setup);
    expect(best.uk!.director!.salary).toBeGreaterThanOrEqual(6_708);
    for (const salary of [6_708, 12_570, 20_000, 30_000]) {
      const fixed = computeIncomeBreakdown({ ...setup, taxSettings: { ukDirectorSalary: salary } });
      expect(best.netTakeHomeMonthly).toBeGreaterThanOrEqual(fixed.netTakeHomeMonthly);
    }
  });
});

describe('US, Germany and Nigeria', () => {
  test('uses 2026 US progressive federal bands, the FICA cap and uncapped Medicare with surtax', () => {
    const regular = computeIncomeBreakdown(profile({ countryCode: 'US', annualIncome: 100_000 }));
    expect(regular.taxableAnnual).toBe(83_900);
    expect(regular.incomeTaxAnnual).toBe(13_170);
    const high = computeIncomeBreakdown(profile({ countryCode: 'US', annualIncome: 250_000 }));
    expect(high.socialSecurityAnnual).toBe(15_514);
    expect(high.pensionCredit.amount).toBe(4);
    expect(high.taxAlert).toContain('Form 8606');
    expect(computeIncomeBreakdown(profile({ countryCode: 'US', annualIncome: 5_669 })).pensionCredit.amount).toBe(2);
  });

  test('deducts half of regular SE tax before QBI and credits net earnings', () => {
    const setup = profile({ countryCode: 'US', annualIncome: 100_000, workStatus: 'sole-trader' });
    const se = computeIncomeBreakdown(setup);
    expect(se.socialSecurityAnnual).toBeCloseTo(92_350 * 0.153, 2);
    expect(se.adjustedAnnual).toBeCloseTo(100_000 - 92_350 * 0.153 / 2, 2);
    expect(se.taxableAnnual).toBeCloseTo((se.adjustedAnnual - 16_100) * 0.8, 2);
    expect(computeIncomeBreakdown({ ...setup, taxSettings: { usQbiEligible: false } }).taxableAnnual).toBeCloseTo(se.adjustedAnnual - 16_100, 2);
    expect(computeIncomeBreakdown({ ...setup, annualIncome: 410 }).socialSecurityAnnual).toBe(0);
    expect(computeIncomeBreakdown({ ...setup, annualIncome: 300_000 }).taxAlert).toContain('simple QBI threshold');
  });

  test('supports the German basic allowance, progressive tariff and solidarity surcharge', () => {
    const setup = profile({ countryCode: 'DE', workStatus: 'sole-trader' });
    expect(computeIncomeBreakdown({ ...setup, annualIncome: 12_384 }).incomeTaxAnnual).toBe(0);
    const high = computeIncomeBreakdown({ ...setup, annualIncome: 100_036 });
    expect(high.taxableAnnual).toBe(100_000);
    expect(high.incomeTaxAnnual).toBeCloseTo(30_864 + (30_864 - 20_350) * 0.119, 2);
    expect(computeIncomeBreakdown({ ...setup, annualIncome: 100_036, taxSettings: { deSelfEmployedCoverAnnual: 4_000 } }).taxableAnnual).toBe(96_000);
  });

  test('uses German GKV and pension caps and adjusts for care insurance', () => {
    const setup = profile({ countryCode: 'DE', annualIncome: 200_000 });
    const result = computeIncomeBreakdown(setup);
    expect(result.socialSecurityAnnual).toBeCloseTo(101_400 * 0.106 + 69_750 * (0.0875 + 0.024), 3);
    expect(result.pensionCredit.amount).toBeCloseTo(101_400 / 51_944, 4);
    const sa = computeIncomeBreakdown({ ...setup, taxSettings: { deSaxony: true, deChildrenUnder25: 2 } });
    expect(result.socialSecurityAnnual - sa.socialSecurityAnnual).toBeCloseTo(69_750 * 0.0035, 3);
  });

  test('models Nigeria’s progressive bands, rent relief cap and separate PenCom flows', () => {
    const result = computeIncomeBreakdown(profile({
      countryCode: 'NG', annualIncome: 10_000_000,
      taxSettings: { ngPensionablePayPct: 60, ngAnnualRent: 3_000_000, ngOtherPayrollDeductions: 50_000, ngOtherEligibleRelief: 100_000 },
    }));
    expect(result.pensionEmployeeMonthly).toBe(40_000);
    expect(result.pensionEmployerMonthly).toBe(50_000);
    expect(result.pensionCredit.amount).toBe(1_080_000);
    expect(result.taxableAnnual).toBe(8_870_000);
    expect(result.incomeTaxAnnual).toBe(1_386_600);
    expect(computeIncomeBreakdown(profile({ countryCode: 'NG', annualIncome: 840_000, taxSettings: { ngPensionablePayPct: 0 } })).incomeTaxAnnual).toBe(0);
    expect(computeIncomeBreakdown(profile({ countryCode: 'NG', annualIncome: 60_000_000, workStatus: 'sole-trader' })).incomeTaxAnnual)
      .toBe(2_200_000 * 0.15 + 9_000_000 * 0.18 + 13_000_000 * 0.21 + 25_000_000 * 0.23 + 10_000_000 * 0.25);
  });
});

describe('What If', () => {
  test('uses the same baseline and exact scenario calculation without changing the profile', () => {
    const start = profile({ annualIncome: 50_000 });
    const result = simulateIncomeDecision(start, 'raise', 5, 100)!;
    const expected = computeIncomeBreakdown({ ...start, annualIncome: 60_000 });
    expect(result.after).toEqual(expected);
    expect(result.monthlyTakeHomeDelta).toBeCloseTo((expected.netTakeHomeAnnual - result.before.netTakeHomeAnnual) / 12, 2);
    expect(result.annualTaxSaved).toBeCloseTo(result.before.totalTaxAnnual - expected.totalTaxAnnual, 2);
    expect(result.creditDelta).toBe(0);
    expect(result.tenYearWealthDelta).toBeCloseTo(monthlyFutureValue((result.after.netTakeHomeAnnual - result.before.netTakeHomeAnnual) / 12, 120, 5), 2);
    expect(start.annualIncome).toBe(50_000);
  });

  test('switching to sole trader changes NI and employer pension', () => {
    const setup = profile({ annualIncome: 6_900, employerMatchPct: 3 });
    const result = simulateIncomeDecision(setup, 'sole-trader', 0, 100)!;
    expect(result.before.pensionCredit.amount).toBe(1);
    expect(result.after.pensionCredit.amount).toBe(0);
    expect(result.creditDelta).toBe(-1);
    expect(result.pensionDelta).toBe(-17.25);
    expect(simulateIncomeDecision({ ...setup, workStatus: 'sole-trader' }, 'sole-trader', 5, 100)).toBeNull();
  });

  test('adds exactly five points of sacrifice and leaves existing net-pay NI intact', () => {
    const setup = profile({ annualIncome: 115_000, monthlyPensionPct: 5 });
    const result = simulateIncomeDecision(setup, 'pension', 0, 100)!;
    expect(result.after.adjustedAnnual).toBe(result.before.adjustedAnnual - 5_750);
    expect(result.annualTaxSaved).toBeCloseTo(5_750 * (0.6 + 0.02), 2);
    expect(result.pensionDelta).toBeCloseTo(5_750 / 12, 2);
    expect(result.tenYearWealthDelta).toBeCloseTo((result.after.netTakeHomeAnnual - result.before.netTakeHomeAnnual + 5_750) * 10, 2);
  });

  test('401(k) caps federal deferral and leaves US FICA alone', () => {
    const result = simulateIncomeDecision(profile({ countryCode: 'US', annualIncome: 200_000, monthlyPensionPct: 10 }), 'pension', 5, 0)!;
    expect(result.before.socialSecurityAnnual).toBe(result.after.socialSecurityAnnual);
    expect(result.after.pensionEmployeeMonthly).toBeCloseTo(24_500 / 12, 2);
    expect(result.tenYearWealthDelta).toBeCloseTo(monthlyFutureValue((result.after.pensionAnnual - result.before.pensionAnnual) / 12, 120, 5), 2);
  });

  test('German salary conversion updates pension points and Nigerian payroll updates RSA flows', () => {
    const germany = simulateIncomeDecision(profile({ countryCode: 'DE', annualIncome: 80_000 }), 'pension', 5, 0)!;
    expect(germany.creditDelta).toBeCloseTo(-4_000 / 51_944, 4);
    expect(germany.pensionDelta).toBe(333.33);
    const nigeria = simulateIncomeDecision(profile({ countryCode: 'NG', annualIncome: 10_000_000 }), 'pension', 5, 0)!;
    expect(nigeria.creditDelta).toBe(500_000);
    expect(nigeria.annualTaxSaved).toBe(90_000);
  });

  test('handles a zero return and uses an effective monthly return for compounding', () => {
    expect(monthlyFutureValue(100, 120, 0)).toBe(12_000);
    expect(monthlyFutureValue(100, 12, 12)).toBeCloseTo(100 * 0.12 / (1.12 ** (1 / 12) - 1), 5);
    expect(monthlyFutureValue(100, 120, -5)).toBeLessThan(12_000);
  });
});

describe('health targets and lab boundaries', () => {
  const reading = (id: LabMarkerId, value: number, unit: string, context = {}, range: Partial<LabResult> = {}) =>
    interpretLabResult(id, context, { value, unit, ...range });

  test('uses body weight and training days, and keeps the caffeine cutoff in the plan', () => {
    const targets = computeHealthTargets({ ...DEFAULT_HEALTH_SNAPSHOT, weightKg: 80, trainingDays: 4, caffeineCutoff: '14:00' });
    expect(targets).toEqual({ personalised: true, waterMl: 2_650, proteinG: 128, caffeineCutoff: '14:00' });
    expect(computeHealthTargets({ ...DEFAULT_HEALTH_SNAPSHOT, weightKg: 80, trainingDays: 0 }).proteinG).toBe(64);
    expect(computeHealthTargets(DEFAULT_HEALTH_SNAPSHOT).personalised).toBe(false);
    expect(Object.values(DIET_GUIDES).map((diet) => diet.swaps.length)).toEqual([2, 2, 2, 2, 2]);
  });

  test('Vitamin D converts units and checks low and high readings', () => {
    expect(reading('bw-vitd', 11.9, 'ng/mL').explanation).toContain('deficiency');
    expect(reading('bw-vitd', 12, 'ng/mL').status).toBe('check');
    expect(reading('bw-vitd', 20, 'ng/mL').status).toBe('optimal');
    expect(reading('bw-vitd', 125, 'nmol/L').status).toBe('optimal');
    expect(reading('bw-vitd', 125.1, 'nmol/L').status).toBe('check');
  });

  test('ApoB uses the chosen risk threshold with unit conversion', () => {
    expect(reading('bw-apob', 0.899, 'g/L').status).toBe('optimal');
    expect(reading('bw-apob', 0.9, 'g/L').status).toBe('check');
    expect(reading('bw-apob', 70, 'mg/dL', { apoBRisk: 'high' }).status).toBe('check');
    expect(reading('bw-apob', 59.9, 'mg/dL', { apoBRisk: 'very-high' }).status).toBe('optimal');
    expect(reading('bw-apob', 60, 'mg/dL', { apoBRisk: 'very-high' }).status).toBe('check');
  });

  test('HbA1c separately handles IFCC and percent results at both action thresholds', () => {
    expect(reading('bw-hba1c', 5.69, '%').status).toBe('optimal');
    expect(reading('bw-hba1c', 5.7, '%').status).toBe('check');
    expect(reading('bw-hba1c', 6.5, '%').explanation).toContain('confirmatory');
    expect(reading('bw-hba1c', 38, 'mmol/mol').status).toBe('optimal');
    expect(reading('bw-hba1c', 39, 'mmol/mol').status).toBe('check');
    expect(reading('bw-hba1c', 48, 'mmol/mol').explanation).toContain('confirmatory');
  });

  test('ferritin changes review thresholds with context', () => {
    expect(reading('bw-ferritin', 14.99, 'ng/mL').status).toBe('check');
    expect(reading('bw-ferritin', 15, 'µg/L').status).toBe('optimal');
    expect(reading('bw-ferritin', 200.1, 'µg/L').status).toBe('check');
    expect(reading('bw-ferritin', 151, 'µg/L', { ferritinContext: 'menstruating' }).status).toBe('check');
    expect(reading('bw-ferritin', 69, 'µg/L', { ferritinContext: 'inflammation' }).status).toBe('check');
    expect(reading('bw-ferritin', 70, 'µg/L', { ferritinContext: 'inflammation' }).status).toBe('optimal');
  });

  test('optional markers distinguish a lab interval from cardiovascular or thyroid guides', () => {
    expect(reading('bw-hscrp', 1.99, 'mg/L').status).toBe('optimal');
    expect(reading('bw-hscrp', 2, 'mg/L', {}, { referenceHigh: 5 }).labRange).toBe('within');
    expect(reading('bw-hscrp', 2, 'mg/L', {}, { referenceHigh: 5 }).status).toBe('check');
    expect(reading('bw-insulin', 10, 'µIU/mL').status).toBe('check');
    expect(reading('bw-insulin', 10, 'µIU/mL', {}, { referenceLow: 3, referenceHigh: 10 }).status).toBe('optimal');
    expect(reading('bw-insulin', 11, 'µIU/mL', {}, { referenceLow: 3, referenceHigh: 10 }).status).toBe('check');
    expect(reading('bw-tsh', 2, 'mIU/L', {}, { referenceLow: 0.4, referenceHigh: 4 }).status).toBe('optimal');
    expect(reading('bw-tsh', 10, 'mIU/L', {}, { referenceLow: 0.4, referenceHigh: 12 }).status).toBe('check');
    expect(reading('bw-tsh', 0.09, 'mIU/L', {}, { referenceHigh: 12 }).status).toBe('check');
    expect(interpretLabResult('bw-insulin', {}).status).toBe('due');
    expect(reading('bw-vitd', 40, 'wrong unit').status).toBe('due');
  });

  test('keeps ambiguous legacy notes and only imports identified units once', () => {
    const health = {
      ...DEFAULT_HEALTH_SNAPSHOT,
      bloodwork: [
        { id: 'bw-vitd', name: 'Vitamin D', currentValue: '56 nmol/L', targetRange: '', status: 'due' as const, whyItMatters: '' },
        { id: 'bw-apob', name: 'ApoB', currentValue: '80', targetRange: '', status: 'optimal' as const, whyItMatters: '' },
      ],
    };
    const migrated = migrateLabResults(health);
    expect(migrated.labResults?.['bw-vitd']).toEqual({ value: 56, unit: 'nmol/L' });
    expect(migrated.labResults?.['bw-apob']).toBeUndefined();
    expect(migrated.bloodwork?.[1].currentValue).toBe('80');
    expect(migrateLabResults({ ...migrated, labResults: {} }).labResults).toEqual({});
  });
});

describe('stage unlocks and adaptive questions', () => {
  const runway = { balance: 100, expectedIncome: 0, essentialBills: 0, dueSoonLabel: '', followUpLabel: '', netRunway: 100, updatedAt: '2026-11-15' };
  const level = (person: UserProfile, done: string[] = []) => computeLifeLevelState(person, getEligibleTasks(person, done), done, '2026-11-15');
  const stageThreeProfile = profile({
    runway, taxReviewed: true, health: { ...DEFAULT_HEALTH_SNAPSHOT, baselineReviewed: true },
    subscriptionsReviewed: true, openedAccountIds: ['acc-current', 'acct-cash-buffer'],
  });

  test('does not unlock Stage II from generic saved outcomes or seeded meals', () => {
    const person = profile({
      annualIncome: 50_000, taxCode: '1257L',
      recordedOutcomes: { other: { taskId: 'other', summary: 'Done', recordedAt: '2026-11-15' } },
    });
    expect(level(person).currentLevel).toBe(1);
    expect(getEligibleTasks(person).some((task) => task.minLevel === 2)).toBe(false);
  });

  test('requires runway, tax review and urgent tasks before Stage II', () => {
    const pending = profile({ runway, taxReviewed: true, hasPendingHospitalReferral: true });
    expect(level(pending).currentLevel).toBe(1);
    const next = level(pending, ['nhs-outpatient-referral']);
    expect(next.currentLevel).toBe(2);
    expect(next.unlockedNormals.map((rule) => rule.id)).toEqual(['payday-sweep', 'tax-record']);
    expect(next.unlockedGambits.some((task) => task.id === 'deep-work-sprint')).toBe(true);
  });

  test('requires a reviewed care baseline, core accounts and subscriptions for Stage III', () => {
    expect(level({ ...stageThreeProfile, subscriptionsReviewed: false }).currentLevel).toBe(2);
    expect(level({ ...stageThreeProfile, openedAccountIds: ['acc-current', 'acct-index-wrapper'] }).currentLevel).toBe(2);
    expect(level({ ...stageThreeProfile, health: DEFAULT_HEALTH_SNAPSHOT }).currentLevel).toBe(2);
    const result = level(stageThreeProfile);
    expect(result.currentLevel).toBe(3);
    expect(result.unlockedGambits.some((task) => task.id === 'rent-vs-buy')).toBe(true);
    expect(result.unlockedGambits.some((task) => task.id === 'mortgage-vs-isa')).toBe(false);
    expect(level({ ...stageThreeProfile, housingStatus: 'homeowner', housingLoan: true }).unlockedGambits.some((task) => task.id === 'mortgage-vs-isa')).toBe(true);
  });

  test('requires protection and a completed Stage III move for Stage IV and retains earned levels', () => {
    const withProtection = { ...stageThreeProfile, protectedPolicyIds: ['prot-income', 'prot-will-nom'] };
    expect(level(withProtection, ['deep-work-sprint']).currentLevel).toBe(3);
    expect(level(stageThreeProfile, ['rent-vs-buy']).currentLevel).toBe(3);
    const earned = level(withProtection, ['rent-vs-buy']);
    expect(earned.currentLevel).toBe(4);
    expect(earned.unlockedGambits.some((task) => task.id === 'specific-knowledge-asset')).toBe(true);
    expect(earned.unlockedGambits.some((task) => task.id === 'rent-vs-buy')).toBe(false);
    expect(level(profile({ earnedLevel: 4 })).currentLevel).toBe(4);
  });

  test('moves a fitness gambit to the front for fitness and explains multi-goal matches', () => {
    const secondStage = profile({ runway, taxReviewed: true, collectiveGoals: ['fit'], destination: 'health-longevity' });
    expect(level(secondStage).unlockedGambits[0].id).toBe('training-recovery-week');
    const multi = level({ ...secondStage, collectiveGoals: ['calm', 'educated'], destination: 'level-up-career' });
    expect(multi.unlockedGambits[0].id).toBe('deep-work-sprint');
    expect(multi.unlockedGambits[0].whySurfaced).toContain('calm and learning');
    for (let mask = 0; mask < 16; mask++) {
      const collectiveGoals = (['wealth', 'fit', 'calm', 'educated'] as const).filter((_, index) => mask & (1 << index));
      expect(level({ ...secondStage, collectiveGoals }).unlockedGambits).toHaveLength(level(secondStage).unlockedGambits.length);
    }
  });

  test('calculates the next maintenance date and preserves saved dates', () => {
    const result = level({ ...stageThreeProfile, operatingRuleDates: { 'payday-sweep': '2026-01-31' } });
    const sweep = result.unlockedNormals.find((rule) => rule.id === 'payday-sweep')!;
    expect(sweep.nextDueOn).toBe('2026-01-31');
    expect(advanceOperatingRule(sweep, '2026-01-31')).toBe('2026-02-28');
    expect(result.unlockedNormals.find((rule) => rule.id === 'subscriptions')?.nextDueOn).toBe('2027-02-15');
  });

  test('only asks PAYE after work status and skips it for sole traders or other countries', () => {
    let person = profile({ answeredQuestionIds: ['q-destination'] });
    expect(getNextOnboardingQuestion(person)?.id).toBe('q-work-status');
    person = { ...person, ...buildOnboardingAnswer(person, 'q-work-status', { workStatus: 'employed' }) };
    expect(getNextOnboardingQuestion(person)?.id).toBe('q-income');
    person = { ...person, ...buildOnboardingAnswer(person, 'q-income', { annualIncome: 68_000 }) };
    expect(getNextOnboardingQuestion(person)?.id).toBe('q-uk-paye-code');
    expect(computeIncomeBreakdown(person).grossAnnual).toBe(68_000);
    expect(getNextOnboardingQuestion({ ...person, workStatus: 'sole-trader' })?.id).toBe('q-money-rail');
    expect(getNextOnboardingQuestion({ ...person, countryCode: 'US' })?.id).toBe('q-money-rail');
  });

  test('rechecks stale income when work stops and preserves a confirmed tax code', () => {
    const person = profile({ countryCode: 'DE', taxCode: 'Steuerklasse VI', annualIncome: 50_000, answeredQuestionIds: ['q-destination'] });
    expect(buildOnboardingAnswer(person, 'q-work-status', { workStatus: 'employed' }).taxCode).toBe('Steuerklasse VI');
    const betweenJobs = { ...person, ...buildOnboardingAnswer(person, 'q-work-status', { workStatus: 'student-between' }) };
    expect(getNextOnboardingQuestion(betweenJobs)?.id).toBe('q-income');
    const noPay = { ...betweenJobs, ...buildOnboardingAnswer(betweenJobs, 'q-income', { annualIncome: 0 }) };
    expect(computeIncomeBreakdown(noPay).netTakeHomeMonthly).toBe(0);
    expect(getNextOnboardingQuestion(noPay)?.id).toBe('q-money-rail');
  });

  test('skip renters’ mortgage intake and update accounts and cover based on answers', () => {
    let person = profile({
      destination: 'fix-stabilize',
      answeredQuestionIds: ['q-destination', 'q-work-status', 'q-income', 'q-uk-paye-code', 'q-money-rail', 'q-tax-compliance'],
    });
    expect(getNextOnboardingQuestion(person)?.id).toBe('q-housing');
    const renter = { ...person, ...buildOnboardingAnswer(person, 'q-housing', { housingStatus: 'renting', housingLoan: false }) };
    expect(getNextOnboardingQuestion(renter)?.id).toBe('q-dependents');
    person = { ...person, ...buildOnboardingAnswer(person, 'q-housing', { housingStatus: 'homeowner' }) };
    expect(getNextOnboardingQuestion(person)?.id).toBe('q-mortgage');
    person = { ...person, ...buildOnboardingAnswer(person, 'q-mortgage', { housingLoan: false }) };
    expect(getProtectionChecklist(person).find((policy) => policy.id === 'prot-life')?.urgency).toBe('Situation-Based');
    person = { ...person, ...buildOnboardingAnswer(person, 'q-dependents', { hasDependents: true }) };
    expect(getProtectionChecklist(person).find((policy) => policy.id === 'prot-life')?.urgency).toBe('Critical');
    expect(getEligibleTasks(person).some((task) => task.id === 'uk-family-childcare')).toBe(true);
    person = { ...person, ...buildOnboardingAnswer(person, 'q-money-rail', { needsCashRunway: false }) };
    expect(getAvailableBankAccounts(person).find((account) => account.id === 'acct-cash-buffer')?.opened).toBe(true);
    expect(new Set(TASK_CATALOG.map((task) => task.id)).size).toBe(TASK_CATALOG.length);
  });
});

describe('housing and growth', () => {
  test('rent and buy use equal budgets and keep a separate emergency buffer', () => {
    const result = compareRentAndBuy({
      price: 120_000, deposit: 24_000, availableCash: 25_000, emergencyBuffer: 5_000, purchaseCosts: 0,
      saleCostsPct: 0, rentMonthly: 1_000, ownerCostsMonthly: 0, mortgageRatePct: 0, termYears: 10,
      years: 10, homeGrowthPct: 0, rentGrowthPct: 0, investmentReturnPct: 0,
    })!;
    expect(result.cashShortfall).toBe(4_000);
    expect(result.maxDeposit).toBe(20_000);
    expect(result.payment).toBe(800);
    expect(result.buyerWealth).toBe(144_000);
    expect(result.rentingInvestments).toBe(24_000);
    expect(mortgagePayment(120_000, 5, 360)).toBeCloseTo(644.19, 2);
  });

  test('mortgage overpayments respect annual caps and reinvest cash after payoff', () => {
    const inputs = { balance: 12_000, mortgageRatePct: 0, termYears: 2, extraMonthly: 500, years: 2, investmentReturnPct: 0, annualOverpaymentLimit: 3_000, overpaymentFee: 0 };
    const result = compareMortgageAndInvest(inputs)!;
    expect(result.payoffMonth).toBe(15);
    expect(result.overpayPortfolio).toBe(12_000);
    expect(result.investPortfolio).toBe(12_000);
    expect(result.overpayAdvantage).toBe(0);
    expect(compareMortgageAndInvest({ ...inputs, overpaymentFee: 100 })?.overpayAdvantage).toBe(-100);
    expect(compareMortgageAndInvest({ ...inputs, mortgageRatePct: 5 })?.overpayAdvantage).toBeGreaterThan(0);
  });

  test('paces reflection over six days and supports opt-out, snooze and revisions', () => {
    const first = startGrowthPlan('2026-11-15');
    expect(getGrowthTimeline(first, '2026-11-15').filter((check) => check.available).map((check) => check.id)).toEqual(['preferences']);
    expect(getGrowthTimeline(first, '2026-11-20').every((check) => check.available)).toBe(true);
    const saved = saveGrowthCheckIn({ ...first, path: 'reset' }, 'swot', { strength: 'Writing' }, '2026-11-16');
    expect(getGrowthTimeline(saved, '2026-12-16').find((check) => check.id === 'swot')?.reviewDue).toBe(true);
    const snoozed = snoozeGrowthReview(saved, '2026-12-16');
    expect(getGrowthTimeline(snoozed, '2026-12-22').some((check) => check.reviewDue)).toBe(false);
    expect(getGrowthTimeline(snoozed, '2026-12-23').some((check) => check.reviewDue)).toBe(true);
    expect(isGrowthProgressReviewDue(saved, '2026-12-16')).toBe(true);
    expect(isGrowthProgressReviewDue({ ...saved, cadenceDays: 0 }, '2026-12-16')).toBe(false);
    const revised = saveGrowthCheckIn(saved, 'swot', { strength: 'Mentoring' }, '2026-12-16');
    expect(revised.checkIns?.swot?.map((entry) => entry.answers.strength)).toEqual(['Writing', 'Mentoring']);
  });

  test('uses preferences as a four-letter reflection and never suggests repeating civic views', () => {
    const prefs = getGrowthTimeline(startGrowthPlan('2026-11-15'), '2026-11-15')[0];
    const picks = Object.fromEntries(prefs.prompts.map((prompt) => [prompt.id, '1']));
    expect(preferenceSnapshot(picks)?.code).toBe('INFP');
    expect(preferenceSnapshot({})).toBeNull();
    const plan = saveGrowthCheckIn(startGrowthPlan('2026-11-15'), 'values', { civic: 'My reflection' }, '2026-11-20');
    expect(getGrowthTimeline(plan, '2027-11-20').find((check) => check.id === 'values')?.reviewDue).toBe(false);
  });
});
