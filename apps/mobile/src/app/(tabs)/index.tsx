import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ListGroup, Separator } from 'heroui-native';
import { useLife, hapticLight } from '@/state/useLifeStore';
import {
  EditorialHeadline,
  IconCircle,
  ProgressBarTrack,
  SectionTitle,
  StatusBadge,
  StyledIonicons,
  TonalCard,
} from '@/components/LifePrimitives';
import { ProgressiveQuestionCard } from '@/components/ProgressiveQuestionCard';

export default function HomeScreen() {
  const {
    profile,
    updateProfile,
    darkMode,
    toggleDarkMode,
    score,
    breakdown,
    levelState,
    activeTasks,
    portals,
    currency,
    openOverlay,
    openSheet,
    openTaskDetail,
  } = useLife();

  const hidden = Boolean(profile.hideBalances);
  const topMove = activeTasks[0];
  const checkInsCount = Object.values(profile.growth?.checkIns ?? {}).filter(
    (list) => list && list.length > 0
  ).length;

  const baseLiquidity =
    profile.runway !== undefined
      ? Math.max(
          0,
          profile.runway.balance + profile.runway.expectedIncome - profile.runway.essentialBills
        ) + (profile.openedAccountIds?.includes('acct-cash-buffer') ? 2400 : 850)
      : Math.max(1200, breakdown.netTakeHomeMonthly + 940);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 32, paddingTop: 6, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial lowercase header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[28px] font-bold tracking-[-1.2px] text-foreground">
              life
            </Text>
            <Text className="text-[12px] text-muted">
              {profile.city} · {profile.countryCode} · Level {levelState.currentLevel}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => openOverlay('growth-checkins')}
              className="flex-row items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 active:opacity-80"
            >
              <StyledIonicons
                name="sparkles"
                size={13}
                className="text-accent-foreground"
              />
              <Text className="text-[12px] font-semibold text-accent-foreground">
                Check in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openSheet('chat')}
              className="size-9 items-center justify-center rounded-full bg-surface-secondary"
            >
              <StyledIonicons
                name="chatbubble-ellipses-outline"
                size={18}
                className="text-foreground"
              />
            </Pressable>

            <Pressable
              onPress={toggleDarkMode}
              className="size-9 items-center justify-center rounded-full bg-surface-secondary"
            >
              <StyledIonicons
                name={darkMode ? 'sunny-outline' : 'moon-outline'}
                size={18}
                className="text-foreground"
              />
            </Pressable>
          </View>
        </View>

        {/* Hero Cash & Phase Card with Privacy Eye Toggle */}
        <LinearGradient
          colors={darkMode ? ['#152E2A', '#0D1717'] : ['#0F332E', '#071817']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: 20 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-white/12 px-2.5 py-1">
                <Text className="text-[11px] font-semibold text-emerald-200">
                  L{levelState.currentLevel} · {levelState.levelName}
                </Text>
              </View>
              <Text className="text-[12px] text-stone-300">
                Readiness {score.total}/100
              </Text>
            </View>

            <Pressable
              onPress={() => {
                hapticLight();
                updateProfile({ hideBalances: !hidden });
              }}
              className="size-8 items-center justify-center rounded-full bg-white/12"
            >
              <StyledIonicons
                name={hidden ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                style={{ color: '#F5F5F0' }}
              />
            </Pressable>
          </View>

          <Text className="mt-3 text-[13px] text-stone-300">30-day accessible buffer</Text>
          <Text className="mt-0.5 text-[36px] font-bold tracking-tight text-white">
            {hidden ? `${currency}•••••` : `${currency}${Math.round(baseLiquidity).toLocaleString()}`}
          </Text>
          <Text className="mt-1 text-[12px] text-emerald-300">
            Net {hidden ? '••••' : `${currency}${Math.round(breakdown.netTakeHomeMonthly).toLocaleString()}/mo`} ·{' '}
            {levelState.progressPct}% to {levelState.nextLevelName}
          </Text>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => openOverlay('cash-ledger')}
              className="flex-1 items-center rounded-full bg-white py-2.5 active:opacity-85"
            >
              <Text className="text-[13px] font-semibold text-stone-950">Open ledger</Text>
            </Pressable>
            <Pressable
              onPress={() => openOverlay('today-brief')}
              className="flex-1 items-center rounded-full bg-white/14 py-2.5 active:opacity-85"
            >
              <Text className="text-[13px] font-semibold text-white">Today brief</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Priority Move + Fanned Daily Check-In Duo */}
        {topMove && (
          <View className="gap-2.5">
            <SectionTitle>Next move</SectionTitle>
            <Pressable
              onPress={() => openTaskDetail(topMove)}
              className="rounded-[24px] bg-surface p-5 active:opacity-90"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted">
                  {topMove.provider}
                </Text>
                <StatusBadge label={topMove.valueBadge} tone="accent" />
              </View>
              <EditorialHeadline className="mt-2 text-[22px] leading-[27px]">
                {topMove.headlinePrompt}
              </EditorialHeadline>
              <Text className="mt-1.5 text-[13px] leading-[18px] text-muted">
                {topMove.personalWhy}
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[13px] font-semibold text-foreground">
                  {topMove.ctaLabel} →
                </Text>
                <Text className="text-[12px] text-muted">+{topMove.scoreDelta} readiness</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Adaptive 1-Tap Progressive Profile Prompt */}
        <ProgressiveQuestionCard />

        {/* Life Stacks 2x2 Grid */}
        <View className="gap-2.5">
          <SectionTitle>Stacks</SectionTitle>
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => openOverlay('money-work')}
              className="flex-1 rounded-[22px] bg-surface p-4 active:opacity-85"
            >
              <IconCircle name="wallet-outline" />
              <Text className="mt-3 text-[15px] font-semibold text-foreground">Work & Tax</Text>
              <Text className="mt-0.5 text-[12px] text-muted">
                {breakdown.effectiveTaxRatePct}% tax · {profile.workStatus}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openOverlay('health-stack')}
              className="flex-1 rounded-[22px] bg-surface p-4 active:opacity-85"
            >
              <IconCircle name="heart-outline" />
              <Text className="mt-3 text-[15px] font-semibold text-foreground">Health</Text>
              <Text className="mt-0.5 text-[12px] text-muted">
                {profile.health?.waterMlToday ?? 1500}ml H2O · {profile.habitStreakDays ?? 4}/30d
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => openOverlay('levels-ateam')}
              className="flex-1 rounded-[22px] bg-surface p-4 active:opacity-85"
            >
              <IconCircle name="trophy-outline" />
              <Text className="mt-3 text-[15px] font-semibold text-foreground">Levels & A-Team</Text>
              <Text className="mt-0.5 text-[12px] text-muted">
                Level {levelState.currentLevel} · Weekly deltas
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openOverlay('growth-checkins')}
              className="flex-1 rounded-[22px] bg-surface p-4 active:opacity-85"
            >
              <IconCircle name="leaf-outline" />
              <Text className="mt-3 text-[15px] font-semibold text-foreground">Check-ins</Text>
              <Text className="mt-0.5 text-[12px] text-muted">{checkInsCount}/6 completed</Text>
            </Pressable>
          </View>
        </View>

        {/* 4-Area Readiness Grid */}
        <View className="gap-2.5">
          <SectionTitle>Readiness across areas · {score.tierLabel}</SectionTitle>
          <View className="gap-2">
            {[
              { id: 'capital', label: 'Capital & Tax Reserve', val: score.capital },
              { id: 'gov', label: 'Gov, Loans & Housing', val: score.gov },
              { id: 'health', label: 'Health & Protection', val: score.health },
              { id: 'growth', label: 'Skills & Check-ins', val: score.growth },
            ].map((area) => (
              <TonalCard key={area.id} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] font-semibold text-foreground">{area.label}</Text>
                  <Text className="text-[12px] font-medium text-muted">{area.val}/100</Text>
                </View>
                <ProgressBarTrack pct={area.val} barColorHex={darkMode ? '#F4F3EE' : '#141417'} />
              </TonalCard>
            ))}
          </View>
        </View>

        {/* Connected Portals & Tools (HeroUI Native ListGroup) */}
        <View className="gap-2.5">
          <SectionTitle>Portals & checks</SectionTitle>
          <ListGroup className="rounded-[22px] bg-surface">
            {portals.map((portal, idx) => (
              <React.Fragment key={portal.id}>
                {idx > 0 && <Separator className="mx-4" />}
                <ListGroup.Item
                  onPress={() => {
                    if (
                      portal.railId === 'tax-account' ||
                      portal.railId === 'cash-isa' ||
                      portal.railId === 'lisa-starter' ||
                      portal.railId === 'pension-match' ||
                      portal.railId === 'business-bank'
                    ) {
                      openOverlay('money-work');
                    } else if (portal.railId === 'gp-dentist') {
                      openOverlay('health-stack');
                    } else if (portal.linkedTaskId) {
                      const t = activeTasks.find((item) => item.id === portal.linkedTaskId);
                      if (t) openTaskDetail(t);
                      else openOverlay('levels-ateam');
                    } else {
                      openOverlay('levels-ateam');
                    }
                  }}
                >
                  <ListGroup.ItemPrefix>
                    <View
                      className="size-8 items-center justify-center rounded-xl"
                      style={{ backgroundColor: portal.badgeBg }}
                    >
                      <Text className="text-[11px] font-bold text-white">
                        {portal.badgeText.slice(0, 2)}
                      </Text>
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{portal.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription>{portal.subtitle}</ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix />
                </ListGroup.Item>
              </React.Fragment>
            ))}
          </ListGroup>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
