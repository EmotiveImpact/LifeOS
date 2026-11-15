import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Input, Label, Tabs, TextField, useBottomSheetAwareHandlers } from 'heroui-native';
import { localDateString } from '@life/core/engine';
import {
  getGrowthTimeline,
  GROWTH_LESSONS,
  preferenceSnapshot,
  RESET_STEPS,
  saveGrowthCheckIn,
  snoozeGrowthReview,
  startGrowthPlan,
} from '@life/core/growth';
import type {
  GrowthCheckInId,
  GrowthPath,
  GrowthPlan,
  LessonDepth,
  LessonId,
} from '@life/core/types';
import { useLife, hapticLight, hapticSuccess } from '@/state/useLifeStore';
import { StatusBadge, StyledIonicons, TonalCard } from '@/components/LifePrimitives';

const PATHS: Array<{ id: GrowthPath; title: string; description: string }> = [
  {
    id: 'reset',
    title: 'Fix my life',
    description: 'Make tomorrow a little easier with a five-minute reset.',
  },
  {
    id: 'goal',
    title: 'Build toward a goal',
    description: 'Choose what would change and how you will recognise progress.',
  },
  {
    id: 'learn',
    title: 'Learn a skill',
    description: 'Try a short lesson and explain it in your own words.',
  },
];

const DEPTHS: Array<[LessonDepth, string]> = [
  ['starter', 'Quick idea'],
  ['practice', 'Try it'],
  ['deep', 'Go deeper'],
];

