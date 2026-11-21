/**
 * Search (Edem, 21 Nov 2026): the field sits at the bottom, just above the keyboard, and rises with it,
 * the way the Claude app's composer does. On a phone the keyboard drives it frame by frame; on the web
 * preview, where there's often no on-screen keyboard, it rises from the bottom edge on the same calm spring.
 * Results sit above it, nearest the thumb last. Everything else stays as it was on Today.
 */
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Press, PhotoFill, RoundButton, Text, cardShadow, componentSize, fonts, motion, photoScrims, photos, radius, space, type, useCalmMotion, useTokens } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { money, seed } from '@/state/seed';
import { councilTax } from '@/state/today';
import { Btn, Micro } from './kit';

const CLOSE = { duration: 200, easing: Easing.out(Easing.cubic) } as const;

/** How far the keyboard covers the screen, as a value the UI thread can follow every frame. */
function useNativeKeyboard(): SharedValue<number> {
  // Reanimated's own tracker: in step with the keyboard on iOS and Android. Swap for react-native-keyboard-controller
  // (KeyboardStickyView) when that package joins the app.
  return useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true, isNavigationBarTranslucentAndroid: true }).height;
}
/** Phone browsers shrink the visual viewport for the keyboard; follow it so the field stays just above. */
function useWebKeyboard(): SharedValue<number> {
  const height = useSharedValue(0);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const follow = () => { height.value = withTiming(Math.max(0, window.innerHeight - vv.height - vv.offsetTop), { duration: 250, easing: Easing.out(Easing.cubic) }); };
    vv.addEventListener('resize', follow); vv.addEventListener('scroll', follow); follow();
    return () => { vv.removeEventListener('resize', follow); vv.removeEventListener('scroll', follow); };
  }, [height]);
  return height;
}
const useKeyboardHeight = Platform.OS === 'web' ? useWebKeyboard : useNativeKeyboard;

/** Search over the page. The page stays behind while the canvas fades in; nothing slides sideways. */
export function SearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}><SearchV26 onClose={onClose} /></SafeAreaProvider>
    </Modal>
  );
}

