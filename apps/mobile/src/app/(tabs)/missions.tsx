import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs } from 'heroui-native';
import { useLife } from '@/state/useLifeStore';
import {
  StatusBadge,
  StyledIonicons,
  TonalCard,
} from '@/components/LifePrimitives';

export default function MissionsScreen() {
  const {
    profile,
    activeTasks,
    comingUpTasks,
    completedTasks,
    openTaskDetail,
    openOverlay,
  } = useLife();
  const [bucket, setBucket] = useState<'active' | 'coming' | 'done'>('active');

  const currentList =
    bucket === 'active' ? activeTasks : bucket === 'coming' ? comingUpTasks : completedTasks;

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
              missions
            </Text>
            <Text className="text-[12px] text-muted">
              {activeTasks.length} ready · {completedTasks.length} recorded wins
            </Text>
          </View>
          <Pressable
            onPress={() => openOverlay('levels-ateam')}
            className="rounded-full bg-accent px-3.5 py-2"
          >
            <Text className="text-[12px] font-semibold text-accent-foreground">Full Audit</Text>
          </Pressable>
        </View>

        <Tabs value={bucket} onValueChange={(v) => setBucket(v as typeof bucket)} variant="primary">
          <Tabs.List className="w-full">
            <Tabs.Indicator />
            <Tabs.Trigger value="active" className="flex-1">
              <Tabs.Label>Now ({activeTasks.length})</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="coming" className="flex-1">
              <Tabs.Label>Later ({comingUpTasks.length})</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="done" className="flex-1">
              <Tabs.Label>Done ({completedTasks.length})</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>

        <View className="gap-2.5">
          {currentList.length === 0 ? (
            <TonalCard className="items-center gap-2 py-8">
              <StyledIonicons name="checkmark-done-circle-outline" size={28} className="text-muted" />
              <Text className="text-[14px] font-semibold text-foreground">
                {bucket === 'done'
                  ? 'No completed moves yet'
                  : 'All caught up in this queue'}
              </Text>
              <Text className="text-center text-[12px] text-muted">
                Tap any move to view steps or record an outcome note.
              </Text>
            </TonalCard>
          ) : (
            currentList.map((task) => {
              const outcome = profile.recordedOutcomes?.[task.id];
              return (
                <Pressable
                  key={task.id}
                  onPress={() => openTaskDetail(task)}
                  className="rounded-[22px] bg-surface p-4 active:opacity-85"
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                      {task.provider} · {task.urgency}
                    </Text>
                    <StatusBadge
                      label={bucket === 'done' ? 'Completed' : task.valueBadge}
                      tone={
                        bucket === 'done'
                          ? 'positive'
                          : task.urgency === 'urgent'
                            ? 'danger'
                            : 'accent'
                      }
                    />
                  </View>
                  <Text className="mt-1.5 text-[17px] font-bold text-foreground">
                    {task.shortTitle}
                  </Text>
                  <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
                    {task.headlinePrompt}
                  </Text>
                  {outcome && (
                    <View className="mt-2.5 rounded-xl bg-surface-secondary p-2.5">
                      <Text className="text-[12px] font-medium text-foreground">
                        {outcome.recordedAt}: {outcome.summary}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
