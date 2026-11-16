import type { ReactNode } from 'react';
import { Image, StyleSheet, View, useWindowDimensions, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Press } from '../Press';
import { Callout, Text, Title, type Tone } from '../Text';
import { useTokens } from '../theme';
import { atmospheres, cardShadow, onAtmosphere, radius, space, type Domain } from '../tokens';

/* ───────────────────────── 1. Atmosphere ───────────────────────── */

export type AtmosphereProps = {
  domain?: Domain;
  /** A photo instead of (or on top of) the domain gradient. */
  image?: ImageSourcePropType;
  /** Height in points. Default: 42% of the screen. */
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * DESIGN.md §6.1: photo or domain gradient across the top of a hero screen, dissolving into `canvas`.
 * Place it first inside the screen container; it sits behind content (absolute, no touches).
 */
export function Atmosphere({ domain = 'calm', image, height, style }: AtmosphereProps) {
  const t = useTokens();
  const { height: winH } = useWindowDimensions();
  const h = height ?? Math.round(winH * 0.42);
  const stops = atmospheres[domain].stops;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: h, bottom: undefined }, style]}>
      {image ? (
        <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[stops[0], stops[1], stops[2]]} locations={[0, 0.45, 0.8]} style={StyleSheet.absoluteFill} />
      )}
      {/* Top scrim keeps the status bar and title readable (≥ 4.5:1 for paper text). */}
      <LinearGradient colors={['rgba(14,14,17,0.35)', 'rgba(14,14,17,0)']} locations={[0, 0.4]} style={StyleSheet.absoluteFill} />
      {/* Bottom fade into the paper. */}
      <LinearGradient
        colors={[hexA(t.canvas, 0), hexA(t.canvas, 1)]}
        locations={[0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ───────────────────────── 3. Card ───────────────────────── */

export type CardProps = {
  variant?: 'default' | 'tinted' | 'inverted' | 'tile';
  /** Domain tint for `tinted`. */
  domain?: Domain;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** DESIGN.md §6.3 + §47: radius 20, no border, a soft shadow. `tile` is the nested `surface-2` level (flat). */
export function Card({ variant = 'default', domain = 'admin', padding, style, children, onPress, accessibilityLabel }: CardProps) {
  const t = useTokens();
  const isTile = variant === 'tile';
  const base: ViewStyle = {
    backgroundColor: variant === 'inverted' ? t.ink : isTile ? t.surface2 : t.surface,
    borderRadius: isTile ? radius.md : radius.lg,
    padding: padding ?? (isTile ? 12 : 16),
    // No borders, ever (DESIGN §47): fill + a soft shadow. Tiles sit flat inside cards.
    ...(isTile || variant === 'inverted' ? null : cardShadow(t.scheme)),
  };
  const tint =
    variant === 'tinted' ? (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.lg, backgroundColor: atmospheres[domain].tint[t.scheme] }]} />
    ) : null;
  if (onPress) {
    return (
      <Press haptic="open" onPress={onPress} accessibilityLabel={accessibilityLabel} style={[base, style]}>
        {tint}
        {children}
      </Press>
    );
  }
  return (
    <View style={[base, style]}>
      {tint}
      {children}
    </View>
  );
}

/* ───────────────────────── 18. StatusPill ───────────────────────── */

export type StatusKind = 'neutral' | 'live' | 'done';

export function StatusPill({ kind = 'neutral', label, onAtmosphere: onAtmos, style }: { kind?: StatusKind; label: string; onAtmosphere?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const bg = onAtmos ? onAtmosphere.glass : kind === 'live' ? t.emberTint : kind === 'done' ? t.gainTint : t.surface2;
  const tone: Tone = onAtmos ? 'paper' : kind === 'live' ? 'ember' : kind === 'done' ? 'gain' : 'ink2';
  const dot = kind === 'live' ? (onAtmos ? onAtmosphere.text : t.ember) : null;
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {dot ? <View style={[styles.pillDot, { backgroundColor: dot }]} /> : null}
      {kind === 'done' ? <Ionicons name="checkmark" size={13} color={onAtmos ? onAtmosphere.text : t.gain} /> : null}
      <Callout tone={tone}>{label}</Callout>
    </View>
  );
}

/* ───────────────────────── 13. Button ───────────────────────── */

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'link';
  /** Inverts the primary button to paper-on-ink for use on an atmosphere. */
  onAtmosphere?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** DESIGN.md §6.13: one primary per screen. Verb + object labels ("Book appointment"). */
