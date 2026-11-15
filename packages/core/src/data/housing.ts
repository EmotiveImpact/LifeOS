export interface RentBuyInputs {
  price: number;
  deposit: number;
  availableCash: number;
  emergencyBuffer: number;
  purchaseCosts: number;
  saleCostsPct: number;
  rentMonthly: number;
  ownerCostsMonthly: number;
  mortgageRatePct: number;
  termYears: number;
  years: number;
  homeGrowthPct: number;
  rentGrowthPct: number;
  investmentReturnPct: number;
}

export interface MortgageInvestInputs {
  balance: number;
  mortgageRatePct: number;
  termYears: number;
  extraMonthly: number;
  annualOverpaymentLimit?: number;
  overpaymentFee: number;
  years: number;
  investmentReturnPct: number;
}

function compoundMonthly(annualPct: number): number {
  return Math.expm1(Math.log1p(annualPct / 100) / 12);
}

export function mortgagePayment(principal: number, annualPct: number, months: number): number {
  if (principal <= 0) return 0;
  const rate = annualPct / 1_200;
  return rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
}

export function compareRentAndBuy(inputs: RentBuyInputs) {
  const { price, deposit, availableCash, emergencyBuffer, purchaseCosts, saleCostsPct, rentMonthly, ownerCostsMonthly,
    mortgageRatePct, termYears, years, homeGrowthPct, rentGrowthPct, investmentReturnPct } = inputs;
  if (price <= 0 || deposit < 0 || deposit > price || termYears < 1 || years < 1) return null;

  const months = Math.round(years * 12);
  const mortgageRate = mortgageRatePct / 1_200;
  const investmentRate = compoundMonthly(investmentReturnPct);
  const payment = mortgagePayment(price - deposit, mortgageRatePct, Math.round(termYears * 12));
  const cashNeeded = deposit + purchaseCosts;
  const maxDeposit = Math.max(0, availableCash - emergencyBuffer - purchaseCosts);
  const cashShortfall = Math.max(0, cashNeeded + emergencyBuffer - availableCash);

  let balance = price - deposit;
  let rentingInvestments = cashNeeded;
  let buyingInvestments = 0;
  let interestPaid = 0;

  for (let month = 0; month < months; month += 1) {
    const interest = balance * mortgageRate;
    const paid = Math.min(payment, balance + interest);
    balance = Math.max(0, balance + interest - paid);
    interestPaid += interest;
    const rent = rentMonthly * (1 + rentGrowthPct / 100) ** Math.floor(month / 12);
    const difference = paid + ownerCostsMonthly - rent;
    rentingInvestments = rentingInvestments * (1 + investmentRate) + Math.max(0, difference);
    buyingInvestments = buyingInvestments * (1 + investmentRate) + Math.max(0, -difference);
  }

  const homeValue = price * (1 + homeGrowthPct / 100) ** years;
  const saleProceeds = homeValue * (1 - saleCostsPct / 100) - balance;
  const buyerWealth = saleProceeds + buyingInvestments;
  return {
    payment, cashNeeded, maxDeposit, cashShortfall, balance, interestPaid, saleProceeds, rentingInvestments,
    buyerWealth, monthlyOwnerCost: payment + ownerCostsMonthly, buyingAdvantage: buyerWealth - rentingInvestments,
  };
}

export function compareMortgageAndInvest(inputs: MortgageInvestInputs) {
  const { balance, mortgageRatePct, termYears, extraMonthly, annualOverpaymentLimit,
    overpaymentFee, years, investmentReturnPct } = inputs;
  if (balance <= 0 || termYears < 1 || years < 1) return null;

  const months = Math.round(years * 12);
  const rate = mortgageRatePct / 1_200;
  const returns = compoundMonthly(investmentReturnPct);
  const payment = mortgagePayment(balance, mortgageRatePct, Math.round(termYears * 12));
  let overpayBalance = balance;
  let investBalance = balance;
  let investPortfolio = 0;
  let overpayPortfolio = 0;
  let unusedAllowance = Infinity;
  let mortgageInterestSaved = 0;
  let payoffMonth: number | undefined;
  let usedOverpayments = false;

  for (let month = 0; month < months; month += 1) {
    if (month % 12 === 0) unusedAllowance = annualOverpaymentLimit ?? Infinity;
    const overpayInterest = overpayBalance * rate;
    const investInterest = investBalance * rate;
    const regularOverpayPayment = Math.min(overpayBalance + overpayInterest, payment);
    const regularInvestPayment = Math.min(investBalance + investInterest, payment);
    const extra = Math.min(extraMonthly, unusedAllowance, Math.max(0, overpayBalance + overpayInterest - regularOverpayPayment));
    unusedAllowance -= extra;
    usedOverpayments ||= extra > 0;
    overpayBalance = Math.max(0, overpayBalance + overpayInterest - regularOverpayPayment - extra);
    investBalance = Math.max(0, investBalance + investInterest - regularInvestPayment);
    if (overpayBalance < 0.005 && payoffMonth === undefined) payoffMonth = month + 1;
    mortgageInterestSaved += investInterest - overpayInterest;
    investPortfolio = investPortfolio * (1 + returns) + payment + extraMonthly - regularInvestPayment;
    overpayPortfolio = overpayPortfolio * (1 + returns) + payment + extraMonthly - regularOverpayPayment - extra;
  }

  if (usedOverpayments) investPortfolio += overpaymentFee * (1 + returns) ** months;
  const investmentNet = investPortfolio - investBalance;
  const overpaymentNet = overpayPortfolio - overpayBalance;
  return {
    payment, investBalance, overpayBalance, investPortfolio, overpayPortfolio, mortgageInterestSaved,
    overpayAdvantage: overpaymentNet - investmentNet, payoffMonth,
  };
}
