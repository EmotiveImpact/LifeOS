/**
 * The toolkit, restyled to the V26 board (`talk-toolkit.js`, `core.js` cashplan). Every figure comes from `packages/core`
 * (business structures, rent vs buy, protection, lab guides) or the seed; choices save on this phone.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { compareUKBusinessStructures } from '@life/core/finance';
import { compareRentAndBuy } from '@life/core/housing';
import { getProtectionChecklist, interpretLabResult, LAB_GUIDES } from '@life/core/engine';
import type { LabMarkerId, LabResult } from '@life/core/types';
import {
  CapsulePairs, CheckRows, CompactStepper, DotGrid, Field, FilterChips, Icon, IconWell, KeyValue, LifeSays, PhotoCard, PhotoGrid, Ruler, SectionHead, SliderV26,
  PhotoFill, StatusPill, Text, TileGrid, TintCard, cardShadow, feedback, fonts, photoScrims, photos, radius, space, useTokens, type DotCell,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { money, moneyCompact, rentBuyInputs, seed, seedLabResults, seedTaxClaim } from '@/state/seed';
import { bloodTiles, bufferMonths, cashWeeks, niYears, TOOLS } from '@/state/plan';
import { BigPhoto, Between, Body, Box, Btn, Callout, Chip, Cols, Display, Eyebrow, Figure, Hero, Legend, Micro, Page, PeekStack, PhotoTile, Row, RowsCard, Shelf, Statement, Tick } from './kit';
import { useOpenTool } from './plan';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const info = (label: string, onPress: () => void) => ({ kind: 'icon' as const, icon: 'info' as const, label, onPress });

function useShow() {
  const { data } = useSeed();
  const hidden = !!data.prefs.hideBalances;
  return (n: number, decimals = 0) => hidden ? '£••••' : money(n, decimals);
}

/** A tool is open at its level, or once you've opened it early. */
function useToolState() {
  const { data, engine } = useSeed();
  const open = (key: ScreenKey, level: number) => level <= engine.level.currentLevel || !!data.flags[`unlocked-${key}`];
  return { open, level: engine.level.currentLevel };
}

/* ───────────────────────── 30-day cash plan ───────────────────────── */

export function CashplanV26() {
  const t = useTokens(), { data, set, choose, flag } = useSeed(), show = useShow();
  const cp = seed.finance.cashplan;
  const [coming, setComing] = useState(Number(data.choices['cashplan-income'] ?? cp.comingIn));
  const essentials = cp.essentialBills, tax = cp.taxSetAside, balance = Math.floor(seed.finance.balance);
  const safe = coming - essentials - tax;
  const weeks = cashWeeks.map(w => (w.in ? { ...w, in: coming } : w));
  const outTotal = sum(weeks.map(w => w.out));
  const saved = !!data.profile.runway;
  const save = () => {
    set({ profile: { ...data.profile, needsCashRunway: false, runway: { balance, expectedIncome: coming, essentialBills: essentials + tax, dueSoonLabel: 'Next 30 days', followUpLabel: 'Review on payday', netRunway: balance + coming - essentials - tax, updatedAt: new Date().toISOString() } } });
    feedback.file();
  };
  return (
    <Page screen="cashplan" bar={{ kind: 'push', title: '30-day cash plan', action: { kind: 'text', label: data.flags['cashplan-edit'] ? 'Done' : 'Edit', onPress: () => flag('cashplan-edit') } }}
      footer={<Btn label={saved ? 'Cash plan saved · update' : 'Save my cash plan'} onPress={save} />}>
      <Eyebrow>Safe to spend this month</Eyebrow>
      <Figure value={safe < 0 ? `−${show(-safe)}` : show(safe)} style={{ marginTop: space.xs }} />
      <Body s={safe < 0 ? `You’re {${show(-safe)} short} this month. Look at income and bills below.` : `Your buffer covers {${bufferMonths.toFixed(1)} months} of essentials.`} style={{ marginTop: space.xs }} />
      {data.flags['cashplan-edit'] ? <Box style={{ marginTop: space.lg }}>
        <Between><Text variant="title">Coming in</Text><Text variant="title">{show(coming)}</Text></Between>
        <SliderV26 value={coming} min={0} max={6000} step={10} onChange={v => { setComing(v); choose('cashplan-income', String(v)); }} accessibilityLabel="Money coming in this month" style={{ marginTop: space.sm }} />
      </Box> : null}
      <Box style={{ marginTop: space.lg }}>
        <Between><Text variant="title">Next 30 days</Text><Legend items={[{ label: `In ${show(coming)}`, color: t.ink }, { label: `Out ${show(outTotal)}`, color: t.ink2 }]} /></Between>
        <View style={{ marginTop: space.sm }}><CapsulePairs weeks={weeks} label={`Next 30 days by week: ${money(coming)} in, ${money(outTotal)} out`} /></View>
        <Callout style={{ marginTop: space.xs }}>Payday lands 28 Nov. Rent leaves the same week.</Callout>
      </Box>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row icon="home" title="Essential bills" sub="Rent, council tax, utilities, phone" end={show(essentials)} endStrong />
        <Row icon="shield" title="Tax set-aside" sub="For your Self Assessment" end={show(tax)} endStrong />
      </RowsCard>
      {saved ? <Callout style={{ marginTop: space.md }}>Saved on this phone. Life checks it again on payday.</Callout> : null}
    </Page>
  );
}

/* ───────────────────────── Tax and NI ───────────────────────── */

