import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Image, PanResponder, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Callout, Headline, Mono, Text, Title, type Tone } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { atmospheres, durations, floatShadow, onAtmosphere, radius, springs, type Domain } from '../tokens';
import { DottedOrb } from './Chrome';

/* ───────────────────────── 2. TwoTone ───────────────────────── */

export type TwoToneSegment = {
  text: string;
  tone?: 'quiet' | 'ink';
  /** Ionicon shown inline before the text. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Inline avatar: initials on a colour. */
  avatar?: { initials: string; color: string };
};

/**
 * DESIGN.md §6.2: the signature sentence. Quiet context in `ink-quiet`, what matters in full ink.
 * Write segments with their own spacing, e.g. [{text:'Nothing urgent — ', tone:'quiet'}, {text:'one form'}].
 */
export function TwoTone({ segments, size = 'statement', onAtmosphere: onAtmos, style }: { segments: TwoToneSegment[]; size?: 'statement' | 'headline' | 'welcomeStatement'; onAtmosphere?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const quiet = onAtmos ? onAtmosphere.quiet : t.inkQuiet;
  const ink = onAtmos ? onAtmosphere.text : t.ink;
  const glyph = size === 'statement' ? 22 : 18;
  return (
    <Animated.View entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.springify().damping(springs.smooth.damping).stiffness(springs.smooth.stiffness)} style={style}>
      <Text variant={size} accessibilityRole="text">
        {segments.map((s, i) => (
          <Text key={i} variant={size} style={{ color: s.tone === 'quiet' ? quiet : ink }}>
            {s.avatar ? (
              <View style={{ width: glyph + 2, height: glyph + 2, borderRadius: (glyph + 2) / 2, backgroundColor: s.avatar.color, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: 3 }] }}>
                <Text variant="micro" style={{ color: onAtmosphere.text }}>
                  {s.avatar.initials}
                </Text>
              </View>
            ) : null}
            {s.icon ? <Ionicons name={s.icon} size={glyph} color={s.tone === 'quiet' ? quiet : ink} /> : null}
            {s.avatar || s.icon ? ' ' : ''}
            {s.text}
          </Text>
        ))}
      </Text>
    </Animated.View>
  );
}

/* ───────────────────────── 7. PeekStack ───────────────────────── */

export type PeekItem = {
  key: string;
  /** The row that peeks when the card is behind (avatar, name, meta). */
  header: ReactNode;
  /** Shown under the header; visible on the front card. */
  body?: ReactNode;
  /** Card background; defaults to `surface`. Use a domain tint for colour. */
  domain?: Domain;
  background?: string;
  onPressFront?: () => void;
};

/**
 * DESIGN.md §6.7: cards fanned behind each other. Tap a peeking header to spring it to the front;
 * swipe the front card down to send it to the back.
 */
export function PeekStack({ items, gap = 54, style }: { items: PeekItem[]; gap?: number; style?: StyleProp<ViewStyle> }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [heights, setHeights] = useState<number[]>(() => items.map(() => 0));
  useEffect(() => {
    setOrder(items.map((_, i) => i));
    setHeights(items.map(() => 0));
  }, [items.length]);
  const n = order.length;
  const frontIdx = order[n - 1];
  const frontH = heights[frontIdx] || 120;
  const visible = Math.min(n, 4);
  const height = (visible - 1) * gap + frontH;

  const bringToFront = (ci: number) => {
    setOrder((o) => [...o.filter((x) => x !== ci), ci]);
  };
  const sendToBack = () => {
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  };

  return (
    <View style={[{ height }, style]}>
      {items.map((it, ci) => {
        const pos = order.indexOf(ci);
        return (
          <PeekCard
            key={it.key}
            item={it}
            pos={pos}
            count={n}
            gap={gap}
            onMeasure={(h) => setHeights((hs) => (hs[ci] === h ? hs : hs.map((x, j) => (j === ci ? h : x))))}
            onBringFront={() => bringToFront(ci)}
            onSendBack={sendToBack}
          />
        );
      })}
    </View>
  );
}

