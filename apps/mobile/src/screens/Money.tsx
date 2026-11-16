import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, CapsuleMeter, ChipGroup, LedgerRow, MoneyFigure, Press, Slider, StatusPill, Text, Ticks, TrendLine, componentSize, radius, space, useTokens } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { money, seed, seedSubscriptionDetails } from '@/state/seed';
import { useLocalSearchParams } from 'expo-router';
import { ParentStateContent } from './States';
import { Heading, LocalNotice, Rows, Screen, Section, layout } from './Screen';

export function MoneyScreen({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), tokens = useTokens(), { data, set, pref, flag, choose, engine } = useSeed();
  const [bank, setBank] = useState(data.choices.bank ?? 'Monzo'), [category, setCategory] = useState('Groceries');
  const subscriptions = data.profile.subscriptions ?? [], activeSubs = subscriptions.filter(s => !s.cancelled);
  const monthly = activeSubs.reduce((sum, subscription) => sum + subscription.monthlyCost, 0), hidden = data.prefs.hideBalances;
  const shown = (amount: number, decimals = 0) => hidden ? '••••' : money(amount, decimals);
  const params = useLocalSearchParams<{ state?: string }>();
  if (screen === 'money' && params.state === 'offline') return <Screen screen={screen} title="Money"><ParentStateContent kind="offline" /></Screen>;

  if (screen === 'money') {
    const index = Math.max(0, Math.min(40, Number(data.choices['money-day'] ?? 40)));
    const date = new Date(2026, 9, 7 + index);
    const label = `${index === 40 ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · all accounts`;
    return <Screen screen={screen} title="" action={{ kind: 'icon', icon: hidden ? 'eye-off-outline' : 'eye-outline', label: hidden ? 'Show balances' : 'Hide balances', onPress: () => pref('hideBalances', !hidden) }}>
      <MoneyFigure value={seed.finance.balanceHistory[index]} hidden={hidden} delta={hidden ? undefined : { pct: seed.finance.balanceChange.pct, abs: seed.finance.balanceChange.amount, label: 'this month' }} />
      <Text variant="callout" tone="ink2" align="center">{label}</Text>
      <Ticks count={41} variant="scrubber" activeIndex={index} onScrub={value => choose('money-day', String(value))} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingBottom: space.xs }}>
        {seed.finance.accounts.map((account, i) => <Card key={account.name} onPress={() => nav.go(i === 0 ? 'budget' : i === 1 ? 'bill' : 'buffer')} padding={space.md} style={{ width: componentSize.moneyAccount, gap: space.xxs }}><Text variant="callout" tone="ink2">{account.name}</Text><Text variant="title">{shown(account.amount, 2)}</Text></Card>)}
      </ScrollView>
      <Card><View style={[layout.between, { paddingVertical: space.xs }]}><Text variant="title">Ledger</Text><Text variant="callout" tone="ink2">Today</Text></View>{seed.finance.transactions.map((transaction, i) => <LedgerRow key={transaction.name} title={transaction.name} sub={transaction.detail} amount={Math.abs(transaction.amount)} direction={transaction.amount > 0 ? 'in' : 'out'} hidden={hidden} onPress={() => { choose('transaction', String(i)); nav.go('txn'); }} />)}</Card>
      <Rows rows={[{ title: 'Budget', to: 'budget' }, { title: 'Net worth', to: 'networth' }, { title: 'Subscriptions', to: 'subs' }, { title: 'Connect your bank', to: 'connectbank' }]} />
    </Screen>;
  }
  if (screen === 'subs') return <Screen screen={screen} title="Subscriptions">
    <Text variant="callout" tone="ink2">Every month</Text><MoneyFigure value={monthly} hidden={hidden} align="left" />
    <Text variant="body" tone="ember">{`${shown(activeSubs.filter(subscription => !subscription.essential).reduce((sum, subscription) => sum + subscription.monthlyCost, 0), 2)} of it you haven’t used in 60 days`}</Text>
    <Card>{subscriptions.map(subscription => <View key={subscription.id} style={[layout.row, { paddingVertical: space.sm }]}><View style={{ flex: 1, gap: space.xxs }}><Text variant="body">{subscription.name}</Text><Text variant="callout" tone={subscription.essential ? 'ink2' : 'ember'}>{seedSubscriptionDetails[subscription.id] ?? 'Renews next month'}</Text></View><Text variant="title">{shown(subscription.monthlyCost, 2)}</Text>{!subscription.essential ? <Press onPress={() => flag(`cancel-preview-${subscription.id}`)} accessibilityLabel={`Cancel ${subscription.name}`} style={{ minHeight: 44, paddingHorizontal: space.sm, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: tokens.surface2 }}><Text variant="callout">{data.flags[`cancel-preview-${subscription.id}`] ? 'Opened' : 'Cancel'}</Text></Press> : null}</View>)}</Card>
    <Text variant="callout" tone="ink2">life opens the provider’s cancel page. Nothing is cancelled without you.</Text><LocalNotice text="Local preview · provider cancellation pages are not connected." />
  </Screen>;
  if (screen === 'area') return <Screen screen={screen} title="Money"><Card style={{ gap: space.sm }}><View style={layout.between}><Text variant="title">How strong</Text><StatusPill label="Building" /></View><CapsuleMeter size="bar" value={(engine.areas.find(area => area.id === 'money')?.progressPct ?? 0) / 100} /><Text variant="body" tone="ink2">Buffer 1.3 months · tax up to date · 1 rebate in progress</Text></Card><Section title="Missions" meta="2 active"><Rows rows={[{ title: 'HMRC tax rebate', sub: 'Submitted', value: 'Live', to: 'mission' }, { title: 'Lifetime ISA', sub: '25% bonus', value: 'To do', to: 'aim' }]} /></Section><Section title="Routines"><Rows rows={[{ title: 'Payday sweep', sub: 'Next 28 Nov', value: 'Active', to: 'routines' }]} /></Section><Section title="Tools"><Rows rows={[{ title: '30-day cash plan', to: 'cashplan' }, { title: 'Money & ledger', to: 'money' }, { title: 'Subscriptions', to: 'subs' }, { title: 'Budget', to: 'budget' }, { title: 'Net worth', to: 'networth' }]} /></Section><Button variant="secondary" label="Talk to life…" onPress={() => nav.go('chat')} /></Screen>;

  if (screen === 'txn') {
    const transaction = data.choices.transaction !== undefined ? seed.finance.transactions[Number(data.choices.transaction)] ?? seed.finance.payment : seed.finance.payment;
    const paymentCategory = data.choices[`category-${transaction.name}`] ?? category;
    return <Screen screen={screen} title="Payment" action={{ kind: 'icon', icon: 'ellipsis-horizontal', label: 'Payment actions', onPress: () => flag('txn-category-edit') }} footer={<Button variant="secondary" label={data.flags['payment-split'] ? 'Split saved · undo' : 'Split with Sam'} onPress={() => flag('payment-split')} />}>
      <View style={{ alignItems: 'flex-start', gap: space.sm }}><View style={{ width: space.xxxl, height: space.xxxl, borderRadius: radius.md, backgroundColor: tokens.surface2, alignItems: 'center', justifyContent: 'center' }}><Text variant="headline">{transaction.name[0]}</Text></View><Text variant="callout" tone="ink2">{`${transaction.name} · ${transaction === seed.finance.payment ? transaction.detail : transaction.detail + ' · Today'}`}</Text></View>
      <MoneyFigure value={Math.abs(transaction.amount)} hidden={hidden} align="left" />
      <Rows rows={[{ title: 'Category', value: paymentCategory, onPress: () => flag('txn-category-edit') }, { title: 'Repeats', sub: 'About weekly', value: 'Normal' }, { title: 'This month', sub: `${shown(seed.finance.budget[1].spent)} of ${shown(seed.finance.budget[1].limit)} groceries`, value: 'On track' }]} />
      {data.flags['txn-category-edit'] ? <ChipGroup options={['Groceries', 'Food', 'Transport', 'Bills', 'Income'].map(value => ({ value, label: value }))} value={paymentCategory} onChange={value => { setCategory(value); choose(`category-${transaction.name}`, value); flag('txn-category-edit', false); }} /> : null}
    </Screen>;
  }
  if (screen === 'bill') return <Screen screen={screen} title="Council tax"><MoneyFigure value={seed.finance.councilTaxMonthly} decimals={0} hidden={hidden} /><Text variant="body" tone="ink2" align="center">a month · Direct Debit · due 1st</Text><StatusPill label="In 16 days" /><Card style={{ gap: space.sm }}><Text variant="headline">{data.profile.householdSize === 1 ? `You could pay ${shown(seed.finance.councilTaxMonthly * .25)} less a month` : 'Your household is billed correctly'}</Text><Text variant="body" tone="ink2">{data.profile.householdSize === 1 ? 'You live alone, so the 25% single person discount applies.' : 'You share with two flatmates, so the single person discount doesn’t apply.'}</Text><Button variant="secondary" label="Review discount" onPress={() => { set({ selectedMission: 'uk-single-person-council' }); nav.go('mission'); }} /></Card><Section title="Last 12 months"><Card><TrendLine values={Array(12).fill(seed.finance.councilTaxMonthly)} label="Council tax payments" unit=" GBP" /></Card></Section></Screen>;

  if (screen === 'budget') return <Screen screen={screen} title="November" action={{ kind: 'text', label: data.flags['budget-edit'] ? 'Done' : 'Edit', onPress: () => flag('budget-edit') }}>
    <Text variant="callout" tone="ink2">Money</Text><Heading title="November" sub={`${shown(Math.floor(seed.finance.accounts[0].amount))} left to spend · 16 days to go`} />
    {seed.finance.budget.map(item => { const limit = Number(data.choices[`budget-${item.name}`] ?? item.limit); return <Card key={item.name} style={{ gap: space.xs }}><View style={layout.between}><Text variant="title">{item.name}</Text><Text variant="callout" tone="ink2">{`${shown(item.spent)} of ${shown(limit)}`}</Text></View><CapsuleMeter size="bar" value={limit > 0 ? Math.min(1, item.spent / limit) : 0} color={item.name === 'Rent' || item.name === 'Tax pot' ? tokens.gain : limit > 0 && item.spent / limit >= .9 ? tokens.ember : tokens.ink} />{data.flags['budget-edit'] ? <Slider value={limit} min={0} max={Math.max(2000, item.limit * 2)} step={10} onChange={value => choose(`budget-${item.name}`, String(value))} accessibilityLabel={`${item.name} budget`} /> : null}</Card>; })}
  </Screen>;
  if (screen === 'networth') {
    const total = seed.finance.netWorth.reduce((sum, account) => sum + account.amount, 0);
    return <Screen screen={screen} title="Net worth" action={{ kind: 'icon', icon: hidden ? 'eye-off-outline' : 'eye-outline', label: hidden ? 'Show numbers' : 'Hide numbers', onPress: () => pref('hideBalances', !hidden) }}><MoneyFigure value={total} decimals={0} hidden={hidden} align="left" /><Text variant="callout" tone="gain">{`▲ ${shown(seed.finance.netWorthGain)} this year`}</Text><Card><TrendLine values={[total - seed.finance.netWorthGain, 18000, 19400, 20100, 22000, total]} labels={['Dec', '', '', '', '', 'Nov']} label="Net worth" unit=" GBP" /></Card><Rows rows={seed.finance.netWorth.map(account => ({ title: account.name, value: `${account.amount < 0 ? '− ' : ''}${shown(Math.abs(account.amount))}`, sub: account.name === 'Student loan' ? 'Doesn’t act like debt' : undefined }))} /></Screen>;
  }
  return <Screen screen={screen} footer={<Button label="Choose your bank" onPress={() => { choose('bank', bank); flag('bank-connected-preview', true); nav.replace('money'); }} />}><Heading title="See all your money in one place" /><Rows rows={[{ title: 'Read-only', sub: 'life can’t move money' }, { title: 'Your login stays with your bank', sub: 'You approve in your bank’s app' }, { title: 'Ends after 90 days', sub: 'Renew in one tap' }]} /><ChipGroup options={['Monzo', 'Starling', 'Barclays', 'HSBC', 'Lloyds', 'Nationwide'].map(value => ({ value, label: value }))} value={bank} onChange={setBank} /><LocalNotice text="Local preview · choosing a bank does not open banking or request credentials." /></Screen>;
}
