import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'heroui-native';
import { THINKER_ATEAM } from '@life/core/engine';
import { useLife } from '@/state/useLifeStore';
import {
  EditorialHeadline,
  ProgressBarTrack,
  SectionTitle,
  StatusBadge,
  StyledIonicons,
  ThirtyDayStreakBar,
  TonalCard,
} from '@/components/LifePrimitives';
import { ProgressiveQuestionCard } from '@/components/ProgressiveQuestionCard';

export default function YouScreen() {
  const {
    profile,
    darkMode,
    toggleDarkMode,
    score,
    levelState,
    openOverlay,
    openSheet,
    resetAll,
  } = useLife();

  const checkInsCount = Object.values(profile.growth?.checkIns ?? {}).filter(
    (list) => list && list.length > 0
  ).length;
  const savedWisdom = THINKER_ATEAM.filter((t) =>
    (profile.savedWisdomIds ?? []).includes(t.id)
  );
  const streakDays = Math.max(1, Math.min(30, profile.habitStreakDays ?? 4));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 32, paddingTop: 10, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <EditorialHeadline className="text-[28px] leading-[32px]">
              {profile.name}
            </EditorialHeadline>
            <Text className="mt-0.5 text-[13px] text-muted">
              {profile.age} · {profile.city}, {profile.countryCode} · {profile.workStatus}
            </Text>
          </View>

          <Pressable
            onPress={() => openSheet('intake')}
            className="rounded-full bg-surface-secondary px-3.5 py-2"
          >
            <Text className="text-[12px] font-semibold text-foreground">Edit context</Text>
          </Pressable>
        </View>

        {/* Growth Check-ins & Calibration Launcher */}
        <TonalCard className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-foreground">Growth Check-ins</Text>
              <Text className="mt-0.5 text-[12px] text-muted">
                {checkInsCount} of 6 reflections completed
              </Text>
            </View>
            <Pressable
              onPress={() => openOverlay('growth-checkins')}
              className="rounded-full bg-accent px-4 py-2"
            >
              <Text className="text-[12px] font-semibold text-accent-foreground">Open check-ins</Text>
            </Pressable>
          </View>
          <ProgressBarTrack
            pct={(checkInsCount / 6) * 100}
            barColorHex={darkMode ? '#F4F3EE' : '#141417'}
          />
        </TonalCard>

        {/* Inline Compact Adaptive Profile Prompt */}
        <ProgressiveQuestionCard compact />

        {/* Ref 11: Routine Streak */}
        <Pressable onPress={() => openOverlay('health-stack')}>
          <TonalCard className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-semibold text-foreground">
                Daily Routine Streak
              </Text>
              <StatusBadge label={`${streakDays}/30 days`} tone="positive" />
            </View>
            <ThirtyDayStreakBar
              streakDays={streakDays}
              accentHex={darkMode ? '#F4F3EE' : '#141417'}
            />
            <Text className="text-[12px] text-muted">
              Tap to log water ({profile.health?.waterMlToday ?? 1500}ml today), meals or bloodwork
            </Text>
          </TonalCard>
        </Pressable>

        {/* Monthly Gambit / Goal */}
        <Pressable onPress={() => openOverlay('levels-ateam')}>
          <TonalCard className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted">
                Monthly Gambit · Level {levelState.currentLevel}
              </Text>
              <StyledIonicons name="chevron-forward" size={16} className="text-muted" />
            </View>
            <Text className="text-[15px] font-semibold leading-[21px] text-foreground">
              {profile.monthlyGambit ||
                'Build a 90-day cash buffer and lock in 2 high-leverage setup wins'}
            </Text>
          </TonalCard>
        </Pressable>

        {/* Saved Thinker Gems */}
        {savedWisdom.length > 0 && (
          <View className="gap-2">
            <SectionTitle>Saved A-Team rules</SectionTitle>
            {savedWisdom.map((w) => (
              <TonalCard key={w.id} className="gap-1">
                <Text className="text-[14px] font-semibold text-foreground">{w.name}</Text>
                <Text className="text-[12px] text-muted">{w.appliedRule}</Text>
              </TonalCard>
            ))}
          </View>
        )}

        {/* Preferences & Readout */}
        <TonalCard className="gap-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-semibold text-foreground">Dark appearance</Text>
              <Text className="text-[12px] text-muted">Switch serene paper / obsidian mode</Text>
            </View>
            <Switch isSelected={darkMode} onSelectedChange={toggleDarkMode} />
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-semibold text-foreground">Overall readiness</Text>
              <Text className="text-[12px] text-muted">{score.total}/100 across 4 areas</Text>
            </View>
            <Pressable onPress={resetAll}>
              <Text className="text-[12px] font-semibold text-rose-500">Reset demo</Text>
            </Pressable>
          </View>
        </TonalCard>
      </ScrollView>
    </SafeAreaView>
  );
}
