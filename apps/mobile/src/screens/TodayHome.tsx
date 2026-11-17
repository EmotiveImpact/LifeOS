import { useState } from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, CapsuleMeter, ChipGroup, Checklist, LifeOrb, ListRow, NextMoveCard, Press, Segmented, StatusPill, Text, TwoTone, componentSize, radius, space, storyImage, touch, useCalmMotion, useTokens } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { isOnLocalDay } from '@/state/day';
import { money, seed, seedTaxClaim } from '@/state/seed';
import { Rows, Section, layout } from './Screen';
import { IllnessCard } from './HealthDetails';

export type TodayQuestion = { intro: string; focus: string; choices: string[]; why: string };
/** V22's editorial day. This is the real persisted app state, not the HTML demo. */
export function TodayHome({ metrics, now, dayKey, question, answered, onAnswer }: { metrics: { label: string; value: string }[]; now: Date; dayKey: string; question?: TodayQuestion; answered: boolean; onAnswer: (answer: string) => void }) {
  const t = useTokens(), calm = useCalmMotion(), nav = useNavigation();
  const { data, set, choose, engine } = useSeed();
  const [tab, setTab] = useState<'Insights' | 'Money' | 'Progress'>('Insights');
  const lastPulse = [...data.pulseLog].reverse().find(entry => isOnLocalDay(entry.at, dayKey));
  const skipped = data.choices['pulse-skipped-day'] === dayKey;
  const cleared = data.completed.includes('uk-hmrc-tax-code');
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const billDays = Math.round((Date.UTC(nextBill.getFullYear(), nextBill.getMonth(), nextBill.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  const openMove = () => { set({ selectedMission: 'uk-hmrc-tax-code' }); nav.go('mission'); };
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  return <View style={{ gap: space.md }}>
    <View style={layout.between}>
      <Text variant="title" style={{ flex: 1 }} numberOfLines={1}>{greeting}, {data.profile.name}</Text>
      <Press onPress={() => nav.go('levels')} accessibilityLabel={`Level ${engine.level.currentLevel}, your levels`} style={{ minHeight: touch.min, justifyContent: 'center' }}><StatusPill label={`Level ${engine.level.currentLevel}`} /></Press>
    </View>
    <TwoTone segments={cleared ? [{ text: 'Your chosen move is ', tone: 'quiet' }, { text: 'finished. ' }, { text: 'Keep your next bill in view: ', tone: 'quiet' }, { text: nextBill.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }, { text: '.', tone: 'quiet' }] : [{ text: 'Your rebate is ', tone: 'quiet' }, { text: 'one form away. ' }, { text: 'Your council tax bill is due in ', tone: 'quiet' }, { text: `${billDays} days.` }]} />
    {lastPulse || skipped ? <View style={layout.between}>
      <View style={[layout.row, { flex: 1 }]}><LifeOrb size={componentSize.icon} state="ring" /><Text variant="callout" tone="ink2" style={{ flex: 1 }}>{lastPulse ? `Feeling ${lastPulse.moodId} · checked in today` : 'Check-in skipped · no penalty'}</Text></View>
      <Button variant="link" label="Change" onPress={() => nav.go('pulse')} />
    </View> : <View style={layout.between}>
      <View style={{ flex: 1, gap: space.xxs }}><Text variant="body">How are you arriving?</Text><Text variant="callout" tone="ink2">A quick check-in, if it helps.</Text></View>
      <Button compact variant="secondary" label="Check in" onPress={() => nav.go('pulse')} />
    </View>}
    {data.aim ? <Press haptic="open" onPress={() => nav.go('aim')} accessibilityLabel="Your Chief Aim" style={layout.row}>
      <Image source={storyImage(data.prefs.look, 'home')} style={{ width: componentSize.rowIcon + space.xxs, height: componentSize.rowIcon + space.xxs, borderRadius: radius.md }} />
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}><Text variant="callout" tone="ink2">{`Your Aim · ${Math.round(seed.finance.deposit / seed.finance.depositGoal * 100)}% there`}</Text><Text variant="body" numberOfLines={2}>{`${data.aim.what} by ${data.aim.when}`}</Text></View>
    </Press> : null}
    {cleared ? <View><Card style={{ gap: space.md }}><View style={layout.row}><LifeOrb size={space.xxl} state={calm ? 'ring' : 'done'} /><Text variant="headline" style={{ flex: 1 }}>Your chosen move is finished.</Text></View><Text variant="body" tone="ink2">That is enough. Your plan is here when you need it.</Text><View style={layout.between}><Button variant="link" label="View your plan" onPress={() => nav.go('plan')} /><Button variant="link" label="Undo" onPress={() => set({ completed: data.completed.filter(id => id !== 'uk-hmrc-tax-code') })} /></View></Card></View> : <NextMoveCard source={storyImage(data.prefs.look, 'calm')} title="HMRC tax rebate" description="One form left · takes 6 min" onPress={openMove} />}
    <Section title="Body at a glance" meta="Choose numbers" onPress={() => nav.go('customise')}>
      <Card padding={space.md}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>{metrics.map(metric => <Press key={metric.label} haptic="open" onPress={() => nav.go('body')} accessibilityLabel={`${metric.label}, ${metric.value}. Sample reading. Open Body.`} style={{ width: '28%', flexGrow: 1, minHeight: componentSize.row, gap: space.xxs }}><Text variant="callout" tone="ink2">{metric.label}</Text><Text variant="headline">{metric.value}</Text></Press>)}</View><Text variant="micro" tone="ink2">Sample readings · no live health connection</Text></Card>
    </Section>
    {data.flags['lighter-day'] ? <IllnessCard /> : null}
    <Press haptic="open" onPress={() => nav.go('knows')} accessibilityLabel="What life knows about you" style={[layout.row, { minHeight: touch.min }]}><Text variant="callout" tone="ink2">life knows you</Text><CapsuleMeter size="thin" value={data.knowledge.overall / 100} style={{ flex: 1 }} /><Text variant="callout">{`${data.knowledge.overall}%`}</Text></Press>
    {answered ? <View style={layout.between}><Text variant="callout" tone="ink2" style={{ flex: 1 }}>Saved to what life knows. That’s enough for today.</Text><Button variant="link" label="View" onPress={() => nav.go('knows')} /></View> : question ? <Section title="life is asking"><Card style={{ gap: space.md }}><TwoTone size="headline" segments={[{ text: question.intro, tone: 'quiet' }, { text: question.focus }]} /><ChipGroup options={question.choices.map(value => ({ value, label: value }))} value={null} onChange={onAnswer} /><Text variant="callout" tone="ink2">{question.why}</Text></Card></Section> : null}
    <Section title="Coming due & waiting">
      <ListRow icon="calendar-outline" title="Council tax" sub={nextBill.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} right={<Text variant="callout">{`In ${billDays} days`}</Text>} chevron onPress={() => nav.go('bill')} />
      <ListRow icon="heart-outline" title="Hospital referral" sub="Waiting 11 weeks · sample record" right={<Text variant="callout" tone="ink2">Follow up</Text>} chevron onPress={() => { set({ selectedMission: 'nhs-outpatient-referral' }); nav.go('mission'); }} />
      <ListRow icon="gift-outline" title="Kofi’s birthday" sub="18 November · saved date" chevron onPress={() => { choose('person', 'kofi'); nav.go('person'); }} />
    </Section>
    <Section title="A little more, when you want it">
      <Segmented options={(['Insights', 'Money', 'Progress'] as const).map(value => ({ value, label: value }))} value={tab} onChange={setTab} />
      {tab === 'Insights' ? <Rows rows={[{ title: 'Things to know', sub: 'Useful context, not another to-do list', to: 'ttk' }, { title: 'The barbell, and your buffer', sub: 'Today’s idea · 60 sec · Taleb', to: 'idea' }]} /> : tab === 'Money' ? <Card style={{ gap: space.md }}><Text variant="title">Your tax record is worth checking</Text><Text variant="body" tone="ink2">{data.prefs.hideBalances ? 'Amounts hidden' : `Estimated rebate ${money(seedTaxClaim.refund)}`}</Text><Button variant="secondary" label="Open Money" onPress={() => nav.go('money')} /></Card> : <Checklist header={`To reach level ${Math.min(4, engine.level.currentLevel + 1)}`} items={engine.level.toAdvance.slice(0, 3).map(item => ({ label: item.label, done: item.done }))} onToggle={index => nav.go(index === 0 ? 'cashplan' : index === 1 ? 'taxcheck' : 'mission')} />}
    </Section>
    <Rows rows={[{ title: 'Your habits', icon: 'checkmark-circle-outline', to: 'habits' }, { title: 'Today’s shape', icon: 'calendar-outline', to: 'calendar' }, { title: 'Focus session', icon: 'time-outline', to: 'focus' }, { title: 'Your routines', to: 'routines' }, { title: 'Morning brief', to: 'morningbrief' }, { title: 'Checking in', to: 'checkin' }, { title: 'Close the day', to: 'evening' }, { title: 'Your body this week', to: 'healthdigest' }, { title: 'Customise Today', to: 'customise' }]} />
    <Text variant="callout" tone="ink2">Local preview · accounts, appointments and reminders are sample records.</Text>
  </View>;
}
