import React from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Surface, useThemeColor } from 'heroui-native';
import { withUniwind } from 'uniwind';

export const StyledIonicons = withUniwind(Ionicons);

export function TonalCard({
  variant = 'default',
  className = '',
  children,
  ...rest
}: {
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
  className?: string;
  children: React.ReactNode;
} & Omit<ViewProps, 'children'>) {
  return (
    <Surface
      variant={variant}
      animation="disable-all"
      className={`rounded-[22px] p-4 ${className}`}
      {...rest}
    >
      {children}
    </Surface>
  );
}

export function SectionTitle({
  children,
  className = '',
  ...rest
}: { children: React.ReactNode; className?: string } & TextProps) {
  return (
    <Text
      className={`text-[12px] font-semibold uppercase tracking-[1.2px] text-muted ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function EditorialHeadline({
  children,
  className = '',
  ...rest
}: { children: React.ReactNode; className?: string } & TextProps) {
  return (
    <Text
      className={`text-[30px] leading-[34px] font-bold tracking-[-0.8px] text-foreground ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function IconCircle({
  name,
  size = 18,
  className = 'bg-surface-secondary',
  iconClassName = 'text-foreground',
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <View className={`size-9 items-center justify-center rounded-full ${className}`}>
      <StyledIonicons name={name} size={size} className={iconClassName} />
    </View>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'positive' | 'warn' | 'danger' | 'accent';
}) {
  const palette =
    tone === 'positive'
      ? 'bg-emerald-500/15'
      : tone === 'warn'
        ? 'bg-amber-500/15'
        : tone === 'danger'
          ? 'bg-rose-500/15'
          : tone === 'accent'
            ? 'bg-blue-500/15'
            : 'bg-surface-secondary';

  const textPalette =
    tone === 'positive'
      ? 'text-emerald-600 dark:text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-700 dark:text-amber-300'
        : tone === 'danger'
          ? 'text-rose-700 dark:text-rose-300'
          : tone === 'accent'
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-foreground';

  return (
    <View className={`rounded-full px-2.5 py-1 ${palette}`}>
      <Text className={`text-[11px] font-semibold ${textPalette}`}>{label}</Text>
    </View>
  );
}

export function ProgressBarTrack({
  pct,
  barColorHex = '#141417',
}: {
  pct: number;
  barColorHex?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
      <View
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, backgroundColor: barColorHex }}
      />
    </View>
  );
}

export function ThirtyDayStreakBar({
  streakDays,
  accentHex = '#F5F4EF',
}: {
  streakDays: number;
  accentHex?: string;
}) {
  const activeCount = Math.max(1, Math.min(30, streakDays));
  const mutedColor = useThemeColor('muted');
  return (
    <View className="flex-row items-center gap-[3px]">
      {Array.from({ length: 30 }, (_, idx) => {
        const filled = idx < activeCount;
        return (
          <View
            key={idx}
            className="h-5 flex-1 rounded-full"
            style={{
              backgroundColor: filled ? accentHex : mutedColor,
              opacity: filled ? 1 : 0.2,
            }}
          />
        );
      })}
    </View>
  );
}