function PeekCard({ item, pos, count, gap, onMeasure, onBringFront, onSendBack }: { item: PeekItem; pos: number; count: number; gap: number; onMeasure: (h: number) => void; onBringFront: () => void; onSendBack: () => void }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const back = count - 1 - pos;
  const isFront = back === 0;
  const visibleOffset = Math.max(0, Math.min(count, 4) - 1 - back);
  const y = useSharedValue(visibleOffset * gap);
  const s = useSharedValue(1 - back * 0.04);
  const drag = useSharedValue(0);
  useEffect(() => {
    const cfg = springs.smooth;
    y.value = calm ? withTiming(visibleOffset * gap, { duration: durations.quick }) : withSpring(visibleOffset * gap, cfg);
    s.value = calm ? withTiming(1 - back * 0.04, { duration: durations.quick }) : withSpring(1 - back * 0.04, cfg);
  }, [visibleOffset, back, gap, calm, y, s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value + drag.value }, { scale: s.value }] }));

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => isFront && g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          drag.value = Math.max(0, g.dy);
        },
        onPanResponderRelease: (_, g) => {
          drag.value = withSpring(0, springs.smooth);
          if (g.dy > 60) {
            feedback.select();
            onSendBack();
          }
        },
        onPanResponderTerminate: () => {
          drag.value = withSpring(0, springs.smooth);
        },
      }),
    [isFront, onSendBack, drag],
  );

  const bg = item.background ?? t.surface;
  return (
    <Animated.View
      {...responder.panHandlers}
      onLayout={(e) => onMeasure(e.nativeEvent.layout.height)}
      style={[
        { position: 'absolute', left: 0, right: 0, top: 0, zIndex: pos + 1, opacity: back > 3 ? 0 : 1 },
        isFront ? floatShadow(t.shadow) : null,
        anim,
      ]}
    >
      <Press
        haptic={isFront ? (item.onPressFront ? 'open' : null) : 'select'}
        onPress={isFront ? item.onPressFront : onBringFront}
        accessibilityLabel={isFront ? undefined : 'Bring card to front'}
        pressScale={0.985}
        style={{ backgroundColor: bg, borderRadius: 24, padding: 18, overflow: 'hidden' }}
      >
        {item.domain ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: atmospheres[item.domain].tint[t.scheme] }]} /> : null}
        <View style={{ minHeight: 28, justifyContent: 'center' }}>{item.header}</View>
        {item.body ? <View style={{ marginTop: 12 }}>{item.body}</View> : null}
      </Press>
    </Animated.View>
  );
}

/** Convenience header row for a peek card: avatar + name + meta on the right. */
export function PeekHeader({ initials, color, name, meta, tone = 'ink' }: { initials: string; color: string; name: string; meta?: string; tone?: Tone }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="micro" style={{ color: onAtmosphere.text }}>
          {initials}
        </Text>
      </View>
      <Text variant="title" tone={tone} style={{ fontSize: 15, flex: 1 }} numberOfLines={1}>
        {name}
      </Text>
      {meta ? <Callout tone={tone === 'paper' ? 'paper2' : 'ink2'}>{meta}</Callout> : null}
    </View>
  );
}

/* ───────────────────────── Rolling numbers ───────────────────────── */

/** Counts from the previous value to the new one over 600ms (ease-out). DESIGN.md §7. */
export function useRollingNumber(value: number): number {
  const calm = useCalmMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (calm) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / durations.roll);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(start + (value - start) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, calm]);
  return shown;
}

/** A display number (Inter, tabular) with an optional unit ("72" + "/100"). Rolls when the value changes. */
export function RollingNumeral({ value, unit, size = 'l', tone = 'ink', decimals = 0 }: { value: number; unit?: string; size?: 'xl' | 'l'; tone?: Tone; decimals?: number }) {
  const v = useRollingNumber(value);
  return (
    <Text variant={size === 'xl' ? 'numeralXl' : 'numeralL'} tone={tone}>
      {v.toFixed(decimals)}
      {unit ? (
        <Text variant="unit" tone={tone === 'paper' ? 'paperQuiet' : 'ink2'}>
          {unit}
        </Text>
      ) : null}
    </Text>
  );
}

/* ───────────────────────── 17. MoneyFigure ───────────────────────── */

