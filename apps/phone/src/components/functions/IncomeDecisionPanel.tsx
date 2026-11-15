import { canSimulateIncomeScenario, compareUKBusinessStructures, simulateIncomeDecision } from '@life/core/finance';
import type { IncomeScenario } from '@life/core/finance';
import type { IncomeBreakdown, PensionCredit, TaxSettings, UKPensionMethod, UKStudentLoanPlan, UserProfile } from '@life/core/types';
import { fieldSurface, moneyFormatter, NumberField } from './SheetControls';
import { useState } from 'react';

type PanelProps = { profile: UserProfile; darkMode: boolean; breakdown: IncomeBreakdown };

function creditLabel(credit: PensionCredit, formatter: Intl.NumberFormat): string {
  const { amount } = credit;
  if (amount === null) return 'Check your record';
  if (credit.measure === 'uk-ni') return amount === 1 ? '1 NI year indicated' : 'No NI year indicated';
  if (credit.measure === 'us-credits') return `${amount} of 4 credits`;
  if (credit.measure === 'de-points') return `${amount.toFixed(2)} pension points`;
  return `${formatter.format(amount)} into RSA / yr`;
}

function creditChange(measure: PensionCredit['measure'], delta: number, formatter: Intl.NumberFormat): string {
  const units = {
    'uk-ni': Math.abs(delta) === 1 ? 'NI qualifying year' : 'NI qualifying years',
    'us-credits': Math.abs(delta) === 1 ? 'Social Security credit' : 'Social Security credits',
    'de-points': 'pension points',
    'ng-rsa': 'in annual RSA contributions',
  };
  const amount = measure === 'ng-rsa' ? formatter.format(delta) : new Intl.NumberFormat('en', { maximumFractionDigits: 3 }).format(delta);
  return `${delta > 0 ? '+' : ''}${amount} ${units[measure]}`;
}

