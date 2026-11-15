import { useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Button, Input, Label, TextField, useBottomSheetAwareHandlers } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  buildTaskReadingCards,
  computeIncomeBreakdown,
  DEFAULT_HEALTH_SNAPSHOT,
  DEFAULT_SUBSCRIPTIONS,
} from '@life/core/engine';
import { workSetupPatch } from '@life/core/onboarding';
import type { LifeTask, UserProfile, WorkStatus } from '@life/core/types';
import { useLife, hapticLight, hapticSuccess } from '@/state/useLifeStore';
import { StatusBadge, StyledIonicons, TonalCard } from '@/components/LifePrimitives';

interface AgendaEvent {
  id: string;
  title: string;
  timeLabel: string;
  countdownLabel: string;
  scope: 'money' | 'health' | 'growth';
  dotHex: string;
  onPress: () => void;
}

export function TodaySheetContent() {
  const {
    profile,
    updateProfile,
    activeTasks,
    openOverlay,
    openTaskDetail,
  } = useLife();

  const health = profile.health ?? DEFAULT_HEALTH_SNAPSHOT;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'money' | 'health' | 'growth'>('all');
  const [layout, setLayout] = useState<'list' | 'blocks'>('list');

  const doneIds = profile.completedAgendaIds ?? [];
  const toggleDone = (id: string) => {
    hapticSuccess();
    updateProfile({
      completedAgendaIds: doneIds.includes(id)
        ? doneIds.filter((x) => x !== id)
        : [...doneIds, id],
    });
  };

  const weekDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return {
        idx: i,
        dayNum: d.getDate(),
        shortDay: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase(),
      };
    });
  }, []);

  const topTask = activeTasks[0];
  const secondTask = activeTasks[1];

  const rawEvents: AgendaEvent[] = useMemo(() => {
    if (selectedDayIdx === 0) {
      return [
        {
          id: 'ev-water',
          title: 'Morning sunlight + 500ml water',
          timeLabel: '07:30 – 08:00',
          countdownLabel: `${health.waterMlToday}ml logged`,
          scope: 'health',
          dotHex: '#10B981',
          onPress: () => openOverlay('health-stack'),
        },
        {
          id: 'ev-top-move',
          title: topTask ? topTask.shortTitle : 'Review monthly surplus transfer',
          timeLabel: '10:30 – 11:00',
          countdownLabel: 'in 1hr 15m',
          scope: 'money',
          dotHex: '#2347D8',
          onPress: () => (topTask ? openTaskDetail(topTask) : openOverlay('money-work')),
        },
        {
          id: 'ev-checkin',
          title: '5-minute Growth Check-in & evening reflection',
          timeLabel: '19:30 – 19:45',
          countdownLabel: 'Tonight',
          scope: 'growth',
          dotHex: '#8B5CF6',
          onPress: () => openOverlay('growth-checkins'),
        },
      ];
    }
    return [
      {
        id: `ev-day-${selectedDayIdx}-1`,
        title: secondTask ? secondTask.shortTitle : 'Audit tax code & payday reserve',
        timeLabel: '09:00 – 09:30',
        countdownLabel: 'Morning focus',
        scope: 'money',
        dotHex: '#2347D8',
        onPress: () => (secondTask ? openTaskDetail(secondTask) : openOverlay('money-work')),
      },
      {
        id: `ev-day-${selectedDayIdx}-2`,
        title: '40m Zone 2 movement & hydration check',
        timeLabel: '17:30 – 18:10',
        countdownLabel: 'Recovery window',
        scope: 'health',
        dotHex: '#10B981',
        onPress: () => openOverlay('health-stack'),
      },
    ];
  }, [selectedDayIdx, health.waterMlToday, topTask, secondTask, openOverlay, openTaskDetail]);

  const events =
    scopeFilter === 'all' ? rawEvents : rawEvents.filter((e) => e.scope === scopeFilter);

  return (
    <View className="gap-4 pb-6">
      {/* Ref 12: 7-day Calendar Pill Strip */}
      <View className="flex-row gap-1.5">
        {weekDays.map((day) => {
          const active = selectedDayIdx === day.idx;
          return (
            <Pressable
              key={day.idx}
              onPress={() => {
                hapticLight();
                setSelectedDayIdx(day.idx);
              }}
              className={`flex-1 items-center rounded-2xl py-2.5 ${
                active ? 'bg-accent' : 'bg-surface-secondary'
              }`}
            >
              <Text
                className={`text-[10px] font-semibold ${
                  active ? 'text-accent-foreground/80' : 'text-muted'
                }`}
              >
                {day.shortDay}
              </Text>
              <Text
                className={`mt-0.5 text-[16px] font-bold ${
                  active ? 'text-accent-foreground' : 'text-foreground'
                }`}
              >
                {day.dayNum}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row gap-1.5">
          {(['all', 'money', 'health', 'growth'] as const).map((s) => {
            const active = scopeFilter === s;
            return (
              <Pressable
                key={s}
                onPress={() => setScopeFilter(s)}
                className={`rounded-full px-3 py-1.5 ${
                  active ? 'bg-accent' : 'bg-surface-secondary'
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold capitalize ${
                    active ? 'text-accent-foreground' : 'text-foreground'
                  }`}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setLayout((l) => (l === 'list' ? 'blocks' : 'list'))}
          className="rounded-full bg-surface-secondary px-3 py-1.5"
        >
          <Text className="text-[12px] font-semibold text-foreground">
            {layout === 'list' ? 'Blocks' : 'List'}
          </Text>
        </Pressable>
      </View>

      <View className="gap-2.5">
        {events.map((ev) => {
          const done = doneIds.includes(ev.id);
          return (
            <TonalCard
              key={ev.id}
              variant="secondary"
              className="flex-row items-center justify-between gap-3"
            >
              <Pressable onPress={() => toggleDone(ev.id)} className="p-1">
                <StyledIonicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  className={done ? 'text-emerald-500' : 'text-muted'}
                />
              </Pressable>
              <Pressable onPress={ev.onPress} className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <View
                    className="size-2 rounded-full"
                    style={{ backgroundColor: ev.dotHex }}
                  />
                  <Text className="text-[11px] font-semibold uppercase text-muted">
                    {ev.scope} · {ev.timeLabel}
                  </Text>
                </View>
                <Text
                  className={`mt-1 text-[15px] font-semibold ${
                    done ? 'text-muted line-through' : 'text-foreground'
                  }`}
                >
                  {ev.title}
                </Text>
              </Pressable>
              <Text className="text-[12px] font-medium text-muted">{ev.countdownLabel}</Text>
            </TonalCard>
          );
        })}
      </View>
    </View>
  );
}

const TIMELINE_POINTS = [
  { id: 't-2', label: '-2w · Prev', multiplier: 0.91, deltaLabel: '+1.8%' },
  { id: 't-1', label: '-1w', multiplier: 0.96, deltaLabel: '+3.1%' },
  { id: 't-0', label: 'Today', multiplier: 1.0, deltaLabel: '+4.8%' },
  { id: 't+1', label: '+15d · Payday', multiplier: 1.12, deltaLabel: '+12.0%' },
  { id: 't+2', label: '+30d · Net', multiplier: 1.21, deltaLabel: '+21.0%' },
];

export function CashflowSheetContent() {
  const { profile, updateProfile, currency, openOverlay } = useLife();
  const [pointIdx, setPointIdx] = useState(2);

  const breakdown = computeIncomeBreakdown(profile);
  const subs = profile.subscriptions ?? DEFAULT_SUBSCRIPTIONS;
  const activeSubsTotal = subs
    .filter((s) => !s.cancelled)
    .reduce((acc, s) => acc + s.monthlyCost, 0);

  const baseBalance =
    profile.runway !== undefined
      ? Math.max(0, profile.runway.balance + profile.runway.expectedIncome - profile.runway.essentialBills) +
        (profile.openedAccountIds?.includes('acct-cash-buffer') ? 2400 : 850)
      : Math.max(1200, breakdown.netTakeHomeMonthly + 940);

  const point = TIMELINE_POINTS[pointIdx] ?? TIMELINE_POINTS[2];
  const scrubbed = Math.round(baseBalance * point.multiplier);
  const hidden = Boolean(profile.hideBalances);

  return (
    <View className="gap-4 pb-6">
      <LinearGradient
        colors={['#0E302C', '#061515']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-emerald-300">
            {point.deltaLabel} · {point.label}
          </Text>
          <Pressable
            onPress={() => {
              hapticLight();
              updateProfile({ hideBalances: !hidden });
            }}
            className="size-9 items-center justify-center rounded-full bg-white/10"
          >
            <StyledIonicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              style={{ color: '#FFFFFF' }}
            />
          </Pressable>
        </View>

        <Text className="mt-3 text-[36px] font-bold tracking-tight text-white">
          {hidden ? `${currency}•••••` : `${currency}${scrubbed.toLocaleString()}.00`}
        </Text>

        <View className="mt-4 flex-row gap-1.5">
          {TIMELINE_POINTS.map((p, idx) => {
            const active = idx === pointIdx;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  hapticLight();
                  setPointIdx(idx);
                }}
                className={`flex-1 items-center rounded-full py-2 ${
                  active ? 'bg-white' : 'bg-white/10'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    active ? 'text-stone-950' : 'text-stone-200'
                  }`}
                >
                  {p.label.split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <TonalCard variant="secondary" className="gap-3">
        <Text className="text-[14px] font-semibold text-foreground">Monthly flows</Text>
        {[
          {
            title: `${profile.countryCode} net pay (${profile.workStatus})`,
            amount: hidden ? '••••' : `+${currency}${Math.round(breakdown.netTakeHomeMonthly).toLocaleString()}`,
            positive: true,
            overlay: 'money-work' as const,
          },
          {
            title: '30-day runway reserve',
            amount: hidden ? '••••' : `${currency}${Math.round(breakdown.netTakeHomeMonthly * 0.25).toLocaleString()}`,
            positive: false,
            overlay: 'runway-calc' as const,
          },
          {
            title: 'Active subscriptions',
            amount: hidden ? '••••' : `-${currency}${activeSubsTotal.toFixed(0)}/mo`,
            positive: false,
            overlay: 'money-work' as const,
          },
        ].map((row) => (
          <Pressable
            key={row.title}
            onPress={() => openOverlay(row.overlay)}
            className="flex-row items-center justify-between rounded-2xl bg-surface p-3.5"
          >
            <Text className="text-[14px] font-medium text-foreground">{row.title}</Text>
            <Text
              className={`text-[14px] font-bold ${
                row.positive ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground'
              }`}
            >
              {row.amount}
            </Text>
          </Pressable>
        ))}
      </TonalCard>
    </View>
  );
}

export function RunwaySheetContent() {
  const { profile, updateProfile, currency } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const initial = profile.runway ?? {
    balance: 2600,
    expectedIncome: 2950,
    essentialBills: 1850,
    dueSoonLabel: 'Rent & tax reserve',
    followUpLabel: 'Review after payday',
    netRunway: 3700,
    updatedAt: 'Today',
  };

  const [bal, setBal] = useState(String(initial.balance));
  const [inc, setInc] = useState(String(initial.expectedIncome));
  const [bills, setBills] = useState(String(initial.essentialBills));

  const nBal = Math.max(0, Number(bal) || 0);
  const nInc = Math.max(0, Number(inc) || 0);
  const nBills = Math.max(0, Number(bills) || 0);
  const net = nBal + nInc - nBills;
  const daily = Math.max(0, Math.round(net / 30));

  const saveRunway = () => {
    hapticSuccess();
    updateProfile({
      needsCashRunway: net < nBills,
      runway: {
        balance: nBal,
        expectedIncome: nInc,
        essentialBills: nBills,
        dueSoonLabel: initial.dueSoonLabel,
        followUpLabel: initial.followUpLabel,
        netRunway: net,
        updatedAt: 'Updated just now',
      },
    });
  };

  return (
    <View className="gap-4 pb-6">
      <TonalCard variant="secondary" className="gap-1.5">
        <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-muted">
          Safe daily spend (30d horizon)
        </Text>
        <Text className="text-[36px] font-bold text-foreground">
          {currency}
          {daily}/day
        </Text>
        <Text className="text-[13px] text-muted">
          Projected 30-day margin: {currency}
          {net.toLocaleString()}
        </Text>
      </TonalCard>

      <TonalCard variant="secondary" className="gap-3">
        <TextField>
          <Label>Accessible cash now ({currency})</Label>
          <Input value={bal} onChangeText={setBal} keyboardType="numeric" onFocus={onFocus} onBlur={onBlur} />
        </TextField>
        <TextField>
          <Label>Expected income next 30d ({currency})</Label>
          <Input value={inc} onChangeText={setInc} keyboardType="numeric" onFocus={onFocus} onBlur={onBlur} />
        </TextField>
        <TextField>
          <Label>Essential bills & obligations ({currency})</Label>
          <Input value={bills} onChangeText={setBills} keyboardType="numeric" onFocus={onFocus} onBlur={onBlur} />
        </TextField>
        <Button onPress={saveRunway}>
          <Button.Label>Save runway snapshot</Button.Label>
        </Button>
      </TonalCard>
    </View>
  );
}

export function ChatSheetContent() {
  const { messages, sendMessage, openTaskDetail } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const clean = draft.trim();
    if (!clean) return;
    sendMessage(clean);
    setDraft('');
  };

  return (
    <View className="gap-3 pb-6">
      <View className="flex-row flex-wrap gap-1.5">
        {[
          'Move to London',
          'Check my tax code',
          'Cut wasted subscriptions',
          'Focus on health',
        ].map((chip) => (
          <Pressable
            key={chip}
            onPress={() => sendMessage(chip)}
            className="rounded-full bg-surface-secondary px-3 py-1.5"
          >
            <Text className="text-[12px] font-medium text-foreground">{chip}</Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-2.5">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              className={`max-w-[90%] rounded-[20px] p-3.5 ${
                isUser ? 'self-end bg-accent' : 'self-start bg-surface-secondary'
              }`}
            >
              <Text
                className={`text-[14px] leading-[20px] ${
                  isUser ? 'text-accent-foreground' : 'text-foreground'
                }`}
              >
                {m.text}
              </Text>
              {m.cards && m.cards.length > 0 && (
                <View className="mt-2 gap-1.5">
                  {m.cards.map((card) => (
                    <Pressable
                      key={card.id}
                      onPress={() => openTaskDetail(card)}
                      className="rounded-xl bg-surface p-2.5"
                    >
                      <Text className="text-[13px] font-semibold text-foreground">
                        {card.shortTitle} →
                      </Text>
                      <Text className="text-[11px] text-muted">{card.valueBadge}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Tell life what changed (city, pay, health)..."
            returnKeyType="send"
            onSubmitEditing={handleSend}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </View>
        <Button size="sm" onPress={handleSend}>
          <Button.Label>Send</Button.Label>
        </Button>
      </View>
    </View>
  );
}

const COUNTRIES: Array<{ code: UserProfile['countryCode']; name: string; city: string }> = [
  { code: 'UK', name: 'United Kingdom', city: 'London' },
  { code: 'US', name: 'United States', city: 'New York' },
  { code: 'DE', name: 'Germany', city: 'Berlin' },
  { code: 'NG', name: 'Nigeria', city: 'Lagos' },
];

export function IntakeSheetContent() {
  const { profile, updateProfile, resetAll, closeSheet } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const [ageDraft, setAgeDraft] = useState(String(profile.age));
  const [cityDraft, setCityDraft] = useState(profile.city);

  const saveProfileBasics = () => {
    const parsedAge = Math.max(16, Math.min(99, Number(ageDraft) || profile.age));
    updateProfile({
      age: parsedAge,
      city: cityDraft.trim() || profile.city,
    });
    hapticSuccess();
    closeSheet();
  };

  return (
    <View className="gap-4 pb-6">
      <TonalCard variant="secondary" className="gap-3">
        <Text className="text-[14px] font-semibold text-foreground">Country jurisdiction</Text>
        <View className="flex-row flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const active = profile.countryCode === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => {
                  hapticLight();
                  setCityDraft(c.city);
                  updateProfile({
                    countryCode: c.code,
                    countryName: c.name,
                    city: c.city,
                  });
                }}
                className={`rounded-full px-3.5 py-2 ${active ? 'bg-accent' : 'bg-surface'}`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    active ? 'text-accent-foreground' : 'text-foreground'
                  }`}
                >
                  {c.code} · {c.city}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row gap-2">
          <View className="w-24">
            <TextField>
              <Label>Age</Label>
              <Input
                value={ageDraft}
                onChangeText={setAgeDraft}
                keyboardType="numeric"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </TextField>
          </View>
          <View className="flex-1">
            <TextField>
              <Label>City</Label>
              <Input value={cityDraft} onChangeText={setCityDraft} onFocus={onFocus} onBlur={onBlur} />
            </TextField>
          </View>
        </View>

        <Text className="mt-1 text-[13px] font-semibold text-foreground">Work status</Text>
        <View className="flex-row flex-wrap gap-2">
          {(['employed', 'sole-trader', 'director', 'student-between'] as WorkStatus[]).map(
            (ws) => {
              const active = profile.workStatus === ws;
              return (
                <Pressable
                  key={ws}
                  onPress={() => updateProfile(workSetupPatch(profile, ws))}
                  className={`rounded-full px-3 py-1.5 ${active ? 'bg-accent' : 'bg-surface'}`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      active ? 'text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    {ws}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <Button onPress={saveProfileBasics}>
          <Button.Label>Save profile context</Button.Label>
        </Button>
      </TonalCard>

      <Button
        variant="ghost"
        onPress={() => {
          resetAll();
          closeSheet();
        }}
      >
        <Button.Label className="text-rose-500">Reset demo state</Button.Label>
      </Button>
    </View>
  );
}

export function TaskDetailSheetContent({ task }: { task: LifeTask }) {
  const {
    profile,
    completedIds,
    toggleCompleteTask,
    recordTaskOutcome,
    askAboutTask,
  } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const isDone = completedIds.includes(task.id);
  const existingOutcome = profile.recordedOutcomes?.[task.id];
  const [outcomeNote, setOutcomeNote] = useState(existingOutcome?.summary ?? '');
  const readingCards = buildTaskReadingCards(task);

  const stage = isDone ? 3 : existingOutcome ? 2 : 1;

  return (
    <View className="gap-4 pb-6">
      {/* Ref 09: 3-stage milestone stepper + status pill */}
      <TonalCard variant="secondary" className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-muted">
            {task.provider} · {task.category}
          </Text>
          <StatusBadge
            label={isDone ? 'Completed' : task.valueBadge}
            tone={isDone ? 'positive' : 'accent'}
          />
        </View>

        <View className="mt-1 flex-row items-center">
          {['Queued', 'In Progress', 'Completed'].map((label, idx) => {
            const active = stage >= idx + 1;
            return (
              <View key={label} className="flex-1 items-center gap-1">
                <View
                  className={`size-6 items-center justify-center rounded-full ${
                    active ? 'bg-accent' : 'bg-surface'
                  }`}
                >
                  <StyledIonicons
                    name={active ? 'checkmark' : 'ellipse-outline'}
                    size={13}
                    className={active ? 'text-accent-foreground' : 'text-muted'}
                  />
                </View>
                <Text className="text-[11px] font-medium text-muted">{label}</Text>
              </View>
            );
          })}
        </View>
      </TonalCard>

      <TonalCard variant="secondary" className="gap-2">
        <Text className="text-[15px] font-semibold text-foreground">{task.insightSummary}</Text>
        <Text className="text-[13px] leading-[19px] text-muted">{task.personalWhy}</Text>
      </TonalCard>

      <TonalCard variant="secondary" className="gap-2.5">
        <Text className="text-[14px] font-semibold text-foreground">Exact steps</Text>
        {task.steps.map((step, idx) => (
          <View key={idx} className="flex-row gap-2.5">
            <View className="mt-0.5 size-5 items-center justify-center rounded-full bg-surface">
              <Text className="text-[11px] font-bold text-foreground">{idx + 1}</Text>
            </View>
            <Text className="flex-1 text-[13px] leading-[19px] text-foreground">{step}</Text>
          </View>
        ))}
      </TonalCard>

      {readingCards.length > 0 && (
        <View className="gap-2">
          {readingCards.map((c) => (
            <TonalCard key={c.id} variant="secondary" className="gap-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                {c.eyebrow}
              </Text>
              <Text className="text-[14px] font-semibold text-foreground">{c.title}</Text>
              <Text className="text-[12px] leading-[17px] text-muted">{c.detail}</Text>
            </TonalCard>
          ))}
        </View>
      )}

      {/* Chronological Outcome Recorder */}
      <TonalCard variant="secondary" className="gap-2.5">
        <TextField>
          <Label>Record outcome or proof note</Label>
          <Input
            value={outcomeNote}
            onChangeText={setOutcomeNote}
            placeholder="e.g. Updated tax code to 1257L, buffer moved"
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </TextField>

        <View className="flex-row gap-2">
          <Button
            size="sm"
            className="flex-1"
            onPress={() => {
              if (outcomeNote.trim()) {
                recordTaskOutcome(task.id, outcomeNote.trim());
              } else {
                toggleCompleteTask(task.id);
              }
            }}
          >
            <Button.Label>{isDone ? 'Undo completion' : 'Mark complete'}</Button.Label>
          </Button>
          <Button size="sm" variant="secondary" onPress={() => askAboutTask(task)}>
            <Button.Label>Ask AI</Button.Label>
          </Button>
        </View>

        {task.sourceUrl && (
          <Pressable onPress={() => Linking.openURL(task.sourceUrl!).catch(() => {})}>
            <Text className="text-[12px] font-medium text-muted underline">
              Open {task.officialSource ?? 'official source'} ↗
            </Text>
          </Pressable>
        )}
      </TonalCard>
    </View>
  );
}
