/**
 * Plan · Money and Plan · Documents and renewals, restyled to the V26 board (`money-docs-aim.js`).
 * Balances, budgets and documents come from the seed and `packages/core`; board-only figures live in `src/state/plan.ts`.
 */
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  BandLine, CapsulePairs, CheckRows, DotGrid, FilterChips, Icon, LifeOrb, LifeSays, PhotoCard, PhotoFill, PhotoGrid, PickRow, Press, RoundButton, Ruler,
  SectionHead, SliderV26, SwitchV26, Text, TileGrid, TintCard, V26Tile, cardShadow, feedback, photo, photos, radius, space, useAreaTint, useTokens, type DotCell,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { money, seed, seedDocuments, seedSubscriptionDetails, SEED_DATE } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { bankChoices, bufferMonths, cancelPages, daysUnused, docDates, monthWeeks, netWorthYear, paydaySweep } from '@/state/plan';
import { BigPhoto, Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Figure, Legend, Micro, Page, PeekStack, QuietLink, Row, RowsCard, Statement, Timeline } from './kit';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const word = (n: number) => WORDS[n] ?? String(n);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** "£2,340.50" as ["£2,340", "50"], so the pence can sit smaller. */
const split = (n: number): [string, string] => { const [w, p = '00'] = money(n, 2).split('.'); return [w, p]; };
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);

/** Balances hide behind dots when you ask (the eye in the bar). */
function useMoney() {
  const { data, pref } = useSeed();
  const hidden = !!data.prefs.hideBalances;
  const show = (n: number, decimals = 0) => hidden ? '£••••' : money(n, decimals);
  const eye = { kind: 'icon' as const, icon: hidden ? 'eyeOff' as const : 'eye' as const, label: hidden ? 'Show balances' : 'Hide balances', onPress: () => pref('hideBalances', !hidden) };
  return { hidden, show, eye };
}

function useSubscriptions() {
  const { data } = useSeed();
  const all = data.profile.subscriptions ?? [];
  const active = all.filter(s => !s.cancelled);
  const unused = active.filter(s => !s.essential), inUse = active.filter(s => s.essential);
  return { all, active, unused, inUse, monthly: sum(active.map(s => s.monthlyCost)), unusedMonthly: sum(unused.map(s => s.monthlyCost)), inUseMonthly: sum(inUse.map(s => s.monthlyCost)) };
}

/** A letter in a square, for a payment with no picture (board `box('A')`). */
function Letter({ ch }: { ch: string }) {
  const t = useTokens();
  return <View style={[styles.letter, { backgroundColor: t.surface2 }]}><Text variant="title">{ch}</Text></View>;
}

/** One bar split into parts (board `.mda-split`). */
function SplitBar({ parts, style }: { parts: { flex: number; color: string; apart?: boolean }[]; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.split, style]}>{parts.map((p, i) => <View key={i} style={{ flex: p.flex, minWidth: 8, borderRadius: radius.full, backgroundColor: p.color, marginLeft: p.apart ? 5 : 0 }} />)}</View>;
}

/** A meter on a photograph (board `.mda-pmeter`). */
function PhotoMeter({ pct }: { pct: number }) {
  const t = useTokens();
  return <View style={styles.pmeter}><View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', borderRadius: radius.full, backgroundColor: t.ember }} /></View>;
}

const TXN_PHOTO = ['payslip', 'terrace', null, null] as const;

/* ───────────────────────── Money: the hub ───────────────────────── */

