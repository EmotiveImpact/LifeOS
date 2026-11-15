import type { DirectorSplit, IncomeBreakdown, PensionCredit, TaxSettings, UKStudentLoanPlan, UserProfile } from '../types/lifeos';

const UK_PAYROLL = 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027';
const UK_ALLOWANCE = 12_570;
const UK_LEL = 6_708;
const UK_SMALL_PROFITS = 7_105;
const UK_SECONDARY = 5_000;
const UK_BASIC = 37_700;
const UK_UPPER_NI = 50_270;

const UK_BANDS = [[UK_BASIC, 0.2], [125_140, 0.4], [Infinity, 0.45]] as const;
const SCOTTISH_BANDS = [[3_967, 0.19], [16_956, 0.2], [31_092, 0.21], [62_430, 0.42], [125_140, 0.45], [Infinity, 0.48]] as const;
const DIVIDEND_BANDS = [[UK_BASIC, 0.1075], [125_140, 0.3575], [Infinity, 0.3935]] as const;
const UK_LOANS: Record<UKStudentLoanPlan, number> = {
  'plan-1': 26_900, 'plan-2': 29_385, 'plan-4': 33_795, 'plan-5': 25_000,
};
const US_BANDS = [[12_400, 0.1], [50_400, 0.12], [105_700, 0.22], [201_750, 0.24], [256_225, 0.32], [640_600, 0.35], [Infinity, 0.37]] as const;
const NG_BANDS = [[800_000, 0], [3_000_000, 0.15], [12_000_000, 0.18], [25_000_000, 0.21], [50_000_000, 0.23], [Infinity, 0.25]] as const;