export function TaxcheckV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, flag } = useSeed(), show = useShow();
  const ni = seed.finance.niRecord;
  const years = [{ y: '2022/23', b: 'OK', s: 'Settled' }, { y: '2023/24', b: 'OK', s: 'Settled' }, { y: '2024/25', b: show(seedTaxClaim.refund), s: 'P800 · overpaid', now: true }];
  return (
    <Page screen="taxcheck" bar={{ kind: 'push', title: 'Tax & NI', action: info('How this is checked', () => flag('tax-details')) }}
      footer={<Btn label="Check if it’s worth filling" onPress={() => { flag('ni-reviewed', true); set({ profile: { ...data.profile, taxReviewed: true } }); nav.go('chat', { question: 'How do I check gaps in my National Insurance record?' }); }} />}>
      <BigPhoto source={photos.payslip} focal={{ y: 0.86 }} height={204} chip="Money · HMRC" chipRight="2024/25 · P800" line="You overpaid. Owed to you:" figure={`${show(seedTaxClaim.refund)} back`} sub="From your P800 and the work costs you told Life about." style={{ marginTop: space.xxs }} />
      {data.flags['tax-details'] ? <Box pad={space.md} style={{ marginTop: space.sm }}><Body s="Life works this out from your payslips, your P800 and the work costs you’ve told it. It doesn’t sign in to HMRC for you. Check the figure in your {Personal Tax Account} before you claim." /></Box> : null}
      <View style={[styles.years, { marginTop: space.sm }]}>
        {years.map(y => (
          <View key={y.y} style={[styles.year, { backgroundColor: y.now ? t.ink : t.surface }, y.now ? null : cardShadow(t.scheme)]}>
            <Text variant="micro" style={{ color: y.now ? t.canvas : t.ink2, opacity: y.now ? 0.66 : 1 }}>{y.y}</Text>
            <Text variant="headline" style={{ color: y.now ? t.canvas : t.ink, marginTop: space.tile, fontVariant: ['tabular-nums'] }}>{y.b}</Text>
            <Text variant="callout" style={{ color: y.now ? t.canvas : t.ink2, opacity: y.now ? 0.66 : 1 }}>{y.s}</Text>
          </View>
        ))}
      </View>
      <TintCard area="money" style={{ marginTop: space.sm }}>
        <Between><Text variant="title">National Insurance record</Text><Chip label={`${ni.targetYears} needed`} /></Between>
        <DotGrid cells={niYears as DotCell[]} columns={12} style={{ marginTop: space.md }} label={`${ni.years} qualifying years of ${ni.targetYears}, one gap in ${ni.gapYear}`} />
        <Legend style={{ marginTop: space.sm }} items={[{ label: `${ni.years} qualifying years`, color: t.ink }, { label: `1 gap · ${ni.gapYear}`, color: t.ember }]} />
        <Body s={`Filling it costs roughly {${show(ni.indicativeCost)}} and adds about {${show(ni.indicativeAnnualPension)} a year} to your State Pension, for life. Check the exact figure with HMRC first.`} style={{ marginTop: space.sm }} />
      </TintCard>
      <Callout style={{ marginTop: space.md }}>An estimate from what you’ve told Life, not tax advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Income and structure ───────────────────────── */

export function IncomeV26() {
  const nav = useNavigation(), { data, choose, flag, engine } = useSeed(), show = useShow();
  const [profit, setProfit] = useState(Number(data.choices['structure-profit'] ?? seed.finance.structureProfit));
  const s = compareUKBusinessStructures({ ...data.profile, annualIncome: profit });
  const sole = s.soleTrader.netTakeHomeAnnual, company = s.director.netTakeHomeAnnual, fees = seed.finance.accountantFees;
  const edge = sole - (company - fees);
  return (
    <Page screen="income" bar={{ kind: 'push', title: 'Income & structure', action: info('How this is worked out', () => flag('income-details')) }}>
      <Eyebrow>Sole trader or limited company</Eyebrow>
      <Display s={edge >= 0 ? `After fees, {staying a sole trader} keeps about {${show(Math.abs(edge))} more.}` : `After fees, {a limited company} keeps about {${show(Math.abs(edge))} more.}`} />
      <Hero source={photos.desk} focal={{ y: 0.18 }} height={124} small="Annual profit · drag to try another" title={show(profit)} style={{ marginTop: space.lg }}>
        <SliderV26 value={profit} min={20000} max={150000} step={1000} onChange={v => { setProfit(v); choose('structure-profit', String(v)); }} accessibilityLabel="Annual profit" />
        <Cols style={{ marginTop: 14 }} items={[{ small: 'Sole trader', value: show(sole), sub: 'take-home' }, { small: 'Limited company', value: show(company), sub: `before ~${show(fees)} fees` }]} />
      </Hero>
      <Callout style={{ marginTop: space.sm }}>{`Take-home per year · tax year ${engine.income.taxYear} · before ~${money(fees)} accountant fees for a company`}</Callout>
      {data.flags['income-details'] ? <Box pad={space.md} style={{ marginTop: space.sm }}><Body s="A sole trader pays income tax and Class 4 NI on profit. A company pays corporation tax, then you take a small salary and dividends. Life uses this year’s rates and your other income." /></Box> : null}
      <Btn label="Ask about the trade-offs" ghost onPress={() => nav.go('ask')} style={{ marginTop: space.md }} />
      <Callout style={{ marginTop: space.md }}>An estimate from Life’s engine, not tax advice. Life suggests speaking to an accountant before switching.</Callout>
    </Page>
  );
}

/* ───────────────────────── Rent vs buy ───────────────────────── */

export function RentbuyV26() {
  const nav = useNavigation(), { data, flag } = useSeed(), show = useShow();
  const bedrooms = Number(data.choices.bedrooms ?? 2);
  const price = rentBuyInputs.price * bedrooms / 2;
  const h = compareRentAndBuy({ ...rentBuyInputs, price, deposit: price * 0.1 });
  const renting = h?.rentingInvestments ?? 0, buying = h?.buyerWealth ?? 0, edge = h?.buyingAdvantage ?? 0, buyWins = edge >= 0;
  const cash = Math.floor(seed.finance.balance), needed = h?.cashNeeded ?? 0;
  const pct = needed ? Math.round(Math.min(100, cash / needed * 100)) : 0;
  return (
    <Page screen="rentbuy" bar={{ kind: 'push', title: 'Rent vs buy', action: info('How the model works', () => flag('rentbuy-details')) }}>
      <Statement s={`Over ${rentBuyInputs.years} years, buying a {${moneyCompact(price)}} flat leaves you about {${show(Math.abs(Math.round(edge / 100) * 100))} ${buyWins ? 'better' : 'worse'} off} than renting and investing the difference.`} />
      <Between style={{ marginTop: space.lg, marginBottom: space.sm }}><Text variant="title">{`Wealth after ${rentBuyInputs.years} years`}</Text><Chip label="Engine model" tone="q" /></Between>
      <PhotoGrid>
        <PhotoCard source={photos.terrace} focal={{ x: 0.36 }} height={186} size="md" chips={[buyWins ? 'Rent + invest' : { label: 'Rent + invest', icon: 'check' }]} title={moneyCompact(renting)} sub="Renting, investing the difference" />
        <PhotoCard source={photos.keyshome} focal={{ y: 0.78 }} height={186} size="md" chips={[buyWins ? { label: 'Buy', icon: 'check' } : 'Buy']} title={moneyCompact(buying)} sub={buyWins ? `About ${show(Math.round(edge / 100) * 100)} more` : `About ${show(Math.round(-edge / 100) * 100)} less`} />
      </PhotoGrid>
      <Box style={{ marginTop: space.sm }}>
        <Between><Chip label={pct >= 100 ? 'Within reach' : 'Not yet'} tone={pct >= 100 ? 'done' : 'live'} /><Text variant="callout" tone="ink2">{`${show(cash)} of the ${moneyCompact(needed)} you need`}</Text></Between>
        <Ruler pct={pct} style={{ marginTop: space.sm }} />
        <Body s="A Lifetime ISA adds {25%} to what you save. Want a plan?" style={{ marginTop: space.sm }} />
        <Btn label="Make a plan" onPress={() => nav.go(data.aim ? 'aim' : 'aimnew')} style={{ marginTop: space.md }} />
      </Box>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Cols items={[{ small: 'Mortgage', value: show(h?.payment ?? 0), sub: 'a month' }, { small: 'Cash needed', value: show(needed), sub: '10% deposit + costs' }, { small: 'Rent today', value: show(rentBuyInputs.rentMonthly), sub: 'a month' }]} />
        <Callout style={{ marginTop: space.sm }}>{`${moneyCompact(price * 0.9)} at ${rentBuyInputs.mortgageRatePct}% over ${rentBuyInputs.termYears} years. Rent rising ${rentBuyInputs.rentGrowthPct}% a year in the model.`}</Callout>
      </Box>
      {data.flags['rentbuy-details'] ? <Box pad={space.md} style={{ marginTop: space.sm }}><Body s={`The model compares owning (mortgage, upkeep, the home growing ${rentBuyInputs.homeGrowthPct}% a year, selling costs) with renting and investing whatever you’d save at ${rentBuyInputs.investmentReturnPct}% a year.`} /></Box> : null}
      <Row icon="home" title={`${bedrooms} bedrooms`} sub="Change the size of home" onPress={() => nav.go('bedrooms')} style={{ marginTop: space.xs }} />
      <Callout style={{ marginTop: space.sm }}>A model from Life’s engine, not financial advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Bloodwork reader ───────────────────────── */

function RangeDot({ pos, flag }: { pos: number; flag?: boolean }) {
  const t = useTokens();
  return (
    <View style={styles.range}>
      <View style={[styles.rangeTrack, { backgroundColor: t.surface3 }]} />
      <View style={[styles.rangeBand, { backgroundColor: t.inkQuiet }]} />
      <View style={[styles.rangeDot, { left: `${pos}%`, backgroundColor: flag ? t.ember : t.ink, borderColor: t.surface }]} />
    </View>
  );
}

export function BloodV26() {
  const { data, set, flag } = useSeed();
  const health = data.profile.health ?? {};
  const labs: Partial<Record<LabMarkerId, LabResult>> = { ...seedLabResults, ...data.profile.health?.labResults };
  const rows = LAB_GUIDES.filter(g => labs[g.id]).map(g => {
    const result = labs[g.id]!, read = interpretLabResult(g.id, health, result);
    const board = bloodTiles.find(b => b.id === g.id);
    const sample = !data.profile.health?.labResults?.[g.id] && board && String(result.value) === board.value;
    const check = read.status === 'check';
    const low = /below|inadequate|^low/i.test(read.explanation);
    const lo = result.referenceLow, hi = result.referenceHigh;
    const pos = sample ? board!.pos : lo !== undefined && hi !== undefined && hi > lo ? Math.max(4, Math.min(96, 30 + (result.value - lo) / (hi - lo) * 46)) : check ? (low ? 14 : 82) : 50;
    return { g, result, read, check, low, pos, name: board?.name ?? g.name.replace(/ \(.*\)$/, '') };
  });
  const inRange = rows.filter(r => !r.check).length, flagged = rows.filter(r => r.check);
  const words = ['None', 'One', 'Two', 'Three', 'Four', 'Five'];
  const [marker, setMarker] = useState<LabMarkerId>(LAB_GUIDES[0].id);
  const [value, setValue] = useState(''), [unit, setUnit] = useState<string>(LAB_GUIDES[0].units[0]), [lowB, setLowB] = useState(''), [highB, setHighB] = useState(''), [error, setError] = useState('');
  const adding = !!data.flags['add-lab'];
  const saveResult = () => {
    const v = Number(value), l = lowB.trim() ? Number(lowB) : undefined, hgh = highB.trim() ? Number(highB) : undefined;
    const guide = LAB_GUIDES.find(x => x.id === marker)!;
    if (!value.trim() || !Number.isFinite(v) || v < 0 || (l !== undefined && !Number.isFinite(l)) || (hgh !== undefined && !Number.isFinite(hgh)) || (l !== undefined && hgh !== undefined && l >= hgh) || !guide.units.some(u => u === unit)) { setError('Check the value, unit and range against your report.'); return; }
    const result: LabResult = { value: v, unit, ...(l === undefined ? {} : { referenceLow: l }), ...(hgh === undefined ? {} : { referenceHigh: hgh }) };
    set({ profile: { ...data.profile, health: { ...data.profile.health!, labResults: { ...data.profile.health?.labResults, [marker]: result } } } });
    flag('add-lab', false); setError(''); setValue(''); feedback.file();
  };
  return (
    <Page screen="blood" bar={{ kind: 'push', title: 'Bloodwork', action: info('How Life reads results', () => flag('blood-details')) }}
      footer={<>
        <Btn label={adding ? 'Save this result' : 'Add a result'} icon={adding ? 'check' : 'add'} onPress={adding ? saveResult : () => flag('add-lab', true)} />
        <Callout center>Life explains results, it doesn’t diagnose. Always check with your GP.</Callout>
      </>}>
      <Eyebrow>Health · 3 Nov · your last test</Eyebrow>
      <Display s={flagged.length ? `{${inRange} of ${rows.length} in range.} ${words[flagged.length] ?? flagged.length} worth a word with your {GP.}` : `{All ${rows.length} in range.} Nothing to raise right now.`} />
      {data.flags['blood-details'] ? <Box pad={space.md} style={{ marginTop: space.md }}><Body s="Each marker is compared with the range printed on your report, or with a published guide when there isn’t one. Your GP knows your history; Life only explains." /></Box> : null}
      <TileGrid style={{ marginTop: space.xl }}>
        {rows.map(r => (
          <Box key={r.g.id} pad={space.md} style={{ minHeight: 118 }}>
            <Between><Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{r.name}</Text><Chip label={r.check ? (r.low ? 'Low' : 'High end') : 'In range'} tone={r.check ? (flagged[0] === r ? 'live' : undefined) : 'q'} /></Between>
            <Text variant="numeralL" style={{ marginTop: 14 }}>{String(r.result.value)}<Text variant="unit" tone="ink2">{` ${r.result.unit}`}</Text></Text>
            <RangeDot pos={r.pos} flag={flagged[0] === r} />
          </Box>
        ))}
      </TileGrid>
      <Callout style={{ marginTop: space.sm }}>Each dot sits against the lab’s usual range.</Callout>
      {flagged.length ? <TintCard area="health" padding={space.md} style={{ marginTop: space.md }}>
        <Micro>What to ask your GP</Micro>
        {flagged.map(r => <View key={r.g.id} style={styles.ask}><Tick /><Body s={`{${r.name}.} ${r.read.nextStep}`} style={{ flex: 1 }} /></View>)}
      </TintCard> : null}
      {adding ? <Box style={{ marginTop: space.md }}>
        <Text variant="title">Add a result</Text>
        <FilterChips wrap options={LAB_GUIDES.map(g => ({ value: g.id, label: g.name.replace(/ \(.*\)$/, '') }))} value={marker} onChange={id => { setMarker(id); setUnit(LAB_GUIDES.find(g => g.id === id)!.units[0]); setError(''); }} style={{ marginTop: space.sm }} />
        <View style={{ gap: space.xs, marginTop: space.sm }}>
          <Field label="Value from your report" value={value} onChangeText={setValue} keyboardType="decimal-pad" />
          <FilterChips options={LAB_GUIDES.find(g => g.id === marker)!.units.map(u => ({ value: u, label: u }))} value={unit} onChange={setUnit} />
          <Field label="Range low (optional)" value={lowB} onChangeText={setLowB} keyboardType="decimal-pad" />
          <Field label="Range high (optional)" value={highB} onChangeText={setHighB} keyboardType="decimal-pad" />
        </View>
        <Callout style={{ marginTop: space.xs }}>{error || 'Use the range and units printed on your report. Leave a bound blank if it isn’t given.'}</Callout>
      </Box> : null}
    </Page>
  );
}

/* ───────────────────────── Protection review ───────────────────────── */

export function ProtectV26() {
  const nav = useNavigation(), { data, set } = useSeed();
  const policies = getProtectionChecklist(data.profile);
  const done = policies.filter(p => p.inPlace).length;
  const gap = policies.find(p => !p.inPlace && p.urgency === 'Critical') ?? policies.find(p => !p.inPlace);
  const rest = policies.filter(p => p !== gap);
  const toggle = (id: string) => { const ids = data.profile.protectedPolicyIds ?? []; set({ profile: { ...data.profile, protectedPolicyIds: ids.includes(id) ? ids.filter(v => v !== id) : [...ids, id] } }); feedback.select(); };
  const selfEmployed = data.profile.workStatus === 'sole-trader' || data.profile.workStatus === 'director';
  const plain = (name: string) => name.replace('Income Protection Cover', 'Income protection').replace('Level Term Life Insurance', 'Life insurance').replace('Tenants Contents & Liability', 'Contents insurance').replace('Pension Expression of Wish and will', 'Pension nomination and a will');
  return (
    <Page screen="protect" bar={{ kind: 'push', title: 'Protection' }}>
      <PhotoCard source={photos.siblings} focal={{ y: 0.46 }} height={204} chips={['Level 4 · your downside']} chipRight={`${done} of ${policies.length} done`} title="Protect what you’ve built" sub={`${policies.length} checks, about 20 minutes in total.`} style={{ marginTop: space.xxs }} />
      {gap ? <Box style={{ marginTop: space.sm }}>
        <Between><Chip label="Gap" tone="live" /><Text variant="callout" tone="ink2">Start here</Text></Between>
        <Text variant="headline" style={{ marginTop: space.sm }}>{plain(gap.name)}</Text>
        <Body s={gap.id === 'prot-income' && selfEmployed ? 'Self-employed: {no sick pay.} Compare how long your savings last with what a policy would pay.' : gap.whyNeeded} style={{ marginTop: space.xxs }} />
        <Btn label="Talk it through" icon="arrow" trail onPress={() => nav.go('chat', { question: `How should I think about ${plain(gap.name).toLowerCase()}?` })} style={{ marginTop: space.md }} />
        <Press2 label={`Mark ${plain(gap.name).toLowerCase()} as sorted`} onPress={() => toggle(gap.id)} />
      </Box> : <Callout style={{ marginTop: space.sm }}>Every check is done. Life asks again in a year.</Callout>}
      <RowsCard style={{ marginTop: space.sm }}>
        {rest.map(p => <Row key={p.id} lead={<Tick on={p.inPlace} />} title={plain(p.name)} sub={p.whyNeeded} right={<Chip label={p.inPlace ? 'Done' : p.urgency === 'Critical' ? 'Soon' : 'To do'} tone={p.inPlace ? 'done' : 'q'} />} onPress={() => toggle(p.id)} />)}
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>General guidance, not regulated financial advice.</Callout>
    </Page>
  );
}

/** A quiet text button under a primary one. */
function Press2({ label, onPress }: { label: string; onPress: () => void }) {
  return <View style={{ alignItems: 'center', marginTop: space.xs }}><Btn label={label} ghost sm onPress={onPress} /></View>;
}

/* ───────────────────────── Growth path ───────────────────────── */

export function GrowthV26() {
  const t = useTokens(), nav = useNavigation(), { data, choose } = useSeed();
  const picked = data.choices['growth-checkin'];
  return (
    <Page screen="growth" bar={{ kind: 'push', action: { kind: 'text', label: 'Levels', onPress: () => nav.go('levels') } }}>
      <Eyebrow>Level 4 · growth path</Eyebrow>
      <Display s="You’ve kept your {payday sweep} for {3 months}. Next: {raise your rate.}" />
      <PhotoCard source={photos.journal} focal={{ y: 0.6 }} height={284} size="md" chips={['This week’s check-in']} chipRight={{ label: 'Due Sun', dot: t.ember }} title="What did you do this week that future-you will thank you for?" style={{ marginTop: space.lg }}>
        <View style={styles.photoChips}>
          {['Saved more', 'Learned something', 'Rested properly'].map(c => <Chip key={c} label={c} onPhoto icon={picked === c ? 'check' : undefined} onPress={() => { choose('growth-checkin', c); feedback.select(); }} />)}
        </View>
      </PhotoCard>
      <SectionHead title="Lessons" link="2 of 6" onLink={() => nav.go('library')} />
      <Shelf>
        <PhotoTile source={photos.areawork} focal={{ y: 0.55 }} width={150} title="Pricing your work" meta="6 min" metaIcon="play" onPress={() => nav.go('idea')} />
        <PhotoTile source={photos.friends} width={150} title="Asking for a rate rise" meta="5 min" metaIcon="play" onPress={() => nav.go('idea')} />
        <PhotoTile source={photos.freedom} focal={{ y: 0.7 }} width={150} title="Building a second income" meta="8 min" metaIcon="play" onPress={() => nav.go('idea')} />
      </Shelf>
      <Btn label="Knocked off course? Reset in 3 steps" icon="repeat" ghost onPress={() => nav.go('routines')} style={{ marginTop: space.lg }} />
    </Page>
  );
}

/* ───────────────────────── Your next home: bedrooms ───────────────────────── */

export function BedroomsV26() {
  const t = useTokens(), nav = useNavigation(), { data, choose } = useSeed();
  const [n, setN] = useState(Number(data.choices.bedrooms ?? 2));
  const price = rentBuyInputs.price * n / 2;
  return (
    <Page screen="bedrooms" bar={{ kind: 'push', title: 'Your next home' }} footer={<Btn label="Use this" onPress={() => { choose('bedrooms', String(n)); feedback.file(); nav.replace('rentbuy'); }} />}>
      <BigPhoto source={photos.bedroom} focal={{ y: 0.76 }} height={236} chip="Rent vs buy · bedrooms" line={`A ${n}-bed in South London is around`} figure={moneyCompact(price)} sub={`Deposit at 10%: ${moneyCompact(price * 0.1)}`} style={{ marginTop: space.xxs }} />
      <Box style={{ marginTop: space.sm, paddingVertical: space.xl }}>
        <Text variant="title" align="center">How many bedrooms do you need?</Text>
        <View style={styles.doors} accessible accessibilityLabel={`${n} bedrooms`}>
          {Array.from({ length: Math.max(4, n) }, (_, k) => <View key={k} style={[styles.door, { backgroundColor: k < n ? t.ink : t.surface3 }]}><View style={[styles.knob, { backgroundColor: t.surface }]} /></View>)}
        </View>
        <View style={{ marginTop: space.lg, alignItems: 'center' }}><CompactStepper value={n} onChange={setN} min={1} max={6} unit="bedrooms" label="Bedrooms" /></View>
      </Box>
      <Callout center style={{ marginTop: space.sm }}>Illustrative prices for now.</Callout>
    </Page>
  );
}

/* ───────────────────────── How big a buffer? ───────────────────────── */

export function BufferV26() {
  const nav = useNavigation(), { data, choose } = useSeed(), show = useShow();
  const [months, setMonths] = useState(Number(data.choices['buffer-months'] ?? seed.finance.bufferMonths));
  const essentials = seed.finance.cashplan.essentialBills, sweep = seed.finance.bufferSavingMonthly, balance = seed.finance.balance;
  const target = essentials * months;
  const toGo = Math.max(0, target - balance), monthsToGo = Math.ceil(toGo / sweep);
  const pct = Math.min(100, Math.round(balance / target * 100));
  const cells: DotCell[] = Array.from({ length: Math.max(6, months) }, (_, k) => (k < months ? 'on' : ''));
  return (
    <Page screen="buffer" bar={{ kind: 'push', title: 'How big a buffer?' }} footer={<Btn label="Set my target" onPress={() => { choose('buffer-months', String(months)); feedback.file(); nav.close(); }} />}>
      <TintCard area="money" style={{ marginTop: space.xxs }}>
        <Eyebrow>30-day cash plan · your target</Eyebrow>
        <Figure value={show(target)} style={{ marginTop: space.xs }} />
        <Body s={toGo ? `At {${show(sweep)} a month}, you get there in {${monthsToGo} ${monthsToGo === 1 ? 'month' : 'months'}}.` : 'You’re {already there.} Keep the sweep running.'} style={{ marginTop: space.xs }} />
        <Ruler pct={pct} style={{ marginTop: space.sm }} />
        <Between style={{ marginTop: space.xs }}><Text variant="callout" tone="ink2">{`${show(balance)} now · covers ${bufferMonths.toFixed(1)} months`}</Text><Text variant="callout" tone="ink2">{`${pct}%`}</Text></Between>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <Text variant="title" align="center">How many months of essentials do you want saved?</Text>
        <View style={{ width: 216, alignSelf: 'center', marginTop: space.lg }}><DotGrid cells={cells} columns={cells.length} label={`${months} months`} /></View>
        <View style={{ marginTop: space.lg, alignItems: 'center' }}><CompactStepper value={months} onChange={setMonths} min={1} max={12} unit="months" label="Months of essentials" /></View>
      </Box>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <KeyValue label="Your essentials" value={`${show(essentials)} a month`} />
        <KeyValue label={`${months} ${months === 1 ? 'month' : 'months'} of them`} value={show(target)} />
        <KeyValue label="Your payday sweep" value={`${show(sweep)} a month`} />
      </Box>
    </Page>
  );
}

/* ───────────────────────── Locked tool ───────────────────────── */

const LOCK_PHOTO: Partial<Record<ScreenKey, keyof typeof photos>> = { rentbuy: 'terrace', blood: 'run', protect: 'siblings', income: 'desk', growth: 'journal', bedrooms: 'bedroom', subs: 'freedom', money: 'payslip', healthstack: 'food' };

export function UnlockV26() {
  const nav = useNavigation(), { data, engine, flag } = useSeed();
  const key = (data.choices['unlock-tool'] ?? 'rentbuy') as ScreenKey;
  const tool = TOOLS.find(x => x.key === key);
  const title = data.choices['unlock-tool-title'] ?? tool?.title ?? 'This tool';
  const level = Number(data.choices['unlock-tool-level'] ?? tool?.level ?? 3);
  const steps = engine.level.toAdvance.slice(0, 2);
  const left = steps.filter(s => !s.done).length;
  return (
    <Page screen="unlock" bar={{ kind: 'sheet', title: 'Locked tool' }}
      footer={<>
        <Btn label="Show me the steps" onPress={() => nav.replace('levels')} />
        <Btn label="Open it early anyway" ghost onPress={() => { flag(`unlocked-${key}`, true); feedback.select(); nav.replace(key); }} />
      </>}>
      <PhotoCard source={photos[LOCK_PHOTO[key] ?? 'terrace']} height={140} size="md" chips={[`${tool?.area ?? 'Plan'} · level ${level}`]} title={`${title} opens at level ${level}`} style={{ marginTop: space.xxs }} />
      <Body s={`It’s most useful once your buffer and tax are sorted, because the numbers depend on them.${left ? ` {${left === 1 ? 'One step' : `${['', 'One', 'Two', 'Three'][left] ?? left} steps`} to go:}` : ''}`} style={{ marginTop: space.sm }} />
      {steps.length ? <CheckRows items={steps.map(s => ({ label: s.label, done: s.done }))} onToggle={i => nav.go(i === 0 ? 'taxcheck' : 'missions')} style={{ marginTop: space.xs }} /> : null}
      <Callout center style={{ marginTop: space.md }}>Levels guide. They never lock you out of your own data.</Callout>
    </Page>
  );
}

/* ───────────────────────── Bigger decisions ───────────────────────── */

const DECISIONS: { title: string; sub: string; lens: string; to: ScreenKey; level: number; photo: keyof typeof photos; focal?: { x?: number; y?: number } }[] = [
  { title: 'Rent vs buy', sub: 'Run the real numbers for your first home', lens: 'Housel · room for error', to: 'rentbuy', level: 3, photo: 'keyshome', focal: { y: 0.8 } },
  { title: 'Sole trader or limited?', sub: 'See which keeps more of your profit', lens: 'Munger · invert', to: 'income', level: 3, photo: 'desk', focal: { x: 0.76 } },
  { title: 'Protect your income', sub: 'Cover for when you can’t work', lens: 'Taleb · remove what can ruin you', to: 'protect', level: 4, photo: 'siblings', focal: { y: 0.4 } },
  { title: 'Second income stream', sub: 'Turn a skill into something that earns while you sleep', lens: 'Naval · leverage', to: 'growth', level: 4, photo: 'freedom', focal: { y: 0.75 } },
];

export function DecisionsV26() {
  const t = useTokens(), openTool = useOpenTool(), { open } = useToolState();
  const [front, ...behind] = DECISIONS;
  const frontOpen = open(front.to, front.level);
  return (
    <Page screen="decisions" bar={{ kind: 'push', title: 'Bigger decisions' }}>
      <Eyebrow>One bigger move per level</Eyebrow>
      <Display s="{One at a time,} when you have the room for it." />
      <PeekStack style={{ marginTop: space.xl }} peeks={[{ left: behind[1].title, right: '3' }, { left: behind[0].title, right: '2' }]}>
        <Box pad={0} style={{ overflow: 'hidden' }}>
          <View style={{ height: 124, backgroundColor: t.surface2 }}>
            <PhotoCardFill source={photos[front.photo]} focal={front.focal} />
            <View style={{ padding: space.md, flexDirection: 'row' }}><StatusPill size="chip" onPhoto label={frontOpen ? 'Open now' : `Opens at level ${front.level}`} /></View>
          </View>
          <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg }}>
            <Micro sig>{`Your next bigger decision · 1 of ${DECISIONS.length}`}</Micro>
            <Text variant="headline" style={{ marginTop: space.xs }}>{front.title}</Text>
            <Body s={front.sub} style={{ marginTop: 2 }} />
            <Btn label="Run the numbers" icon="arrow" trail onPress={() => openTool(front.to, front.level, front.title)} style={{ marginTop: space.md }} />
            <Between style={{ marginTop: space.sm }}>
              <View style={styles.lens}><Icon name="book" size={16} color={t.ink2} /><Text variant="callout" tone="ink2">{front.lens}</Text></View>
              <Text variant="callout" tone="ink2">Taught through a lens</Text>
            </Between>
          </View>
        </Box>
      </PeekStack>
      <SectionHead title="Resting behind it" link="Opens by level" />
      <RowsCard>
        {behind.map(d => <Row key={d.title} photo={photos[d.photo]} thumbFocal={d.focal} title={d.title} sub={`${d.sub} · ${d.lens}`} right={<Chip label={open(d.to, d.level) ? 'Open' : `Level ${d.level}`} tone={open(d.to, d.level) ? 'done' : 'q'} />} onPress={() => openTool(d.to, d.level, d.title)} />)}
      </RowsCard>
    </Page>
  );
}

/** A photograph filling its box with the card scrim, for a card whose top is a picture. */
function PhotoCardFill({ source, focal }: { source: Parameters<typeof PhotoFill>[0]['source']; focal?: { x?: number; y?: number } }) {
  return <View style={StyleSheet.absoluteFill}><PhotoFill source={source} focal={focal} /><LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} /></View>;
}