export type MoneyFigureProps = {
  value: number;
  currency?: string;
  size?: 'xl' | 'l';
  delta?: { pct?: number; abs?: number; label?: string };
  hidden?: boolean;
  onToggleHidden?: () => void;
  onAtmosphere?: boolean;
  align?: 'left' | 'center';
};

/** DESIGN.md §6.17: display whole part, quiet decimals, delta pill, and a privacy eye. */
export function MoneyFigure({ value, currency = '£', size = 'xl', delta, hidden, onToggleHidden, onAtmosphere: onAtmos, align = 'center' }: MoneyFigureProps) {
  const t = useTokens();
  const v = useRollingNumber(value);
  const whole = Math.floor(Math.abs(v)).toLocaleString('en-GB');
  const dec = Math.round((Math.abs(v) % 1) * 100)
    .toString()
    .padStart(2, '0')
    .slice(0, 2);
  const tone: Tone = onAtmos ? 'paper' : 'ink';
  const quiet = onAtmos ? onAtmosphere.quiet : t.inkQuiet;
  const up = (delta?.pct ?? delta?.abs ?? 0) >= 0;
  const deltaColor = onAtmos ? '#2FD39F' : up ? t.gain : t.emberText;
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', gap: 6 }}>
      {delta ? (
        <Text variant="callout" style={{ color: deltaColor }}>
          {up ? '▲' : '▼'} {delta.pct !== undefined ? `${Math.abs(delta.pct).toFixed(1)}%` : ''}
          {delta.abs !== undefined ? (
            <Text variant="callout" tone={onAtmos ? 'paper2' : 'ink2'}>
              {'  '}
              {up ? '+' : '−'}
              {currency}
              {Math.abs(delta.abs).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {delta.label ? ` ${delta.label}` : ''}
            </Text>
          ) : null}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Animated.View key={hidden ? 'h' : 's'} entering={FadeIn.duration(durations.quick)}>
          <Text variant={size === 'xl' ? 'numeralXl' : 'numeralL'} tone={tone} accessibilityLabel={hidden ? 'Balance hidden' : `${currency}${whole}.${dec}`}>
            {hidden ? (
              `${currency}••••`
            ) : (
              <>
                {value < 0 ? '−' : ''}
                {currency}
                {whole}
                <Text variant={size === 'xl' ? 'numeralXl' : 'numeralL'} style={{ color: quiet }}>
                  .{dec}
                </Text>
              </>
            )}
          </Text>
        </Animated.View>
        {onToggleHidden ? (
          <Press haptic="select" onPress={onToggleHidden} accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: onAtmos ? onAtmosphere.glass : t.surface2 }}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={onAtmos ? onAtmosphere.text : t.ink2} />
          </Press>
        ) : null}
      </View>
    </View>
  );
}

/* ───────────────────────── 19. Countdown ───────────────────────── */

export function formatRelative(target: Date, now: Date): string {
  const ms = target.getTime() - now.getTime();
  const past = ms < 0;
  const mins = Math.round(Math.abs(ms) / 60000);
  let s: string;
  if (mins < 1) return 'now';
  if (mins < 60) s = `${mins}m`;
  else if (mins < 60 * 24) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    s = m ? `${h}h ${m}m` : `${h}h`;
  } else {
    const d = Math.round(mins / (60 * 24));
    s = `${d} day${d === 1 ? '' : 's'}`;
  }
  return past ? `${s} ago` : `in ${s}`;
}

/** DESIGN.md §6.19: "in 1h 15m". Under 24h it turns ember. Re-renders every minute. */
export function Countdown({ to, prefix, style }: { to: Date; prefix?: string; style?: StyleProp<ViewStyle> }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const ms = to.getTime() - now.getTime();
  const soon = ms > 0 && ms < 24 * 3600 * 1000;
  return (
    <View style={style}>
      <Callout tone={soon ? 'ember' : 'ink2'}>
        {prefix ? `${prefix} ` : ''}
        {formatRelative(to, now)}
      </Callout>
    </View>
  );
}

/* ───────────────────────── 16. LedgerRow ───────────────────────── */

export type LedgerRowProps = {
  title: string;
  amount: number;
  direction?: 'in' | 'out' | 'move';
  sub?: string;
  currency?: string;
  hidden?: boolean;
  onPress?: () => void;
};