export function TaxSettingsFields({ profile, darkMode, onChange }: {
  profile: UserProfile;
  darkMode: boolean;
  onChange: (patch: TaxSettings) => void;
}) {
  const settings = profile.taxSettings ?? {};
  const field = fieldSurface(darkMode);
  const sole = profile.workStatus === 'sole-trader';
  const employed = profile.workStatus === 'employed';
  const director = profile.workStatus === 'director';
  const hasChildrenUnder25 = (settings.deChildrenUnder25 ?? 0) >= 1;
  const toggle = (key: 'ukPostgraduateLoan' | 'ukVoluntaryClass2' | 'ukStatePensionAgeReached' | 'deSaxony' | 'deUseSalaryConversion', label: string) => (
    <label className="flex items-start gap-2 text-[13px] leading-snug">
      <input type="checkbox" checked={settings[key] ?? false} onChange={(event) => onChange({ [key]: event.currentTarget.checked })} className="mt-0.5 accent-[#2347D8]" />
      {label}
    </label>
  );
  const amount = (key: {
    [K in keyof TaxSettings]-?: NonNullable<TaxSettings[K]> extends number ? K : never;
  }[keyof TaxSettings], label: string, defaultValue?: number, max?: number) => (
    <NumberField label={label} darkMode={darkMode} value={settings[key] ?? defaultValue} max={max} onChange={(value) => onChange({ [key]: value })} />
  );

  return (
    <details className={`rounded-[20px] p-4 ${darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]'}`}>
      <summary className="cursor-pointer text-[14px] font-semibold">Tax assumptions and deductions</summary>
      <div className="mt-3 space-y-3">
        {profile.countryCode === 'UK' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[13px]">
                Tax region
                <select value={settings.ukRegion ?? (/^S(?:\d|BR|D|K|NT)/i.test(profile.taxCode.trim()) ? 'scotland' : 'rest-of-uk')} className={field}
                  onChange={(event) => onChange({ ukRegion: event.currentTarget.value === 'scotland' ? 'scotland' : 'rest-of-uk' })}>
                  <option value="rest-of-uk">England, Wales, N. Ireland</option>
                  <option value="scotland">Scotland</option>
                </select>
              </label>
              <label className="text-[13px]">
                Student loan
                <select value={settings.ukStudentLoan ?? ''} className={field}
                  onChange={(event) => onChange({ ukStudentLoan: (event.currentTarget.value || undefined) as UKStudentLoanPlan | undefined })}>
                  <option value="">None</option>
                  <option value="plan-1">Plan 1</option><option value="plan-2">Plan 2</option>
                  <option value="plan-4">Plan 4</option><option value="plan-5">Plan 5</option>
                </select>
              </label>
            </div>
            {toggle('ukPostgraduateLoan', 'Repaying a postgraduate loan')}
            {employed && (
              <label className="block text-[13px]">
                Workplace pension method
                <select value={settings.ukPensionMethod ?? 'net-pay'} className={field}
                  onChange={(event) => onChange({ ukPensionMethod: event.currentTarget.value as UKPensionMethod })}>
                  <option value="net-pay">Net pay (before income tax)</option>
                  <option value="salary-sacrifice">Salary sacrifice</option>
                  <option value="relief-at-source">Relief at source (provider top-up)</option>
                </select>
              </label>
            )}
            {director && amount('ukDirectorSalary', 'Director salary (£). Leave blank for automatic comparison.')}
            {amount('ukOtherAdjustedIncome', 'Other adjusted income (£/yr, for the allowance taper)')}
            {(sole || director) && amount('ukTaxDeductedAtSource', 'Tax already collected on assessed income (£/yr)')}
            {sole && toggle('ukVoluntaryClass2', 'Count voluntary Class 2 below the small profits threshold')}
            {toggle('ukStatePensionAgeReached', 'Reached State Pension age before the tax year')}
          </>
        )}
        {profile.countryCode === 'US' && (
          <>
            <p className="text-[13px]">Single filer with the standard deduction and federal payroll taxes. Use annual W-2 pay or net Schedule C profit.</p>
            {sole && (
              <label className="flex items-start gap-2 text-[13px]">
                <input type="checkbox" checked={settings.usQbiEligible !== false} onChange={(event) => onChange({ usQbiEligible: event.currentTarget.checked })} className="mt-0.5 accent-[#2347D8]" />
                Include simple qualified business income deduction when eligible
              </label>
            )}
            <p className="text-[13px] opacity-80">If MAGI limits direct Roth contributions, check the tax on a backdoor Roth conversion. Form 8606 combines your traditional, SEP and SIMPLE IRA balances for the pro-rata calculation.</p>
          </>
        )}
        {profile.countryCode === 'DE' && (
          <>
            {sole ? (
              <div className="grid grid-cols-2 gap-3">
                {amount('deSelfEmployedCoverAnnual', 'Deductible health and care cover (€/yr)')}
                {amount('deSelfEmployedStatutoryPensionAnnual', 'Statutory pension paid (€/yr)')}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {amount('deHealthSupplementPct', 'Health fund supplement (%)', 2.9, 20)}
                  {amount('deChildrenUnder25', 'Children under 25', 0, 10)}
                </div>
                <label className="flex items-start gap-2 text-[13px]">
                  <input type="checkbox" checked={Boolean(settings.deIsParent || hasChildrenUnder25)} disabled={hasChildrenUnder25}
                    onChange={(event) => onChange({ deIsParent: event.currentTarget.checked })} className="mt-0.5 accent-[#2347D8]" />
                  Parent for care insurance purposes
                </label>
                {toggle('deSaxony', 'Work in Saxony')}
                {toggle('deUseSalaryConversion', 'Use occupational salary conversion (Entgeltumwandlung)')}
              </>
            )}
          </>
        )}
        {profile.countryCode === 'NG' && (
          <div className="grid grid-cols-2 gap-3">
            {(employed || director) && (
              <>
                {amount('ngPensionablePayPct', 'PenCom pensionable share of gross (%)', 100, 100)}
                {amount('ngVoluntaryPensionPct', 'Additional eligible pension (%)', 0, 40)}
              </>
            )}
            {amount('ngAnnualRent', 'Your documented rent (₦/yr)')}
            {amount('ngOtherPayrollDeductions', 'Eligible NHF / NHIS payments (₦/yr)')}
            {amount('ngOtherEligibleRelief', 'Other documented tax relief (₦/yr)')}
          </div>
        )}
      </div>
    </details>
  );
}

function IncomeSources({ breakdown }: { breakdown: IncomeBreakdown }) {
  return (
    <details className="text-[13px] leading-relaxed">
      <summary className="cursor-pointer font-medium">Assumptions and official sources</summary>
      <ul className="mt-2 list-disc space-y-1 pl-4 opacity-80">
        {breakdown.assumptions.map((note) => <li key={note}>{note}</li>)}
      </ul>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {breakdown.sources.map((source) => (
          <li key={source.url}><a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>
        ))}
      </ul>
    </details>
  );
}