/* ───────────────────────── All tools ───────────────────────── */

export function ToolsV26() {
  const t = useTokens(), nav = useNavigation(), openTool = useOpenTool(), { data, flag } = useSeed(), { open } = useToolState();
  const [q, setQ] = useState('');
  const unlocked = TOOLS.filter(x => open(x.key, x.level));
  const later = TOOLS.filter(x => !open(x.key, x.level)).sort((a, b) => a.level - b.level);
  const searching = !!data.flags['search-tools'];
  const match = TOOLS.filter(x => x.title.toLowerCase().includes(q.trim().toLowerCase()));
  const area = (name: (typeof TOOLS)[number]['area'], p: keyof typeof photos, focal: { x?: number; y?: number }, height: number) => {
    const tools = TOOLS.filter(x => x.area === name), on = tools.filter(x => open(x.key, x.level)), off = tools.filter(x => !open(x.key, x.level));
    return (
      <PhotoCard source={photos[p]} focal={focal} height={height} size="md" chips={[off.length && on.length ? `${on.length} open · ${off.length} later` : on.length ? `${on.length} open` : `${off.length} later`]} title={name}>
        <View style={styles.photoChips}>
          {on.slice(0, 3).map(x => <Chip key={x.key} label={x.short && name !== 'Money' ? x.short : x.title} onPhoto onPress={() => nav.go(x.key)} />)}
          {on.length < 3 ? off.slice(0, 3 - on.length > 1 && name === 'Money' ? 2 : 1).map(x => <Press3 key={x.key} label={`${x.short ?? x.title} · level ${x.level}`} onPress={() => openTool(x.key, x.level, x.title)} />) : null}
        </View>
      </PhotoCard>
    );
  };
  return (
    <Page screen="tools" bar={{ kind: 'push', action: { kind: 'icon', icon: searching ? 'close' : 'search', label: searching ? 'Close search' : 'Search tools', onPress: () => { flag('search-tools'); setQ(''); } } }}>
      <Eyebrow>Plan · your toolkit</Eyebrow>
      <Display s={`{${unlocked.length} tools unlocked.} ${later.length ? `${later.length} more as you level up.` : 'Every tool is open.'}`} />
      <Ruler pct={Math.round(unlocked.length / TOOLS.length * 100)} bars={TOOLS.length} style={{ marginTop: space.md }} />
      {searching ? <>
        <View style={[styles.search, { backgroundColor: t.surface2, marginTop: space.lg }]}>
          <Icon name="search" size={18} color={t.ink2} />
          <TextInput maxFontSizeMultiplier={1.3} autoFocus value={q} onChangeText={setQ} placeholder="Search tools" placeholderTextColor={t.inkQuiet} selectionColor={t.ember} accessibilityLabel="Search tools" style={[styles.searchInput, { color: t.ink, fontFamily: fonts.sans }]} />
        </View>
        <RowsCard style={{ marginTop: space.sm }}>
          {match.map(x => <Row key={x.key} photo={photos[x.photo]} title={x.title} sub={x.sub} right={open(x.key, x.level) ? undefined : <Chip label={`Level ${x.level}`} tone="q" />} onPress={() => openTool(x.key, x.level, x.title)} />)}
        </RowsCard>
        {!match.length ? <Callout style={{ marginTop: space.sm }}>No tool by that name. Try a word like tax, home or sleep.</Callout> : null}
      </> : <>
        <View style={{ marginTop: space.lg }}>{area('Money', 'payslip', { y: 0.86 }, 196)}</View>
        <PhotoGrid style={{ marginTop: space.tile }}>{area('Home', 'keyshome', { y: 0.74 }, 178)}{area('Work', 'desk', { x: 0.76 }, 178)}</PhotoGrid>
        <View style={{ marginTop: space.tile }}>{area('Health', 'walk', { y: 0.36 }, 178)}</View>
        {later.length ? <>
          <SectionHead title="As you level up" link="Worth the wait" />
          <RowsCard>{later.slice(0, 4).map(x => <Row key={x.key} photo={photos[x.photo]} title={x.title} sub={x.sub} right={<Chip label={`Level ${x.level}`} tone="q" />} onPress={() => openTool(x.key, x.level, x.title)} />)}</RowsCard>
        </> : null}
        <Row icon="layers" title="Bigger decisions" sub="One at a time, when you have room" onPress={() => nav.go('decisions')} style={{ marginTop: space.sm }} />
      </>}
    </Page>
  );
}

