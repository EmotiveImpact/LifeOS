import { useState } from 'react';
import { compareMortgageAndInvest, compareRentAndBuy } from '@life/core/housing';
import type { MortgageInvestInputs, RentBuyInputs } from '@life/core/housing';
import type { CountryCode } from '@life/core/types';
import { NumberField } from './SheetControls';
import { moneyFormatter } from './SheetControls';

type Props = { countryCode: CountryCode; darkMode: boolean };

function Rows({ rows, money }: { rows: Array<[string, number]>; money: Intl.NumberFormat }) {
  return (
    <dl className="mt-3 space-y-2 text-[13px]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-2">
          <dt className="opacity-80">{label}</dt><dd className="shrink-0 tabular-nums">{money.format(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function RentBuy({ countryCode, darkMode }: Props) {
  const sample = countryCode === 'NG' ? 220_000_000 : 300_000;
  const [inputs, setInputs] = useState<RentBuyInputs>({
    price: sample, deposit: sample * 0.2, availableCash: sample * 0.26, emergencyBuffer: sample * 0.03,
    purchaseCosts: sample * 0.02, saleCostsPct: 2, rentMonthly: sample * 0.004, ownerCostsMonthly: sample * 0.001,
    mortgageRatePct: 5, termYears: 25, years: 10, homeGrowthPct: 2, rentGrowthPct: 2, investmentReturnPct: 5,
  });
  const money = moneyFormatter(countryCode);
  const result = compareRentAndBuy(inputs);
  const field = (name: keyof RentBuyInputs, label: string, min = 0, max?: number) => (
    <NumberField key={name} label={label} darkMode={darkMode} value={inputs[name]}
      onChange={(value) => setInputs((previous) => ({ ...previous, [name]: value ?? 0 }))} min={min} max={max} />
  );

  return (
    <>
      <h3 className="font-serif-display text-[23px] leading-tight">Rent or buy</h3>
      <p className="mt-1 text-[13px] opacity-80">Replace the example with your quotes. Use the same currency for every amount.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {field('price', 'Purchase price')}
        {field('deposit', 'Deposit')}
        {field('availableCash', 'Total available cash')}
        {field('emergencyBuffer', 'Emergency cash to keep aside')}
        {field('purchaseCosts', 'Upfront taxes and fees')}
        {field('rentMonthly', 'Monthly rent')}
        {field('ownerCostsMonthly', 'Monthly repairs, taxes, cover and fees')}
        {field('mortgageRatePct', 'Mortgage rate (%)', 0, 100)}
        {field('termYears', 'Mortgage term (years)', 1, 50)}
        {field('years', 'Time you expect to stay (years)', 1, 50)}
      </div>
      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer font-medium">Growth and sale assumptions</summary>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {field('homeGrowthPct', 'Home price growth / yr (%)', -50, 100)}
          {field('rentGrowthPct', 'Rent increase / yr (%)', -50, 100)}
          {field('investmentReturnPct', 'Investment return after tax and fees (%)', -50, 100)}
          {field('saleCostsPct', 'Selling costs and taxes (% of price)', 0, 100)}
        </div>
      </details>
      {result ? (
        <div className="mt-4" aria-live="polite">
          <p className="font-serif-display text-[28px] leading-tight">
            {result.buyingAdvantage >= 0 ? 'Buying' : 'Renting'} leads by {money.format(Math.abs(result.buyingAdvantage))}
          </p>
          {result.cashShortfall > 0 && <p className="mt-1 text-[13px]">Buying at this deposit leaves you {money.format(result.cashShortfall)} short of your emergency-cash target.</p>}
          <Rows money={money} rows={[
            ['Deposit available after buffer and costs', result.maxDeposit],
            ['Deposit and purchase costs due', result.cashNeeded],
            ['First-month cost of owning', result.monthlyOwnerCost],
            ['Cash from sale after loan and fees', result.saleProceeds],
            ['Buying path wealth at sale', result.buyerWealth],
            ['Renting path wealth at the same date', result.rentingInvestments],
          ]} />
        </div>
      ) : <p className="mt-3 text-[13px]">Enter a positive price, a deposit at or below that price, and both terms.</p>}
      <p className="mt-3 text-[13px] leading-relaxed opacity-80">The renter invests the deposit and purchase costs. Each path invests any monthly savings against the other path. The model holds the loan rate and owner costs fixed and sells the home at the end.</p>
    </>
  );
}

function MortgageInvest({ countryCode, darkMode }: Props) {
  const sample = countryCode === 'NG' ? 150_000_000 : 180_000;
  const [inputs, setInputs] = useState<MortgageInvestInputs>({
    balance: sample, mortgageRatePct: 4.5, termYears: 20, extraMonthly: Math.round(sample / 600),
    overpaymentFee: 0, years: 10, investmentReturnPct: 5,
  });
  const money = moneyFormatter(countryCode);
  const result = compareMortgageAndInvest(inputs);
  const field = (name: keyof MortgageInvestInputs, label: string, min = 0, max?: number) => (
    <NumberField key={name} label={label} darkMode={darkMode} value={inputs[name]} min={min} max={max}
      onChange={(value) => setInputs((previous) => ({ ...previous, [name]: name === 'annualOverpaymentLimit' ? value : value ?? 0 }))} />
  );

  return (
    <>
      <h3 className="font-serif-display text-[23px] leading-tight">Overpay or invest{countryCode === 'UK' ? ' in an ISA' : ''}</h3>
      <p className="mt-1 text-[13px] opacity-80">Give both paths the same monthly budget. Replace the example with your loan terms.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {field('balance', 'Mortgage balance')}
        {field('mortgageRatePct', 'Mortgage rate (%)', 0, 100)}
        {field('termYears', 'Years left on mortgage', 1, 50)}
        {field('extraMonthly', 'Extra cash per month')}
        {field('annualOverpaymentLimit', 'Annual overpayment cap (if known)')}
        {field('overpaymentFee', 'One-off fee for overpaying')}
        {field('years', 'Comparison years', 1, 50)}
        {field('investmentReturnPct', 'Investment return after tax and fees (%)', -50, 100)}
      </div>
      {result ? (
        <div className="mt-4" aria-live="polite">
          <p className="font-serif-display text-[28px] leading-tight">
            {result.overpayAdvantage >= 0 ? 'Overpaying' : 'Investing'} leads by {money.format(Math.abs(result.overpayAdvantage))}
          </p>
          <Rows money={money} rows={[
            ['Scheduled mortgage payment', result.payment],
            ['Interest saved by overpaying', result.mortgageInterestSaved],
            ['Loan left after overpaying', result.overpayBalance],
            ['Loan left if you invest instead', result.investBalance],
            ['Investments if you invest instead', result.investPortfolio],
          ]} />
          {result.payoffMonth !== undefined && <p className="mt-2 text-[13px]">The mortgage is paid off by month {result.payoffMonth} on the overpayment path.</p>}
        </div>
      ) : <p className="mt-3 text-[13px]">Enter a positive loan balance and both terms.</p>}
      <p className="mt-3 text-[13px] leading-relaxed opacity-80">This holds the mortgage rate and payment fixed. Any monthly cash freed by a cap or early payoff goes into investments. Confirm the cap, fee and rate-reset date with your lender.</p>
    </>
  );
}

export function HousingDecisionTools({ calculator, darkMode, countryCode }: Props & { calculator: 'rent-buy' | 'mortgage-invest' }) {
  return (
    <section className={`mt-4 rounded-[20px] p-4 ${darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]'}`}>
      {calculator === 'rent-buy' ? <RentBuy darkMode={darkMode} countryCode={countryCode} /> : <MortgageInvest darkMode={darkMode} countryCode={countryCode} />}
    </section>
  );
}
