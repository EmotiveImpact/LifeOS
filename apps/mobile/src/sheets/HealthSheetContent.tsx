import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import {
  Button,
  Input,
  Label,
  Tabs,
  TextField,
  useBottomSheetAwareHandlers,
} from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_HEALTH_SNAPSHOT, THINKER_ATEAM } from '@life/core/engine';
import { computeHealthTargets, DIET_GUIDES, interpretLabResult, LAB_GUIDES } from '@life/core/health';
import type { DietStyle, FoodLogEntry, HealthSnapshot, LabMarkerId, LabResult } from '@life/core/types';
import { useLife, hapticLight, hapticSuccess } from '@/state/useLifeStore';
import {
  ProgressBarTrack,
  StatusBadge,
  StyledIonicons,
  ThirtyDayStreakBar,
  TonalCard,
} from '@/components/LifePrimitives';

const DIETS: DietStyle[] = ['balanced', 'high-protein', 'mediterranean', 'whole-food', 'plant-forward'];

function LabInputRow({
  marker,
  health,
  onUpdate,
}: {
  marker: (typeof LAB_GUIDES)[number];
  health: HealthSnapshot;
  onUpdate: (id: LabMarkerId, res?: LabResult) => void;
}) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();
  const result = health.labResults?.[marker.id];
  const [unit, setUnit] = useState(result?.unit ?? marker.units[0]);
  const [valText, setValText] = useState(result ? String(result.value) : '');
  const info = interpretLabResult(marker.id, health, result);

  const commitValue = (text: string, targetUnit = unit) => {
    setValText(text);
    const cleaned = text.trim();
    if (!cleaned) {
      onUpdate(marker.id, undefined);
      return;
    }
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onUpdate(marker.id, {
        value: parsed,
        unit: targetUnit,
        referenceLow: result?.referenceLow,
        referenceHigh: result?.referenceHigh,
      });
    }
  };

  return (
    <TonalCard variant="secondary" className="gap-2">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-[15px] font-semibold text-foreground">{marker.name}</Text>
        <StatusBadge
          label={
            info.status === 'optimal'
              ? 'Within guide'
              : info.status === 'check'
                ? 'Check'
                : marker.optional
                  ? 'Optional'
                  : 'Due to log'
          }
          tone={
            info.status === 'optimal'
              ? 'positive'
              : info.status === 'check'
                ? 'warn'
                : 'neutral'
          }
        />
      </View>

      <Text className="text-[12px] leading-[17px] text-muted">{marker.meaning}</Text>

      <View className="mt-1 flex-row items-end gap-2">
        <View className="flex-1">
          <TextField>
            <Label>Result</Label>
            <Input
              value={valText}
              onChangeText={(txt) => commitValue(txt)}
              keyboardType="numeric"
              placeholder="Enter value"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </TextField>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {marker.units.map((u) => {
            const active = unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => {
                  setUnit(u);
                  if (result) {
                    onUpdate(marker.id, { ...result, unit: u });
                  }
                }}
                className={`rounded-full px-3 py-2 ${active ? 'bg-accent' : 'bg-surface'}`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    active ? 'text-accent-foreground' : 'text-foreground'
                  }`}
                >
                  {u}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text className="text-[12px] text-foreground">
        <Text className="font-semibold">Guide · </Text>
        {info.guide}
      </Text>
      {result && (
        <Text className="text-[12px] leading-[17px] text-muted">
          {info.explanation} {info.nextStep}
        </Text>
      )}
      <Pressable onPress={() => Linking.openURL(marker.source).catch(() => {})}>
        <Text className="text-[12px] font-medium text-muted underline">
          Read clinical guidance
        </Text>
      </Pressable>
    </TonalCard>
  );
}

export function HealthSheetContent() {
  const { profile, updateProfile, darkMode } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();
  const health: HealthSnapshot = profile.health ?? DEFAULT_HEALTH_SNAPSHOT;

  const [tab, setTab] = useState<'routine' | 'food' | 'bloodwork'>('routine');
  const [expandedInfoId, setExpandedInfoId] = useState<string | null>(null);
  const [mealLabel, setMealLabel] = useState('');
  const [mealProtein, setMealProtein] = useState('35');
  const [mealCals, setMealCals] = useState('520');

  const targets = computeHealthTargets(health);
  const waterPct = Math.min(
    100,
    Math.round((health.waterMlToday / Math.max(500, targets.waterMl)) * 100)
  );
  const totalProtein = health.mealsLogged.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCalories = health.mealsLogged.reduce((sum, m) => sum + m.calories, 0);
  const proteinPct = Math.min(
    100,
    Math.round((totalProtein / Math.max(40, targets.proteinG)) * 100)
  );
  const streakDays = Math.max(
    1,
    Math.min(30, profile.habitStreakDays ?? (health.waterMlToday >= 1000 ? 5 : 4))
  );

  const updateHealth = (patch: Partial<HealthSnapshot>) => {
    updateProfile({ health: { ...health, ...patch } });
  };

  const addWater = (ml: number) => {
    hapticSuccess();
    const nextMl = Math.max(0, health.waterMlToday + ml);
    updateHealth({ waterMlToday: nextMl });
    if (ml > 0 && nextMl >= targets.waterMl) {
      updateProfile({ habitStreakDays: Math.min(30, streakDays + 1) });
    }
  };

  const addMeal = () => {
    const clean = mealLabel.trim();
    if (!clean) return;
    hapticSuccess();
    const entry: FoodLogEntry = {
      id: `meal-${Date.now()}`,
      label: clean,
      proteinG: Math.max(0, Math.min(200, Number(mealProtein) || 0)),
      calories: Math.max(0, Math.min(3500, Number(mealCals) || 0)),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    updateHealth({ mealsLogged: [entry, ...health.mealsLogged] });
    setMealLabel('');
  };

  const toggleBaseline = () => {
    hapticSuccess();
    updateHealth({ baselineReviewed: !health.baselineReviewed });
  };

  const protocols = [
    {
      id: 'morning-light',
      period: 'Morning',
      badge: 'Circadian Anchor',
      title: '10m daylight + 500ml water before caffeine',
      detail:
        'Direct outdoor light sets SCN cortisol pulse and anchors melatonin 14–16h later; water restores overnight plasma loss.',
      icon: 'sunny-outline' as const,
      tint: '#F59E0B',
    },
    {
      id: 'protein-anchor',
      period: 'Morning',
      badge: 'Metabolic',
      title: `${Math.round(targets.proteinG * 0.3)}g first-meal protein`,
      detail:
        'Hits leucine threshold early to stabilize glucose variability and suppress afternoon ultra-processed cravings.',
      icon: 'nutrition-outline' as const,
      tint: '#10B981',
    },
    {
      id: 'zone-2',
      period: 'Evening',
      badge: 'Mitochondrial',
      title: `${health.zone2MinsWeek}m / 150m weekly Zone 2`,
      detail:
        'Nose-breathing conversational pace expands capillary density and resting lactate clearance.',
      icon: 'walk-outline' as const,
      tint: '#3B82F6',
    },
    {
      id: 'wind-down',
      period: 'Evening',
      badge: 'Recovery',
      title: `Screens dim & caffeine cutoff by ${health.caffeineCutoff ?? '14:00'}`,
      detail:
        'Caffeine half-life is ~6 hours; cutting early protects deep slow-wave sleep architecture.',
      icon: 'moon-outline' as const,
      tint: '#8B5CF6',
    },
  ];

  const longevityThinkers = THINKER_ATEAM.filter((t) =>
    ['attia', 'huberman', 'walker'].includes(t.id)
  );

  return (
    <View className="gap-4 pb-6">
      {/* Ref 11: Dark Espresso / Espresso-Warmth Routine & 30-tick Streak */}
      <View className="overflow-hidden rounded-[24px]">
        <LinearGradient
          colors={darkMode ? ['#29231F', '#191614'] : ['#3B312B', '#201B18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 18 }}
        >
          <View className="flex-row items-baseline justify-between">
            <Text className="text-[12px] font-semibold uppercase tracking-[1.1px] text-stone-300">
              Health & New Normal
            </Text>
            <Text className="text-[12px] text-stone-300">{targets.proteinG}g P / {targets.waterMl}ml H2O</Text>
          </View>

          <View className="mt-3 flex-row items-baseline justify-between">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[36px] font-bold tracking-tight text-stone-50">
                {streakDays}
              </Text>
              <Text className="text-[15px] text-stone-400">/30 days</Text>
            </View>
            <Text className="text-[12px] text-stone-300">Most see baseline shift after 14d</Text>
          </View>

          <View className="mt-3">
            <ThirtyDayStreakBar streakDays={streakDays} accentHex="#F7F5EE" />
          </View>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => updateProfile({ habitStreakDays: Math.min(30, streakDays + 1) })}
              className="flex-1 items-center rounded-full bg-stone-50 py-2.5 active:opacity-80"
            >
              <Text className="text-[13px] font-semibold text-stone-950">Check in today</Text>
            </Pressable>
            <Pressable
              onPress={toggleBaseline}
              className="items-center justify-center rounded-full bg-white/12 px-4 py-2.5"
            >
              <Text className="text-[12px] font-semibold text-stone-100">
                {health.baselineReviewed ? 'Baseline synced' : 'Mark baseline'}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} variant="primary">
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="routine" className="flex-1">
            <Tabs.Label>Protocol & Water</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="food" className="flex-1">
            <Tabs.Label>Food & Diet</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="bloodwork" className="flex-1">
            <Tabs.Label>Bloodwork</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="routine" className="mt-3 gap-3">
          {/* Hydration Quick Control */}
          <TonalCard variant="secondary" className="gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[15px] font-semibold text-foreground">Water intake today</Text>
                <Text className="text-[13px] text-muted">
                  {health.waterMlToday}ml of {targets.waterMl}ml target ({waterPct}%)
                </Text>
              </View>
              <StyledIonicons name="water" size={22} className="text-blue-500" />
            </View>
            <ProgressBarTrack pct={waterPct} barColorHex="#3B82F6" />
            <View className="flex-row gap-2">
              <Button size="sm" variant="secondary" className="flex-1 bg-surface" onPress={() => addWater(250)}>
                <Button.Label>+250ml</Button.Label>
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 bg-surface" onPress={() => addWater(500)}>
                <Button.Label>+500ml</Button.Label>
              </Button>
              <Button size="sm" variant="ghost" onPress={() => updateHealth({ waterMlToday: 0 })}>
                <Button.Label>Reset</Button.Label>
              </Button>
            </View>
          </TonalCard>

          {/* Morning & Evening Science Protocols (Ref 11) */}
          {(['Morning', 'Evening'] as const).map((period) => (
            <View key={period} className="gap-2">
              <Text className="px-1 text-[13px] font-semibold text-muted">{period} routine</Text>
              <TonalCard variant="secondary" className="gap-3">
                {protocols
                  .filter((p) => p.period === period)
                  .map((item) => {
                    const open = expandedInfoId === item.id;
                    return (
                      <View key={item.id} className="gap-2">
                        <Pressable
                          onPress={() => {
                            hapticLight();
                            setExpandedInfoId(open ? null : item.id);
                          }}
                          className="flex-row items-center gap-3"
                        >
                          <View
                            className="size-10 items-center justify-center rounded-xl bg-surface"
                          >
                            <StyledIonicons name={item.icon} size={18} style={{ color: item.tint }} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-[11px] font-semibold uppercase tracking-[0.6px] text-muted">
                              {item.badge}
                            </Text>
                            <Text className="text-[14px] font-semibold text-foreground">
                              {item.title}
                            </Text>
                          </View>
                          <StyledIonicons
                            name={open ? 'information-circle' : 'information-circle-outline'}
                            size={20}
                            className="text-muted"
                          />
                        </Pressable>
                        {open && (
                          <View className="rounded-xl bg-surface p-3">
                            <Text className="text-[12px] leading-[17px] text-muted">
                              {item.detail}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </TonalCard>
            </View>
          ))}
        </Tabs.Content>

        <Tabs.Content value="food" className="mt-3 gap-3">
          <TonalCard variant="secondary" className="gap-3">
            <Text className="text-[15px] font-semibold text-foreground">Diet pattern</Text>
            <View className="flex-row flex-wrap gap-2">
              {DIETS.map((style) => {
                const active = health.dietStyle === style;
                return (
                  <Pressable
                    key={style}
                    onPress={() => {
                      hapticLight();
                      updateHealth({ dietStyle: style });
                    }}
                    className={`rounded-full px-3.5 py-2 ${active ? 'bg-accent' : 'bg-surface'}`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        active ? 'text-accent-foreground' : 'text-foreground'
                      }`}
                    >
                      {DIET_GUIDES[style]?.label ?? style}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {(DIET_GUIDES[health.dietStyle]?.swaps ?? []).map((swap, i) => (
              <Text key={i} className="text-[12px] leading-[17px] text-muted">
                • {swap}
              </Text>
            ))}
          </TonalCard>

          <TonalCard variant="secondary" className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-semibold text-foreground">
                Protein & energy today
              </Text>
              <Text className="text-[13px] font-semibold text-foreground">
                {totalProtein}g / {targets.proteinG}g
              </Text>
            </View>
            <ProgressBarTrack pct={proteinPct} barColorHex="#16A34A" />
            <Text className="text-[12px] text-muted">{totalCalories} kcal logged</Text>

            <View className="gap-2 pt-1">
              <TextField>
                <Label>Meal description</Label>
                <Input
                  value={mealLabel}
                  onChangeText={setMealLabel}
                  placeholder="Greek yogurt, eggs, chicken bowl..."
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </TextField>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextField>
                    <Label>Protein (g)</Label>
                    <Input
                      value={mealProtein}
                      onChangeText={setMealProtein}
                      keyboardType="numeric"
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </TextField>
                </View>
                <View className="flex-1">
                  <TextField>
                    <Label>Calories</Label>
                    <Input
                      value={mealCals}
                      onChangeText={setMealCals}
                      keyboardType="numeric"
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </TextField>
                </View>
              </View>
              <Button size="sm" onPress={addMeal} className="self-start">
                <Button.Label>Log meal</Button.Label>
              </Button>
            </View>

            {health.mealsLogged.map((meal) => (
              <View
                key={meal.id}
                className="flex-row items-center justify-between rounded-2xl bg-surface p-3"
              >
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-foreground">{meal.label}</Text>
                  <Text className="text-[12px] text-muted">
                    {meal.proteinG}g protein · {meal.calories} kcal · {meal.time}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    updateHealth({
                      mealsLogged: health.mealsLogged.filter((m) => m.id !== meal.id),
                    })
                  }
                  className="p-2"
                >
                  <StyledIonicons name="trash-outline" size={16} className="text-muted" />
                </Pressable>
              </View>
            ))}
          </TonalCard>
        </Tabs.Content>

        <Tabs.Content value="bloodwork" className="mt-3 gap-3">
          {LAB_GUIDES.map((marker) => (
            <LabInputRow
              key={marker.id}
              marker={marker}
              health={health}
              onUpdate={(id, res) => {
                const next = { ...(health.labResults ?? {}) };
                if (res === undefined) delete next[id];
                else next[id] = res;
                updateHealth({ labResults: next });
              }}
            />
          ))}

          {longevityThinkers.map((t) => (
            <TonalCard key={t.id} variant="secondary" className="gap-1.5">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                A-Team · {t.name}
              </Text>
              <Text className="text-[13px] leading-[18px] text-foreground">{t.appliedRule}</Text>
            </TonalCard>
          ))}
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