/** A faint chip on a photograph for a tool that opens later (board `.tt-dimchip`). */
function Press3({ label, onPress }: { label: string; onPress: () => void }) {
  return <Chip label={label} onPhoto icon="clock" onPress={onPress} style={{ opacity: 0.72 }} />;
}

/* ───────────────────────── Health stack ───────────────────────── */

export function HealthstackV26() {
  const t = useTokens(), nav = useNavigation();
  const ironLow = true;
  const caps: { icon: 'sun' | 'fitness' | 'water'; title: string; sub: string; end?: string; gp?: boolean }[] = [
    { icon: 'sun', title: 'Vitamin D', sub: 'Morning · Oct–Mar', end: '1,000 IU' },
    { icon: 'fitness', title: 'Creatine', sub: 'Any time', end: '5 g' },
    { icon: 'water', title: 'Iron', sub: ironLow ? 'Your last test was low' : 'With food', gp: ironLow },
  ];
  return (
    <Page screen="healthstack" bar={{ kind: 'push', title: 'Health stack', action: { kind: 'icon', icon: 'add', label: 'Add to your stack', onPress: () => nav.go('talk') } }}>
      <View style={{ flexDirection: 'row', marginTop: space.xxs }}><Chip label="Timing · no clashes" icon="check" tone="done" /></View>
      <Display s="{Nothing clashes.} One thing to raise with your {GP.}" style={{ marginTop: space.sm }} />
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        {caps.map(c => (
          <View key={c.title} style={[styles.cap, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
            <IconWell icon={c.icon} size={48} />
            <View style={{ flex: 1, minWidth: 0 }}><Text variant="rowTitle">{c.title}</Text><Text variant="callout" tone="ink2">{c.sub}</Text></View>
            {c.gp ? <Chip label="Talk to GP" tone="live" onPress={() => nav.go('blood')} /> : <Text variant="title">{c.end}</Text>}
          </View>
        ))}
      </View>
      <LifeSays style={{ marginTop: space.md }}>Take iron away from tea or coffee: they reduce how much you absorb.</LifeSays>
      <PhotoCard source={photos.food} focal={{ x: 0.38, y: 0.45 }} height={150} size="md" chips={['Worth knowing']} title="Your diet already covers B12 and omega-3 most days." onPress={() => nav.go('fuel')} style={{ marginTop: space.md }} />
      <Callout style={{ marginTop: space.sm }}>Wellness information, not medical advice. Check medicines with a pharmacist.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  years: { flexDirection: 'row', gap: space.xs },
  year: { flex: 1, paddingTop: space.sm, paddingHorizontal: 14, paddingBottom: 14, borderRadius: radius.tile },
  range: { height: 14, marginTop: 14, justifyContent: 'center' },
  rangeTrack: { position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2 },
  rangeBand: { position: 'absolute', left: '30%', width: '46%', height: 8, borderRadius: 4, opacity: 0.45 },
  rangeDot: { position: 'absolute', width: 14, height: 14, marginLeft: -7, borderRadius: 7, borderWidth: 3 },
  ask: { flexDirection: 'row', gap: space.tile, alignItems: 'flex-start', marginTop: space.sm },
  photoChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.tile },
  doors: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginTop: space.lg },
  door: { width: 44, height: 66, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  knob: { position: 'absolute', right: 9, top: 36, width: 5, height: 5, borderRadius: 3 },
  lens: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 48, borderRadius: radius.md, paddingHorizontal: space.md },
  searchInput: { flex: 1, fontSize: 16, minWidth: 0 },
  cap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 68, paddingVertical: space.tile, paddingLeft: space.tile, paddingRight: space.lg, borderRadius: radius.full },
});

