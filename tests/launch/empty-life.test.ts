import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { emptyLife, emptyProfile } from '../../apps/mobile/src/state/empty';

/**
 * Fix F-01: a real account starts with an empty life. Release builds (no `EXPO_PUBLIC_SAMPLE_DATA`, no `__DEV__`) never
 * start with Ama's profile, Aim, records, people, habits, memories or body numbers, and the screens whose figures are
 * only the sample life's show a day-one state instead.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('the starting life', () => {
  test('a real account starts with nothing of anyone else’s', () => {
    const life = emptyLife();
    expect(life.aim).toBeNull();
    for (const list of [life.records, life.proposals, life.people, life.habits, life.memories, life.pulseLog, life.meal]) expect(list).toEqual([]);
    expect([life.weightKg, life.heightCm, life.waistCm]).toEqual([0, 0, 0]);
    expect(life.knowledge.overall).toBe(0);
    expect(Object.values(life.knowledge.areas).every(v => v === 0)).toBe(true);
    expect(life.selectedMission).toBe('');
    const json = JSON.stringify(life);
    for (const sample of ['Ama', 'Noa', 'Kofi', 'Efua', 'South London', 'Guy’s', 'Adobe', 'Netflix', 'uk-hmrc-tax-code', 'Lifetime ISA']) expect({ sample, found: json.includes(sample) }).toEqual({ sample, found: false });
  });

  test('the empty profile asks the engine for nothing on a stranger’s behalf', () => {
    expect({ name: emptyProfile.name, age: emptyProfile.age, city: emptyProfile.city, income: emptyProfile.annualIncome }).toEqual({ name: '', age: 0, city: '', income: 0 });
    expect([emptyProfile.needsTaxOrDebtFix, emptyProfile.needsCashRunway, emptyProfile.overdueRoutineCare, emptyProfile.hasPendingHospitalReferral, emptyProfile.isBusinessOwner]).toEqual([false, false, false, false, false]);
    expect(emptyProfile.subscriptions).toEqual([]);
    expect(emptyProfile.health).toBeUndefined();
  });

  test('the app starts from the empty life unless the sample is switched on, and erasing goes back to it', () => {
    const provider = read('apps/mobile/src/state/SeedProvider.tsx');
    expect(provider).toContain('...(SHOW_SAMPLES ? sampleLife : emptyLife()),');
    expect(provider).toContain('const next = { ...initial, onboardingDone: false };');
    expect(read('apps/mobile/src/state/sample.ts')).toContain("export const SHOW_SAMPLES = flag === '1' || (flag !== '0' && typeof __DEV__ !== 'undefined' && __DEV__);");
  });

  test('store builds never carry the sample; review builds do', () => {
    const build = JSON.parse(read('apps/mobile/eas.json')).build;
    expect(build.production.env.EXPO_PUBLIC_SAMPLE_DATA).toBe('0');
    expect(build.preview.env.EXPO_PUBLIC_SAMPLE_DATA).toBe('1');
    expect(build.e2e.env.EXPO_PUBLIC_SAMPLE_DATA).toBe('1');
  });
});

describe('screens made only of sample figures', () => {
  // Each opens its day-one state, or its real variant, when the sample is off.
  const gated: [string, string][] = [
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <MoneySampleV26 /> : <MoneyNotYetV26 screen="money" title="Money" />;'],
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <AreaMoneySampleV26 /> : <MoneyNotYetV26 screen="area" />;'],
    ['apps/mobile/src/screens/v26/plan.tsx', 'if (!SHOW_SAMPLES) return <NotYetV26 screen="areahome"'],
    ['apps/mobile/src/screens/v26/plan.tsx', '<NotYetV26 screen="areahealth"'],
    ['apps/mobile/src/screens/v26/plan.tsx', 'if (!SHOW_SAMPLES) return <NotYetV26 screen="areawork"'],
    ['apps/mobile/src/screens/v26/plan.tsx', "const isTax = SHOW_SAMPLES && task.id === 'uk-hmrc-tax-code'"],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'if (!SHOW_SAMPLES) return <NotYetV26 screen="taxcheck"'],
    ['apps/mobile/src/screens/v26/today.tsx', 'return SHOW_SAMPLES ? <InboxSampleV26 /> : <InboxRealV26 />;'],
    ['apps/mobile/src/screens/v26/today.tsx', 'return SHOW_SAMPLES ? <RoutinesSampleV26 /> : <RoutinesRealV26 />;'],
    ['apps/mobile/src/screens/v26/kit.tsx', "unread: SHOW_SAMPLES && !data.flags['inbox-read']"],
    ['apps/mobile/src/state/loops.ts', "if (SHOW_SAMPLES && taskId === 'uk-hmrc-tax-code') return"],
    ['apps/mobile/src/state/firstopen.ts', 'if (SHOW_SAMPLES) return shareWeek;'],
    ['apps/mobile/src/screens/v26/people.tsx', "useState(params.state === 'type' || !SHOW_SAMPLES)"],
    ['apps/mobile/src/screens/v26/aim.tsx', '{SHOW_SAMPLES ? <View style={{ flexDirection: \'row\', marginTop: space.sm }}>'],
    ['apps/mobile/src/screens/v26/self.tsx', 'const b = SHOW_SAMPLES ? seed.body : null;'],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'if (!SHOW_SAMPLES) return <NotYetV26 screen="cashplan"'],
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <BudgetSampleV26 /> : <MoneyNotYetV26 screen="budget"'],
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <NetWorthSampleV26 /> : <MoneyNotYetV26 screen="networth"'],
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <TxnSampleV26 /> : <MoneyNotYetV26 screen="txn"'],
    ['apps/mobile/src/screens/v26/money.tsx', 'return SHOW_SAMPLES ? <BillSampleV26 /> : <MoneyNotYetV26 screen="bill"'],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'return SHOW_SAMPLES ? <RentbuySampleV26 /> : <HomeNotYet screen="rentbuy"'],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'return SHOW_SAMPLES ? <BedroomsSampleV26 /> : <HomeNotYet screen="bedrooms"'],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'return SHOW_SAMPLES ? <BufferSampleV26 /> : <MoneyNotYetV26 screen="buffer"'],
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'return SHOW_SAMPLES ? <BloodSampleV26 /> : <NotYetV26 screen="blood"'],
    // Past day one: Plan, the Aim, Fuel and quick log read the account's own records, meals and weigh-ins.
    ['apps/mobile/src/screens/v26/plan.tsx', 'return SHOW_SAMPLES ? <PlanSampleV26 /> : <PlanRealV26 />;'],
    ['apps/mobile/src/screens/v26/plan.tsx', "const waitingIds = SHOW_SAMPLES ? ['uk-single-person-council', 'nhs-outpatient-referral'] : [];"],
    ['apps/mobile/src/screens/v26/aim.tsx', "<Eyebrow onPhoto>{SHOW_SAMPLES ? `Chief Aim · ${p}% there` : 'Chief Aim'}</Eyebrow>"],
    ['apps/mobile/src/screens/v26/aim.tsx', 'return SHOW_SAMPLES ? <GambitSampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/aim.tsx', 'return SHOW_SAMPLES ? <GlimpseSampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'return SHOW_SAMPLES ? <FuelprogressSampleV26 /> : <FuelprogressRealV26 />;'],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'return SHOW_SAMPLES ? <WeekbudgetSampleV26 /> : <WeekbudgetRealV26 />;'],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'return SHOW_SAMPLES ? <MealtimingSampleV26 /> : <MealtimingRealV26 />;'],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'return SHOW_SAMPLES ? <FoodqualitySampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'const days = SHOW_SAMPLES ? weightDays.slice(-14).map(d => r1(d.day + offset)) : real.map(w => w.kg)'],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', 'choose(`weight-${dayKey()}`, String(kg))'],
    ['apps/mobile/src/screens/v26/fuelmore.tsx', "(SHOW_SAMPLES ? 'Halal' : 'High-protein')"],
    ['apps/mobile/src/screens/v26/fuel.tsx', 'const recent: { name: string; brand?: string; kcal: number; items?: MealItem[] }[] = SHOW_SAMPLES ? quick.small'],
    ['apps/mobile/src/screens/v26/talk.tsx', 'return SHOW_SAMPLES ? <EditFiledSampleV26 /> : ('],
    ['apps/mobile/src/state/you.ts', "SHOW_SAMPLES ? 'Bedtime 22:45' : 'A fixed bedtime'"],
    // Onboarding: every new account passes these, so none of them may carry the sample's rebate, payslip or first home.
    ['apps/mobile/src/state/firstopen.ts', 'const owed = (SHOW_SAMPLES ? seedTaxClaim.refund : tax?.estimatedValueAmount ?? 0)'],
    ['apps/mobile/src/state/firstopen.ts', "sub: SHOW_SAMPLES ? 'Cardiology · Guy’s' : profile.referralSpecialty || 'Your referral'"],
    ['apps/mobile/src/screens/v26/firstopen.tsx', "{SHOW_SAMPLES ? 'Your monthly costs' : 'Your answers'}"],
    ['apps/mobile/src/screens/v26/firstopen.tsx', "'{Find money you’re owed.} Tax rebates, refunds and schemes people often {miss}.'"],
    ['apps/mobile/src/screens/v26/firstopen.tsx', "'You’ve got 20 free minutes. Your first move fits.'"],
    ['apps/mobile/src/screens/v26/you.tsx', "title={SHOW_SAMPLES ? season.toward : data.aim?.what"],
    ['apps/mobile/src/screens/v26/grow.tsx', "line: SHOW_SAMPLES ? m.line.replace('DEPOSIT', String(pct))"],
    // Tools and self-knowledge a real account reaches as it levels up.
    ['apps/mobile/src/screens/v26/toolkit.tsx', 'return SHOW_SAMPLES ? <HealthstackSampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/toolkit.tsx', "'{Your growth path.} A weekly check-in, and lessons for earning more.'"],
    ['apps/mobile/src/screens/v26/learn.tsx', 'return SHOW_SAMPLES ? <LensaskSampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/self.tsx', 'return SHOW_SAMPLES ? <ChronotypeSampleV26 /> : ('],
    ['apps/mobile/src/screens/v26/self.tsx', "'Five to start from · put them in your order'"],
    ['apps/mobile/src/screens/v26/money.tsx', "'{Nothing here yet.} Your documents and renewals, with their dates.'"],
    ['apps/mobile/src/screens/v26/money.tsx', '<Display s="{Nothing here yet.} Subscriptions you tell Life about show here, with what each costs." />'],
  ];
  test.each(gated)('%s: %s', (file, line) => {
    expect(read(file)).toContain(line);
  });

  test('weigh-ins are kept one a day and read back oldest first', () => {
    const fuel = read('apps/mobile/src/state/fuel.ts');
    // Weight writes `weight-YYYY-MM-DD`; progress and the weigh-in chart read the same keys back.
    expect(fuel).toContain(".filter(([k]) => /^weight-\\d{4}-\\d{2}-\\d{2}$/.test(k))");
    expect(fuel).toContain('.sort((a, b) => a.day.localeCompare(b.day));');
  });

  test('onboarding keeps its first answer in choices, so an empty profile shows "Select"', () => {
    const firstopen = read('apps/mobile/src/screens/v26/firstopen.tsx');
    expect(firstopen).toContain("const dest = DESTINATIONS.find(x => x.value === data.choices['setup-want']);");
    // Body numbers start at 0: the steppers start from a typical figure and only height and weight are kept on Continue.
    expect(firstopen).toContain("if (!given(active) && active !== 's') change(active, now.value);");
  });
});