export function SearchV26({ onClose }: { onClose: () => void }) {
  const t = useTokens(), nav = useNavigation(), { update } = useSeed(), insets = useSafeAreaInsets(), calm = useCalmMotion();
  const [query, setQuery] = useState('');
  const keyboard = useKeyboardHeight();
  const shown = useSharedValue(0);
  useEffect(() => { shown.value = calm ? withTiming(1, { duration: 150 }) : withSpring(1, motion.smooth); }, [calm, shown]);
  const close = () => { Keyboard.dismiss(); shown.value = withTiming(0, CLOSE); setTimeout(onClose, CLOSE.duration); };
  const go = (fn: () => void) => { Keyboard.dismiss(); onClose(); fn(); };
  const areas: { n: string; p: keyof typeof photos; to: ScreenKey }[] = [{ n: 'Home', p: 'home', to: 'areahome' }, { n: 'Work', p: 'work', to: 'areawork' }, { n: 'Body', p: 'run', to: 'body' }, { n: 'People', p: 'people', to: 'people' }, { n: 'Learn', p: 'bench', to: 'library' }];
  const asked: { icon: 'doc' | 'home' | 'moon' | 'wallet' | 'gift' | 'folder' | 'food'; t: string; to: ScreenKey }[] = [{ icon: 'doc', t: 'tax code', to: 'taxcheck' }, { icon: 'home', t: 'council tax', to: 'bill' }, { icon: 'moon', t: 'sleep', to: 'sleep' }, { icon: 'wallet', t: 'rent', to: 'budget' }, { icon: 'gift', t: 'Kofi’s birthday', to: 'person' }, { icon: 'folder', t: 'passport', to: 'vault' }, { icon: 'food', t: 'lunch', to: 'fuel' }];
  const found = [
    { k: 'ct', title: 'Council tax', sub: `Money · ${money(councilTax.amount)} · due in ${councilTax.days} days`, date: { day: '01', month: 'Dec' }, to: 'bill' as ScreenKey },
    { k: 'letter', title: 'Council tax letter', sub: 'Scan · yesterday', icon: 'camera' as const, to: 'scan' as ScreenKey },
    { k: 'code', title: `Tax code ${seed.finance ? '1257L' : ''}`, sub: 'Money · from your payslip', icon: 'doc' as const, to: 'taxcheck' as ScreenKey },
    { k: 'disc', title: 'Council tax discount', sub: 'Single person · 25% off', icon: 'home' as const, to: 'mission' as ScreenKey, mission: 'uk-single-person-council' },
  ].filter(r => !query || `${r.title} ${r.sub}`.toLowerCase().includes(query.toLowerCase()));
  const veil = useAnimatedStyle(() => ({ opacity: Math.min(1, shown.value * 1.4) }));
  const list = useAnimatedStyle(() => ({ opacity: shown.value, transform: [{ translateY: (1 - shown.value) * (calm ? 0 : 12) }] }));
  const dock = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.value, insets.bottom) + space.xs,
    opacity: Math.min(1, shown.value * 1.6),
    transform: [{ translateY: (1 - shown.value) * (calm ? 0 : 96) }],
  }));
  return (
    <View style={{ flex: 1 }}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.canvas }, veil]} />
      <Animated.View style={[{ flex: 1, minHeight: 0, paddingTop: insets.top }, list]}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.md, paddingBottom: space.lg }}>
        {query ? null : <>
          <Micro style={{ marginTop: space.xs }}>YOUR AREAS</Micro>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter, marginTop: space.sm }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.tile, paddingBottom: space.xxs }}>
            {areas.map(a => (
              <Press key={a.n} haptic="open" onPress={() => go(() => nav.go(a.to))} accessibilityLabel={a.n} style={[styles.ptile, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
                <PhotoFill source={photos[a.p]} />
                <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
                <Text variant="buttonCompact" tone="paper" style={{ padding: space.tile }}>{a.n}</Text>
              </Press>
            ))}
          </ScrollView>
          <Micro style={{ marginTop: space.xxl }}>ASKED MOST</Micro>
          <View style={[styles.wrap, { marginTop: space.sm }]}>
            {asked.map(a => (
              <Press key={a.t} haptic="select" onPress={() => go(() => nav.go(a.to))} accessibilityLabel={a.t} style={[styles.askChip, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                <Icon name={a.icon} size={componentSize.iconXs} color={t.ink} /><Text variant="buttonCompact">{a.t}</Text>
              </Press>
            ))}
          </View>
        </>}
        <Micro style={{ marginTop: query ? space.xs : space.xxl }}>{query ? 'FOUND' : 'FROM YOUR LIFE'}</Micro>
        <View style={{ marginTop: space.sm, gap: space.xs }}>
          {found.map(r => (
            <Press key={r.k} haptic="open" onPress={() => go(() => { if (r.mission) update(c => ({ ...c, selectedMission: r.mission! })); nav.go(r.to); })} accessibilityLabel={`${r.title}, ${r.sub}`} style={[styles.found, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
              {r.date ? <View style={[styles.datebox, { backgroundColor: t.surface2 }]}><Text variant="title" style={{ lineHeight: 18 }}>{r.date.day}</Text><Text variant="micro" tone="ink2">{r.date.month.toUpperCase()}</Text></View>
                : <View style={[styles.iconWell, { backgroundColor: t.surface2 }]}><Icon name={r.icon!} size={componentSize.iconSm} color={t.ink} /></View>}
              <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{r.title}</Text><Text variant="callout" tone="ink2">{r.sub}</Text></View>
            </Press>
          ))}
        </View>
        <Btn label={query ? `Ask Life: “${query}”` : 'Ask Life a question'} ghost onPress={() => go(() => nav.go('chat', { question: query }))} style={{ marginTop: space.lg }} />
        </ScrollView>
      </Animated.View>
      <Animated.View style={[styles.dock, dock]}>
        <LinearGradient pointerEvents="none" colors={[t.canvas + '00', t.canvas]} style={styles.fade} />
        <View style={[styles.dockRow, { backgroundColor: t.canvas }]}>
          <View style={[styles.field, { backgroundColor: t.surface2 }]}>
            <Icon name="search" size={componentSize.iconSm} color={t.ink2} />
            <TextInput maxFontSizeMultiplier={1.3} autoFocus value={query} onChangeText={setQuery} placeholder="Search your life" placeholderTextColor={t.ink2} accessibilityLabel="Search everything" returnKeyType="search"
              onSubmitEditing={() => go(() => nav.go('chat', { question: query }))} selectionColor={t.ember}
              style={[styles.input, { color: t.ink, fontFamily: fonts.sansMedium }]} />
          </View>
          <RoundButton icon="close" label="Close search" onPress={close} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { paddingHorizontal: space.gutter },
  fade: { position: 'absolute', left: 0, right: 0, top: -space.lg, height: space.lg },
  dockRow: { flexDirection: 'row', alignItems: 'center', gap: space.tile, paddingTop: space.xs },
  field: { flex: 1, minWidth: 0, height: 48, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingLeft: space.md, paddingRight: space.sm },
  input: { flex: 1, minWidth: 0, ...type.body, paddingVertical: 0, outlineStyle: 'none' } as never,
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  ptile: { width: 112, height: 150, borderRadius: radius.tile, overflow: 'hidden', justifyContent: 'flex-end' },
  askChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: space.tile, paddingRight: 14, borderRadius: radius.full },
  found: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg },
  datebox: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconWell: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
