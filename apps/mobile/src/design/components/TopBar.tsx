import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Press } from '../Press';
import { Text } from '../Text';
import { useTokens } from '../theme';

/**
 * TopBar (DESIGN.md §46). The header NEVER moves: it sits fixed above the scroll view, same height and
 * same place on every screen of its kind. No collapsing, no title fading in, no sliding away.
 * Put it outside your ScrollView; only the content scrolls underneath.
 *
 * Which kind is decided by how the screen opened:
 *  root   Tabs (Today, Plan, You): eyebrow + large title, at most two icon buttons on the right.
 *  push   Pushed screens: back · centred title · ONE smart action or nothing.
 *  sheet  Grabber, title on the left, close (or one text action like "Done") on the right.
 *  flow   Full-screen tasks: close · progress (pass it as `center`) · step count.
 * `onImage` (push only) puts the buttons on solid dark discs over a photo header; no blur, no glass.
 */
export type TopBarAction =
  | { kind: 'icon'; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; badge?: boolean }
  | { kind: 'text'; label: string; onPress: () => void };

export type TopBarProps =
  | { kind: 'root'; eyebrow?: string; title: string; actions?: TopBarAction[]; avatar?: ReactNode }
  | { kind: 'push'; title?: string; action?: TopBarAction; onBack: () => void; onImage?: boolean }
  | { kind: 'sheet'; title: string; action?: TopBarAction; onClose: () => void }
  | { kind: 'flow'; center?: ReactNode; step?: string; onClose: () => void };

/** Fixed heights, so content below always starts in the same place. */
export const TOP_BAR_HEIGHT = { root: 72, push: 48, sheet: 64, flow: 48 } as const;

export function TopBar(props: TopBarProps) {
  const t = useTokens();

  if (props.kind === 'root') {
    return (
      <View style={[styles.root, { backgroundColor: t.canvas }]}>
        <View style={{ flex: 1, gap: 1 }}>
          {props.eyebrow ? <Text variant="callout" tone="ink2">{props.eyebrow}</Text> : null}
          <Text variant="titleSerif" accessibilityRole="header" numberOfLines={1}>{props.title}</Text>
        </View>
        <View style={styles.actions}>
          {props.avatar}
          {props.actions?.slice(0, 2).map((a, i) => <ActionButton key={i} action={a} />)}
        </View>
      </View>
    );
  }

  if (props.kind === 'sheet') {
    return (
      <View style={[styles.sheet, { backgroundColor: t.surface }]}>
        <View style={[styles.grabber, { backgroundColor: t.surface3 }]} />
        <View style={styles.row}>
          <Text variant="headline" style={{ flex: 1 }} accessibilityRole="header" numberOfLines={1}>{props.title}</Text>
          <ActionButton action={props.action ?? { kind: 'icon', icon: 'close', label: 'Close', onPress: props.onClose }} />
        </View>
      </View>
    );
  }

  if (props.kind === 'flow') {
    return (
      <View style={[styles.bar, { backgroundColor: t.canvas }]}>
        <ActionButton action={{ kind: 'icon', icon: 'close', label: 'Close', onPress: props.onClose }} />
        <View style={styles.center}>{props.center}</View>
        {props.step ? <Text variant="mono" tone="ink2" style={styles.step}>{props.step}</Text> : <View style={styles.spacer} />}
      </View>
    );
  }

  const onImg = !!props.onImage;
  return (
    <View style={[styles.bar, { backgroundColor: onImg ? 'transparent' : t.canvas }]}>
      <ActionButton onImage={onImg} action={{ kind: 'icon', icon: 'chevron-back', label: 'Back', onPress: props.onBack }} />
      <View pointerEvents="none" style={styles.centerAbs}>
        {props.title ? <Text variant="title" numberOfLines={1} style={onImg ? { color: '#F7F8F8' } : undefined}>{props.title}</Text> : null}
      </View>
      {props.action ? <ActionButton onImage={onImg} action={props.action} /> : <View style={styles.spacer} />}
    </View>
  );
}

function ActionButton({ action, onImage }: { action: TopBarAction; onImage?: boolean }) {
  const t = useTokens();
  if (action.kind === 'text') {
    return (
      <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} style={styles.text}>
        <Text variant="title" tone="ember">{action.label}</Text>
      </Press>
    );
  }
  return (
    <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label}
      style={[styles.icon, { backgroundColor: onImage ? 'rgba(13,14,16,0.55)' : t.surface2 }]}>
      <Ionicons name={action.icon} size={19} color={onImage ? '#F7F8F8' : t.ink2} />
      {action.badge ? <View style={[styles.badge, { backgroundColor: t.ember, borderColor: t.surface2 }]} /> : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  root: { height: TOP_BAR_HEIGHT.root, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 6, gap: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bar: { height: TOP_BAR_HEIGHT.push, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  centerAbs: { position: 'absolute', left: 72, right: 72, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  step: { minWidth: 40, textAlign: 'right' },
  sheet: { height: TOP_BAR_HEIGHT.sheet, paddingHorizontal: 20, paddingTop: 8, gap: 8 },
  grabber: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { height: 40, justifyContent: 'center', paddingHorizontal: 4 },
  spacer: { width: 40, height: 40 },
  badge: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, borderWidth: 2 },
});