export function Button({ label, onPress, variant = 'primary', onAtmosphere: onAtmos, icon, disabled, style }: ButtonProps) {
  const t = useTokens();
  if (variant === 'link') {
    return (
      <Press haptic="select" onPress={onPress} disabled={disabled} accessibilityLabel={label} style={[styles.link, style]}>
        <Callout tone={onAtmos ? 'paper' : 'ink'} style={{ textDecorationLine: 'underline' }}>
          {label}
        </Callout>
      </Press>
    );
  }
  const primary = variant === 'primary';
  const bg = primary ? (onAtmos ? onAtmosphere.text : t.ink) : onAtmos ? onAtmosphere.glass : t.surface2;
  const fg = primary ? (onAtmos ? '#141417' : t.canvas) : onAtmos ? onAtmosphere.text : t.ink;
  return (
    <Press
      haptic={primary ? 'primary' : 'select'}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.4 : 1, height: primary ? 50 : 46 }, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text variant="title" style={{ color: fg, fontSize: primary ? 16 : 15 }}>
        {label}
      </Text>
    </Press>
  );
}

/* ───────────────────────── 9. MetricRow ───────────────────────── */

export type Metric = { label: string; value: string; tone?: Tone };

export function MetricRow({ items, style }: { items: Metric[]; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
      {items.map((m) => (
        <View key={m.label} style={{ flex: 1, backgroundColor: t.surface2, borderRadius: radius.md, padding: 14, gap: 4 }}>
          <Callout tone="ink2">{m.label}</Callout>
          <Title tone={m.tone ?? 'ink'}>{m.value}</Title>
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── 15. PromptBanner ───────────────────────── */

export type PromptBannerProps = {
  kind?: 'inspiration' | 'checkin';
  label?: string;
  title: string;
  subtitle?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  onPress?: () => void;
};

/** DESIGN.md §6.15: translucent warm banner (ref 16) with a ♡ save toggle. */
export function PromptBanner({ kind = 'inspiration', label, title, subtitle, saved, onToggleSave, onPress }: PromptBannerProps) {
  const t = useTokens();
  const colors: [string, string] =
    kind === 'inspiration' ? ['rgba(255,74,28,0.30)', 'rgba(120,30,20,0.16)'] : ['rgba(170,30,40,0.30)', 'rgba(80,10,20,0.16)'];
  const body = (
    <>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={kind === 'inspiration' ? 'sparkles-outline' : 'help-circle-outline'} size={16} color={t.ink2} />
        <Callout tone="ink2">{label ?? (kind === 'inspiration' ? 'Inspiration' : 'Check-in')}</Callout>
      </View>
      <Title style={{ paddingRight: 40 }}>{title}</Title>
      {subtitle ? <Callout tone="ink2">{subtitle}</Callout> : null}
      {onToggleSave ? (
        <Press
          haptic="select"
          onPress={onToggleSave}
          accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
          accessibilityState={{ selected: saved }}
          hitSlop={8}
          style={styles.heart}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? t.ember : t.ink2} />
        </Press>
      ) : null}
    </>
  );
  const box: ViewStyle = { backgroundColor: t.surface, borderRadius: 24, padding: 18, gap: 6, overflow: 'hidden' };
  return onPress ? (
    <Press haptic="open" onPress={onPress} style={box}>
      {body}
    </Press>
  ) : (
    <View style={box}>{body}</View>
  );
}

/* ───────────────────────── 14. ChoiceCard ───────────────────────── */

export type ChoiceCardProps = {
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Revealed on the right half when selected (ref 01). */
  image?: ImageSourcePropType;
};

export function ChoiceCard({ title, description, selected, onPress, image }: ChoiceCardProps) {
  const t = useTokens();
  const filled = selected && !image;
  const onPhoto = selected && !!image;
  const fg: Tone = filled ? 'inverse' : onPhoto ? 'paper' : 'ink';
  const fg2: Tone = filled ? 'inverse' : onPhoto ? 'paper2' : 'ink2';
  const ring = filled ? t.canvas : onPhoto ? onAtmosphere.text : t.surface3;
  return (
    <Press
      haptic="select"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={{ backgroundColor: filled ? t.ink : onPhoto ? '#141417' : t.surface, borderRadius: radius.md + 4, padding: 18, minHeight: 96, overflow: 'hidden' }}
    >
      {onPhoto ? (
        <>
          <Image source={image} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '62%' }} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(20,20,23,1)', 'rgba(20,20,23,0.6)', 'rgba(20,20,23,0)']}
            locations={[0.32, 0.55, 0.9]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}
      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: ring, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        {selected ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: filled ? t.canvas : onAtmosphere.text }} /> : null}
      </View>
      <Title tone={fg} style={{ maxWidth: '70%' }}>
        {title}
      </Title>
      {description ? (
        <Callout tone={fg2} style={{ marginTop: 4, maxWidth: '62%', opacity: filled ? 0.75 : 1 }}>
          {description}
        </Callout>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 12, borderRadius: radius.full, alignSelf: 'flex-start' },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.button, paddingHorizontal: 24, minWidth: 44 },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 8 },
  heart: { position: 'absolute', top: 10, right: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
