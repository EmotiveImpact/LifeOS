import { Text, View } from 'react-native';
import { BottomSheet, useThemeColor } from 'heroui-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useLife } from '@/state/useLifeStore';
import { HealthSheetContent } from './HealthSheetContent';
import { MoneyWorkSheetContent } from './MoneyWorkSheetContent';
import { LevelsSheetContent } from './LevelsSheetContent';
import { GrowthSheetContent } from './GrowthSheetContent';
import {
  CashflowSheetContent,
  ChatSheetContent,
  IntakeSheetContent,
  RunwaySheetContent,
  TaskDetailSheetContent,
  TodaySheetContent,
} from './TodayAndCashSheets';

export function NativeSheetHost() {
  const {
    activeSheet,
    closeSheet,
    selectedTask,
    closeTaskDetail,
  } = useLife();

  const surfaceColor = useThemeColor('surface');
  const mutedColor = useThemeColor('muted');

  const isOpen = activeSheet !== null || selectedTask !== null;
  const handleClose = () => {
    closeSheet();
    closeTaskDetail();
  };

  let title = '';
  let subtitle = '';

  if (selectedTask) {
    title = selectedTask.shortTitle;
    subtitle = selectedTask.headlinePrompt;
  } else {
    switch (activeSheet) {
      case 'health':
        title = 'Health & Biology';
        subtitle = '30-day streak, morning/evening routine, water, protein & bloodwork';
        break;
      case 'money':
        title = 'Work, Tax & Money';
        subtitle = 'Pay structure, tax code, accounts, cover & subscription audit';
        break;
      case 'levels':
        title = 'Levels & A-Team';
        subtitle = '4-week deltas, monthly goal, operating normals & 12 thinkers';
        break;
      case 'growth-plan':
      case 'growth-checkins':
      case 'growth-learn':
        title = 'Growth & Check-ins';
        subtitle = '6-stage calibration, 5-minute reset & applied lessons';
        break;
      case 'today':
        title = 'Today Brief';
        subtitle = 'Time-blocked schedule & high-leverage moves';
        break;
      case 'cashflow':
        title = 'Cashflow Ledger';
        subtitle = 'Timeline projection & monthly flows';
        break;
      case 'runway':
        title = '30-Day Runway';
        subtitle = 'Margin & safe daily spend';
        break;
      case 'chat':
        title = 'Ask life';
        subtitle = 'Adaptive triage from your live context';
        break;
      case 'intake':
        title = 'Your Context';
        subtitle = 'Location, work structure & baseline settings';
        break;
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay variant="blur" />
        <BottomSheet.Content
          snapPoints={['88%']}
          enableDynamicSizing={false}
          keyboardBehavior="extend"
          backgroundStyle={{ backgroundColor: surfaceColor, borderRadius: 30 }}
          handleIndicatorStyle={{ backgroundColor: mutedColor, width: 42 }}
        >
          <View className="flex-row items-start justify-between gap-3 px-5 pb-3 pt-1">
            <View className="flex-1">
              <BottomSheet.Title className="text-[24px] font-bold tracking-tight text-foreground">
                {title}
              </BottomSheet.Title>
              {subtitle ? (
                <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <BottomSheet.Close />
          </View>

          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {selectedTask ? (
              <TaskDetailSheetContent task={selectedTask} />
            ) : activeSheet === 'health' ? (
              <HealthSheetContent />
            ) : activeSheet === 'money' ? (
              <MoneyWorkSheetContent />
            ) : activeSheet === 'levels' ? (
              <LevelsSheetContent />
            ) : activeSheet === 'growth-plan' ? (
              <GrowthSheetContent initialTab="plan" />
            ) : activeSheet === 'growth-checkins' ? (
              <GrowthSheetContent initialTab="check-ins" />
            ) : activeSheet === 'growth-learn' ? (
              <GrowthSheetContent initialTab="learn" />
            ) : activeSheet === 'today' ? (
              <TodaySheetContent />
            ) : activeSheet === 'cashflow' ? (
              <CashflowSheetContent />
            ) : activeSheet === 'runway' ? (
              <RunwaySheetContent />
            ) : activeSheet === 'chat' ? (
              <ChatSheetContent />
            ) : activeSheet === 'intake' ? (
              <IntakeSheetContent />
            ) : null}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
