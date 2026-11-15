import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Button, Input, Tabs, TextField, useBottomSheetAwareHandlers } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  advanceOperatingRule,
  EXHAUSTIVE_MISSING_ESSENTIALS,
  localDateString,
  THINKER_ATEAM,
} from '@life/core/engine';
import type { CollectiveGoal, ThinkerWisdom } from '@life/core/types';
import { useLife, hapticLight, hapticSuccess } from '@/state/useLifeStore';
import { StatusBadge, StyledIonicons, TonalCard } from '@/components/LifePrimitives';

const GOAL_META: Array<{ id: CollectiveGoal; label: string; desc: string }> = [
  { id: 'wealth', label: 'Wealth', desc: 'Assets & cash runway' },
  { id: 'fit', label: 'Fitness', desc: 'Strength & metabolic health' },
  { id: 'calm', label: 'Calm', desc: 'Fewer loose ends & margin' },
  { id: 'educated', label: 'Learning', desc: 'Mental models & craft' },
];

export function LevelsSheetContent() {
  const {
    profile,
    updateProfile,
    levelState,
    recapDeck,
    openOverlay,
    openTaskDetail,
    eligibleTasks,
  } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const [tab, setTab] = useState<'levels' | 'audit' | 'ateam'>('levels');
  const [weekIdx, setWeekIdx] = useState(0);
  const [domainFilter, setDomainFilter] = useState<'all' | ThinkerWisdom['domain']>('all');
  const [editingGambit, setEditingGambit] = useState(false);
  const defaultGambit =
    profile.monthlyGambit ||
    'build a 90-day cash buffer and lock in 2 high-leverage setup wins';
  const [gambitDraft, setGambitDraft] = useState(defaultGambit);

  const activeWeek = recapDeck[weekIdx] ?? recapDeck[0];
  const savedWisdom = profile.savedWisdomIds ?? [];
  const featuredThinker =
    THINKER_ATEAM[(weekIdx + savedWisdom.length) % THINKER_ATEAM.length] ?? THINKER_ATEAM[0];
  const selectedGoals = profile.collectiveGoals ?? ['calm', 'wealth', 'fit'];

  const toggleWisdom = (id: string) => {
    hapticLight();
    const next = savedWisdom.includes(id)
      ? savedWisdom.filter((item) => item !== id)
      : [...savedWisdom, id];
    updateProfile({ savedWisdomIds: next });
  };

  const toggleGoal = (goalId: CollectiveGoal) => {
    hapticLight();
    const next = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g) => g !== goalId)
      : [...selectedGoals, goalId];
    if (next.length > 0) updateProfile({ collectiveGoals: next });
  };

  const filteredThinkers =
    domainFilter === 'all'
      ? THINKER_ATEAM
      : THINKER_ATEAM.filter((t) => t.domain === domainFilter);

  return (
    <View className="gap-4 pb-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} variant="primary">
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="levels" className="flex-1">
            <Tabs.Label>Level {levelState.currentLevel}</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="audit" className="flex-1">
            <Tabs.Label>Full Audit</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="ateam" className="flex-1">
            <Tabs.Label>A-Team (12)</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="levels" className="mt-3 gap-3.5">
          {/* Ref 15: 4-week fanned delta stack */}
          <View className="px-2 pt-1">
            <View className="mx-6 h-2 rounded-t-2xl bg-surface-tertiary opacity-50" />
            <View className="mx-3 h-2 rounded-t-2xl bg-surface-tertiary opacity-75" />
            <TonalCard variant="secondary" className="gap-3 rounded-[24px] p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View
                    className="size-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: activeWeek.badgeBgHex }}
                  >
                    <StyledIonicons name="sparkles" size={18} style={{ color: '#FFFFFF' }} />
                  </View>
                  <View>
                    <Text className="text-[12px] font-semibold text-muted">
                      {activeWeek.weekLabel}
                    </Text>
                    <Text className="text-[12px] font-semibold text-foreground">
                      {activeWeek.accentLabel}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-1.5">
                  <Pressable
                    onPress={() =>
                      setWeekIdx((prev) => (prev - 1 + recapDeck.length) % recapDeck.length)
                    }
                    className="size-8 items-center justify-center rounded-full bg-surface"
                  >
                    <StyledIonicons name="chevron-back" size={16} className="text-foreground" />
                  </Pressable>
                  <Pressable
                    onPress={() => setWeekIdx((prev) => (prev + 1) % recapDeck.length)}
                    className="size-8 items-center justify-center rounded-full bg-surface"
                  >
                    <StyledIonicons name="chevron-forward" size={16} className="text-foreground" />
                  </Pressable>
                </View>
              </View>

              <Text className="text-[22px] leading-[29px] text-muted">
                You stayed active{' '}
                <Text className="font-bold text-foreground">
                  {activeWeek.activeDays}
                  {activeWeek.activeDelta === 'up' ? '↑' : '↓'}
                </Text>{' '}
                days with{' '}
                <Text className="font-bold text-foreground">
                  {activeWeek.checkInsCount}
                  {activeWeek.checkInsDelta === 'up' ? '↑' : '↓'}
                </Text>{' '}
                moves and{' '}
                <Text className="font-bold text-foreground">
                  {activeWeek.highlightValue}
                  {activeWeek.highlightDelta === 'up' ? '↑' : '↓'}
                </Text>{' '}
                {activeWeek.highlightUnit}.
              </Text>
            </TonalCard>
          </View>

          {/* Ref 16: Warm Inspiration & Crimson Check-in Prompts */}
          <LinearGradient
            colors={['#7A4A21', '#3E220D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold uppercase tracking-[0.8px] text-amber-200">
                Inspiration · {featuredThinker.name}
              </Text>
              <Pressable onPress={() => toggleWisdom(featuredThinker.id)} className="p-1">
                <StyledIonicons
                  name={savedWisdom.includes(featuredThinker.id) ? 'heart' : 'heart-outline'}
                  size={18}
                  style={{ color: '#FDE68A' }}
                />
              </Pressable>
            </View>
            <Text className="mt-1.5 text-[16px] font-semibold text-white">
              {featuredThinker.coreIdea}
            </Text>
            <Text className="mt-1 text-[12px] leading-[17px] text-amber-100/80">
              {featuredThinker.appliedRule}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#6E1B24', '#380B10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold uppercase tracking-[0.8px] text-rose-200">
                Level Check-in
              </Text>
              <StatusBadge label={`Next: ${levelState.nextLevelName}`} tone="neutral" />
            </View>
            <Text className="mt-1.5 text-[15px] font-semibold text-white">
              {levelState.toAdvance.find((x) => !x.done)?.label ??
                'All level requirements met — new gambits unlocked'}
            </Text>
          </LinearGradient>

          {/* Ref 16: Editable Monthly Goal / Gambit */}
          <TonalCard variant="secondary" className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold text-muted">Your monthly goal</Text>
              <Pressable onPress={() => setEditingGambit((p) => !p)}>
                <Text className="text-[12px] font-semibold text-foreground underline">
                  {editingGambit ? 'Cancel' : 'Edit'}
                </Text>
              </Pressable>
            </View>

            {editingGambit ? (
              <View className="gap-2">
                <TextField>
                  <Input
                    value={gambitDraft}
                    onChangeText={setGambitDraft}
                    multiline
                    numberOfLines={3}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </TextField>
                <Button
                  size="sm"
                  className="self-start"
                  onPress={() => {
                    hapticSuccess();
                    updateProfile({ monthlyGambit: gambitDraft.trim() || defaultGambit });
                    setEditingGambit(false);
                  }}
                >
                  <Button.Label>Save monthly goal</Button.Label>
                </Button>
              </View>
            ) : (
              <Text className="text-[20px] leading-[27px] text-muted">
                I want to <Text className="font-bold text-foreground">{defaultGambit}</Text> so my
                next baseline feels effortless.
              </Text>
            )}
          </TonalCard>

          {/* Collective Goal Chips */}
          <TonalCard variant="secondary" className="gap-2">
            <Text className="text-[13px] font-semibold text-foreground">Focus pillars</Text>
            <View className="flex-row flex-wrap gap-2">
              {GOAL_META.map((g) => {
                const active = selectedGoals.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleGoal(g.id)}
                    className={`rounded-full px-3.5 py-2 ${active ? 'bg-accent' : 'bg-surface'}`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        active ? 'text-accent-foreground' : 'text-foreground'
                      }`}
                    >
                      {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </TonalCard>

          {/* Operating Normals */}
          <TonalCard variant="secondary" className="gap-2.5">
            <Text className="text-[13px] font-semibold text-foreground">Operating Normals</Text>
            {levelState.unlockedNormals.map((rule) => (
              <View
                key={rule.id}
                className="flex-row items-center justify-between gap-2 rounded-2xl bg-surface p-3"
              >
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-foreground">{rule.label}</Text>
                  <Text className="text-[12px] text-muted">{rule.instruction}</Text>
                  <Text className="mt-0.5 text-[11px] text-muted">Next due {rule.nextDueOn}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    hapticSuccess();
                    updateProfile({
                      operatingRuleDates: {
                        ...(profile.operatingRuleDates ?? {}),
                        [rule.id]: advanceOperatingRule(rule, localDateString()),
                      },
                    });
                  }}
                  className="rounded-full bg-accent px-3 py-1.5"
                >
                  <Text className="text-[12px] font-semibold text-accent-foreground">Done</Text>
                </Pressable>
              </View>
            ))}
          </TonalCard>
        </Tabs.Content>

        <Tabs.Content value="audit" className="mt-3 gap-2.5">
          {EXHAUSTIVE_MISSING_ESSENTIALS.map((item) => (
            <TonalCard key={item.id} variant="secondary" className="gap-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                  {item.area}
                </Text>
                {(item.overlay || item.taskId) && (
                  <Pressable
                    onPress={() => {
                      if (item.taskId) {
                        const found = eligibleTasks.find((t) => t.id === item.taskId);
                        if (found) {
                          openTaskDetail(found);
                          return;
                        }
                      }
                      if (item.overlay === 'health-stack') openOverlay('health-stack');
                      else if (item.overlay === 'money-work') openOverlay('money-work');
                      else if (item.overlay === 'runway-calc') openOverlay('runway-calc');
                    }}
                    className="rounded-full bg-accent px-3 py-1"
                  >
                    <Text className="text-[11px] font-semibold text-accent-foreground">Open</Text>
                  </Pressable>
                )}
              </View>
              <Text className="text-[15px] font-semibold text-foreground">{item.title}</Text>
              <Text className="text-[13px] leading-[18px] text-muted">{item.whyEssential}</Text>
            </TonalCard>
          ))}
        </Tabs.Content>

        <Tabs.Content value="ateam" className="mt-3 gap-2.5">
          <View className="flex-row flex-wrap gap-1.5">
            {(
              [
                'all',
                'Wealth & Leverage',
                'Risk & Antifragility',
                'Health & Longevity',
                'Mind & Habits',
                'Money Psychology',
              ] as const
            ).map((d) => {
              const active = domainFilter === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDomainFilter(d)}
                  className={`rounded-full px-3 py-1.5 ${
                    active ? 'bg-accent' : 'bg-surface-secondary'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      active ? 'text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    {d === 'all' ? 'All 12' : d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredThinkers.map((t) => {
            const liked = savedWisdom.includes(t.id);
            return (
              <TonalCard key={t.id} variant="secondary" className="gap-2">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-foreground">{t.name}</Text>
                    <Text className="text-[12px] text-muted">
                      {t.domain} · {t.handleOrSource}
                    </Text>
                  </View>
                  <Pressable onPress={() => toggleWisdom(t.id)} className="p-2">
                    <StyledIonicons
                      name={liked ? 'heart' : 'heart-outline'}
                      size={20}
                      className={liked ? 'text-rose-500' : 'text-muted'}
                    />
                  </Pressable>
                </View>
                <Text className="text-[13px] leading-[18px] text-foreground">{t.coreIdea}</Text>
                <Text className="text-[12px] leading-[17px] text-muted">Rule: {t.appliedRule}</Text>
                {t.linkUrl && (
                  <Pressable onPress={() => Linking.openURL(t.linkUrl!).catch(() => {})}>
                    <Text className="text-[12px] font-semibold text-foreground underline">
                      Read essay ↗
                    </Text>
                  </Pressable>
                )}
              </TonalCard>
            );
          })}
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
