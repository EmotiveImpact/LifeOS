import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, CapsuleMeter, ChipGroup, Checklist, Icon, ImageTreatment, LifeOrb, ListRow, Press, Segmented, StatusPill, Text, TwoTone, componentSize, palette, radius, space, storyImage, touch, useCalmMotion, useTokens } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { isOnLocalDay } from '@/state/day';
import { money, moodLines, seed, seedTaxClaim } from '@/state/seed';
import { Rows, Section, layout } from './Screen';
import { IllnessCard } from './HealthDetails';

export type TodayQuestion = { intro: string; focus: string; choices: string[]; why: string };
/** Original calmer composition, with life's full daily state retained below it. */
export function TodayHome({ metrics, now, dayKey, question, answered, onAnswer }: { metrics: { label: string; value: string }[]; now: Date; dayKey: string; question?: TodayQuestion; answered: boolean; onAnswer: (answer: string) => void }) {
  const t = useTokens(), calm = useCalmMotion(), nav = useNavigation();
  const { data, set, choose, engine } = useSeed();
  const [tab, setTab] = useState<'Insights' | 'Money' | 'Progress'>('Insights');
  const [showWhy, setShowWhy] = useState(false), [showDayTools, setShowDayTools] = useState(false);
  const lastPulse = [...data.pulseLog].reverse().find(entry => isOnLocalDay(entry.at, dayKey));
  const skipped = data.choices['pulse-skipped-day'] === dayKey;
  const cleared = data.completed.includes('uk-hmrc-tax-code');
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const billDays = Math.round((Date.UTC(nextBill.getFullYear(), nextBill.getMonth(), nextBill.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  const openMove = () => { set({ selectedMission: 'uk-hmrc-tax-code' }); nav.go('taxcheck'); };
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const moment = data.prefs.followMood && lastPulse ? ['drained', 'anxious'].includes(lastPulse.moodId) ? 'drained' : ['driven', 'restless'].includes(lastPulse.moodId) ? 'driven' : 'calm' : 'calm';
  const moodCopy = lastPulse ? moodLines[lastPulse.moodId] ?? moodLines.calm : null;
  return <View style={{ gap: space.lg }}>
    <View style={{ gap: space.xs }}>
      <View style={layout.between}>
        <Text variant="greeting" style={{ flex: 1 }} numberOfLines={1}>{greeting}, {data.profile.name}.</Text>
        <Press onPress={() => nav.go('levels')} accessibilityLabel={`Level ${engine.level.currentLevel}, your levels`} style={{ minHeight: touch.min, justifyContent: 'center' }}><StatusPill label={`Level ${engine.level.currentLevel}`} /></Press>
      </View>
      <TwoTone segments={cleared ? [{ text: 'Your chosen move is ', tone: 'quiet' }, { text: 'finished. ' }, { text: 'Your next bill is due ', tone: 'quiet' }, { text: nextBill.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }, { text: '.', tone: 'quiet' }] : [{ text: 'Your ', tone: 'quiet' }, { text: 'tax code ' }, { text: 'is worth a look. ', tone: 'quiet' }, { text: data.profile.destination === 'buy-home' ? 'Your first home ' : 'Your Aim ' }, { text: 'is still the bigger picture.', tone: 'quiet' }]} />
    </View>
    {cleared ? <Card padding={space.md} style={{ gap: space.sm }}>
      <View style={layout.row}><LifeOrb size={space.xxl} state={calm ? 'ring' : 'done'} /><Text variant="headline" style={{ flex: 1 }}>Your chosen move is finished.</Text></View>
      <Text variant="body" tone="ink2">That is enough. Your plan is here when you need it.</Text>
      <View style={layout.between}><Button variant="link" label="View your plan" onPress={() => nav.go('plan')} /><Button variant="link" label="Undo" onPress={() => set({ completed: data.completed.filter(id => id !== 'uk-hmrc-tax-code') })} /></View>
    </Card> : <Card padding={space.md} style={{ gap: space.xs }}>
      <Text variant="title">Start with your payslip</Text>
      <Text variant="body" tone="ink2">One short check, with guidance as you go.</Text>
      <Button label="Start the check" icon="arrow-forward" iconPosition="trailing" onPress={openMove} />
      <View style={layout.between}>
        <Press haptic="open" onPress={() => nav.go('aim')} accessibilityLabel="Your Chief Aim" style={[layout.row, { flex: 1, minHeight: touch.min, gap: space.xs }]}>
          <Icon name="home-outline" size={componentSize.icon} color={t.ink2} />
          <Text variant="callout" tone="ink2" style={{ flex: 1 }}>{data.aim ? data.profile.destination === 'buy-home' ? 'For your first home' : 'For your Aim' : 'Choose your Aim'}</Text>
        </Press>
        <Press haptic="select" onPress={() => setShowWhy(value => !value)} accessibilityLabel="Why this move?" accessibilityState={{ expanded: showWhy }} style={{ minHeight: touch.min, justifyContent: 'center' }}><Text variant="callout">{showWhy ? 'Hide explanation' : 'Why this?'}</Text></Press>
      </View>
      {showWhy ? <Text variant="callout" tone="ink2">Your saved work details make this a useful check. The estimate comes from life’s engine and a sample case—not a live check of your HMRC record.</Text> : null}
    </Card>}
    <Press haptic="open" onPress={() => nav.go('pulse')} accessibilityLabel={lastPulse ? 'Open your Pulse' : 'Open check-in'}>
      <ImageTreatment kind="card" source={storyImage(data.prefs.look, moment)} height={componentSize.nextMovePhoto} focalY={.76}>
        <View style={[layout.between, { alignItems: 'flex-end' }]}>
          <View style={{ flex: 1, gap: space.xxs }}><Text variant="headline" tone="paper">{moodCopy ? moodCopy[0] : skipped ? 'A little time, well spent.' : 'How are you arriving?'}</Text><Text variant="callout" tone="paper2">{lastPulse ? 'From your Pulse · checked in today' : skipped ? 'Check-in skipped. No penalty.' : 'A quick check-in, if you want.'}</Text></View>
          {!lastPulse && !skipped ? <View style={{ width: touch.min, height: touch.min, borderRadius: radius.md, backgroundColor: palette.dark.surface, justifyContent: 'center', alignItems: 'center' }}><Icon name="arrow-forward" size={componentSize.navIcon} color={t.paper} /></View> : null}
        </View>
      </ImageTreatment>
    </Press>
    {data.aim ? <Press haptic="open" onPress={() => nav.go('aim')} accessibilityLabel="View your Aim and progress" style={{ minHeight: touch.min, gap: space.xxs }}><Text variant="callout" tone="ink2">{`Your Aim · ${Math.round(seed.finance.deposit / seed.finance.depositGoal * 100)}% there`}</Text><Text variant="greeting" numberOfLines={2}>{`${data.aim.what} by ${data.aim.when}`}</Text></Press> : null}
    <Section title="Body at a glance" meta="Choose numbers" onPress={() => nav.go('customise')}>
      <Card padding={space.md}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>{metrics.map(metric => <Press key={metric.label} haptic="open" onPress={() => nav.go('body')} accessibilityLabel={`${metric.label}, ${metric.value}. Sample reading. Open Body.`} style={{ width: '28%', flexGrow: 1, minHeight: componentSize.row, gap: space.xxs }}><Text variant="callout" tone="ink2">{metric.label}</Text><Text variant="headline">{metric.value}</Text></Press>)}</View><Text variant="micro" tone="ink2">Sample readings · no live health connection</Text></Card>
    </Section>
    {data.flags['lighter-day'] ? <IllnessCard /> : null}
    <Press haptic="open" onPress={() => nav.go('knows')} accessibilityLabel="What life knows about you" style={[layout.row, { minHeight: touch.min }]}><Text variant="callout" tone="ink2">life knows you</Text><CapsuleMeter size="thin" value={data.knowledge.overall / 100} style={{ flex: 1 }} /><Text variant="callout">{`${data.knowledge.overall}%`}</Text></Press>
    {answered ? <View style={layout.between}><Text variant="callout" tone="ink2" style={{ flex: 1 }}>Saved to what life knows. That’s enough for today.</Text><Button variant="link" label="View" onPress={() => nav.go('knows')} /></View> : question ? <Section title="life is asking"><Card padding={space.md} style={{ gap: space.md }}><TwoTone size="headline" segments={[{ text: question.intro, tone: 'quiet' }, { text: question.focus }]} /><ChipGroup options={question.choices.map(value => ({ value, label: value }))} value={null} onChange={onAnswer} /><Text variant="callout" tone="ink2">{question.why}</Text></Card></Section> : null}
    <Section title="Also on your radar" meta="Your plan" onPress={() => nav.go('plan')}>
      <Card padding={space.md}>
        <ListRow icon="calendar-outline" title="Council tax" sub={nextBill.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} right={<Text variant="callout">{`In ${billDays} days`}</Text>} chevron onPress={() => nav.go('bill')} />
        <ListRow icon="heart-outline" title="Hospital referral" sub="Waiting 11 weeks · sample record" chevron onPress={() => { set({ selectedMission: 'nhs-outpatient-referral' }); nav.go('mission'); }} />
        <ListRow icon="gift-outline" title="Kofi’s birthday" sub="18 November · saved date" chevron onPress={() => { choose('person', 'kofi'); nav.go('person'); }} />
      </Card>
    </Section>
    <Section title="A little more, when you want it">
      <Segmented options={(['Insights', 'Money', 'Progress'] as const).map(value => ({ value, label: value }))} value={tab} onChange={setTab} />
      {tab === 'Insights' ? <Rows rows={[{ title: 'Things to know', sub: 'Useful context, not another to-do list', icon: 'document-text-outline', to: 'ttk' }, { title: 'The barbell, and your buffer', sub: 'Today’s idea · 60 sec · Taleb', icon: 'book-outline', to: 'idea' }]} /> : tab === 'Money' ? <Card padding={space.md} style={{ gap: space.md }}><Text variant="title">Your tax record is worth checking</Text><Text variant="body" tone="ink2">{data.prefs.hideBalances ? 'Amounts hidden' : `Estimated rebate ${money(seedTaxClaim.refund)}`}</Text><Button variant="secondary" label="Open Money" onPress={() => nav.go('money')} /></Card> : <Checklist header={`To reach level ${Math.min(4, engine.level.currentLevel + 1)}`} items={engine.level.toAdvance.slice(0, 3).map(item => ({ label: item.label, done: item.done }))} onToggle={index => nav.go(index === 0 ? 'cashplan' : index === 1 ? 'taxcheck' : 'missions')} />}
    </Section>
    <Button variant="secondary" label={showDayTools ? 'Fewer day tools' : 'More from your day'} onPress={() => setShowDayTools(value => !value)} />
    {showDayTools ? <Rows rows={[{ title: 'Your habits', icon: 'checkmark-circle-outline', to: 'habits' }, { title: 'Today’s shape', icon: 'calendar-outline', to: 'calendar' }, { title: 'Focus session', icon: 'time-outline', to: 'focus' }, { title: 'Your routines', to: 'routines' }, { title: 'Morning brief', to: 'morningbrief' }, { title: 'Checking in', to: 'checkin' }, { title: 'Close the day', to: 'evening' }, { title: 'Your body this week', to: 'healthdigest' }, { title: 'Customise Today', to: 'customise' }]} /> : null}
    <Text variant="callout" tone="ink2">Local preview · accounts, appointments and reminders are sample records.</Text>
  </View>;
}