export function MoneyV26() {
  const nav = useNavigation(), { data, choose } = useSeed(), { show, hidden, eye } = useMoney(), subs = useSubscriptions();
  const f = seed.finance;
  const [whole, pence] = split(f.balance);
  const inSoFar = sum(monthWeeks.map(w => w.in)), outSoFar = sum(monthWeeks.map(w => w.out));
  const netWorth = sum(f.netWorth.map(n => n.amount));
  const t = useTokens();
  const accountTo = ['budget', 'bill', 'buffer'] as const;
  const accountLine = ['Day-to-day spending', 'Rent and bills leave here', `${money(f.bufferSavingMonthly, 2)} moved in today`];
  const accountScale = ['·· 4821', undefined, 'payday sweep'];
  return (
    <Page screen="money" bar={{ kind: 'push', title: 'Money', action: eye }}>
      <BigPhoto source={photos.payslip} focal={{ y: 1 }} height={270} chip="Today · all accounts" chipRight={{ label: `${f.balanceChange.pct}%`, icon: 'arrowUp' }}
        figure={hidden ? '£••••' : whole} pence={hidden ? undefined : pence} sub={hidden ? 'Balances hidden' : `+${money(f.balanceChange.amount, 2)} this month`} style={{ marginTop: space.xxs }} />
      <TintCard area="money" style={{ marginTop: space.sm }}>
        <Between><Text variant="title">This month</Text><Legend items={[{ label: 'In', color: t.ink }, { label: 'Out', color: t.ink2 }]} /></Between>
        <View style={{ marginTop: space.sm }}><CapsulePairs weeks={monthWeeks} label={`This month by week: ${money(inSoFar, 2)} in, ${money(outSoFar, 2)} out`} /></View>
        <Body variant="callout" s={`{${show(inSoFar, 2)} in} and ${show(outSoFar, 2)} out so far. Payday landed today.`} style={{ marginTop: space.xs }} />
      </TintCard>
      <SectionHead title="Accounts" link={`adds up to ${show(f.balance, 2)}`} />
      <TileGrid>
        {f.accounts.map((a, i) => <V26Tile key={a.name} wide={i === 2} label={a.name} scale={accountScale[i]} value={hidden ? '£••••' : split(a.amount)[0]} unit={hidden ? undefined : `.${split(a.amount)[1]}`} sub={accountLine[i]} onPress={() => nav.go(accountTo[i])} />)}
      </TileGrid>
      <SectionHead title="Today" link="All payments" onLink={() => nav.go('budget')} />
      <RowsCard>
        {f.transactions.map((x, i) => {
          const p = TXN_PHOTO[i];
          const lead = p ? undefined : i === 2 ? undefined : <Letter ch={x.name.charAt(0)} />;
          return <Row key={x.name} photo={p ? photos[p] : undefined} icon={i === 2 ? 'swap' : undefined} lead={lead} title={x.name} sub={x.detail}
            end={hidden ? '£••••' : `${x.amount > 0 ? '+' : ''}${money(Math.abs(x.amount), 2)}`} endStrong onPress={() => { choose('transaction', String(i)); nav.go('txn'); }} />;
        })}
      </RowsCard>
      <SectionHead title="More in Money" />
      <RowsCard>
        <Row icon="wallet" title="Budget" sub={`${show(Math.floor(f.accounts[0].amount))} left to spend in November`} onPress={() => nav.go('budget')} />
        <Row icon="repeat" title="Subscriptions" sub={`${show(subs.monthly, 2)} a month${subs.unused.length ? ` · ${subs.unused.length} not used` : ''}`} onPress={() => nav.go('subs')} />
        <Row icon="trend" title="Net worth" sub={`${show(netWorth)} · up ${show(f.netWorthGain)} this year`} onPress={() => nav.go('networth')} />
        <Row icon="shield" title="Connect your bank" sub={data.choices.bank ? `${data.choices.bank} chosen · read-only` : 'Read-only'} right={<Chip label="Preview" tone="q" />} onPress={() => nav.go('connectbank')} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Balances are the ones you’ve given life. No bank is connected. Guidance, not advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Subscriptions ───────────────────────── */

export function SubsV26() {
  const nav = useNavigation(), t = useTokens(), { data, set, flag } = useSeed(), { show } = useMoney(), s = useSubscriptions();
  const opened = (id: string) => !!data.flags[`cancel-opened-${id}`];
  const setCancelled = (id: string, cancelled: boolean) => {
    set({ profile: { ...data.profile, subscriptions: s.all.map(x => x.id === id ? { ...x, cancelled } : x) } });
    if (cancelled) feedback.cleared(); else feedback.select();
  };
  const cancel = (id: string) => {
    if (!opened(id)) { flag(`cancel-opened-${id}`, true); if (cancelPages[id]) void Linking.openURL(cancelPages[id]); return; }
    setCancelled(id, true);
  };
  const cancelled = s.all.filter(x => x.cancelled);
  return (
    <Page screen="subs" bar={{ kind: 'push', title: 'Subscriptions', action: { kind: 'text', label: data.flags['subs-show-cancelled'] ? 'Active only' : 'Show all', onPress: () => flag('subs-show-cancelled') } }}>
      <Eyebrow>Checked every quarter</Eyebrow>
      {s.unused.length
        ? <Display s={`{${show(s.unusedMonthly * 12, 2)} a year} goes on ${word(s.unused.length).toLowerCase()} ${s.unused.length === 1 ? 'thing' : 'things'} you {haven’t used} in 60 days.`} />
        : <Display s="{Everything you pay for,} you use." />}
      <TintCard area="money" style={{ marginTop: space.xl }}>
        <Between><Text variant="title">Every month</Text><Text variant="title">{show(s.monthly, 2)}</Text></Between>
        <SplitBar style={{ marginTop: space.sm }} parts={[{ flex: Math.max(1, s.inUseMonthly), color: t.ink }, ...(s.unusedMonthly ? [{ flex: s.unusedMonthly, color: t.ember }] : [])]} />
        <Between style={{ marginTop: space.xs }}><Text variant="callout" tone="ink2">{`In use ${show(s.inUseMonthly, 2)}`}</Text>{s.unusedMonthly ? <Text variant="callout" tone="ember">{`Not used ${show(s.unusedMonthly, 2)}`}</Text> : null}</Between>
      </TintCard>
      {s.unused.length ? <>
        <SectionHead title="Not being used" link={`${show(s.unusedMonthly, 2)} a month`} />
        <TileGrid>
          {s.unused.map(x => (
            <Box key={x.id} pad={space.md} style={{ minHeight: 118 }}>
              <Between style={{ alignItems: 'flex-start' }}><Text variant="title" numberOfLines={2} style={{ flexShrink: 1 }}>{x.name}</Text><Chip label="Not used" tone="live" /></Between>
              <Text variant="numeralL" style={{ marginTop: 14 }}>{String(daysUnused[x.id] ?? 60)}<Text variant="unit" tone="ink2"> days</Text></Text>
              <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{`${show(x.monthlyCost, 2)} a month`}</Text>
              <Btn label={opened(x.id) ? 'I’ve cancelled it' : 'Cancel'} ghost sm onPress={() => cancel(x.id)} style={{ marginTop: 14 }} />
            </Box>
          ))}
        </TileGrid>
        <Box pad={space.md} onPress={() => nav.go('aim')} accessibilityLabel={`If you let them go, ${money(s.unusedMonthly, 2)} a month more for your flat`} style={{ marginTop: space.sm }}>
          <View style={styles.rowLine}>
            <View style={styles.thumb}><PhotoFill source={photos.keyshome} focal={{ y: 0.78 }} /></View>
            <View style={{ flex: 1 }}><Micro>{s.unused.length > 1 ? 'If you let both go' : 'If you let it go'}</Micro><Text variant="title" style={{ marginTop: 2 }}>{`${show(s.unusedMonthly, 2)} a month more for your flat`}</Text></View>
            <Icon name="chev" size={16} color={t.ink2} />
          </View>
        </Box>
      </> : null}
      <SectionHead title="Still in use" link={`${show(s.inUseMonthly, 2)} a month`} />
      <RowsCard>
        {s.inUse.map(x => <Row key={x.id} lead={<Letter ch={x.name.charAt(0)} />} title={x.name} sub={seedSubscriptionDetails[x.id] ?? 'Renews next month'} end={show(x.monthlyCost, 2)} endStrong onPress={() => { if (cancelPages[x.id]) void Linking.openURL(cancelPages[x.id]); }} />)}
      </RowsCard>
      {cancelled.length && data.flags['subs-show-cancelled'] ? <>
        <SectionHead title="Cancelled" link={`${show(sum(cancelled.map(x => x.monthlyCost)) * 12, 2)} a year kept`} />
        <RowsCard>{cancelled.map(x => <Row key={x.id} lead={<Letter ch={x.name.charAt(0)} />} title={x.name} sub="Marked cancelled by you" right={<Chip label="Undo" onPress={() => setCancelled(x.id, false)} />} />)}</RowsCard>
      </> : null}
      <Callout style={{ marginTop: space.md }}>life opens the provider’s cancel page. Nothing is cancelled without you.</Callout>
    </Page>
  );
}

/* ───────────────────────── Area: Money ───────────────────────── */

export function AreaMoneyV26() {
  const nav = useNavigation(), t = useTokens(), { data, set } = useSeed(), { show } = useMoney(), subs = useSubscriptions(), accent = useAreaTint('money').accent;
  const f = seed.finance, cp = f.cashplan;
  const safe = cp.comingIn - cp.essentialBills - cp.taxSetAside;
  const rebateOpen = !data.completed.includes('uk-hmrc-tax-code');
  const openMission = (id: string) => { set({ selectedMission: id }); nav.go('mission'); };
  return (
    <Page screen="area" bar={{ kind: 'push', action: { kind: 'icon', icon: 'info', label: 'Why these show here', onPress: () => nav.go('why') } }}>
      <View style={styles.rowLine}><View style={[styles.dot, { backgroundColor: accent }]} /><Text variant="callout" tone="ink2">Money · how strong</Text></View>
      <Display s={`{Building.} Buffer at {${bufferMonths.toFixed(1)} months}, tax {up to date}, ${rebateOpen ? '{1 rebate} in progress' : '{rebate} cleared'}.`} />
      <SectionHead title="Missions" link={`${rebateOpen ? 2 : 1} active`} />
      <PhotoGrid>
        {rebateOpen ? <PhotoCard source={photos.payslip} focal={{ y: 1 }} height={200} size="md" chips={[{ label: 'Live', dot: t.ember }]} title="HMRC tax rebate" sub={`est. ${money(840)} · one form to go`} onPress={() => openMission('uk-hmrc-tax-code')} /> : null}
        <PhotoCard source={photos.keyshome} focal={{ y: 0.92 }} height={200} size="md" chips={['To do']} title="Lifetime ISA" sub="25% bonus" onPress={() => openMission('uk-lifetime-isa')} />
      </PhotoGrid>
      <SectionHead title="Routines" link="1 running" />
      <RowsCard><Row icon="repeat" title="Payday sweep" sub={`Next ${paydaySweep.next}`} right={<Chip label="Active" />} onPress={() => nav.go('routines')} /></RowsCard>
      <SectionHead title="Tools" />
      <RowsCard>
        <Row icon="cash" title="30-day cash plan" sub={`Safe to spend this month: ${show(safe)}`} onPress={() => nav.go('cashplan')} />
        <Row icon="wallet" title="Money and ledger" sub={`${show(f.balance, 2)} across ${f.accounts.length} accounts`} onPress={() => nav.go('money')} />
        <Row icon="repeat" title="Subscriptions" sub={`${show(subs.monthly, 2)} a month`} onPress={() => nav.go('subs')} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Progress, not a score. life works it out from what you’ve told it.</Callout>
    </Page>
  );
}

/* ───────────────────────── A payment ───────────────────────── */

const CATEGORIES = ['Groceries', 'Eating out', 'Transport', 'Bills', 'Income', 'Subscriptions'] as const;

export function TxnV26() {
  const { data, choose, flag } = useSeed(), { show } = useMoney();
  const f = seed.finance;
  const i = data.choices.transaction !== undefined ? Number(data.choices.transaction) : -1;
  const x = f.transactions[i] ?? f.payment;
  const isShop = x === f.payment;
  const inferred = isShop ? 'Groceries' : x.amount > 0 ? 'Income' : x.name === 'Rent' ? 'Bills' : x.detail === 'Subscription' ? 'Subscriptions' : 'Bills';
  const category = data.choices[`category-${x.name}`] ?? inferred;
  const [whole, pence] = split(Math.abs(x.amount));
  const picture = isShop ? photos.cook : x.amount > 0 ? photos.payslip : x.name === 'Rent' ? photos.terrace : x.detail === 'Payday sweep' ? photos.aimdesk : photos.desk;
  const groceries = f.budget.find(b => b.name === 'Groceries')!;
  const accent = useAreaTint('money').accent, t = useTokens();
  const split2 = !!data.flags['payment-split'];
  return (
    <Page screen="txn" bar={{ kind: 'push', title: 'Payment', action: { kind: 'text', label: data.flags['txn-category-edit'] ? 'Done' : 'Edit', onPress: () => flag('txn-category-edit') } }}
      footer={<Btn label={split2 ? 'Split saved · undo' : 'Split with Sam'} icon="people" onPress={() => flag('payment-split')} />}>
      <View style={[styles.strip, { backgroundColor: t.surface2 }]}><PhotoFill source={picture} focal={{ y: 0.36 }} /></View>
      <View style={{ alignItems: 'center', marginTop: space.md }}>
        <Eyebrow>{isShop ? `${x.name} · ${x.detail}` : `${x.name} · today`}</Eyebrow>
        <Text variant="numeralXl" style={{ marginTop: 6 }}>{data.prefs.hideBalances ? '£••••' : whole}{data.prefs.hideBalances ? null : <Text variant="heading" tone="ink2">{`.${pence}`}</Text>}</Text>
        <Chip label={isShop ? 'About weekly · normal' : x.amount > 0 ? 'Money in' : x.detail} tone="q" icon={isShop ? 'repeat' : undefined} style={{ marginTop: space.tile }} />
      </View>
      {isShop ? (
        <TintCard area="money" padding={space.md} style={{ marginTop: space.lg }}>
          <Between><Text variant="callout" tone="ink2">Groceries this month</Text><Text variant="micro" tone="quiet">{`of ${show(groceries.limit)}`}</Text></Between>
          <Between style={{ alignItems: 'flex-end', marginTop: 14 }}><Text variant="numeralL">{show(groceries.spent)}</Text><Chip label={groceries.spent / groceries.limit < 0.9 ? 'On track' : 'Nearly there'} tone={groceries.spent / groceries.limit < 0.9 ? 'done' : 'live'} /></Between>
          <View style={[styles.meter, { backgroundColor: t.surface }]}><View style={{ width: `${Math.min(100, groceries.spent / groceries.limit * 100)}%`, height: '100%', borderRadius: radius.full, backgroundColor: accent }} /></View>
        </TintCard>
      ) : null}
      <View style={{ gap: space.sm, marginTop: space.sm }}>
        <PickRow label="Category" value={category} set onPress={() => flag('txn-category-edit')} />
        {isShop ? <PickRow label="Repeats" value="About weekly" set /> : <PickRow label="Recorded as" value={x.detail} set />}
      </View>
      {data.flags['txn-category-edit'] ? <FilterChips wrap options={CATEGORIES.map(v => ({ value: v, label: v }))} value={category as (typeof CATEGORIES)[number]} onChange={v => { choose(`category-${x.name}`, v); flag('txn-category-edit', false); feedback.select(); }} style={{ marginTop: space.sm }} /> : null}
      <Callout center style={{ marginTop: space.sm }}>{split2 ? 'Split saved on this phone. Nothing is sent to Sam.' : 'Change the category once and life remembers.'}</Callout>
    </Page>
  );
}

/* ───────────────────────── A bill ───────────────────────── */

export function BillV26() {
  const nav = useNavigation(), { data, set } = useSeed(), { show, hidden } = useMoney();
  const f = seed.finance;
  const alone = data.profile.householdSize === 1;
  const saving = Math.round(f.councilTaxMonthly * 0.25);
  const due = daysBetween(SEED_DATE, '2026-12-01');
  const [whole, pence] = split(f.councilTaxMonthly);
  const t = useTokens();
  return (
    <Page screen="bill" bar={{ kind: 'push', title: 'Council tax', action: { kind: 'icon', icon: 'info', label: 'Why this shows here', onPress: () => nav.go('why') } }}>
      <BigPhoto source={photos.letter} focal={{ y: 0.64 }} height={240} topLeft={<View style={styles.paperDate}><Text variant="title" style={{ color: photo.ink }}>01</Text><Text variant="micro" style={{ color: photo.ink }}>DEC</Text></View>}
        chipRight={`In ${due} days`} figure={hidden ? '£••••' : whole} pence={hidden ? undefined : pence} sub="a month · Direct Debit · due 1st" style={{ marginTop: space.xxs }} />
      <Box style={{ marginTop: space.sm }}>
        <Chip label={alone ? `You could pay ${show(saving)} less a month` : 'Check your household discount'} tone="live" />
        <Statement s={alone ? 'You live alone, so the {25% single person discount} applies.' : 'You share your home, so the {single person discount} may not apply.'} style={{ marginTop: space.sm }} />
        <LifeSays style={{ marginTop: space.md }}>I’ll fill in the council’s form, show it to you, then send it and watch for the reply.</LifeSays>
        <Btn label={alone ? 'Claim it for me' : 'Check with life'} onPress={() => { set({ selectedMission: 'uk-single-person-council' }); nav.go('mission'); }} style={{ marginTop: space.md }} />
        <Callout center style={{ marginTop: space.sm }}>{`About ${show(f.councilTaxMonthly - saving)} a month if the council agrees. Nothing is sent without your OK.`}</Callout>
      </Box>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">Last 12 months</Text><Text variant="callout" tone="ink2">12 paid by Direct Debit</Text></Between>
        <DotGrid cells={Array(12).fill('on') as DotCell[]} columns={12} style={{ marginTop: space.md }} label="12 payments made, one each month" />
        <View style={[styles.months, { marginTop: space.xs }]}>{'DJFMAMJJASON'.split('').map((m, k) => <Text key={k} variant="micro" tone="ink2" style={{ flex: 1, textAlign: 'center' }}>{m}</Text>)}</View>
      </Box>
      <Callout style={{ marginTop: space.md }}>An estimate from what you’ve told life. Your council decides. Guidance, not advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Budget ───────────────────────── */

export function BudgetV26() {
  const { data, flag, choose } = useSeed(), { show } = useMoney(), t = useTokens();
  const f = seed.finance;
  const editing = !!data.flags['budget-edit'];
  const limit = (name: string, base: number) => Number(data.choices[`budget-${name}`] ?? base);
  const flexible = ['Going out', 'Groceries', 'Transport'].map(n => f.budget.find(b => b.name === n)!).map(b => ({ ...b, limit: limit(b.name, b.limit) }));
  const tight = [...flexible].sort((a, b) => b.spent / Math.max(1, b.limit) - a.spent / Math.max(1, a.limit))[0];
  const rest = flexible.filter(b => b !== tight);
  const covered = f.budget.filter(b => b.name === 'Rent' || b.name === 'Tax pot');
  const gone = Number(SEED_DATE.slice(8, 10)) - 2, monthDays = 30, left = monthDays - gone;
  const days: DotCell[] = Array.from({ length: monthDays }, (_, k) => (k < gone ? 'on' : ''));
  return (
    <Page screen="budget" bar={{ kind: 'push', title: 'November', action: { kind: 'text', label: editing ? 'Done' : 'Edit', onPress: () => flag('budget-edit') } }}>
      <Eyebrow>Budget · every pound has a job</Eyebrow>
      <Display s={`{${show(Math.floor(f.accounts[0].amount))}} left to spend, with {${left} days} to go.`} />
      <DotGrid cells={days} columns={15} style={{ marginTop: space.lg }} label={`${gone} days of ${monthDays} gone`} />
      <Between style={{ marginTop: space.xs }}><Text variant="callout" tone="ink2">{`${gone} days gone`}</Text><Text variant="callout" tone="ink2">30 Nov</Text></Between>
      <SectionHead title="Flexible spending" link={editing ? 'drag to move money' : undefined} />
      <PhotoCard source={photos.friends} focal={{ y: 0.66 }} height={180} chips={[{ label: `${show(Math.max(0, tight.limit - tight.spent))} left`, dot: t.ember }]} title={tight.name} sub={`${show(tight.spent)} of ${show(tight.limit)}`} size="md">
        <PhotoMeter pct={tight.spent / Math.max(1, tight.limit) * 100} />
      </PhotoCard>
      <TileGrid style={{ marginTop: space.sm }}>
        {rest.map(b => <V26Tile key={b.name} label={b.name} scale={`of ${show(b.limit)}`} value={show(Math.max(0, b.limit - b.spent))} unit="left" meter={b.spent / Math.max(1, b.limit)} sub={`${show(b.spent)} spent`} />)}
      </TileGrid>
      {editing ? <Box style={{ marginTop: space.sm }}>
        {flexible.map((b, k) => <View key={b.name} style={{ marginTop: k ? space.md : 0 }}>
          <Between><Text variant="title">{b.name}</Text><Text variant="callout" tone="ink2">{show(b.limit)}</Text></Between>
          <SliderV26 value={b.limit} min={0} max={Math.max(400, b.limit * 2)} step={10} onChange={v => choose(`budget-${b.name}`, String(v))} accessibilityLabel={`${b.name} budget`} style={{ marginTop: space.xs }} />
        </View>)}
      </Box> : null}
      <SectionHead title="Already covered" />
      <RowsCard>
        {covered.map(b => <Row key={b.name} photo={b.name === 'Rent' ? photos.terrace : photos.payslip} title={b.name} sub={`${show(b.spent)} of ${show(b.limit)}`} right={<Chip label={b.spent >= b.limit ? 'Covered' : 'Filling'} tone={b.spent >= b.limit ? 'done' : 'q'} />} />)}
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Worked out from the payments you’ve given life. Guidance, not advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Net worth ───────────────────────── */

export function NetWorthV26() {
  const t = useTokens(), { show, eye } = useMoney(), accent = useAreaTint('money').accent;
  const f = seed.finance;
  const total = sum(f.netWorth.map(n => n.amount));
  const start = netWorthYear[0];
  const own = f.netWorth.filter(n => n.amount > 0), owe = f.netWorth.filter(n => n.amount < 0);
  const colours = [t.ink, t.ink2];
  return (
    <Page screen="networth" bar={{ kind: 'push', title: 'Net worth', action: { ...eye, label: eye.label.replace('balances', 'numbers') } }}>
      <Eyebrow>Everything you own, minus everything you owe</Eyebrow>
      <Figure value={show(total)} style={{ marginTop: space.xs }} />
      <View style={{ flexDirection: 'row', marginTop: space.xs }}><Chip label={`${show(f.netWorthGain)} this year`} icon="arrowUp" tone="done" /></View>
      <TintCard area="money" style={{ marginTop: space.lg }}>
        <Between><Text variant="title">The trend leads</Text><Text variant="callout" tone="ink2">12 months</Text></Between>
        <View style={{ marginTop: space.sm }}><BandLine values={netWorthYear} baseline={start} height={150} color={accent} label={`Net worth from December to November, rising from ${money(start)} to ${money(netWorthYear[netWorthYear.length - 1])}`} /></View>
        <Between style={{ marginTop: space.xxs }}><Text variant="micro" tone="ink2">Dec</Text><Text variant="micro" tone="ink2">Nov</Text></Between>
        <Callout style={{ marginTop: space.xs }}>{`The pale line is where you began the year: ${show(start)}.`}</Callout>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">What makes it up</Text><Text variant="callout" tone="ink2">own, then owe</Text></Between>
        <SplitBar style={{ marginTop: space.md }} parts={[...own.map((n, k) => ({ flex: n.amount, color: colours[k] ?? t.ink2 })), ...owe.map((n, k) => ({ flex: -n.amount, color: t.surface3, apart: k === 0 }))]} />
        <View style={{ marginTop: space.sm }}>
          {f.netWorth.map((n, k) => (
            <Between key={n.name} style={{ minHeight: 40 }}>
              <View style={styles.rowLine}><View style={[styles.dot, { backgroundColor: n.amount < 0 ? t.surface3 : colours[k] ?? t.ink2 }]} /><Text variant="body" tone="ink2">{n.name}</Text></View>
              <Text variant="title">{`${n.amount < 0 ? '− ' : ''}${show(Math.abs(n.amount))}`}</Text>
            </Between>
          ))}
        </View>
        {owe.some(n => /student/i.test(n.name)) ? <Callout style={{ marginTop: 2 }}>The student loan doesn’t act like debt. Repayments move with what you earn.</Callout> : null}
      </Box>
      <Callout style={{ marginTop: space.md }}>Pensions and property count. Values are the last ones you gave life. Guidance, not advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Connect your bank ───────────────────────── */

export function ConnectBankV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose, flag } = useSeed();
  const [bank, setBank] = useState(data.choices.bank ?? '');
  return (
    <Page screen="connectbank" bar={{ kind: 'push', close: true, action: { kind: 'node', node: <Chip label="Preview" tone="q" /> } }}
      footer={<>
        <Btn label={bank ? `Choose ${bank}` : 'Choose your bank'} disabled={!bank} onPress={() => { choose('bank', bank); flag('bank-chosen', true); feedback.file(); nav.close(); }} />
        <QuietLink label="Not now" onPress={nav.close} />
      </>}>
      <View style={[styles.shield, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Icon name="shield" size={24} color={t.ink} /></View>
      <Display s="See {all your money} in one place." style={{ marginTop: space.md }} />
      <Body s="Read-only, through a regulated Open Banking provider. {This is a preview:} connecting isn’t switched on yet. life keeps your choice and asks when it is." style={{ marginTop: space.xs }} />
      <RowsCard style={{ marginTop: space.lg }}>
        <Row icon="eye" title="Read-only" sub="life can’t move money" />
        <Row icon="shield" title="Your login stays with your bank" sub="You approve in your bank’s app" />
        <Row icon="clock" title="Ends after 90 days" sub="Renew in one tap" />
      </RowsCard>
      <Micro style={{ marginTop: space.xl }}>BANKS YOU’LL BE ABLE TO CHOOSE</Micro>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter, marginTop: space.sm }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.xs }}>
        {bankChoices.map(b => {
          const on = b === bank;
          return <Press key={b} haptic="select" onPress={() => setBank(b)} accessibilityLabel={b} accessibilityState={{ selected: on }} style={[styles.bank, { backgroundColor: on ? t.ink : t.surface2 }]}>
            <Text variant="buttonCompact" style={{ color: on ? t.canvas : t.ink }}>{b}</Text>
          </Press>;
        })}
      </ScrollView>
    </Page>
  );
}

/* ───────────────────────── Documents and renewals ───────────────────────── */

const docWeeks = (id: string) => docDates[id] ? Math.round(daysBetween(SEED_DATE, docDates[id]) / 7) : undefined;
const monthsTo = (iso: string) => Math.max(0, (Number(iso.slice(0, 4)) - Number(SEED_DATE.slice(0, 4))) * 12 + Number(iso.slice(5, 7)) - Number(SEED_DATE.slice(5, 7)));
const DOC_BOX: Record<string, { day: string; month: string }> = { mot: { day: '12', month: 'JAN' }, railcard: { day: '03', month: 'MAR' }, licence: { day: '2031', month: '' }, tv: { day: 'OCT', month: '2027' }, insurance: { day: '14', month: 'FEB' } };

function useDocuments() {
  const nav = useNavigation(), { data, choose } = useSeed();
  const open = (id: string) => { choose('document', id); nav.go(id === 'insurance' ? 'renewal' : 'docdetail'); };
  const docs = SHOW_SAMPLES ? seedDocuments : [];
  return { docs, open };
}

export function VaultV26() {
  const nav = useNavigation(), { docs, open } = useDocuments();
  const act = docs.filter(d => d.status === 'Act now'), sorted = docs.filter(d => d.status !== 'Act now');
  const passport = sorted.find(d => d.id === 'passport');
  const others = sorted.filter(d => d.id !== 'passport');
  const soon = others.filter(d => docWeeks(d.id) !== undefined).sort((a, b) => (docWeeks(b.id) ?? 0) - (docWeeks(a.id) ?? 0));
  const front = act[0];
  return (
    <Page screen="vault" bar={{ kind: 'push', action: { kind: 'node', node: <View style={styles.acts}><RoundButton icon="search" label="Search documents" onPress={() => nav.go('search')} /><RoundButton icon="add" label="Add a document" onPress={() => nav.go('scan')} /></View> } }}>
      <Eyebrow>Documents and renewals</Eyebrow>
      <Display s={`{${word(act.length)}} to act on. {${word(sorted.length)}} sorted.`} />
      {front ? (
        <PeekStack style={{ marginTop: space.xl }} peeks={soon.slice(0, 2).map((d, k) => ({ left: `${d.name} · ${d.summary.charAt(0).toLowerCase()}${d.summary.slice(1)}`, right: String(3 - k), onPress: () => open(d.id) }))}>
          <Box pad={0} style={{ overflow: 'hidden' }}>
            <View style={{ height: 132 }}><PhotoFill source={photos.letter} focal={{ y: 0.61 }} /></View>
            <View style={{ paddingHorizontal: space.lg, paddingTop: space.xxs, paddingBottom: space.lg }}>
              <Between style={{ marginTop: space.sm }}><Micro sig>{`To act on · 1 of ${act.length + Math.min(2, soon.length)}`}</Micro><Chip label="Renews 14 Feb" /></Between>
              <Text variant="headline" style={{ marginTop: space.xs }}>{front.name}</Text>
              <Body s="Compare from {22 Jan}. Prices are usually lowest about three weeks before renewal." style={{ marginTop: space.xxs }} />
              <Btn label="See the renewal plan" icon="arrow" trail onPress={() => open(front.id)} style={{ marginTop: space.md }} />
            </View>
          </Box>
        </PeekStack>
      ) : <Callout style={{ marginTop: space.lg }}>Nothing to act on. Scan a letter or a document and life keeps its dates for you.</Callout>}
      {sorted.length ? <SectionHead title="Filed" link={`${sorted.length} sorted`} /> : null}
      {passport ? <PhotoCard source={photos.passport} focal={{ y: 0.83 }} height={170} size="md" chips={[`In ${monthsTo(docDates.passport)} months`]} chipRight={{ label: 'Copy saved', icon: 'check' }} title="Passport" sub={passport.summary} onPress={() => open('passport')} /> : null}
      {others.length ? <RowsCard style={{ marginTop: space.sm }}>
        {others.map(d => {
          const w = docWeeks(d.id);
          return <Row key={d.id} date={DOC_BOX[d.id] ?? { day: '•', month: '' }} title={d.name} sub={d.id === 'mot' ? 'Due 12 Jan · book from 12 Dec' : d.summary} end={w !== undefined ? `${w} weeks` : undefined} right={w === undefined ? <Chip label="Sorted" tone="done" /> : undefined} onPress={() => open(d.id)} />;
        })}
      </RowsCard> : null}
      <Btn label="Scan a document" icon="camera" ghost onPress={() => nav.go('scan')} style={{ marginTop: space.md }} />
    </Page>
  );
}

export function DocDetailV26() {
  const nav = useNavigation(), t = useTokens(), { data, flag } = useSeed();
  const doc = seedDocuments.find(d => d.id === data.choices.document) ?? seedDocuments.find(d => d.id === 'passport')!;
  const passport = doc.id === 'passport';
  const iso = docDates[doc.id];
  const months = iso ? monthsTo(iso) : undefined;
  const removed = !!data.flags[`document-removed-${doc.id}`];
  const reminder = data.flags[`document-reminder-${doc.id}`] !== false;
  const renewMonths = 7;
  const cells: DotCell[] = months !== undefined ? Array.from({ length: Math.max(1, months) }, (_, k) => (k >= months - renewMonths ? 'on' : '')) : [];
  return (
    <Page screen="docdetail" bar={{ kind: 'push', title: doc.name, action: { kind: 'menu', label: 'Document actions', items: [
      { label: 'Scan a new copy', icon: 'camera', onPress: () => nav.go('scan') },
      removed ? { label: 'Undo removal', icon: 'repeat', onPress: () => flag(`document-removed-${doc.id}`, false) } : { label: 'Remove this copy', icon: 'trash', destructive: true, onPress: () => flag(`document-removed-${doc.id}`, true) },
    ] } }}>
      <BigPhoto source={passport ? photos.passport : photos.letter} focal={{ y: passport ? 1 : 0.6 }} height={300} chip={`Expires ${doc.expires}`} chipRight={removed ? undefined : { label: 'Copy saved', icon: 'check' }}
        figure={months !== undefined ? `${months} months` : doc.expires} sub={months !== undefined ? `left on your ${doc.name.toLowerCase()}. ${months > renewMonths ? 'Nothing to do yet.' : 'Time to renew.'}` : 'The date life keeps for you.'} style={{ marginTop: space.xxs }} />
      {months !== undefined ? <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">The countdown</Text><Text variant="callout" tone="ink2">one dot a month</Text></Between>
        <DotGrid cells={cells} columns={Math.max(cells.length, 12)} style={{ marginTop: space.md }} label={`${months} months left, renew in the last ${renewMonths}`} />
        <Between style={{ marginTop: space.sm }}><Text variant="callout" tone="ink2">{`${Math.max(0, months - renewMonths)} quiet months`}</Text><Text variant="callout">{passport ? 'Feb to Aug 2027: renew' : `From ${doc.actFrom}: act`}</Text></Between>
      </Box> : null}
      <SectionHead title="When to act" />
      <Timeline items={[
        { when: 'YOUR COPY', text: removed ? 'Copy removed from this phone.' : passport ? 'Photo page saved on this phone.' : 'Saved on this phone.', state: 'done' },
        { when: doc.actFrom.toUpperCase(), text: reminder ? 'life will remind you.' : 'No reminder. You’ll keep track.', state: 'now', children: (
          <Box pad={space.md} style={{ marginTop: space.sm }}>
            <Between><Text variant="title">{reminder ? 'Reminder set' : 'Reminder off'}</Text><SwitchV26 value={reminder} onChange={v => { flag(`document-reminder-${doc.id}`, v); feedback.select(); }} accessibilityLabel={`Remind me in ${doc.actFrom}`} /></Between>
            <Callout style={{ marginTop: space.xs }}>{passport ? 'Six months before expiry, with time to spare for summer travel.' : 'With time to compare and book.'}</Callout>
          </Box>
        ) },
        { when: 'WHEN YOU RENEW', text: passport ? 'Renew online at GOV.UK. Allow about 3 weeks.' : 'Check timing and fees with the issuer.', state: 'later', children: passport ? <Press haptic="open" onPress={() => { void Linking.openURL('https://www.gov.uk/renew-adult-passport'); }} accessibilityLabel="Check the current fee on GOV.UK" style={{ marginTop: 2 }}><Text variant="callout" tone="ink2">Cost: check the current fee on GOV.UK.</Text></Press> : undefined },
        { when: doc.expires.toUpperCase(), text: `Your ${doc.name.toLowerCase()} expires.`, state: 'later' },
      ]} />
      {SHOW_SAMPLES ? <Callout style={{ marginTop: space.md }}>Sample document, shown in development builds.</Callout> : null}
    </Page>
  );
}

export function RenewalV26() {
  const nav = useNavigation(), { data, flag } = useSeed(), { show } = useMoney();
  const steps = [
    { key: 'renew-compare', label: 'Compare quotes', sub: 'From 22 January' },
    { key: 'renew-switch', label: 'Switch or haggle', sub: 'Your insurer often matches' },
    { key: 'renew-auto', label: 'Turn off auto-renew', sub: 'By 13 February' },
  ];
  const looking = !!data.flags['renew-look'];
  return (
    <Page screen="renewal" bar={{ kind: 'push', action: { kind: 'icon', icon: 'info', label: 'Why this shows here', onPress: () => nav.go('why') } }}
      footer={<>
        <Btn label={looking ? 'life looks from 22 Jan' : 'Compare quotes'} icon={looking ? 'check' : 'search'} onPress={() => { flag('renew-look'); feedback.select(); }} />
        <Callout center>Guidance, not advice. Nothing switches without you.</Callout>
      </>}>
      <Eyebrow right={<Chip label="Best window" tone="live" />}>Car insurance · renews 14 February</Eyebrow>
      <Display s="Compare from {22 January}, when prices are usually {lowest.}" />
      <PhotoGrid style={{ marginTop: space.xl }}>
        <PhotoCard source={photos.letter} focal={{ y: 0.72 }} height={200} size="md" chips={['Your renewal']} title={show(seed.finance.insuranceRenewal, 2)} sub="a year with your current insurer" />
        <TintCard area="money" padding={space.md} style={{ minHeight: 200 }}>
          <Text variant="callout" tone="ink2">A better quote</Text>
          <View style={{ marginTop: 22 }}><LifeOrb size={44} state={looking ? 'searching' : 'ring'} /></View>
          <View style={{ flex: 1 }} />
          <Text variant="callout" tone="ink2">{looking ? 'life starts looking on 22 Jan and shows you what it finds. You choose.' : 'Not found yet. life looks from 22 Jan, when you say. You choose.'}</Text>
        </TintCard>
      </PhotoGrid>
      <Callout style={{ marginTop: space.sm }}>Prices are usually lowest around three weeks before renewal.</Callout>
      <SectionHead title="Three steps" link="tick as you go" />
      <Box pad={space.md}>
        <CheckRows items={steps.map(s => ({ label: s.label, sub: s.sub, done: !!data.flags[s.key] }))} onToggle={i => flag(steps[i].key)} />
      </Box>
    </Page>
  );
}

const styles = StyleSheet.create({
  letter: { width: 48, height: 48, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  split: { flexDirection: 'row', gap: 3, height: 12 },
  pmeter: { height: 6, marginTop: space.tile, borderRadius: radius.full, backgroundColor: photo.fill, overflow: 'hidden' },
  meter: { height: 6, marginTop: space.sm, borderRadius: radius.full, overflow: 'hidden' },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  thumb: { width: 48, height: 48, borderRadius: radius.tile, overflow: 'hidden' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  strip: { height: 140, borderRadius: radius.photo, overflow: 'hidden' },
  paperDate: { minWidth: 44, height: 46, paddingHorizontal: 6, borderRadius: radius.md, backgroundColor: photo.onPhoto, alignItems: 'center', justifyContent: 'center' },
  months: { flexDirection: 'row', gap: 7 },
  shield: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  bank: { height: 36, paddingHorizontal: 14, borderRadius: radius.full, justifyContent: 'center' },
  acts: { flexDirection: 'row', gap: space.xs },
});

