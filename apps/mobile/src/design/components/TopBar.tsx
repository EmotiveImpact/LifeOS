import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Press } from '../Press';
import { Text } from '../Text';
import { useTokens } from '../theme';
import { componentSize, palette, radius, space, touch } from '../tokens';

/** One fixed bar outside the scroller. On photographs, ALL kinds use paper
 * controls over the actual image, never an opaque light-theme background. */
export type TopBarAction =
  | { kind: 'icon'; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; badge?: boolean }
  | { kind: 'text'; label: string; onPress: () => void };
export type TopBarProps =
  | { kind: 'root'; eyebrow?: string; title: string; actions?: TopBarAction[]; avatar?: ReactNode; onImage?: boolean }
  | { kind: 'push'; title?: string; action?: TopBarAction; onBack: () => void; onImage?: boolean }
  | { kind: 'sheet'; title: string; action?: TopBarAction; onClose: () => void; onImage?: boolean }
  | { kind: 'flow'; center?: ReactNode; step?: string; action?: TopBarAction; onClose: () => void; onImage?: boolean };
export const TOP_BAR_HEIGHT = { root: 72, push: 60, sheet: 76, flow: 60 } as const;

export function TopBar(props: TopBarProps) {
  const t = useTokens();
  const [actionWidth, setActionWidth] = useState<number>(touch.min);
  const onImage = !!props.onImage;
  const backgroundColor = onImage ? 'transparent' : props.kind === 'sheet' ? t.surface : t.canvas;
  if (props.kind === 'root') return (
    <View style={[styles.root, { backgroundColor }]}>
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        {props.eyebrow ? <Text variant="callout" tone={onImage ? 'paper2' : 'ink2'}>{props.eyebrow}</Text> : null}
        <Text variant="titleSerif" tone={onImage ? 'paper' : 'ink'} accessibilityRole="header" numberOfLines={1}>{props.title}</Text>
      </View>
      <View style={styles.actions}>{props.avatar}{props.actions?.slice(0, 2).map((a, i) => <ActionButton key={i} action={a} onImage={onImage} />)}</View>
    </View>
  );
  if (props.kind === 'sheet') return (
    <View style={[styles.sheet, { backgroundColor }]}>
      <View style={[styles.grabber, { backgroundColor: onImage ? palette.dark.ink2 : t.surface3 }]} />
      <View style={styles.row}>
        <Text variant="title" tone={onImage ? 'paper' : 'ink'} style={{ flex: 1, minWidth: 0 }} accessibilityRole="header" numberOfLines={2}>{props.title}</Text>
        <ActionButton onImage={onImage} action={props.action ?? { kind: 'icon', icon: 'close', label: 'Close', onPress: props.onClose }} />
      </View>
    </View>
  );
  if (props.kind === 'flow') return (
    <View style={[styles.bar, { backgroundColor }]}>
      <ActionButton onImage={onImage} action={{ kind: 'icon', icon: 'close', label: 'Close', onPress: props.onClose }} />
      <View style={styles.center}>{props.center}</View>
      {props.action ? <ActionButton onImage={onImage} action={props.action} /> : props.step ? <Text variant="callout" tone={onImage ? 'paper2' : 'ink2'} style={styles.step}>{props.step}</Text> : <View style={styles.spacer} />}
    </View>
  );
  return (
    <View style={[styles.bar, { backgroundColor }]}>
      <View style={{ width: actionWidth, alignItems: 'flex-start' }}><ActionButton onImage={onImage} action={{ kind: 'icon', icon: 'chevron-back', label: 'Back', onPress: props.onBack }} /></View>
      <View pointerEvents="none" style={styles.center}>
        {props.title ? <Text variant="title" tone={onImage ? 'paper' : 'ink'} accessibilityRole="header" numberOfLines={1}>{props.title}</Text> : null}
      </View>
      <View onLayout={event => setActionWidth(Math.max(touch.min, event.nativeEvent.layout.width))} style={{ minWidth: touch.min, alignItems: 'flex-end' }}>
        {props.action ? <ActionButton onImage={onImage} action={props.action} /> : <View style={styles.spacer} />}
      </View>
    </View>
  );
}
function ActionButton({ action, onImage }: { action: TopBarAction; onImage?: boolean }) {
  const t = useTokens();
  if (action.kind === 'text') return <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} style={styles.text}><Text variant="callout" tone={onImage ? 'paper' : 'ink'} numberOfLines={1}>{action.label}</Text></Press>;
  return <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} style={[styles.icon, { backgroundColor: onImage ? palette.dark.surface : t.surface2 }]}>
    <Ionicons name={action.icon} size={componentSize.icon} color={onImage ? t.paper : t.ink} />
    {action.badge ? <View style={[styles.badge, { backgroundColor: t.ember }]} /> : null}
  </Press>;
}
const styles = StyleSheet.create({
  root: { minHeight: TOP_BAR_HEIGHT.root, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.gutter, paddingBottom: space.xs, gap: space.sm },
  actions: { flexDirection: 'row', gap: space.xs, alignItems: 'center' },
  bar: { minHeight: TOP_BAR_HEIGHT.push, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter },
  center: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: space.sm },
  step: { minWidth: touch.min, textAlign: 'right' },
  sheet: { minHeight: TOP_BAR_HEIGHT.sheet, paddingHorizontal: space.gutter, paddingTop: space.sm, paddingBottom: space.xs, gap: space.xxs },
  grabber: { width: space.xxl, height: space.xxs, borderRadius: radius.full, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  icon: { width: touch.min, height: touch.min, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { minHeight: touch.min, justifyContent: 'center', paddingHorizontal: space.xxs },
  spacer: { width: touch.min, height: touch.min },
  badge: { position: 'absolute', top: space.xs, right: space.xs, width: space.xs, height: space.xs, borderRadius: radius.full },
});