export function IncomeDetails({ profile, darkMode, breakdown }: PanelProps) {
  const format = moneyFormatter(profile.countryCode);
  const money = (value: number) => format.format(value);
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const uk = breakdown.uk;
  const director = uk?.director;
  const business = profile.countryCode === 'UK' && (profile.workStatus === 'director' || profile.workStatus === 'sole-trader');
  const structures = business ? compareUKBusinessStructures(profile) : undefined;
  const details: Array<[string, number]> = [
    ['Gross before deductions', breakdown.grossMonthly],
    ['Income tax', breakdown.incomeTaxMonthly],
    [breakdown.socialSecurityLabel, breakdown.socialSecurityMonthly],
    ['Pension from your pay', breakdown.pensionEmployeeMonthly],
    ['Employer pension and provider relief', breakdown.pensionEmployerMonthly],
  ];
  if (breakdown.studentLoanMonthly > 0) details.push(['Student and postgraduate loans', breakdown.studentLoanMonthly]);
  if (director) details.push(['Company tax and employer NI', (director.corporationTax + director.employerNI) / 12]);
  if (breakdown.taxReserveMonthly > 0) details.push(['Monthly reserve for upcoming bills', breakdown.taxReserveMonthly]);

  return (
    <>
      <section className={`rounded-[22px] p-4 ${card}`}>
        <p className="text-[13px] opacity-75">Estimated monthly take-home · {breakdown.taxYear}</p>
        <p className="mt-1 font-serif-display text-[36px] leading-none tabular-nums">{money(breakdown.netTakeHomeMonthly)}</p>
        <dl className="mt-4 space-y-2 text-[13px]">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="opacity-75">{label}</dt><dd className="shrink-0 font-medium tabular-nums">{money(value)}</dd>
            </div>
          ))}
          {uk && <div className="flex justify-between gap-3"><dt className="opacity-75">Personal Allowance / yr</dt><dd>{money(uk.personalAllowance)}</dd></div>}
        </dl>
        <p className="mt-3 text-[13px] leading-relaxed">{breakdown.statePensionNote}</p>
        {breakdown.taxAlert && <p className="mt-2 text-[13px] leading-relaxed">{breakdown.taxAlert}</p>}
        {uk?.extraSacrificeTo100k !== undefined && (
          <p className="mt-2 text-[13px] leading-relaxed">
            To bring adjusted net income to £100,000, an extra <strong>{money(uk.extraSacrificeTo100k)} a year</strong> ({money(uk.extraSacrificeTo100k / 12)}/mo)
            {' '}would need to go into salary sacrifice. Check available pay and pension limits with payroll.
          </p>
        )}
        {uk?.estimatedWithholdingAnnual !== undefined && (
          <p className="mt-2 text-[13px] leading-relaxed">
            Annualised PAYE from this code is {money(uk.estimatedWithholdingAnnual)}. Estimated annual income tax is {money(breakdown.incomeTaxAnnual)}.
          </p>
        )}
      </section>
      {structures && (
        <section className={`rounded-[22px] p-4 text-[13px] ${card}`}>
          <h3 className="font-serif-display text-[23px]">Same profit, two ways to get paid</h3>
          <p className="mt-1 opacity-75">Enter profit after business expenses. Both routes use that same starting amount.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold">Limited company</p>
              <p className="mt-0.5 text-[15px] tabular-nums">{money(structures.director.netTakeHomeMonthly)}/mo</p>
              <p className="mt-1 opacity-75">{money(structures.director.uk?.director?.salary ?? 0)} salary + {money(structures.director.uk?.director?.dividends ?? 0)} dividends / yr</p>
            </div>
            <div>
              <p className="font-semibold">Sole trader</p>
              <p className="mt-0.5 text-[15px] tabular-nums">{money(structures.soleTrader.netTakeHomeMonthly)}/mo</p>
              <p className="mt-1 opacity-75">{money(structures.soleTrader.socialSecurityAnnual)} National Insurance / yr</p>
            </div>
          </div>
          {uk && uk.paymentOnAccount > 0 && (
            <p className="mt-3 leading-relaxed">
              There may be two payments on account of <strong>{money(uk.paymentOnAccount)} each</strong>.
              If this is your first January bill, plan for about {money(uk.firstJanuaryBill)} in personal tax, loans and the first advance payment.
            </p>
          )}
          <p className="mt-2 opacity-75">Company compliance costs, retained profits and any client employment-status rules can change the decision.</p>
        </section>
      )}
      <IncomeSources breakdown={breakdown} />
    </>
  );
}

