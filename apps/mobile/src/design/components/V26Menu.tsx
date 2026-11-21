import { useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions, type HostInstance } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Icon, type GlyphName } from '../Icon';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { durations, floatLift, motion, radius, space, touch } from '../tokens';

/** One choice in a pull-down menu. `destructive` draws it in the signal colour, as iOS draws Delete in red. */
export type MenuItem = { label: string; /** A quiet second line, as iOS menus allow. */ sub?: string; icon?: GlyphName; destructive?: boolean; onPress: () => void };

const WIDTH = 264;
const EDGE = space.xs;

/**
 * The native pull-down menu (Edem, 20 Nov: three dots that reveal a card of options inside the page didn't feel
 * native). Like iOS's UIMenu and Android's dropdown, it drops from the button that opened it, lists two or more actions
 * with their icons on the right, and closes on a choice or a tap anywhere else. Three dots are kept only for this: a
 * button that does one thing shows that thing instead (a clock for history, an `i` for why, Edit for changes).
 *
 *   <ActionMenu items={[...]}>{open => <RoundButton icon="more" label="Meal actions" onPress={open} />}</ActionMenu>
 */
export function ActionMenu({ items, children }: { items: MenuItem[]; children: (open: () => void, isOpen: boolean) => ReactNode }) {
  const t = useTokens(), calm = useCalmMotion(), win = useWindowDimensions();
  const anchor = useRef<HostInstance>(null);
  const [at, setAt] = useState<{ top: number; right: number; up: boolean } | null>(null);
  const grow = useSharedValue(0);
  const height = items.reduce<number>((h, it) => h + (it.sub ? touch.min + 36 : touch.min), space.xs);
  const open = () => {
    anchor.current?.measureInWindow((x, y, w, h) => {
      const below = y + h + space.xs;
      const up = below + height > win.height - EDGE;
      setAt({ top: up ? Math.max(EDGE, y - space.xs - height) : below, right: Math.max(EDGE, win.width - (x + w)), up });
      grow.value = 0;
      grow.value = calm ? withTiming(1, { duration: durations.quick }) : withSpring(1, motion.snappy);
    });
  };
  const close = (then?: () => void) => { setAt(null); then?.(); };
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, grow.value * 1.6), transform: [{ scale: calm ? 1 : 0.86 + 0.14 * grow.value }] }));
  // No blur is allowed (DESIGN §43), so a faint scrim lifts the menu off the page instead of iOS's frosted material.
  const dim = useAnimatedStyle(() => ({ opacity: Math.min(1, grow.value) * (t.scheme === 'dark' ? 0.7 : 0.35) }));
  return (
    <>
      <View ref={anchor} collapsable={false}>{children(open, !!at)}</View>
      <Modal visible={!!at} transparent animationType="none" statusBarTranslucent onRequestClose={() => close()}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }, dim]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel="Close menu" />
        {at ? (
          <Animated.View accessibilityRole="menu" style={[styles.menu, { top: at.top, right: at.right, backgroundColor: t.surface, transformOrigin: at.up ? 'bottom right' : 'top right', ...floatLift(t.scheme) }, style]}>
            {items.map(it => {
              const tone = it.destructive ? 'ember' : 'ink';
              return (
                <Press key={it.label} haptic="select" onPress={() => close(it.onPress)} accessibilityRole="menuitem" accessibilityLabel={it.label} style={styles.item}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyMedium" tone={tone} numberOfLines={1}>{it.label}</Text>
                    {it.sub ? <Text variant="callout" tone="ink2" numberOfLines={2}>{it.sub}</Text> : null}
                  </View>
                  {it.icon ? <Icon name={it.icon} size={18} color={it.destructive ? t.ember : t.ink} /> : null}
                </Press>
              );
            })}
          </Animated.View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menu: { position: 'absolute', width: WIDTH, borderRadius: radius.md + 2, paddingVertical: space.xxs, overflow: 'visible' },
  item: { minHeight: touch.min, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.xxs },
});