const SOURCES = {
  UK: [
    { label: 'HMRC income tax', url: 'https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past' },
    { label: 'Payroll and student loans', url: UK_PAYROLL },
    { label: 'Self-employed NI', url: 'https://www.gov.uk/self-employed-national-insurance-rates' },
    { label: 'Payments on account', url: 'https://www.gov.uk/understand-self-assessment-bill/payments-on-account' },
    { label: 'Corporation Tax', url: 'https://www.gov.uk/guidance/corporation-tax-marginal-relief' },
    { label: 'NI record', url: 'https://www.gov.uk/check-national-insurance-record' },
  ],
  US: [
    { label: 'IRS 2026 tax tables', url: 'https://www.irs.gov/irb/2025-45_IRB' },
    { label: 'IRS 401(k) and Roth IRA limits', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
    { label: 'Schedule SE', url: 'https://www.irs.gov/instructions/i1040sse' },
    { label: 'SSA credits', url: 'https://www.ssa.gov/news/en/cola/factsheets/2026.html' },
    { label: 'QBI deduction', url: 'https://www.irs.gov/newsroom/qualified-business-income-deduction' },
    { label: 'IRA conversions (Form 8606)', url: 'https://www.irs.gov/instructions/i8606' },
  ],
  DE: [
    { label: '§32a income tax tariff', url: 'https://www.gesetze-im-internet.de/estg/__32a.html' },
    { label: '2026 contribution limits', url: 'https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html' },
    { label: 'Statutory health insurance', url: 'https://www.bundesgesundheitsministerium.de/beitraege' },
    { label: 'Care insurance', url: 'https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung/' },
  ],
  NG: [
    { label: 'Nigeria Tax Act', url: 'https://nass.gov.ng/documents/download/11249' },
    { label: 'Personal income tax guidelines', url: 'https://www.jtb.gov.ng/assets/2026-pit-guidelines-TJG3n9-T.pdf' },
    { label: 'Pension Reform Act', url: 'https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf' },
  ],
} satisfies Record<UserProfile['countryCode'], IncomeBreakdown['sources']>;

type AnnualIncome = {
  adjusted: number;
  taxable: number;
  incomeTax: number;
  social: number;
  employeePension: number;
  employerPension: number;
  studentLoan?: number;
  companyTax?: number;
  reserve?: number;
  socialLabel: string;
  pensionNote: string;
  credit: PensionCredit;
  assumptions: string[];
  uk?: IncomeBreakdown['uk'];
  taxAlert?: string;
};

type Bands = readonly (readonly [upper: number, rate: number])[];

function positive(value = 0): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function percentage(value: number | undefined, max = 100): number {
  return Math.min(max, positive(value)) / 100;
}

function taxAcrossBands(income: number, bands: Bands, startAt = 0): number {
  let tax = 0;
  let bottom = 0;
  for (const [top, rate] of bands) {
    tax += Math.max(0, Math.min(income + startAt, top) - Math.max(bottom, startAt)) * rate;
    bottom = top;
    if (top >= income + startAt) break;
  }
  return tax;
}

function ukAllowance(adjusted: number): number {
  return Math.max(0, UK_ALLOWANCE - Math.floor(Math.max(0, adjusted - 100_000) / 2));
}

function ukStudentLoan(income: number, settings: TaxSettings): number {
  const threshold = settings.ukStudentLoan ? UK_LOANS[settings.ukStudentLoan] : undefined;
  const undergraduate = threshold === undefined ? 0 : Math.max(0, income - threshold) * 0.09;
  const postgraduate = settings.ukPostgraduateLoan ? Math.max(0, income - 21_000) * 0.06 : 0;
  return undergraduate + postgraduate;
}

function ukEmployeeNI(salary: number, reachedPensionAge: boolean | undefined): number {
  if (reachedPensionAge) return 0;
  return taxAcrossBands(salary, [[UK_ALLOWANCE, 0], [UK_UPPER_NI, 0.08], [Infinity, 0.02]]);
}

export function computeUKPaymentOnAccount(relevantTax: number, deductedAtSource = 0): number {
  const outstanding = Math.max(0, relevantTax - deductedAtSource);
  return outstanding >= 1_000 && deductedAtSource <= relevantTax * 0.8 ? outstanding / 2 : 0;
}

function corporationTax(profit: number): number {
  if (profit <= 50_000) return profit * 0.19;
  return profit * 0.25 - Math.max(0, 250_000 - profit) * 0.015;
}

function ukRegion(profile: UserProfile): boolean {
  return profile.taxSettings?.ukRegion
    ? profile.taxSettings.ukRegion === 'scotland'
    : /^S(?:\d|BR|D|K|NT)/i.test(profile.taxCode.trim());
}

function evaluateDirector(
  gross: number, salary: number, pensionPct: number, scotland: boolean, settings: TaxSettings
) {
  const employerNI = Math.max(0, salary - UK_SECONDARY) * 0.15;
  const employerPension = salary * pensionPct;
  const companyProfit = Math.max(0, gross - salary - employerNI - employerPension);
  const companyTax = corporationTax(companyProfit);
  const dividends = companyProfit - companyTax;
  const adjusted = salary + dividends + positive(settings.ukOtherAdjustedIncome);
  const allowance = ukAllowance(adjusted);
  const taxableSalary = Math.max(0, salary - allowance);
  const taxableDividends = Math.max(0, dividends - Math.max(0, allowance - salary));
  const dividendOffset = Math.min(500, taxableDividends);
  const payTax = taxAcrossBands(taxableSalary, scotland ? SCOTTISH_BANDS : UK_BANDS);
  const dividendTax = taxAcrossBands(taxableDividends - dividendOffset, DIVIDEND_BANDS, taxableSalary + dividendOffset);
  const employeeNI = ukEmployeeNI(salary, settings.ukStatePensionAgeReached);
  const studentLoan = ukStudentLoan(salary + (dividends > 2_000 ? dividends : 0), settings);
  const split: DirectorSplit = {
    salary, dividends, corporationTax: companyTax, employerNI, dividendTax, employerPension,
    annualNet: salary + dividends - payTax - dividendTax - employeeNI - studentLoan,
  };
  return { split, adjusted, allowance, taxableSalary, taxableDividends, payTax, employeeNI, studentLoan };
}

function directorSalaryForProfit(gross: number, profit: number, pensionPct: number): number {
  const budget = Math.max(0, gross - profit);
  return budget <= UK_SECONDARY * (1 + pensionPct)
    ? budget / (1 + pensionPct)
    : (budget + UK_SECONDARY * 0.15) / (1 + pensionPct + 0.15);
}

function bestDirectorSalary(gross: number, pensionPct: number, scotland: boolean, settings: TaxSettings): number {
  const max = Math.floor(directorSalaryForProfit(gross, 0, pensionPct));
  const min = settings.ukStatePensionAgeReached ? 0 : Math.min(max, UK_LEL);
  const valueAt = (salary: number) => evaluateDirector(gross, salary, pensionPct, scotland, settings);
  let points = [
    min, max, UK_SECONDARY, UK_ALLOWANCE, UK_UPPER_NI, 21_000, ...Object.values(UK_LOANS),
    directorSalaryForProfit(gross, 50_000, pensionPct),
    directorSalaryForProfit(gross, 250_000, pensionPct),
  ].filter((salary) => salary >= min && salary <= max);

  // Between band boundaries, cash after tax is piecewise linear apart from statutory rounding.
  // Search either side of each boundary at whole-pound salary precision.
  const addCrossings = (values: (sample: ReturnType<typeof valueAt>) => Array<[number, number]>) => {
    const ends = [...new Set(points)].sort((a, b) => a - b);
    let previous = values(valueAt(ends[0]));
    for (let i = 1; i < ends.length; i += 1) {
      const current = values(valueAt(ends[i]));
      for (let j = 0; j < current.length; j += 1) {
        const [from, boundary] = previous[j];
        const [to] = current[j];
        if ((from < boundary && to > boundary) || (from > boundary && to < boundary)) {
          points.push(ends[i - 1] + (ends[i] - ends[i - 1]) * (boundary - from) / (to - from));
        }
      }
      previous = current;
    }
  };

  addCrossings((v) => [[v.adjusted, 100_000], [v.adjusted, 125_140], [v.split.dividends, 2_000]]);
  addCrossings((v) => [[v.split.salary - v.allowance, 0], [v.split.salary + v.split.dividends - v.allowance, 0]]);
  addCrossings((v) => [
    ...[21_000, ...Object.values(UK_LOANS)].map((threshold): [number, number] => [v.split.salary + v.split.dividends, threshold]),
    ...((scotland ? SCOTTISH_BANDS : UK_BANDS).slice(0, -1)).map(([threshold]): [number, number] => [v.taxableSalary, threshold]),
    [v.taxableDividends, 500],
    [v.taxableSalary + v.taxableDividends, UK_BASIC],
    [v.taxableSalary + v.taxableDividends, 125_140],
    [v.taxableSalary + 500, UK_BASIC],
    [v.taxableSalary + 500, 125_140],
  ]);
  const salaries = new Set(points.flatMap((point) => {
    const salary = Math.floor(point);
    return [salary - 1, salary, salary + 1, salary + 2];
  }).filter((salary) => salary >= min && salary <= max));

  return [...salaries].reduce((best, salary) =>
    valueAt(salary).split.annualNet > valueAt(best).split.annualNet + 0.005 ? salary : best, min);
}

function ukWithholding(code: string, taxablePay: number, scotland: boolean): number | undefined {
  const key = code.trim().toUpperCase().replace(/^[SC](?=\d|BR|D|K|NT)/, '');
  if (key === 'BR') return taxablePay * 0.2;
  if (key === 'NT') return 0;
  const flatRates: Record<string, number> = scotland
    ? { D0: 0.21, D1: 0.42, D2: 0.45, D3: 0.48 }
    : { D0: 0.4, D1: 0.45 };
  if (key in flatRates) return taxablePay * flatRates[key];
  if (key === '0T') return taxAcrossBands(taxablePay, scotland ? SCOTTISH_BANDS : UK_BANDS);
  const match = /^(\d+)L(?:\s?(?:W1|M1|X|NONCUM))?$/.exec(key);
  if (!match) return undefined;
  return taxAcrossBands(Math.max(0, taxablePay - Number(match[1]) * 10), scotland ? SCOTTISH_BANDS : UK_BANDS);
}

function ukAnnual(profile: UserProfile, gross: number, extraDeferral: number): AnnualIncome {
  const settings = profile.taxSettings ?? {};
  const scotland = ukRegion(profile);
  const bands = scotland ? SCOTTISH_BANDS : UK_BANDS;
  const pensionPct = percentage(profile.monthlyPensionPct, 40);
  const otherIncome = positive(settings.ukOtherAdjustedIncome);
  const reachedPensionAge = settings.ukStatePensionAgeReached;
  const sole = profile.workStatus === 'sole-trader';
  const region = scotland ? 'Scottish' : 'England, Wales and Northern Ireland';
  const allowanceAssumption = 'One full tax year. Other adjusted income changes the allowance only. Credits, pensions and loan balances depend on your records.';
  const pensionNote = (qualifies: boolean, target: string) => reachedPensionAge
    ? 'Check your existing NI record and State Pension forecast.'
    : qualifies
      ? `Meets the ${target} under this annual model. Confirm the qualifying year in your NI record.`
      : `Below the ${target}. Check your NI record, other credits and the cost of filling a gap.`;

  if (profile.workStatus === 'director') {
    const salary = settings.ukDirectorSalary === undefined
      ? bestDirectorSalary(gross, pensionPct, scotland, settings)
      : Math.min(positive(settings.ukDirectorSalary), directorSalaryForProfit(gross, 0, pensionPct));
    const { split, adjusted, allowance, taxableSalary, taxableDividends, payTax, employeeNI, studentLoan } =
      evaluateDirector(gross, salary, pensionPct, scotland, settings);
    const qualifies = salary >= UK_LEL;
    const dividendLoan = Math.max(0, studentLoan - ukStudentLoan(salary, settings));
    const dividendBill = Math.max(0, split.dividendTax - positive(settings.ukTaxDeductedAtSource));
    const payment = computeUKPaymentOnAccount(payTax + split.dividendTax, payTax + positive(settings.ukTaxDeductedAtSource));
    return {
      adjusted, taxable: taxableSalary + taxableDividends, incomeTax: payTax + split.dividendTax,
      social: employeeNI, employeePension: 0, employerPension: split.employerPension, studentLoan,
      companyTax: split.corporationTax + split.employerNI,
      reserve: split.corporationTax + split.employerNI + dividendBill + dividendLoan,
      socialLabel: 'Director Class 1 NI',
      pensionNote: pensionNote(qualifies, '£6,708 salary Lower Earnings Limit'),
      credit: { measure: 'uk-ni', amount: reachedPensionAge ? null : Number(qualifies) },
      uk: {
        personalAllowance: allowance, director: split, paymentOnAccount: payment,
        firstJanuaryBill: dividendBill + dividendLoan + payment,
      },
      assumptions: [
        `${region} rates. Company profit is before your salary, employer NI and company pension. One trading company, one shareholder, no Employment Allowance, full-year directorship and all distributable profit paid out.`,
        'Auto salary searches whole-pound tax boundaries and protects the NI year when affordable. Employer pension is the entered percentage of director salary.',
        allowanceAssumption,
      ],
    };
  }

  const employed = profile.workStatus === 'employed';
  const method = sole ? 'relief-at-source' : settings.ukPensionMethod ?? 'net-pay';
  const basePension = gross * pensionPct;
  const sacrifice = employed ? Math.min(gross, extraDeferral + (method === 'salary-sacrifice' ? basePension : 0)) : 0;
  const reliefAtSource = method === 'relief-at-source' ? basePension : 0;
  const netPayPension = method === 'net-pay' ? basePension : 0;
  const payroll = gross - sacrifice;
  const beforeAllowance = Math.max(0, payroll - netPayPension);
  const adjusted = Math.max(0, beforeAllowance + otherIncome - reliefAtSource);
  const allowance = ukAllowance(adjusted);
  const taxable = Math.max(0, beforeAllowance - allowance);
  const higherRateBands: Bands = bands.map(([ceiling, rate]) => [ceiling, Math.max(0, rate - 0.2)]);
  const reliefSlice = Math.min(taxable, reliefAtSource);
  const extraTaxRelief = taxAcrossBands(reliefSlice, higherRateBands, taxable - reliefSlice);
  const incomeTax = taxAcrossBands(taxable, bands) - extraTaxRelief;
  const social = sole
    ? (reachedPensionAge ? 0 : taxAcrossBands(gross, [[UK_ALLOWANCE, 0], [UK_UPPER_NI, 0.06], [Infinity, 0.02]]))
      + (gross < UK_SMALL_PROFITS && settings.ukVoluntaryClass2 && !reachedPensionAge ? 3.65 * 52 : 0)
    : ukEmployeeNI(payroll, reachedPensionAge);
  const loan = ukStudentLoan(sole ? gross : payroll, settings);
  const employerPension = employed ? gross * percentage(profile.employerMatchPct, 20) : 0;
  const voluntaryClass2 = sole && gross < UK_SMALL_PROFITS && settings.ukVoluntaryClass2 && !reachedPensionAge ? 3.65 * 52 : 0;
  const paidAtSource = positive(settings.ukTaxDeductedAtSource);
  const payment = sole ? computeUKPaymentOnAccount(incomeTax + social - voluntaryClass2, paidAtSource) : 0;
  const reserve = sole ? Math.max(0, incomeTax + social - paidAtSource) + loan : 0;
  const qualifies = sole ? gross >= UK_SMALL_PROFITS || Boolean(voluntaryClass2) : payroll >= UK_LEL;
  const regionNotes = scotland && reliefAtSource > 0
    ? 'Scottish relief-at-source adds the 20% provider top-up. Confirm any extra Scottish-rate relief with HMRC.'
    : '';
  const code = profile.taxCode.toUpperCase().trim();
  const withholding = employed ? ukWithholding(code, beforeAllowance, scotland) : undefined;
  const showWithholding = withholding !== undefined && Math.abs(withholding - incomeTax) > 1;
  const taperAlert = adjusted > 100_000
    ? `At £100,000–£125,140 the allowance falls £1 per £2. The marginal income-tax rate in that band is ${scotland ? '67.5%' : '60%'} on salary, before NI and loans.`
    : undefined;

  return {
    adjusted, taxable, incomeTax, social, studentLoan: loan, reserve,
    employeePension: Math.min(gross, sacrifice + netPayPension + reliefAtSource * 0.8),
    employerPension: employerPension + reliefAtSource * 0.2,
    socialLabel: sole ? 'Class 4 NI and any voluntary Class 2' : 'Class 1 National Insurance',
    pensionNote: pensionNote(qualifies, sole ? 'Class 2 small-profits or voluntary contribution test' : '£6,708 annual Lower Earnings Limit'),
    credit: { measure: 'uk-ni', amount: reachedPensionAge ? null : Number(qualifies) },
    uk: {
      personalAllowance: allowance, paymentOnAccount: payment, firstJanuaryBill: sole ? reserve + payment : 0,
      extraSacrificeTo100k: employed && adjusted > 100_000 ? adjusted - 100_000 : undefined,
      estimatedWithholdingAnnual: showWithholding ? withholding : undefined,
    },
    taxAlert: taperAlert ?? (employed && withholding === undefined
      ? 'Confirm this tax code on your payslip. The annual liability below uses the statutory allowance.'
      : showWithholding ? `Code ${code} gives a different annualised PAYE estimate. Check your coding notice and combined income.` : undefined),
    assumptions: [
      `${region} rates. ${allowanceAssumption}`,
      'NI and loans use annual equivalents. Actual deductions vary with pay periods, other jobs and loan balance.',
      ...(employed ? ['Salary exchange requires employer consent, minimum wage headroom and pension allowance. Check any effect on benefits.'] : []),
      ...(regionNotes ? [regionNotes] : []),
    ],
  };
}

function usAnnual(profile: UserProfile, gross: number, extraDeferral: number): AnnualIncome {
  const sole = profile.workStatus === 'sole-trader';
  const workplacePlan = profile.workStatus === 'employed' || profile.workStatus === 'director';
  const earnings = sole ? gross * 0.9235 : gross;
  const sev = sole ? (earnings < 400 ? 0 : 1) : 1;
  const baseFica = sev * (Math.min(earnings, 184_500) * (sole ? 0.124 : 0.062) + earnings * (sole ? 0.029 : 0.0145));
  const additionalMedicare = Math.max(0, earnings - 200_000) * 0.009;
  const pensionRequested = gross * percentage(profile.monthlyPensionPct, 40) + extraDeferral;
  const halfSeTax = sole ? baseFica / 2 : 0;
  const employeePension = workplacePlan || sole ? Math.min(pensionRequested, 24_500, Math.max(0, gross - halfSeTax)) : 0;
  const employerPension = workplacePlan ? gross * percentage(profile.employerMatchPct, 20) : 0;
  const adjusted = Math.max(0, gross - employeePension - halfSeTax);
  const beforeQbi = Math.max(0, adjusted - 16_100);
  const eligibleQbi = sole && profile.taxSettings?.usQbiEligible !== false;
  const qbi = eligibleQbi && beforeQbi <= 201_750
    ? Math.max(Math.min(adjusted, beforeQbi) * 0.2, adjusted >= 1_000 ? 400 : 0)
    : 0;
  const taxable = Math.max(0, beforeQbi - qbi);
  const incomeTax = taxAcrossBands(taxable, US_BANDS);
  const social = baseFica + additionalMedicare;
  const credits = Math.min(4, Math.floor(earnings * sev / 1_890));

  return {
    adjusted, taxable, incomeTax, social, employeePension, employerPension,
    reserve: sole ? incomeTax + social : 0,
    socialLabel: sole ? 'Self-employment tax and Medicare' : 'FICA (Social Security + Medicare)',
    credit: { measure: 'us-credits', amount: credits },
    pensionNote: `${credits} of 4 Social Security work credits at $1,890 per credit in 2026. Confirm in your SSA record.`,
    taxAlert: eligibleQbi && beforeQbi > 201_750
      ? 'Above the simple QBI threshold. Wages, property and business type can change your deduction. The estimate leaves it out.'
      : adjusted >= 153_000
        ? 'Direct Roth IRA contributions are limited from $153,000 single-filer MAGI. A conversion can trigger Form 8606 pro-rata tax across traditional, SEP and SIMPLE IRAs.'
        : undefined,
    assumptions: [
      'Single filer with the standard deduction. Federal only. State/local tax, corporate entity income, overtime and other credits are outside this estimate.',
      'Employee deferrals use the base pre-tax 401(k) or solo 401(k) limit. Catch-up contributions, employer plan limits and health benefits vary.',
      ...(eligibleQbi ? ['QBI uses the simple deduction and assumes material participation up to the filing threshold.'] : []),
    ],
  };
}

function deIncomeTax(income: number): number {
  const x = Math.floor(income);
  const y = (x - 12_348) / 10_000;
  const z = (x - 17_799) / 10_000;
  if (x <= 12_348) return 0;
  if (x <= 17_799) return Math.floor((914.51 * y + 1_400) * y);
  if (x <= 69_878) return Math.floor((173.1 * z + 2_397) * z + 1_034.87);
  if (x <= 277_825) return Math.floor(0.42 * x - 11_135.63);
  return Math.floor(0.45 * x - 19_470.38);
}

function deAnnual(profile: UserProfile, gross: number, extraDeferral: number): AnnualIncome {
  const settings = profile.taxSettings ?? {};
  const payroll = profile.workStatus === 'employed' || profile.workStatus === 'director';
  const contribution = gross * percentage(profile.monthlyPensionPct, 40);
  const employeePension = Math.min(gross, contribution + extraDeferral);
  const employerPension = payroll ? gross * percentage(profile.employerMatchPct, 20) : 0;
  const pensionCap = 101_400;
  const salaryConversion = payroll ? (settings.deUseSalaryConversion ? contribution : 0) + extraDeferral : 0;
  const taxFreeConversion = Math.min(salaryConversion, Math.max(0, pensionCap * 0.08 - employerPension));
  const niFreeConversion = Math.min(salaryConversion, Math.max(0, pensionCap * 0.04 - employerPension));
  const insuredPay = Math.max(0, gross - niFreeConversion);
  const pensionBase = Math.min(insuredPay, pensionCap);
  const healthBase = Math.min(insuredPay, 69_750);
  const supplement = percentage(settings.deHealthSupplementPct ?? 2.9, 20);
  const childCount = Math.floor(positive(settings.deChildrenUnder25));
  const hasChildren = settings.deIsParent || childCount > 0;
  const childless = profile.age >= 23 && !hasChildren ? 0.006 : 0;
  const childDiscount = Math.min(4, Math.max(0, childCount - 1)) * 0.0025;
  const nursingRate = 0.018 + (settings.deSaxony ? 0.005 : 0) + childless - childDiscount;
  const statutoryPension = payroll ? pensionBase * 0.093 : positive(settings.deSelfEmployedStatutoryPensionAnnual);
  const unemployment = payroll ? pensionBase * 0.013 : 0;
  const health = payroll ? healthBase * (0.146 + supplement) / 2 : positive(settings.deSelfEmployedCoverAnnual);
  const nursing = payroll ? healthBase * nursingRate : 0;
  const social = statutoryPension + unemployment + health + nursing;
  const adjusted = Math.max(0, gross - taxFreeConversion - statutoryPension - health * (payroll ? 0.96 : 1) - nursing);
  const taxable = Math.max(0, adjusted - (payroll ? 1_230 : 0) - 36);
  const tax = deIncomeTax(taxable);
  const solidarity = Math.min(tax * 0.055, Math.max(0, tax - 20_350) * 0.119);
  const points = (payroll ? pensionBase : Math.min(pensionCap, statutoryPension / 0.186)) / 51_944;

  return {
    adjusted, taxable, incomeTax: tax + solidarity, social, employeePension, employerPension,
    reserve: profile.workStatus === 'sole-trader' ? tax + solidarity : 0,
    socialLabel: 'Pension, health, care and unemployment',
    credit: { measure: 'de-points', amount: payroll || statutoryPension > 0 ? points : null },
    pensionNote: payroll || statutoryPension > 0
      ? `About ${points.toFixed(2)} pension points using the provisional €51,944 average wage.`
      : 'Self-employed pension membership varies. Enter statutory pension payments if they count toward your record.',
    taxAlert: payroll && /(?:^|\s)VI$/.test(profile.taxCode.trim().toUpperCase())
      ? 'Steuerklasse VI can change payroll withholding. Compare your payslip with the annual single-assessment estimate.'
      : payroll && gross > 0 && gross <= 24_000
      ? 'Mini-job and midi-job contributions can differ. Check your payslip or insurer.'
      : undefined,
    assumptions: [
      'Single assessment with basic tax allowances and solidarity surcharge. Church tax, child allowance comparisons and splitting are outside the model.',
      payroll
        ? 'Regular statutory payroll with your health fund rate. Enter parent status for care insurance. Unticked salary conversion treats the pension as a personal cash contribution.'
        : 'Enter actual deductible health, nursing and statutory pension contributions. Business trade tax and private pension relief vary.',
    ],
  };
}

function ngAnnual(profile: UserProfile, gross: number, extraDeferral: number): AnnualIncome {
  const settings = profile.taxSettings ?? {};
  const payroll = profile.workStatus === 'employed' || profile.workStatus === 'director';
  const covered = payroll && settings.ngPensionablePayPct !== 0;
  const pensionable = covered ? gross * percentage(settings.ngPensionablePayPct ?? 100) : 0;
  const voluntary = payroll ? gross * percentage(settings.ngVoluntaryPensionPct, 40) + extraDeferral : 0;
  const employeePension = Math.min(gross, pensionable * 0.08 + voluntary);
  const employerPension = pensionable * 0.1;
  const social = Math.min(gross, positive(settings.ngOtherPayrollDeductions));
  const rentRelief = Math.min(500_000, positive(settings.ngAnnualRent) * 0.2);
  const adjusted = Math.max(0, gross - employeePension - social);
  const taxable = Math.max(0, adjusted - rentRelief - positive(settings.ngOtherEligibleRelief));
  const minimumWageExemption = payroll && gross <= 840_000;
  const incomeTax = minimumWageExemption ? 0 : taxAcrossBands(taxable, NG_BANDS);
  return {
    adjusted, taxable, incomeTax, social, employeePension, employerPension,
    reserve: profile.workStatus === 'sole-trader' ? incomeTax : 0,
    socialLabel: 'Other eligible payroll deductions',
    credit: { measure: 'ng-rsa', amount: payroll ? employeePension + employerPension : null },
    pensionNote: covered
      ? 'PenCom minimum on your pensionable pay: 8% from you and 10% from your employer. Reconcile remittances with your PFA.'
      : 'A micro pension or other voluntary retirement arrangement may apply. Check coverage with your PFA.',
    assumptions: [
      '2026 Nigeria Tax Act. Enter your share of documented rent. Eligible rent reduces chargeable income by 20%, up to ₦500,000.',
      'For covered payroll, basic pay plus housing and transport allowances set the pension base. Use 0% if the statutory plan does not cover you. Enter only eligible, documented deductions.',
      'Self-employment uses net business profit. Company taxes and dividend withholding are outside this personal estimate.',
    ],
  };
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function computeIncomeBreakdown(profile: UserProfile, extraDeferralPct = 0): IncomeBreakdown {
  const grossAnnual = positive(profile.annualIncome);
  const extraDeferral = grossAnnual * percentage(extraDeferralPct, 40);
  const annual = {
    UK: ukAnnual,
    US: usAnnual,
    DE: deAnnual,
    NG: ngAnnual,
  }[profile.countryCode](profile, grossAnnual, extraDeferral);
  const monthly = (amount: number) => roundMoney(amount / 12);
  const totalTaxAnnual = annual.incomeTax + annual.social + (annual.companyTax ?? 0);
  const netAnnual = grossAnnual - totalTaxAnnual - annual.employeePension - (annual.studentLoan ?? 0)
    - (annual.uk?.director?.employerPension ?? 0);

  return {
    grossAnnual, grossMonthly: monthly(grossAnnual),
    incomeTaxMonthly: monthly(annual.incomeTax), socialSecurityMonthly: monthly(annual.social),
    pensionEmployeeMonthly: monthly(annual.employeePension), pensionEmployerMonthly: monthly(annual.employerPension),
    studentLoanMonthly: monthly(annual.studentLoan ?? 0), taxReserveMonthly: monthly(annual.reserve ?? 0),
    netTakeHomeMonthly: monthly(netAnnual), netTakeHomeAnnual: netAnnual,
    pensionAnnual: annual.employeePension + annual.employerPension,
    effectiveTaxRatePct: grossAnnual ? roundMoney(totalTaxAnnual / grossAnnual * 100) : 0,
    socialSecurityLabel: annual.socialLabel,
    statePensionNote: annual.pensionNote,
    taxYear: profile.countryCode === 'UK' ? '2026/27' : '2026',
    adjustedAnnual: annual.adjusted, taxableAnnual: annual.taxable,
    incomeTaxAnnual: annual.incomeTax, socialSecurityAnnual: annual.social,
    totalTaxAnnual, pensionCredit: annual.credit, assumptions: annual.assumptions,
    sources: SOURCES[profile.countryCode], uk: annual.uk, taxAlert: annual.taxAlert,
  };
}

export type IncomeScenario = 'sole-trader' | 'raise' | 'pension';

export function canSimulateIncomeScenario(profile: UserProfile, scenario: IncomeScenario): boolean {
  if (scenario === 'raise') return true;
  return profile.workStatus === 'employed';
}

export function compareUKBusinessStructures(profile: UserProfile) {
  return {
    director: computeIncomeBreakdown({ ...profile, countryCode: 'UK', workStatus: 'director' }),
    soleTrader: computeIncomeBreakdown({ ...profile, countryCode: 'UK', workStatus: 'sole-trader' }),
  };
}

export function monthlyFutureValue(payment: number, months: number, annualReturnPct: number): number {
  if (annualReturnPct === 0) return payment * months;
  const monthlyLog = Math.log1p(annualReturnPct / 100) / 12;
  return payment * Math.expm1(months * monthlyLog) / Math.expm1(monthlyLog);
}

export function simulateIncomeDecision(
  profile: UserProfile,
  scenario: IncomeScenario,
  annualReturnPct: number,
  investCashDeltaPct: number,
) {
  if (!canSimulateIncomeScenario(profile, scenario)) return null;
  const before = computeIncomeBreakdown(profile);
  const next = scenario === 'sole-trader'
    ? { ...profile, workStatus: 'sole-trader' as const, isBusinessOwner: true }
    : scenario === 'raise'
      ? { ...profile, annualIncome: profile.annualIncome * 1.2 }
      : profile;
  const after = computeIncomeBreakdown(next, scenario === 'pension' ? 5 : 0);
  const monthlyTakeHomeDelta = (after.netTakeHomeAnnual - before.netTakeHomeAnnual) / 12;
  const pensionDelta = (after.pensionAnnual - before.pensionAnnual) / 12;
  const creditDelta = before.pensionCredit.amount !== null && after.pensionCredit.amount !== null
    ? after.pensionCredit.amount - before.pensionCredit.amount
    : null;
  const monthlyInvestedDelta = pensionDelta + monthlyTakeHomeDelta * percentage(investCashDeltaPct);
  return {
    before, after, monthlyTakeHomeDelta: roundMoney(monthlyTakeHomeDelta), pensionDelta: roundMoney(pensionDelta), creditDelta,
    annualTaxSaved: roundMoney(before.totalTaxAnnual - after.totalTaxAnnual),
    tenYearWealthDelta: roundMoney(monthlyFutureValue(monthlyInvestedDelta, 120, Math.max(-99, Math.min(100, annualReturnPct)))),
  };
}
