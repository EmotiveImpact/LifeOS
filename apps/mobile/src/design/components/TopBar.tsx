import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon as Ionicons, type GlyphName } from '../Icon';
import { Press } from '../Press';
import { Text } from '../Text';
import { useTokens } from '../theme';
import { componentSize, palette, radius, space, touch } from '../tokens';
import { LifeOrb } from './Orb';
import { RoundButton } from './V26Chrome';

/** One fixed bar outside the scroller. On photographs, ALL kinds use paper
 * controls over the actual image, never an opaque light-theme background. */
export type TopBarAction =
  | { kind: 'icon'; icon: GlyphName; label: string; onPress: () => void; badge?: boolean }
  | { kind: 'text'; label: string; onPress: () => void }
  /** V26: anything small in the bar's right slot (a chip such as "Free 13:40 to 14:00"). */
  | { kind: 'node'; node: ReactNode };
/** `look: 'v26'` draws the board's bars (52pt, round 40pt buttons, the orb on root). Leave it unset for the V23 bars. */
type BarLook = { look?: 'v26' };
export type TopBarProps = BarLook & (
  | { kind: 'root'; eyebrow?: string; title: string; /** V26: the quiet words after the title ("Mon 16 Nov"). */ sub?: string; actions?: TopBarAction[]; avatar?: ReactNode; onImage?: boolean }
  | { kind: 'push'; title?: string; /** V26: something other than words in the middle (the orb and "life" on Chat). */ titleNode?: ReactNode; action?: TopBarAction; onBack: () => void; /** V26: a close cross in place of the back arrow. */ closeIcon?: boolean; onImage?: boolean }
  | { kind: 'sheet'; title: string; action?: TopBarAction; onClose: () => void; onImage?: boolean }
  | { kind: 'flow'; center?: ReactNode; step?: string; action?: TopBarAction; onClose: () => void; /** V26 text bar: the words on the left ("Back"). */ closeLabel?: string; closeIcon?: GlyphName; onImage?: boolean });
export const TOP_BAR_HEIGHT = { root: 72, push: 60, sheet: 76, flow: 60 } as const;
/** V26 bar heights: every bar 52pt; a sheet adds its 13pt handle. */
export const TOP_BAR_HEIGHT_V26 = { root: 52, push: 52, sheet: 65, flow: 52 } as const;

export function TopBar(props: TopBarProps) {
  if (props.look === 'v26') return <TopBarV26 {...props} />;
  return <TopBarV23 {...props} />;
}

function TopBarV23(props: TopBarProps) {
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
/* V26 (board `rootBar`, `pushBar`, `sheetBar`, `textBar`): the bar never moves and never holds more than it needs. */
function TopBarV26(props: TopBarProps) {
  const t = useTokens();
  const [sideWidth, setSideWidth] = useState<number>(componentSize.round);
  const onImage = !!props.onImage;
  const bg = onImage ? 'transparent' : props.kind === 'sheet' ? t.surface : t.canvas;
  if (props.kind === 'root') return (
    <View style={[styles.v26, { backgroundColor: bg }]}>
      <View style={styles.v26Id}>
        <LifeOrb size={22} color={onImage ? t.paper : t.ink} />
        <Text variant="title" tone={onImage ? 'paper' : 'ink'} accessibilityRole="header" numberOfLines={1} style={{ marginRight: 2, flexShrink: 1 }}>{props.title}</Text>
        {props.sub ? <Text variant="callout" tone={onImage ? 'paper2' : 'ink2'} numberOfLines={1}>{props.sub}</Text> : null}
      </View>
      <View style={styles.actions}>{props.avatar}{props.actions?.slice(0, 2).map((a, i) => <ActionV26 key={i} action={a} onImage={onImage} />)}</View>
    </View>
  );
  if (props.kind === 'flow') return (
    <View style={[styles.v26, { backgroundColor: bg }]}>
      <Press haptic="select" onPress={props.onClose} accessibilityLabel={props.closeLabel ?? 'Back'} hitSlop={10} style={styles.v26Txt}>
        <Ionicons name={props.closeIcon ?? 'back'} size={componentSize.iconSm} color={onImage ? t.paper : t.ink2} />
        <Text variant="bodyMedium" tone={onImage ? 'paper' : 'ink2'}>{props.closeLabel ?? 'Back'}</Text>
      </Press>
      {props.center ? <View style={styles.center}>{props.center}</View> : null}
      {props.action ? <ActionV26 action={props.action} onImage={onImage} /> : props.step ? <Text variant="bodyMedium" tone={onImage ? 'paper2' : 'ink2'} style={{ fontVariant: ['tabular-nums'] }}>{props.step}</Text> : <View />}
    </View>
  );
  const left = props.kind === 'push'
    ? <RoundButton icon={props.closeIcon ? 'close' : 'back'} label={props.closeIcon ? 'Close' : 'Back'} onPress={props.onBack} onPhoto={onImage} />
    : props.action ? <ActionV26 action={props.action} onImage={onImage} /> : null;
  const right = props.kind === 'push'
    ? (props.action ? <ActionV26 action={props.action} onImage={onImage} /> : null)
    : <RoundButton icon="close" label="Close" onPress={props.onClose} onPhoto={onImage} />;
  const bar = (
    <View style={[styles.v26, { backgroundColor: bg }]}>
      <View style={{ minWidth: sideWidth, alignItems: 'flex-start' }}>{left}</View>
      <View pointerEvents={props.kind === 'push' && props.titleNode ? 'box-none' : 'none'} style={styles.center}>
        {props.kind === 'push' && props.titleNode ? props.titleNode : props.title ? <Text variant="title" tone={onImage ? 'paper' : 'ink'} accessibilityRole="header" numberOfLines={1}>{props.title}</Text> : null}
      </View>
      <View onLayout={e => setSideWidth(Math.max(componentSize.round, e.nativeEvent.layout.width))} style={{ minWidth: componentSize.round, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
  if (props.kind === 'sheet') return (
    <View style={{ backgroundColor: bg }}>
      <View style={[styles.v26Handle, { backgroundColor: onImage ? t.paper : t.surface3 }]} />
      {bar}
    </View>
  );
  return bar;
}

function ActionV26({ action, onImage }: { action: TopBarAction; onImage?: boolean }) {
  if (action.kind === 'node') return <>{action.node}</>;
  if (action.kind === 'text') return <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} hitSlop={10} style={styles.v26Txt}><Text variant="bodyMedium" tone={onImage ? 'paper' : 'ink2'} numberOfLines={1}>{action.label}</Text></Press>;
  return <RoundButton icon={action.icon} label={action.label} onPress={action.onPress} dot={action.badge} onPhoto={onImage} />;
}

function ActionButton({ action, onImage }: { action: TopBarAction; onImage?: boolean }) {
  const t = useTokens();
  if (action.kind === 'node') return <>{action.node}</>;
  if (action.kind === 'text') return <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} style={styles.text}><Text variant="callout" tone={onImage ? 'paper' : 'ink'} numberOfLines={1}>{action.label}</Text></Press>;
  return <Press haptic="select" onPress={action.onPress} accessibilityLabel={action.label} style={[styles.icon, { backgroundColor: onImage ? palette.dark.surface : t.surface }]}>
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
  v26: { height: componentSize.topBarV26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter, gap: space.xs },
  v26Id: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flex: 1, minWidth: 0 },
  v26Txt: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: componentSize.round },
  v26Handle: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: space.xs },
});
