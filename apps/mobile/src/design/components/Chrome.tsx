import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { durations, floatShadow, radius, springs } from '../tokens';

/* ───────────────────────── 21. DottedOrb ───────────────────────── */

const DOTS = 12;

/** DESIGN.md §6.21: the life symbol. Idle: slow 12s rotation. Thinking: dots pulse in sequence. */
export function DottedOrb({ size = 56, state = 'idle', color }: { size?: number; state?: 'idle' | 'thinking'; color?: string }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const rot = useSharedValue(0);
  const phase = useSharedValue(0);
  useEffect(() => {
    if (calm) {
      cancelAnimation(rot);
      cancelAnimation(phase);
      return;
    }
    rot.value = 0;
    rot.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
    if (state === 'thinking') {
      phase.value = 0;
      phase.value = withRepeat(withTiming(DOTS, { duration: 1200, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(phase);
      phase.value = 0;
    }
  }, [calm, state, rot, phase]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const dot = Math.max(3, Math.round(size / 11));
  const r = size / 2 - dot;
  return (
    <Animated.View style={[{ width: size, height: size }, spin]} accessibilityRole="image" accessibilityLabel={state === 'thinking' ? 'life is thinking' : 'life'}>
      {Array.from({ length: DOTS }, (_, i) => (
        <OrbDot key={i} i={i} r={r} size={size} dot={dot} color={color ?? t.ink} phase={phase} thinking={state === 'thinking' && !calm} />
      ))}
    </Animated.View>
  );
}

function OrbDot({ i, r, size, dot, color, phase, thinking }: { i: number; r: number; size: number; dot: number; color: string; phase: SharedValue<number>; thinking: boolean }) {
  const a = (i / DOTS) * Math.PI * 2;
  const base = 0.35 + 0.65 * (i / DOTS);
  const style = useAnimatedStyle(() => {
    if (!thinking) return { opacity: base, transform: [{ scale: 1 }] };
    const d = (phase.value - i + DOTS) % DOTS;
    const k = d < 3 ? 1 - d / 3 : 0;
    return { opacity: 0.25 + 0.75 * k, transform: [{ scale: 1 + 0.5 * k }] };
  });
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color, left: size / 2 - dot / 2 + Math.cos(a) * r, top: size / 2 - dot / 2 + Math.sin(a) * r },
        style,
      ]}
    />
  );
}

/* ───────────────────────── 12. Dock ───────────────────────── */

export type DockItem = { key: string; label: string; icon: (color: string) => ReactNode };

/**
 * DESIGN.md §6.12 + §43: floating solid pill with 4 items. Active = inverted capsule with label.
 * Pass `hidden` from your scroll handler (true while scrolling down) to tuck it away.
 */
export function Dock({ items, active, onChange, hidden }: { items: DockItem[]; active: string; onChange: (key: string) => void; hidden?: boolean }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const calm = useCalmMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    const to = hidden ? 120 : 0;
    y.value = calm ? withTiming(to, { duration: durations.quick }) : withSpring(to, springs.smooth);
  }, [hidden, calm, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View pointerEvents="box-none" style={[styles.dockWrap, { bottom: 12 + insets.bottom }, anim]}>
      {/* Shadow lives on the outer view; the inner one clips the blur to the pill shape. */}
      <View style={[{ borderRadius: radius.full }, floatShadow(t.shadow)]}>
      <View style={styles.dock} accessibilityRole="tablist">
        {/* Solid surface + hairline. No blur or glass anywhere (DESIGN.md §43). */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.dockBg, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: t.line }]} />
        {items.map((it) => {
          const on = it.key === active;
          return (
            <Press
              key={it.key}
              haptic="select"
              onPress={() => onChange(it.key)}
              accessibilityRole="tab"
              accessibilityLabel={it.label}
              accessibilityState={{ selected: on }}
              style={[styles.dockItem, on && { backgroundColor: t.ink, paddingHorizontal: 18 }]}
            >
              {it.icon(on ? t.canvas : t.ink2)}
              {on ? (
                <Text variant="micro" style={{ color: t.canvas }}>
                  {it.label}
                </Text>
              ) : null}
            </Press>
          );
        })}
      </View>
      </View>
    </Animated.View>
  );
}

/* ───────────────────────── 20. Sheet ───────────────────────── */

export type SheetHandle = { open: () => void; close: () => void };

export type SheetProps = {
  children: ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  /** Wrap content in a scroll view (default true). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * DESIGN.md §6.20: @gorhom bottom sheet with 36pt top corners, a quiet grabber and a dimmed backdrop.
 * Needs `BottomSheetModalProvider` above it (exported as `SheetProvider`).
 */
export const Sheet = forwardRef<SheetHandle, SheetProps>(function Sheet({ children, snapPoints = ['55%', '92%'], onClose, scroll = true, contentStyle }, ref) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const modal = useRef<BottomSheetModal>(null);
  useImperativeHandle(ref, () => ({ open: () => modal.current?.present(), close: () => modal.current?.dismiss() }), []);
  const backdrop = useCallback(
    (p: BottomSheetBackdropProps) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.35} pressBehavior="close" />,
    [],
  );
  const pad: ViewStyle = { paddingHorizontal: 20, paddingBottom: 24 + insets.bottom };
  return (
    <BottomSheetModal
      ref={modal}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={backdrop}
      onChange={(i) => {
        if (i >= 0) feedback.snap();
      }}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: t.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}
      handleIndicatorStyle={{ backgroundColor: t.surface3, width: 36, height: 5 }}
    >
      {scroll ? <BottomSheetScrollView contentContainerStyle={[pad, contentStyle]}>{children}</BottomSheetScrollView> : <View style={[pad, contentStyle]}>{children}</View>}
    </BottomSheetModal>
  );
});

export { BottomSheetModalProvider as SheetProvider } from '@gorhom/bottom-sheet';

const styles = StyleSheet.create({
  dockWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dock: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderRadius: radius.full, overflow: 'hidden' },
  dockItem: { height: 48, minWidth: 52, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14 },
});