export function GrowthSheetContent({
  initialTab = 'check-ins',
}: {
  initialTab?: 'plan' | 'check-ins' | 'learn';
}) {
  const { profile, updateProfile } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();
  const today = localDateString();

  const [tab, setTab] = useState<'plan' | 'check-ins' | 'learn'>(initialTab);
  const [activeCheckInId, setActiveCheckInId] = useState<GrowthCheckInId | undefined>();
  const [answersDraft, setAnswersDraft] = useState<Record<string, string>>({});
  const [submittedCheckIn, setSubmittedCheckIn] = useState(false);

  const [selectedLessonId, setSelectedLessonId] = useState<LessonId>('next-step');
  const [depth, setDepth] = useState<LessonDepth>('starter');
  const [teachBackNote, setTeachBackNote] = useState('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const plan = profile.growth;
  const savePlan = (growth: GrowthPlan) => updateProfile({ growth });

  const startPlan = (skipPreferences: boolean) => {
    hapticSuccess();
    const fresh = startGrowthPlan(today);
    savePlan(skipPreferences ? { ...fresh, skippedCheckIns: ['preferences'] } : fresh);
    if (!skipPreferences) {
      setActiveCheckInId('preferences');
      setTab('check-ins');
    }
  };

  if (!plan) {
    return (
      <View className="gap-4 pb-6">
        <TonalCard variant="secondary" className="gap-3 p-5">
          <Text className="text-[22px] font-bold tracking-tight text-foreground">
            Find your starting point
          </Text>
          <Text className="text-[14px] leading-[20px] text-muted">
            A short preferences check-in helps adapt recommendations, SWOT reflection, emotional
            clarity, and clear reasoning to how you think. Or skip straight to a 5-minute reset.
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <Button size="sm" onPress={() => startPlan(false)}>
              <Button.Label>Start preferences check-in</Button.Label>
            </Button>
            <Button size="sm" variant="secondary" onPress={() => startPlan(true)}>
              <Button.Label>Skip to paths</Button.Label>
            </Button>
          </View>
        </TonalCard>
      </View>
    );
  }

  const timeline = getGrowthTimeline(plan, today);
  const selectedCheckIn = timeline.find((item) => item.id === activeCheckInId);
  const activeLesson =
    GROWTH_LESSONS.find((l) => l.id === selectedLessonId) ?? GROWTH_LESSONS[0];
  const savedLessonNote = plan.lessons?.[activeLesson.id]?.explanation;

  const openCheckIn = (id: GrowthCheckInId) => {
    hapticLight();
    const hist = plan.checkIns?.[id] ?? [];
    setAnswersDraft(hist[hist.length - 1]?.answers ?? {});
    setSubmittedCheckIn(false);
    setActiveCheckInId(id);
  };

  const submitCheckIn = () => {
    if (!selectedCheckIn) return;
    hapticSuccess();
    savePlan(saveGrowthCheckIn(plan, selectedCheckIn.id, answersDraft, today));
    setSubmittedCheckIn(true);
  };

  return (
    <View className="gap-4 pb-6">
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setActiveCheckInId(undefined);
        }}
        variant="primary"
      >
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="plan" className="flex-1">
            <Tabs.Label>Plan</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="check-ins" className="flex-1">
            <Tabs.Label>Check-ins</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="learn" className="flex-1">
            <Tabs.Label>Learn</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="plan" className="mt-3 gap-3">
          <TonalCard variant="secondary" className="gap-2.5">
            <Text className="text-[14px] font-semibold text-foreground">
              Choose your focus path
            </Text>
            {PATHS.map((p) => {
              const active = plan.path === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    hapticLight();
                    savePlan({ ...plan, path: p.id });
                  }}
                  className={`rounded-2xl p-3.5 ${active ? 'bg-accent' : 'bg-surface'}`}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      active ? 'text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    {p.title}
                  </Text>
                  <Text
                    className={`mt-0.5 text-[12px] ${
                      active ? 'text-accent-foreground/80' : 'text-muted'
                    }`}
                  >
                    {p.description}
                  </Text>
                </Pressable>
              );
            })}
          </TonalCard>

          <TonalCard variant="secondary" className="gap-2.5">
            <Text className="text-[14px] font-semibold text-foreground">5-minute reset steps</Text>
            {RESET_STEPS.map((step, i) => (
              <Pressable
                key={step.lesson}
                onPress={() => {
                  setSelectedLessonId(step.lesson);
                  setTab('learn');
                }}
                className="flex-row items-center justify-between gap-2 rounded-2xl bg-surface p-3"
              >
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-foreground">
                    {i + 1}. {step.title}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-muted">{step.guidance}</Text>
                </View>
                <StyledIonicons name="arrow-forward" size={16} className="text-muted" />
              </Pressable>
            ))}
          </TonalCard>
        </Tabs.Content>

        <Tabs.Content value="check-ins" className="mt-3 gap-2.5">
          {selectedCheckIn ? (
            <TonalCard variant="secondary" className="gap-3">
              <View className="flex-row items-center justify-between gap-2">
                <Pressable
                  onPress={() => setActiveCheckInId(undefined)}
                  className="flex-row items-center gap-1"
                >
                  <StyledIonicons name="chevron-back" size={16} className="text-foreground" />
                  <Text className="text-[13px] font-semibold text-foreground">All 6 stages</Text>
                </Pressable>
                {selectedCheckIn.optional && <StatusBadge label="Optional" tone="neutral" />}
              </View>

              <Text className="text-[20px] font-bold text-foreground">
                {selectedCheckIn.label}
              </Text>
              <Text className="text-[13px] leading-[18px] text-muted">
                {selectedCheckIn.intro}
              </Text>

              {selectedCheckIn.prompts.map((prompt) => {
                const picked = answersDraft[prompt.id];
                return (
                  <View key={prompt.id} className="gap-2 rounded-2xl bg-surface p-3.5">
                    <Text className="text-[14px] font-semibold leading-[19px] text-foreground">
                      {prompt.text}
                    </Text>

                    {prompt.options ? (
                      <View className="gap-1.5">
                        {prompt.options.map((opt, idx) => {
                          const selected = picked === String(idx);
                          return (
                            <Pressable
                              key={opt}
                              onPress={() =>
                                setAnswersDraft((prev) => ({ ...prev, [prompt.id]: String(idx) }))
                              }
                              className={`rounded-xl px-3.5 py-2.5 ${
                                selected ? 'bg-accent' : 'bg-surface-secondary'
                              }`}
                            >
                              <Text
                                className={`text-[13px] font-medium ${
                                  selected ? 'text-accent-foreground' : 'text-foreground'
                                }`}
                              >
                                {opt}
                              </Text>
                            </Pressable>
                          );
                        })}
                        {submittedCheckIn && prompt.explanation && (
                          <Text className="mt-1 text-[12px] leading-[17px] text-emerald-600 dark:text-emerald-300">
                            {prompt.explanation}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <TextField>
                        <Input
                          value={picked ?? ''}
                          onChangeText={(txt) =>
                            setAnswersDraft((prev) => ({ ...prev, [prompt.id]: txt }))
                          }
                          placeholder="Write a brief reflection..."
                          multiline
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </TextField>
                    )}
                  </View>
                );
              })}

              {selectedCheckIn.id === 'preferences' &&
                preferenceSnapshot(answersDraft) && (
                  <View className="rounded-2xl bg-surface p-3.5">
                    <Text className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted">
                      Style pattern: {preferenceSnapshot(answersDraft)?.code}
                    </Text>
                    <Text className="mt-1 text-[13px] text-foreground">
                      {preferenceSnapshot(answersDraft)?.practiceTip}
                    </Text>
                  </View>
                )}

              <Button size="sm" onPress={submitCheckIn}>
                <Button.Label>
                  {submittedCheckIn ? 'Saved check-in ✓' : 'Save reflection'}
                </Button.Label>
              </Button>
            </TonalCard>
          ) : (
            <>
              <Text className="px-1 text-[13px] text-muted">
                Six short check-ins designed to calibrate your plan. Tap any card to open or revisit.
              </Text>
              {timeline.map((item) => (
                <TonalCard
                  key={item.id}
                  variant="secondary"
                  className="flex-row items-center justify-between gap-3"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[15px] font-semibold text-foreground">
                        {item.label}
                      </Text>
                      {item.optional && <StatusBadge label="Optional" tone="neutral" />}
                    </View>
                    <Text className="mt-0.5 text-[12px] text-muted">
                      {item.reviewDue
                        ? 'Ready to revisit'
                        : item.last
                          ? `Checked ${item.last.on}`
                          : item.skipped
                            ? 'Skipped'
                            : item.available
                              ? 'Ready now'
                              : `Opens ${item.availableOn}`}
                    </Text>
                  </View>

                  <Button size="sm" onPress={() => openCheckIn(item.id)}>
                    <Button.Label>{item.last ? 'Revisit' : 'Open'}</Button.Label>
                  </Button>
                </TonalCard>
              ))}

              {timeline.some((i) => i.reviewDue) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => savePlan(snoozeGrowthReview(plan, today))}
                >
                  <Button.Label>Remind me in a week</Button.Label>
                </Button>
              )}
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="learn" className="mt-3 gap-3">
          <View className="flex-row flex-wrap gap-1.5">
            {GROWTH_LESSONS.map((l) => {
              const active = l.id === activeLesson.id;
              return (
                <Pressable
                  key={l.id}
                  onPress={() => {
                    hapticLight();
                    setSelectedLessonId(l.id);
                    setTeachBackNote(plan.lessons?.[l.id]?.explanation ?? '');
                  }}
                  className={`rounded-full px-3 py-1.5 ${
                    active ? 'bg-accent' : 'bg-surface-secondary'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      active ? 'text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    {l.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TonalCard variant="secondary" className="gap-3">
            <View className="flex-row gap-1.5">
              {DEPTHS.map(([key, label]) => {
                const active = depth === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setDepth(key)}
                    className={`flex-1 items-center rounded-xl py-2 ${
                      active ? 'bg-surface' : 'bg-transparent'
                    }`}
                  >
                    <Text className="text-[12px] font-semibold text-foreground">{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-[15px] leading-[22px] text-foreground">
              {activeLesson.depths[depth]}
            </Text>
            <View className="rounded-2xl bg-surface p-3">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                Worked example
              </Text>
              <Text className="mt-1 text-[13px] leading-[18px] text-foreground">
                {activeLesson.example}
              </Text>
            </View>

            <TextField>
              <Label>{activeLesson.teachBack}</Label>
              <Input
                value={teachBackNote}
                onChangeText={setTeachBackNote}
                placeholder="Write in your own words..."
                multiline
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </TextField>

            <Button
              size="sm"
              className="self-start"
              onPress={() => {
                const clean = teachBackNote.trim();
                if (!clean) return;
                hapticSuccess();
                savePlan({
                  ...plan,
                  lessons: {
                    ...(plan.lessons ?? {}),
                    [activeLesson.id]: {
                      depth,
                      explanation: clean,
                      confidence: 'ready',
                      on: today,
                    },
                  },
                });
              }}
            >
              <Button.Label>Save explanation</Button.Label>
            </Button>

            {savedLessonNote && (
              <Text className="text-[12px] text-emerald-600 dark:text-emerald-300">
                Saved note: {savedLessonNote}
              </Text>
            )}
          </TonalCard>
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