export function LedgerRow({ title, amount, direction = 'out', sub, currency = '£', hidden, onPress }: LedgerRowProps) {
  const t = useTokens();
  const icon = direction === 'in' ? 'arrow-down-outline' : direction === 'move' ? 'swap-horizontal' : 'arrow-up-outline';
  const whole = Math.floor(Math.abs(amount)).toLocaleString('en-GB');
  const dec = Math.round((Math.abs(amount) % 1) * 100)
    .toString()
    .padStart(2, '0');
  const row = (
    <>
      <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: direction === 'in' ? t.gainTint : t.surface2 }}>
        <Ionicons name={icon} size={18} color={direction === 'in' ? t.gain : t.ink} style={{ transform: [{ rotate: direction === 'move' ? '0deg' : '45deg' }] }} />
      </View>
      <Title style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Title>
      <View style={{ alignItems: 'flex-end' }}>
        <Title style={{ color: direction === 'in' ? t.gain : t.ink, fontVariant: ['tabular-nums'] }}>
          {hidden ? (
            '••••'
          ) : (
            <>
              {direction === 'in' ? '+' : ''}
              {currency}
              {whole}
              <Text variant="title" style={{ color: t.inkQuiet }}>
                .{dec}
              </Text>
            </>
          )}
        </Title>
        {sub ? <Callout tone="ink2">{sub}</Callout> : null}
      </View>
    </>
  );
  const style: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, minHeight: 64 };
  return onPress ? (
    <Press haptic="open" onPress={onPress} pressScale={0.985} style={style}>
      {row}
    </Press>
  ) : (
    <View style={style}>{row}</View>
  );
}

/* ───────────────────────── 8. NudgeCard ───────────────────────── */

export type NudgeCardProps = {
  timestamp: string;
  title: string;
  media?: { type: 'image'; source: ImageSourcePropType } | { type: 'orb' };
  variant?: 'default' | 'hero';
  /** Gradient for `hero`. Defaults to the ref-10 dusk gradient. */
  heroColors?: [string, string, string];
  onPress?: () => void;
  /** Swipe right. */
  onComplete?: () => void;
  /** Swipe left. */
  onSnooze?: () => void;
};

/** DESIGN.md §6.8: mono timestamp + title + media. Swipe right to complete, left to snooze a day. */
export function NudgeCard({ timestamp, title, media, variant = 'default', heroColors, onPress, onComplete, onSnooze }: NudgeCardProps) {
  const t = useTokens();
  const hero = variant === 'hero';
  const x = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => {
          x.value = g.dx;
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > 90 && onComplete) {
            feedback.complete();
            onComplete();
          } else if (g.dx < -90 && onSnooze) {
            feedback.select();
            onSnooze();
          }
          x.value = withSpring(0, springs.smooth);
        },
        onPanResponderTerminate: () => {
          x.value = withSpring(0, springs.smooth);
        },
      }),
    [onComplete, onSnooze, x],
  );
  return (
    <Animated.View {...(onComplete || onSnooze ? responder.panHandlers : {})} style={anim}>
      <Press
        haptic="open"
        onPress={onPress}
        style={{ borderRadius: 24, padding: 18, minHeight: hero ? 170 : 120, flexDirection: 'row', alignItems: 'flex-end', gap: 14, backgroundColor: t.surface, overflow: 'hidden' }}
      >
        {hero ? <LinearGradient colors={heroColors ?? ['#5B3B8C', '#C2457A', '#F0612D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /> : null}
        <View style={{ flex: 1, gap: 8 }}>
          <Mono tone={hero ? 'paper2' : 'ink2'}>{timestamp}</Mono>
          {hero ? (
            <Headline tone="paper" style={{ fontSize: 20, lineHeight: 25 }}>
              {title}
            </Headline>
          ) : (
            <Title numberOfLines={3}>{title}</Title>
          )}
        </View>
        {media?.type === 'image' ? <Image source={media.source} style={{ width: 76, height: 76, borderRadius: radius.sm }} /> : null}
        {media?.type === 'orb' ? <DottedOrb size={56} /> : null}
      </Press>
    </Animated.View>
  );
}
