import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, CapsuleMeter, ChipGroup, LedgerRow, MoneyFigure, Slider, StatusPill, Text, Ticks, TrendLine, space, useTokens } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { money, seed, seedSubscriptionDetails } from '@/state/seed';
import { useLocalSearchParams } from 'expo-router';
import { ParentStateContent } from './States';
import { Heading, LocalNotice, Rows, Screen, Section, layout } from './Screen';

export function MoneyScreen({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), tokens = useTokens(), { data, set, pref, flag, choose, engine } = useSeed();
  const [bank, setBank] = useState(data.choices.bank ?? 'Monzo'), [category, setCategory] = useState('');
  const subscriptions = data.profile.subscriptions ?? [], activeSubs = subscriptions.filter(s => !s.cancelled);
  const unusedSubs = activeSubs.filter(subscription => !subscription.essential);
  const monthly = activeSubs.reduce((sum, subscription) => sum + subscription.monthlyCost, 0), hidden = data.prefs.hideBalances;
  const shown = (amount: number, decimals = 0) => hidden ? '••••' : money(amount, decimals);
  const params = useLocalSearchParams<{ state?: string }>();
  if (screen === 'money' && params.state === 'offline') return <Screen screen={screen} title="Money"><ParentStateContent kind="offline" /></Screen>;

  if (screen === 'money') {
    const last = seed.finance.balanceHistory.length - 1;
    const selectedDay = Number(data.choices['money-day'] ?? last);
    const index = Number.isFinite(selectedDay) ? Math.max(0, Math.min(last, Math.round(selectedDay))) : last;
    const date = new Date(`${seed.date.slice(0, 10)}T12:00:00`);
    date.setDate(date.getDate() - (last - index));
    const label = `${index === last ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · all accounts`;
    return <Screen screen={screen} title="Money" action={{ kind: 'icon', icon: hidden ? 'eye-off-outline' : 'eye-outline', label: hidden ? 'Show balances' : 'Hide balances', onPress: () => pref('hideBalances', !hidden) }}>
      <View style={{ gap: space.sm }}>
        <Text variant="callout" tone="ink2" align="center">{label}</Text>
        <MoneyFigure value={seed.finance.balanceHistory[index]} hidden={hidden} />
        <Text variant="callout" tone="ink2" align="center">{hidden ? 'Monthly movement hidden' : `▲ ${seed.finance.balanceChange.pct}% · +${money(seed.finance.balanceChange.amount, 2)} this month`}</Text>
      </View>
      <Ticks count={seed.finance.balanceHistory.length} variant="scrubber" activeIndex={index} onScrub={value => choose('money-day', String(value))} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {seed.finance.accounts.map((account, i) => <Card key={account.name} onPress={() => nav.go(i === 0 ? 'budget' : i === 1 ? 'bill' : 'buffer')} padding={space.xs} style={{ flex: 1, minWidth: space.xxxl * 2, gap: space.xs }}><Text variant="callout" tone="ink2">{account.name}</Text><Text variant="body">{shown(account.amount, 2)}</Text></Card>)}
      </View>
      <View style={{ gap: space.xs }}>
        <View style={layout.between}><Text variant="title">Ledger</Text><Text variant="callout" tone="ink2">Today</Text></View>
        {seed.finance.transactions.map((transaction, i) => <LedgerRow key={transaction.name} title={transaction.name} sub={transaction.detail} amount={Math.abs(transaction.amount)} direction={transaction.amount > 0 ? 'in' : 'out'} hidden={hidden} onPress={() => { choose('transaction', String(i)); nav.go('txn'); }} />)}
      </View>
      <Rows rows={[{ title: 'Budget', to: 'budget' }, { title: 'Net worth', to: 'networth' }, { title: 'Subscriptions', to: 'subs' }, { title: 'Connect your bank', to: 'connectbank' }]} />
      {data.flags['bank-connected-preview'] ? <LocalNotice text={`${data.choices.bank ?? bank} selected for this local preview. No bank is connected; these are sample balances.`} /> : null}
    </Screen>;
  }
  if (screen === 'subs') return <Screen screen={screen} title="Subscriptions">
    <View style={{ gap: space.xs }}><Text variant="callout" tone="ink2">Every month</Text><MoneyFigure value={monthly} hidden={hidden} align="left" /></View>
    {unusedSubs.length ? <Section title="Not being used">
      <Text variant="body" tone="ink2">{`${shown(unusedSubs.reduce((sum, subscription) => sum + subscription.monthlyCost, 0), 2)} a month · not used in over 60 days`}</Text>
      {unusedSubs.map(subscription => <Card key={subscription.id} style={{ gap: space.sm }}>
        <View style={[layout.between, { alignItems: 'flex-start', flexWrap: 'wrap' }]}><View style={{ flex: 1, minWidth: space.xxxl * 2, gap: space.xxs }}><Text variant="title">{subscription.name}</Text><Text variant="callout" tone="ink2">{seedSubscriptionDetails[subscription.id] ?? 'Renews next month'}</Text></View><Text variant="title">{shown(subscription.monthlyCost, 2)}</Text></View>
        <Button variant="secondary" label={data.flags[`cancel-preview-${subscription.id}`] ? 'Close cancel preview' : 'Preview cancellation'} onPress={() => flag(`cancel-preview-${subscription.id}`)} />
        {data.flags[`cancel-preview-${subscription.id}`] ? <LocalNotice text={`${subscription.name} cancellation is not connected. Open the provider’s account settings yourself; nothing has been cancelled.`} /> : null}
      </Card>)}
    </Section> : <Text variant="body" tone="ink2">No unused subscriptions in your current list.</Text>}
    <Section title="Still in use"><Rows rows={activeSubs.filter(subscription => subscription.essential).map(subscription => ({ title: subscription.name, sub: seedSubscriptionDetails[subscription.id] ?? 'Renews next month', value: shown(subscription.monthlyCost, 2) }))} /></Section>
    {subscriptions.some(subscription => subscription.cancelled) ? <Section title="Cancelled"><Rows rows={subscriptions.filter(subscription => subscription.cancelled).map(subscription => ({ title: subscription.name, sub: 'Marked cancelled in your local plan' }))} /></Section> : null}
    <Text variant="callout" tone="ink2">Nothing is cancelled without you.</Text><LocalNotice text="Local preview · provider cancellation pages are not connected." />
  </Screen>;
  if (screen === 'area') return <Screen screen={screen} title="Money"><Card style={{ gap: space.sm }}><View style={layout.between}><Text variant="title">How strong</Text><StatusPill label="Building" /></View><CapsuleMeter size="bar" value={(engine.areas.find(area => area.id === 'money')?.progressPct ?? 0) / 100} /><Text variant="body" tone="ink2">Buffer 1.3 months · tax up to date · 1 rebate in progress</Text></Card><Section title="Missions" meta="2 active"><Rows rows={[{ title: 'HMRC tax rebate', sub: 'Submitted · sample case', value: 'Waiting', onPress: () => { set({ selectedMission: 'uk-hmrc-tax-code' }); nav.go('mission'); } }, { title: 'Lifetime ISA', sub: '25% bonus', value: 'To do', to: 'aim' }]} /></Section><Section title="Routines"><Rows rows={[{ title: 'Payday sweep', sub: 'Next 28 Nov', value: 'Active', to: 'routines' }]} /></Section><Section title="Tools"><Rows rows={[{ title: '30-day cash plan', to: 'cashplan' }, { title: 'Money & ledger', to: 'money' }, { title: 'Subscriptions', to: 'subs' }, { title: 'Budget', to: 'budget' }, { title: 'Net worth', to: 'networth' }]} /></Section><Button variant="secondary" label="Talk to life…" onPress={() => nav.go('chat')} /></Screen>;

  if (screen === 'txn') {
    const transaction = data.choices.transaction !== undefined ? seed.finance.transactions[Number(data.choices.transaction)] ?? seed.finance.payment : seed.finance.payment;
    const inferredCategory = transaction === seed.finance.payment ? 'Groceries' : transaction.amount > 0 ? 'Income' : transaction.name === 'Rent' ? 'Bills' : transaction.detail;
    const paymentCategory = data.choices[`category-${transaction.name}`] ?? (category || inferredCategory);
    return <Screen screen={screen} title="Payment" action={{ kind: 'icon', icon: 'ellipsis-horizontal', label: 'Payment actions', onPress: () => flag('txn-category-edit') }} footer={<Button variant="secondary" label={data.flags['payment-split'] ? 'Local split saved · undo' : 'Split with Sam'} onPress={() => flag('payment-split')} />}>
      <View style={{ gap: space.xxs }}><Text variant="title">{transaction.name}</Text><Text variant="callout" tone="ink2">{transaction === seed.finance.payment ? transaction.detail : `${transaction.detail} · Today`}</Text></View>
      <MoneyFigure value={Math.abs(transaction.amount)} hidden={hidden} align="left" />
      <Rows rows={[{ title: 'Category', value: paymentCategory, onPress: () => flag('txn-category-edit') }, ...(transaction === seed.finance.payment ? [{ title: 'Repeats', sub: 'About weekly', value: 'Normal' }, { title: 'This month', sub: `${shown(seed.finance.budget[1].spent)} of ${shown(seed.finance.budget[1].limit)} groceries`, value: 'On track' }] : [{ title: 'Type', value: transaction.amount > 0 ? 'Money in' : 'Money out' }, { title: 'Recorded as', value: transaction.detail }])]} />
      {data.flags['txn-category-edit'] ? <ChipGroup options={['Groceries', 'Food', 'Transport', 'Bills', 'Income'].map(value => ({ value, label: value }))} value={paymentCategory} onChange={value => { setCategory(value); choose(`category-${transaction.name}`, value); flag('txn-category-edit', false); }} /> : null}
      {data.flags['payment-split'] ? <LocalNotice text="Split saved on this phone only. No request or payment has been sent to Sam." /> : null}
    </Screen>;
  }
  if (screen === 'bill') return <Screen screen={screen} title="Council tax">
    <View style={{ gap: space.sm }}><MoneyFigure value={seed.finance.councilTaxMonthly} decimals={0} hidden={hidden} align="left" size="l" /><Text variant="body" tone="ink2">a month · Direct Debit · due 1st</Text><StatusPill label="In 16 days" /></View>
    <Card style={{ gap: space.sm }}><Text variant="headline">{data.profile.householdSize === 1 ? `You could pay ${shown(seed.finance.councilTaxMonthly * .25)} less a month` : 'Check your household discount'}</Text><Text variant="body" tone="ink2">{data.profile.householdSize === 1 ? 'You live alone, so the 25% single person discount may apply.' : 'You share your home, so the single person discount may not apply. Check who counts with your council.'}</Text><Button label="Review discount" onPress={() => { set({ selectedMission: 'uk-single-person-council' }); nav.go('mission'); }} /></Card>
    <Section title="Last 12 months"><TrendLine values={Array(12).fill(seed.finance.councilTaxMonthly)} label="Council tax payments" unit=" GBP" /></Section>
    <Text variant="callout" tone="ink2">Guidance, not financial advice. Your council confirms eligibility.</Text>
  </Screen>;

  if (screen === 'budget') {
    const flexible = ['Going out', 'Groceries', 'Transport'].map(name => seed.finance.budget.find(item => item.name === name)!);
    const covered = seed.finance.budget.filter(item => item.name === 'Rent' || item.name === 'Tax pot');
    return <Screen screen={screen} title="November" action={{ kind: 'text', label: data.flags['budget-edit'] ? 'Done' : 'Edit', onPress: () => flag('budget-edit') }}>
      <Text variant="body" tone="ink2">{`${shown(Math.floor(seed.finance.accounts[0].amount))} left to spend · 16 days to go`}</Text>
      {[{ title: 'Flexible spending', items: flexible }, { title: 'Already covered', items: covered }].map(group => <Section key={group.title} title={group.title}>{group.items.map(item => {
        const limit = Number(data.choices[`budget-${item.name}`] ?? item.limit);
        return <View key={item.name} style={{ gap: space.sm, paddingVertical: space.xs }}><View style={[layout.between, { flexWrap: 'wrap' }]}><Text variant="body">{item.name}</Text><Text variant="callout" tone="ink2">{`${shown(item.spent)} of ${shown(limit)}`}</Text></View><CapsuleMeter size="bar" value={limit > 0 ? Math.min(1, item.spent / limit) : 0} color={item.name === 'Rent' || item.name === 'Tax pot' ? tokens.ink2 : limit > 0 && item.spent / limit >= .9 ? tokens.ember : tokens.ink} />{data.flags['budget-edit'] ? <Slider value={limit} min={0} max={Math.max(2000, item.limit * 2)} step={10} onChange={value => choose(`budget-${item.name}`, String(value))} accessibilityLabel={`${item.name} budget`} /> : null}</View>;
      })}</Section>)}
    </Screen>;
  }
  if (screen === 'networth') {
    const total = seed.finance.netWorth.reduce((sum, account) => sum + account.amount, 0);
    return <Screen screen={screen} title="Net worth" action={{ kind: 'icon', icon: hidden ? 'eye-off-outline' : 'eye-outline', label: hidden ? 'Show numbers' : 'Hide numbers', onPress: () => pref('hideBalances', !hidden) }}>
      <View style={{ gap: space.xs }}><MoneyFigure value={total} size="l" decimals={0} hidden={hidden} align="left" /><Text variant="callout" tone="ink2">{`▲ ${shown(seed.finance.netWorthGain)} this year`}</Text></View>
      <TrendLine values={[total - seed.finance.netWorthGain, 18000, 19400, 20100, 22000, total]} labels={['Dec', '', '', '', '', 'Nov']} label="Net worth" unit=" GBP" />
      <Section title="What makes it up"><Rows rows={seed.finance.netWorth.map(account => ({ title: account.name, value: `${account.amount < 0 ? '− ' : ''}${shown(Math.abs(account.amount))}` }))} /><Text variant="callout" tone="ink2">Your student loan doesn’t act like other debt: repayments depend on income, not the balance.</Text></Section>
    </Screen>;
  }
  return <Screen screen={screen} footer={<Button label={`Preview ${bank}`} onPress={() => { choose('bank', bank); flag('bank-connected-preview', true); nav.replace('money'); }} />}>
    <Heading title="See all your money in one place" />
    <Rows rows={[{ title: 'Read-only', sub: 'life can’t move money' }, { title: 'Your login stays with your bank', sub: 'You approve in your bank’s app' }, { title: 'Ends after 90 days', sub: 'Renew in one tap' }]} />
    <ChipGroup options={['Monzo', 'Starling', 'Barclays', 'HSBC', 'Lloyds', 'Nationwide'].map(value => ({ value, label: value }))} value={bank} onChange={setBank} />
    <LocalNotice text="Local preview · choosing a bank shows sample money only. No bank is connected, no bank app opens and no credentials are requested. The permissions describe the planned connection." />
  </Screen>;
}