export function IncomeWhatIf({ profile, darkMode }: Pick<PanelProps, 'profile' | 'darkMode'>) {
  const [scenario, setScenario] = useState<IncomeScenario>('raise');
  const [growth, setGrowth] = useState<number | undefined>(5);
  const [investPct, setInvestPct] = useState<number | undefined>(100);
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const muted = darkMode ? 'text-white/70' : 'text-[#5A5A60]';
  const format = moneyFormatter(profile.countryCode);
  const signed = (amount: number) => `${amount > 0 ? '+' : ''}${format.format(amount)}`;
  const pensionName = {
    UK: 'Salary-sacrifice an extra 5% into pension',
    US: 'Defer an extra 5% to a pre-tax 401(k)',
    DE: 'Convert an extra 5% to an occupational pension',
    NG: 'Contribute an extra 5% to your pension',
  }[profile.countryCode];
  const options: Array<[IncomeScenario, string]> = [
    ['raise', profile.workStatus === 'employed' ? 'Raise salary by 20%' : 'Raise income by 20%'],
    ['sole-trader', 'Switch from employed to sole trader'],
    ['pension', pensionName],
  ];
  const result = simulateIncomeDecision(profile, scenario, growth ?? 0, investPct ?? 0);

  return (
    <div className="mt-4 space-y-3">
      <label className={`block rounded-[20px] p-4 text-[13px] ${card}`}>
        Change to compare
        <select className={fieldSurface(darkMode)} value={scenario} onChange={(event) => setScenario(event.currentTarget.value as IncomeScenario)}>
          {options.map(([key, label]) => <option key={key} value={key} disabled={!canSimulateIncomeScenario(profile, key)}>{label}</option>)}
        </select>
      </label>
      {profile.workStatus !== 'employed' && <p className={`text-[13px] ${muted}`}>Choose Employed in Work &amp; tax to compare a switch or payroll pension change.</p>}
      {result && (
        <>
          <section className={`rounded-[22px] p-4 ${card}`} aria-live="polite">
            <p className={`text-[13px] ${muted}`}>Monthly take-home change</p>
            <p className="mt-1 font-serif-display text-[38px] leading-none tabular-nums">{signed(result.monthlyTakeHomeDelta)}</p>
            <p className={`mt-1 text-[13px] ${muted}`}>{format.format(result.before.netTakeHomeMonthly)} now · {format.format(result.after.netTakeHomeMonthly)} in scenario</p>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex justify-between gap-2"><dt>Tax and social contributions saved / yr</dt><dd className="font-semibold tabular-nums">{signed(result.annualTaxSaved)}</dd></div>
              <div className="flex justify-between gap-2"><dt>Pension added / mo</dt><dd className="font-semibold tabular-nums">{signed(result.pensionDelta)}</dd></div>
              <div>
                <dt>Pension credits or account flows</dt>
                <dd className={`mt-1 ${muted}`}>
                  {creditLabel(result.before.pensionCredit, format)} now · {creditLabel(result.after.pensionCredit, format)} in scenario
                  {result.creditDelta !== null && <span className="mt-1 block font-semibold">Change of {creditChange(result.after.pensionCredit.measure, result.creditDelta, format)}</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-2"><dt>10-year wealth difference</dt><dd className="font-semibold tabular-nums">{signed(result.tenYearWealthDelta)}</dd></div>
            </dl>
          </section>
          <div className={`rounded-[20px] p-4 ${card}`}>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Annual return (%)" darkMode={darkMode} value={growth} onChange={setGrowth} min={-50} max={50} />
              <NumberField label="Take-home difference invested (%)" darkMode={darkMode} value={investPct} onChange={setInvestPct} max={100} />
            </div>
            <p className={`mt-2 text-[13px] leading-relaxed ${muted}`}>The projection compounds the change in monthly cash you invest plus the change in pension contributions. It holds current tax rules, income and returns fixed and values pensions before withdrawal tax.</p>
            {scenario === 'sole-trader' && <p className={`mt-2 text-[13px] ${muted}`}>This uses the same annual amount as business profit after expenses. Factor in paid leave, benefits, overhead, insurance and gaps between projects.</p>}
          </div>
          <IncomeSources breakdown={result.after} />
        </>
      )}
    </div>
  );
}
