import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from 'heroui-native';
import {
  DAILY_PRACTICAL_NOTES,
  THINKER_ATEAM,
} from '@life/core/engine';
import { useLife } from '@/state/useLifeStore';
import {
  SectionTitle,
  StatusBadge,
  StyledIonicons,
  TonalCard,
} from '@/components/LifePrimitives';

export default function DiscoverScreen() {
  const {
    profile,
    activeTasks,
    openOverlay,
    openTaskDetail,
    openSheet,
  } = useLife();
  const [query, setQuery] = useState('');

  const topMove = activeTasks[0];
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeTasks.slice(0, 4);
    return activeTasks.filter(
      (t) =>
        t.shortTitle.toLowerCase().includes(q) ||
        t.provider.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [activeTasks, query]);

  const filteredThinkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THINKER_ATEAM.slice(0, 4);
    return THINKER_ATEAM.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.coreIdea.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 32, paddingTop: 10, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[28px] font-bold tracking-[-0.8px] text-foreground">
              discover
            </Text>
            <Text className="text-[12px] text-muted">
              Contextual prompts, radar & thinker briefs
            </Text>
          </View>
          <Pressable
            onPress={() => openSheet('chat')}
            className="rounded-full bg-surface-secondary px-3.5 py-2"
          >
            <Text className="text-[12px] font-semibold text-foreground">Ask AI</Text>
          </Pressable>
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search tax, bloodwork, Naval, runway..."
        />

        {/* Ref 14: Grounding morning ritual + conversational nudge cards */}
        {!query.trim() && (
          <View className="gap-2.5">
            <SectionTitle>Timely briefs</SectionTitle>
            <Pressable
              onPress={() => (topMove ? openTaskDetail(topMove) : openOverlay('money-work'))}
            >
              <LinearGradient
                colors={['#C0392B', '#642B73']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 24, padding: 18 }}
              >
                <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-white/75">
                  NOW · HIGHEST LEVERAGE
                </Text>
                <Text className="mt-1.5 text-[20px] font-bold leading-[25px] text-white">
                  {topMove ? topMove.shortTitle : 'Review pay & tax allocation'}
                </Text>
                <Text className="mt-1 text-[13px] text-white/85">
                  {topMove
                    ? `${topMove.valueBadge} · Tap to open 3-stage plan`
                    : 'Keep tax reserve automatic'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => openOverlay('today-brief')}>
              <TonalCard className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-muted">TODAY · SCHEDULE</Text>
                  <Text className="mt-0.5 text-[15px] font-semibold text-foreground">
                    Time-block your next 3 hours for energy & buffer
                  </Text>
                </View>
                <StyledIonicons name="calendar-outline" size={20} className="text-foreground" />
              </TonalCard>
            </Pressable>

            <Pressable onPress={() => openOverlay('health-stack')}>
              <TonalCard className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-muted">
                    BIOLOGY · {profile.health?.waterMlToday ?? 1500}ML LOGGED
                  </Text>
                  <Text className="mt-0.5 text-[15px] font-semibold text-foreground">
                    Morning light & +500ml water check-in
                  </Text>
                </View>
                <StyledIonicons name="water-outline" size={20} className="text-blue-500" />
              </TonalCard>
            </Pressable>
          </View>
        )}

        {/* Matching Active Moves */}
        <View className="gap-2.5">
          <SectionTitle>Relevant moves ({filteredTasks.length})</SectionTitle>
          {filteredTasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => openTaskDetail(task)}
              className="rounded-[20px] bg-surface p-4 active:opacity-85"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-[11px] font-semibold uppercase text-muted">
                  {task.provider} · {task.category}
                </Text>
                <StatusBadge label={task.valueBadge} tone="accent" />
              </View>
              <Text className="mt-1 text-[16px] font-semibold text-foreground">
                {task.shortTitle}
              </Text>
              <Text className="mt-0.5 text-[12px] text-muted">{task.headlinePrompt}</Text>
            </Pressable>
          ))}
        </View>

        {/* Thinker A-Team Snippets */}
        <View className="gap-2.5">
          <SectionTitle>A-Team philosophy</SectionTitle>
          {filteredThinkers.map((t) => (
            <TonalCard key={t.id} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-semibold text-foreground">{t.name}</Text>
                <Text className="text-[11px] font-medium text-muted">{t.domain}</Text>
              </View>
              <Text className="text-[13px] leading-[18px] text-muted">{t.coreIdea}</Text>
              {t.linkUrl && (
                <Pressable onPress={() => Linking.openURL(t.linkUrl!).catch(() => {})}>
                  <Text className="mt-1 text-[12px] font-semibold text-foreground underline">
                    {t.handleOrSource} ↗
                  </Text>
                </Pressable>
              )}
            </TonalCard>
          ))}
        </View>

        {/* Practical Life Notes */}
        <View className="gap-2.5">
          <SectionTitle>Daily fundamentals</SectionTitle>
          {DAILY_PRACTICAL_NOTES.slice(0, 3).map((note) => (
            <TonalCard key={note.id} className="gap-1">
              <Text className="text-[14px] font-semibold text-foreground">{note.title}</Text>
              <Text className="text-[12px] leading-[17px] text-muted">{note.takeaway}</Text>
            </TonalCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
