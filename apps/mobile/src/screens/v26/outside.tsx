/**
 * Life outside the app, and the orb pages, restyled to the V26 board (`states-outside.js`, `first-open.js`).
 * The outside surfaces (widgets, Live Activity, watch, Lock Screen, Android widgets, Siri) are drawn previews of the
 * native targets Phase 29 builds; they open from the design gallery in development builds. The share card is a real
 * sheet (Weekly recap → Share).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Share, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Icon, LifeOrb, PhotoFill, Press, RoundButton, SegmentedV26, StatusPill, Text, TopBar, TwoTone, areaColors, cardShadow, componentSize, feedback,
  floatLift, photo, photoScrims, photos, radius, space, useAreaTint, useCalmMotion, useTokens, type Area, type GlyphName, type OrbState,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { money, seed, seedTaxClaim } from '@/state/seed';
import { councilTax } from '@/state/today';
import { platform } from '@/services/platform';
import { isoWeek, shareWeek } from '@/state/firstopen';
import { PhotoStatus } from './firstopen';
import { Between, Body, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, Statement, two } from './kit';

const lockDate = (d = new Date()) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
const shortDay = (d = new Date()) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
const PREVIEW_TIME = '9:41';

/* ───────────────────────── Shared pieces ───────────────────────── */

/** A percentage as a ring of the orb's dots (board `ring()`). On a dark face the dots are paper on photo fill. */
function DotRing({ pct, size, n, night, accent, children }: { pct: number; size: number; n: number; night?: boolean; accent?: string; children?: ReactNode }) {
  const t = useTokens();
  const d = Math.max(4, Math.round(size / 12)), R = size / 2 - d / 2, on = Math.round((pct / 100) * n);
  const onColor = night ? photo.onPhoto : accent ?? t.ink, offColor = night ? photo.fill : t.surface3;
  return (
    <View accessible accessibilityLabel={`${pct} out of 100`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: n }, (_, k) => {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2;
        return <View key={k} style={{ position: 'absolute', left: size / 2 + Math.cos(a) * R - d / 2, top: size / 2 + Math.sin(a) * R - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: k < on ? onColor : offColor }} />;
      })}
      {children}
    </View>
  );
}

/** Steps of a task as three small dots: done in ink, now in ember (board `.so-steps`). */
function Steps({ states, night }: { states: ('on' | 'now' | '')[]; night?: boolean }) {
  const t = useTokens();
  return (
    <View style={styles.steps}>
      {states.map((s, i) => <View key={i} style={[styles.step, { backgroundColor: s === 'now' ? t.ember : s === 'on' ? (night ? photo.onPhoto : t.ink) : night ? photo.fill : t.surface3 }]} />)}
    </View>
  );
}

/** A 6pt dot in an area's colour (board `areaDot`). */
function AreaDot({ area }: { area: Area }) {
  const t = useTokens();
  return <View style={[styles.areaDot, { backgroundColor: areaColors[t.scheme][area] }]} />;
}

/** The widget surface (board `.so-w`): white, rounded 26, the float shadow. */
function Widget({ children, area, style, onPress, label }: { children: ReactNode; area?: Area; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string }) {
  const t = useTokens(), tint = useAreaTint(area ?? 'money');
  const box: StyleProp<ViewStyle> = [styles.widget, { backgroundColor: t.surface, ...floatLift(t.scheme) }, style];
  const inner = <>{area ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: StyleSheet.flatten(style)?.borderRadius ?? 26, backgroundColor: tint.tint }]} /> : null}{children}</>;
  return onPress ? <Press haptic="select" onPress={onPress} accessibilityLabel={label} style={box}>{inner}</Press> : <View style={box}>{inner}</View>;
}

/** The phone's wallpaper: a photograph edge to edge, with or without the soft fade. */
function Wallpaper({ source, focal, fade = true }: { source: number; focal?: { x?: number; y?: number }; fade?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <PhotoFill source={source} focal={focal} />
      {fade ? <LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /> : null}
    </View>
  );
}

/** The Lock Screen's date and time, centred (board `lockHead`). */
function LockHead() {
  return (
    <View style={{ alignItems: 'center', paddingTop: 28 }}>
      <Text variant="title" style={{ color: photo.onPhoto }}>{lockDate()}</Text>
      <Text variant="numeralXl" style={{ color: photo.onPhoto, marginTop: 2 }}>{PREVIEW_TIME}</Text>
    </View>
  );
}

/** The torch and camera on the Lock Screen, and the home indicator (board `lockFoot`). */
function LockFoot() {
  return <>
    <View style={styles.lockFoot}>
      {(['bulb', 'camera'] as GlyphName[]).map(i => <View key={i} style={styles.lockRound}><Icon name={i} size={componentSize.iconSm} color={photo.onPhoto} /></View>)}
    </View>
    <View style={styles.homeInd} />
  </>;
}

/** A full-bleed outside surface: the photograph, the light status bar, the safe area. */
function Surface({ id, children, wall }: { id: string; children: ReactNode; wall: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View nativeID={`screen-${id}`} style={{ flex: 1, backgroundColor: photo.ink }}>
      <PhotoStatus />
      {wall}
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom - 12, 0) }}>{children}</View>
    </View>
  );
}

/* ───────────────────────── iOS: Home Screen widgets, and the Live Activity ───────────────────────── */

export function WidgetsV26({ lock: startLock = false }: { lock?: boolean }) {
  const t = useTokens(), w = platform.widget();
  const [lock, setLock] = useState(startLock);
  const steps: ('on' | 'now' | '')[] = Array.from({ length: w.steps }, (_, k) => (k < w.step - 1 ? 'on' : k === w.step - 1 ? 'now' : ''));
  const refund = `est. ${money(seedTaxClaim.refund)}`, kit = `Add ${money(seedTaxClaim.workExpenses)} of software and kit`;
  if (lock) return (
    <Surface id="widgets" wall={<Wallpaper source={photos.calmdesk} />}>
      <LockHead />
      <View style={{ flex: 1 }} />
      <Widget style={{ marginHorizontal: 12, marginBottom: space.md, paddingTop: space.md, paddingHorizontal: 18, paddingBottom: 18 }} onPress={() => setLock(false)} label="Live Activity. Back to the Home Screen">
        <Between><View style={styles.inline}><LifeOrb size={20} state="working" /><Text variant="micro" tone="ink2">HMRC rebate</Text></View><Chip label={`${refund} back`} /></Between>
        <Text variant="headline" style={{ marginTop: space.sm }}>{kit}</Text>
        <Between style={{ marginTop: 10 }}><Text variant="callout" tone="ink2">{`Step ${w.step} of ${w.steps}`}</Text><Steps states={steps} /></Between>
      </Widget>
      <LockFoot />
    </Surface>
  );
  return (
    <Surface id="widgets" wall={<Wallpaper source={photos.calmdesk} />}>
      <Press haptic="select" onPress={() => setLock(true)} accessibilityLabel="Live Activity: HMRC rebate. Show it on the Lock Screen" style={[styles.island, { backgroundColor: photo.ink }]}>
        <Between>
          <View style={styles.inline}><LifeOrb size={22} state="working" color={photo.onPhoto} /><Text variant="buttonCompact" style={{ color: photo.onPhoto }}>HMRC rebate</Text></View>
          <Text variant="buttonCompact" style={{ color: photo.onPhoto }}>{refund}</Text>
        </Between>
        <Text variant="title" style={{ color: photo.onPhoto, marginTop: 10 }}>{kit}</Text>
        <Between style={{ marginTop: space.xs }}><Text variant="callout" style={{ color: photo.onPhoto2 }}>{`Step ${w.step} of ${w.steps}`}</Text><Steps states={steps} night /></Between>
      </Press>
      <View style={{ flex: 1, minHeight: 0, gap: space.sm, paddingTop: 136, paddingHorizontal: space.gutter }}>
        <Widget style={{ height: 159 }}>
          <Between><View style={styles.inline}><LifeOrb size={18} /><Text variant="micro" tone="ink2">Today’s move</Text></View><Chip label={`${refund} back`} /></Between>
          <View style={{ flex: 1 }} />
          <Text variant="titleSerif" numberOfLines={1}>{w.move}</Text>
          <Between style={{ marginTop: 6 }}>
            <View style={styles.inline}><Icon name="clock" size={componentSize.iconXs} color={t.ink2} /><Text variant="callout" tone="ink2">Takes 6 min</Text></View>
            <RoundButton icon="arrow" size="sm" solid label="Open today’s move" />
          </Between>
        </Widget>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Widget area="health" style={{ flex: 1, height: 159 }}>
            <View style={styles.inline}><AreaDot area="health" /><Text variant="micro" tone="ink2">Readiness</Text></View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><DotRing pct={w.readiness} size={96} n={20} accent={areaColors[t.scheme].health}><Text variant="numeralL">{w.readiness}</Text></DotRing></View>
          </Widget>
          <Widget area="work" style={{ flex: 1, height: 159 }}>
            <View style={styles.inline}><AreaDot area="work" /><Text variant="micro" tone="ink2">Sleep</Text></View>
            <Text variant="headline" style={{ marginTop: 2 }}>{w.sleep}</Text>
            <View style={{ flex: 1 }} />
            <View style={styles.inline}><AreaDot area="home" /><Text variant="micro" tone="ink2">Fuel</Text><Text variant="micro" tone="quiet" style={{ marginLeft: 'auto' }}>{`/${seed.fuel.kcal.toLocaleString('en-GB')} kcal`}</Text></View>
            <Text variant="headline" style={{ marginTop: 2 }}>{w.fuel.toLocaleString('en-GB')}</Text>
            <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: `${Math.min(100, (w.fuel / seed.fuel.kcal) * 100)}%`, height: '100%', borderRadius: radius.full, backgroundColor: t.ink }} /></View>
          </Widget>
        </View>
        <View style={[styles.apps, { marginTop: 10 }]}>
          <View style={[styles.icon, { backgroundColor: photo.ink }]}><LifeOrb size={30} color={photo.onPhoto} /></View>
          {[1, 2, 3].map(i => <View key={i} style={[styles.icon, { backgroundColor: photo.fill }]} />)}
        </View>
      </View>
      <View style={styles.pages}><View style={[styles.page, { backgroundColor: photo.onPhoto }]} /><View style={[styles.page, { backgroundColor: photo.fill }]} /></View>
      <View style={[styles.dockBar, { backgroundColor: photo.fill }]}>{[0, 1, 2, 3].map(i => <View key={i} style={[styles.icon, { backgroundColor: photo.fill }]} />)}</View>
    </Surface>
  );
}

/* ───────────────────────── Weekly recap, shared (a real sheet) ───────────────────────── */

export function ShareCardV26() {
  const t = useTokens(), { data, choose } = useSeed();
  const hidden = data.choices['share-hide-numbers'] === '1';
  const nights = shareWeek.nights.split('').map(b => b === '1');
  const sentence = hidden
    ? 'I cleared {missions}, slept {well} most nights and kept {my habits}.'
    : `I cleared {${shareWeek.missions} missions}, slept {7h+} ${nights.filter(Boolean).length} nights and kept {${shareWeek.habits} habits}.`;
  const plain = sentence.replace(/[{}]/g, '');
  const share = () => { feedback.primary(); void Share.share({ message: `${plain} Made with Life.` }); };
  return (
    <Page screen="sharecard" bar={{ kind: 'sheet', title: 'Share your week' }}
      footer={<View style={styles.footRow}>
        <Btn label={hidden ? 'Show numbers' : 'Hide numbers'} ghost fit onPress={() => choose('share-hide-numbers', hidden ? '' : '1')} />
        <View style={{ flex: 1 }}><Btn label="Share" icon="arrowUp" onPress={share} /></View>
      </View>}>
      <View style={[styles.share, { backgroundColor: t.surface2, ...floatLift(t.scheme) }]}>
        <PhotoFill source={photos.sky} focal={{ y: 1 }} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <Between>
          <StatusPill size="chip" onPhoto label={`Week ${isoWeek()}`} />
          {hidden ? null : <View style={styles.week} accessible accessibilityLabel={`Slept 7 hours or more on ${nights.filter(Boolean).length} of 7 nights`}>{nights.map((on, i) => <View key={i} style={[styles.night, { backgroundColor: on ? photo.onPhoto : photo.fill }]} />)}</View>}
        </Between>
        <Text variant="titleSerif" style={{ marginTop: 14, color: photo.onPhoto2 }} accessibilityLabel={plain}>
          {two(sentence).map((s, i) => <Text key={i} variant="titleSerif" style={{ color: s.tone === 'quiet' ? photo.onPhoto2 : photo.onPhoto }}>{s.text}</Text>)}
        </Text>
        <View style={[styles.made, { backgroundColor: photo.onPhoto }]}><LifeOrb size={18} color={photo.ink} /><Text variant="micro" style={{ color: photo.ink }}>Made with Life</Text></View>
      </View>
      <Callout center style={{ marginTop: space.sm }}>Nothing personal on the card. No £ amounts unless you choose.</Callout>
    </Page>
  );
}

/* ───────────────────────── Watch companion ───────────────────────── */

export function WatchV26({ done: startDone = false }: { done?: boolean }) {
  const t = useTokens(), insets = useSafeAreaInsets(), w = platform.widget();
  const [done, setDone] = useState(startDone);
  const health = useAreaTint('health');
  const comp = (inner: ReactNode, label: string, tinted?: boolean) => (
    <View style={styles.comp}>
      <View style={[styles.disc, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>{tinted ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 32, backgroundColor: health.tint }]} /> : null}{inner}</View>
      <Text variant="callout" tone="ink2" align="center">{label}</Text>
    </View>
  );
  return (
    <View nativeID="screen-watch" style={{ flex: 1, backgroundColor: t.canvas, paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.gutter }}>
      <Eyebrow>Apple Watch · Wear OS</Eyebrow>
      <View style={[styles.wrist, { marginTop: space.md }]}>
        <View style={[styles.strap, { top: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: t.inkQuiet }]} />
        <View style={[styles.strap, { bottom: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, backgroundColor: t.inkQuiet }]} />
        <View style={[styles.case, { backgroundColor: t.surface3, ...floatLift(t.scheme) }]}>
          <View style={[styles.crown, { backgroundColor: t.surface3 }]} />
          <View style={[styles.side, { backgroundColor: t.surface3 }]} />
          <View style={[styles.face, { backgroundColor: photo.ink }]}>
            <Between>
              <View style={[styles.inline, { gap: 6 }]}><LifeOrb size={20} state={done ? 'done' : 'ring'} color={photo.onPhoto} /><Text variant="buttonCompact" style={{ color: photo.onPhoto }}>Life</Text></View>
              <Text variant="buttonCompact" style={{ color: photo.onPhoto, fontVariant: ['tabular-nums'] }}>{PREVIEW_TIME}</Text>
            </Between>
            <Micro sig={!done} onPhoto style={{ marginTop: 14 }}>Today’s move</Micro>
            <Text variant="headline" style={{ color: photo.onPhoto, marginTop: 4 }} numberOfLines={2}>{w.move}</Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.inline, { gap: 10 }]}>
              <DotRing pct={w.readiness} size={40} n={12} night><Text variant="micro" style={{ color: photo.onPhoto }}>{w.readiness}</Text></DotRing>
              <Text variant="buttonCompact" style={{ color: photo.onPhoto }}>Readiness</Text>
            </View>
            <Press haptic={done ? 'select' : 'file'} onPress={() => setDone(!done)} accessibilityLabel={done ? 'Marked as done. Undo' : 'Done'} style={[styles.watchDone, { backgroundColor: done ? photo.fill : photo.onPhoto }]}>
              <Icon name="check" size={componentSize.iconSm} color={done ? photo.onPhoto : photo.ink} />
              <Text variant="button" style={{ color: done ? photo.onPhoto : photo.ink }}>{done ? 'Marked as done' : 'Done'}</Text>
            </Press>
          </View>
        </View>
      </View>
      <View style={[styles.comps, { marginTop: space.lg }]}>
        {comp(<DotRing pct={74} size={48} n={12} accent={areaColors[t.scheme].health}><Text variant="micro">{w.readiness}</Text></DotRing>, `Readiness ${w.readiness}`, true)}
        {comp(<Steps states={['on', 'on', done ? 'on' : '']} />, done ? '3 of 3 done' : '2 of 3 done')}
        {comp(<LifeOrb size={30} />, 'Breathe')}
      </View>
      <Callout center style={{ marginTop: space.lg }}>Never more than one nudge an hour on the wrist.</Callout>
    </View>
  );
}

/* ───────────────────────── Notifications, on the Lock Screen ───────────────────────── */

function Note({ title, when, text, source, focal, children }: { title: string; when: string; text: string; source: number; focal?: { x?: number; y?: number }; children?: ReactNode }) {
  const t = useTokens();
  return (
    <View accessible accessibilityLabel={`Life, ${when}. ${title}. ${text}`} style={[styles.note, { backgroundColor: t.surface, ...floatLift(t.scheme) }]}>
      <View style={[styles.mark, { backgroundColor: photo.ink }]}><LifeOrb size={22} color={photo.onPhoto} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={[styles.inline, { justifyContent: 'space-between', alignItems: 'baseline' }]}><Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>{title}</Text><Text variant="callout" tone="ink2">{when}</Text></View>
        <View style={[styles.inline, { alignItems: 'flex-start', gap: 10, marginTop: 2 }]}>
          <Text variant="callout" style={{ flex: 1 }}>{text}</Text>
          <View style={styles.noteThumb}><PhotoFill source={source} focal={focal} /></View>
        </View>
        {children}
      </View>
    </View>
  );
}

export function LockPushV26() {
  const nav = useNavigation();
  return (
    <Surface id="lockpush" wall={<Wallpaper source={photos.calm} focal={{ x: 0.73, y: 1 }} />}>
      <LockHead />
      <View style={{ flex: 1 }} />
      <View style={{ gap: space.xs, paddingHorizontal: 12, paddingBottom: space.md }}>
        <Note title={`You’re likely owed ${money(seedTaxClaim.refund)}`} when="now" text="A tax rebate is waiting. One form, about 6 minutes." source={photos.payslip} focal={{ y: 0.82 }}>
          <Btn label="Start the claim" ghost sm onPress={() => nav.go('taxcheck')} style={{ marginTop: space.sm }} />
        </Note>
        <Text variant="micro" style={{ color: photo.onPhoto, paddingTop: space.xs, paddingHorizontal: space.xs }}>Earlier</Text>
        <Note title="20 free minutes" when="Yesterday" text="A short walk fits before 14:00." source={photos.walk} focal={{ y: 0.36 }} />
        <Note title="Council tax due 1 December" when="Sat" text={`${money(councilTax.amount)} · paid by Direct Debit, nothing to do.`} source={photos.letter} focal={{ y: 0.62 }} />
      </View>
      <LockFoot />
    </Surface>
  );
}

/* ───────────────────────── Android: Material You widgets ───────────────────────── */

export function AndroidWidgetV26() {
  const t = useTokens(), w = platform.widget();
  const [done, setDone] = useState(false), [shown, setShown] = useState(false);
  const cp = seed.finance.cashplan, left = cp.comingIn - cp.essentialBills - cp.taxSetAside;
  return (
    <Surface id="androidwidget" wall={<Wallpaper source={photos.sky} focal={{ x: 0.35, y: 0 }} fade={false} />}>
      <View style={{ flex: 1, minHeight: 0, paddingTop: space.lg, paddingHorizontal: space.gutter }}>
        <Text variant="titleSerif" style={{ color: photo.onPhoto }}>{shortDay()}</Text>
        <Widget style={{ marginTop: space.lg, borderRadius: 28, paddingVertical: 18, paddingLeft: space.gutter, paddingRight: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.inline}><LifeOrb size={18} /><Text variant="micro" tone="ink2">Life · today’s move</Text></View>
            <Text variant="headline" tone={done ? 'ink2' : 'ink'} style={{ marginTop: space.xs }}>{w.move}</Text>
          </View>
          <Press haptic={done ? 'select' : 'file'} onPress={() => setDone(!done)} accessibilityLabel={done ? 'Done. Undo' : 'Mark as done'} style={[styles.tick, { backgroundColor: done ? t.gainTint : t.ink }]}>
            <Icon name="check" size={componentSize.icon} color={done ? t.gain : t.canvas} />
            <Text variant="buttonCompact" style={{ color: done ? t.gain : t.canvas }}>Done</Text>
          </Press>
        </Widget>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
          <Widget area="health" style={{ flex: 1, aspectRatio: 1, borderRadius: 999, padding: 0, alignItems: 'center', justifyContent: 'center' }}>
            <DotRing pct={w.readiness} size={128} n={24} accent={areaColors[t.scheme].health}>
              <View style={{ alignItems: 'center' }}><Text variant="numeralL">{w.readiness}</Text><Text variant="micro" tone="ink2">Readiness</Text></View>
            </DotRing>
          </Widget>
          <Widget area="money" style={{ flex: 1, aspectRatio: 1, borderRadius: 28 }} onPress={() => setShown(!shown)} label={shown ? 'Hide the amount' : 'Show the amount'}>
            <View style={styles.inline}><AreaDot area="money" /><Text variant="micro" tone="ink2">Left to spend</Text></View>
            <View style={{ flex: 1 }} />
            <Text variant="numeralL">{shown ? money(left) : '£•••'}</Text>
            <View style={[styles.inline, { gap: 6, marginTop: 6 }]}><Icon name={shown ? 'eye' : 'eyeOff'} size={componentSize.iconXs} color={t.ink2} /><Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{shown ? 'Tap to hide' : 'Hidden. Tap to show'}</Text></View>
          </Widget>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.apps}>
          <View style={[styles.round56, { backgroundColor: photo.ink }]}><LifeOrb size={28} color={photo.onPhoto} /></View>
          {[1, 2, 3].map(i => <View key={i} style={[styles.round56, { backgroundColor: photo.fill }]} />)}
        </View>
        <View style={[styles.search, { backgroundColor: photo.fill }]}><Icon name="search" size={componentSize.iconSm} color={photo.onPhoto} /><Icon name="mic" size={componentSize.iconSm} color={photo.onPhoto} /></View>
      </View>
      <View style={styles.gesture} />
    </Surface>
  );
}

/* ───────────────────────── Siri and Shortcuts ───────────────────────── */

export function SiriV26() {
  const t = useTokens(), said = platform.shortcut('Tell Life the dentist is on Friday at 3');
  return (
    <Surface id="siri" wall={<Wallpaper source={photos.vantage} />}>
      <View style={{ flex: 1, minHeight: 0, paddingTop: 28, paddingHorizontal: space.gutter }}>
        <Eyebrow icon="mic" onPhoto>Hey Siri</Eyebrow>
        <Display onPhoto s="“Tell Life the {@calendar dentist} is on {Friday at 3}”" />
        <View style={{ flex: 1 }} />
        <Widget style={{ borderRadius: radius.xl, flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
          <LifeOrb size={28} state="done" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Between><Text variant="micro" tone="ink2">Life</Text><Chip label="Filed" icon="check" tone="done" /></Between>
            <Text variant="title" style={{ marginTop: 6 }}>{`Filed: ${said.proposed.label} · ${said.proposed.at}`}</Text>
            <View style={[styles.inline, { gap: 6, marginTop: 4 }]}><AreaDot area="health" /><Text variant="callout" tone="ink2" style={{ flexShrink: 1 }}>{`Added to ${said.proposed.area} · reminder Thursday evening`}</Text></View>
          </View>
        </Widget>
        <Micro onPhoto style={{ marginTop: 22 }}>ALSO WORKS</Micro>
        <View style={[styles.inline, { flexWrap: 'wrap', marginTop: 10 }]}>
          {['“What’s my move today?”', 'Log water', 'Start a check-in', 'Read my brief'].map(s => (
            <View key={s} style={[styles.say, { backgroundColor: photo.fill }]}><Text variant="buttonCompact" style={{ color: photo.onPhoto }}>{s}</Text></View>
          ))}
        </View>
      </View>
      <View style={[styles.homeInd, { marginTop: 22, backgroundColor: t.paper }]} />
    </Surface>
  );
}

/* ───────────────────────── The orb: six states ───────────────────────── */

const ORB_STATES: [OrbState, string, string, string][] = [
  ['ring', 'Ring', 'The everyday mark: tab bar, headers, small sizes.', 'Default'],
  ['thinking', 'Thinking', 'Only while Life is working something out.', 'Over 1s'],
  ['working', 'Working', 'While Life builds or files something in front of you.', ''],
  ['searching', 'Searching', 'While Life checks or looks something up.', ''],
  ['listening', 'Listening', 'While you talk. It moves with your voice.', 'A pulse'],
  ['done', 'Done', 'On finish. Dots gather in, then open back out.', '1s'],
];

export function OrbV26() {
  const t = useTokens();
  const rows = [ORB_STATES.slice(0, 2), ORB_STATES.slice(2, 4), ORB_STATES.slice(4, 6)];
  return (
    <Page screen="orb" bar={{ kind: 'push', title: 'The orb' }}>
      <Display s="{One ring of 10 dots.} Six states." flush style={{ marginTop: space.xxs }} />
      <View style={{ gap: space.tile, marginTop: space.md }}>
        {rows.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.tile }}>
            {r.map(([st, name, when, tag]) => (
              <View key={st} accessible accessibilityLabel={`${name}. ${when}`} style={[styles.orbTile, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                <Between style={{ alignItems: 'flex-start' }}><LifeOrb size={60} state={st} />{tag ? <Chip label={tag} tone="q" /> : null}</Between>
                <Text variant="title" style={{ marginTop: space.sm }}>{name}</Text>
                <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{when}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <Callout style={{ marginTop: space.sm }}>One lap every 12 seconds. With Reduce Motion, each state is shown still.</Callout>
    </Page>
  );
}

/* ───────────────────────── The top bar: decided by how the screen opened ───────────────────────── */

export function TopbarsV26() {
  const t = useTokens();
  const none = () => undefined;
  const spec = (kind: string, rule: string, bar: ReactNode) => <>
    <Between style={{ marginTop: space.md }}><Micro>{kind}</Micro><Text variant="micro" tone="quiet">{rule}</Text></Between>
    <View pointerEvents="none" style={[styles.spec, { backgroundColor: t.canvas, ...cardShadow(t.scheme) }]}>{bar}</View>
  </>;
  return (
    <Page screen="topbars" bar={{ kind: 'push', title: 'The top bar' }}>
      <Display s="One rule for the top: {how it opened.}" flush style={{ marginTop: space.xxs }} />
      {spec('ROOT · TODAY, PLAN, YOU', 'Two buttons at most', <TopBar look="v26" kind="root" title="Today" sub={shortDay()} actions={[{ kind: 'icon', icon: 'search', label: 'Search', onPress: none }, { kind: 'icon', icon: 'bell', label: 'From Life', badge: true, onPress: none }]} />)}
      {spec('PUSH', 'Back, title, one smart action or none', <TopBar look="v26" kind="push" title="Readiness" onBack={none} action={{ kind: 'icon', icon: 'info', label: 'How this is worked out', onPress: none }} />)}
      {spec('SHEET', 'A handle, a title, close', <TopBar look="v26" kind="sheet" title="Add something" onClose={none} />)}
      {spec('FULL-SCREEN FLOW', 'Back or close, and a step count', <TopBar look="v26" kind="flow" closeLabel="Back" step="2 of 3" onClose={none} />)}
      <Between style={{ marginTop: space.md }}><Micro>OVER A PHOTOGRAPH</Micro><Text variant="micro" tone="quiet">Same bar, on solid discs</Text></Between>
      <View pointerEvents="none" style={[styles.overPhoto, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
        <PhotoFill source={photos.terrace} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <TopBar look="v26" kind="push" title="Home" onBack={none} onImage action={{ kind: 'icon', icon: 'info', label: 'Why these show here', onPress: none }} />
      </View>
      <Callout style={{ marginTop: space.md }}>Never two bars. Never more than one action on a pushed screen. The bar never moves.</Callout>
    </Page>
  );
}

/* ───────────────────────── Orb states, next: watch the ring become each one ───────────────────────── */

const NEXT: { state: OrbState; name: string; how: string }[] = [
  { state: 'thinking', name: 'Thinking', how: 'Your dots form {a clear sphere}, turning, the near side brighter.' },
  { state: 'working', name: 'Working', how: 'Your circle {speeds up}; smaller rings of the same dots turn inside, like clockwork.' },
  { state: 'searching', name: 'Searching', how: 'Your dots spread over a sphere; {each hop draws a line} to the next, building a web of connections.' },
  { state: 'listening', name: 'Listening', how: 'Your ring {stops and pays attention}, moving out and in with your voice.' },
];

export function OrbnextV26() {
  const t = useTokens(), calm = useCalmMotion();
  const [k, setK] = useState('0');
  const [run, setRun] = useState(0);
  const n = NEXT[Number(k)];
  const [stage, setStage] = useState<OrbState>(calm ? n.state : 'ring');
  // Ring, then the state, then done, then back: on a loop. Still under Reduce Motion.
  useEffect(() => {
    if (calm) { setStage(n.state); return; }
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const loop = () => {
      if (!alive) return;
      setStage(n.state);
      timers.push(setTimeout(() => { if (alive) setStage('done'); }, 3800), setTimeout(() => { if (alive) { setStage('ring'); timers.push(setTimeout(loop, 800)); } }, 5800));
    };
    setStage('ring');
    timers.push(setTimeout(loop, 800));
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [n.state, calm, run]);
  return (
    <Page screen="orbnext" bar={{ kind: 'push', title: 'Orb states' }}>
      <Display s="{One family.} Same dots as your ring." flush style={{ marginTop: space.xxs }} />
      <SegmentedV26 options={NEXT.map((x, i) => ({ value: String(i), label: x.name }))} value={k} onChange={setK} style={{ marginTop: space.md }} />
      <Press haptic="select" onPress={() => setRun(r => r + 1)} accessibilityLabel="Play it again" style={styles.stage}>
        <LifeOrb size={120} state={stage} />
        <View style={[styles.inline, { gap: 4 }]}>
          <Text variant="micro" tone="ink2">Ring</Text><Icon name="arrow" size={14} color={t.ink2} /><Text variant="micro" tone="ink2">{n.name}</Text><Icon name="arrow" size={14} color={t.ink2} /><Text variant="micro" tone="ink2">Done</Text>
        </View>
      </Press>
      <Statement s={n.how} style={{ marginTop: space.xs }} />
      <View style={[styles.sizes, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Between><Micro>AT REAL SIZES</Micro><Text variant="micro" tone="quiet">22 · 36 · 56 · 88</Text></Between>
        <View style={[styles.inline, { justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space.sm, paddingHorizontal: 10 }]}>
          {[22, 36, 56, 88].map(z => <LifeOrb key={z} size={z} state={n.state} />)}
        </View>
      </View>
      <Body s="Every change is the dots travelling one after another, so any 3D state collapses straight back into your spinning circle." variant="callout" style={{ marginTop: space.sm }} />
    </Page>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  areaDot: { width: 6, height: 6, borderRadius: 3 },
  steps: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  step: { width: 8, height: 8, borderRadius: 4 },
  widget: { borderRadius: 26, padding: space.md, overflow: 'hidden' },
  meter: { height: 6, borderRadius: radius.full, overflow: 'hidden', marginTop: 6 },
  island: { position: 'absolute', zIndex: 5, top: 11, left: 12, right: 12, borderRadius: 38, paddingTop: 14, paddingHorizontal: space.gutter, paddingBottom: space.md },
  apps: { flexDirection: 'row', justifyContent: 'space-between' },
  icon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pages: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  page: { width: 6, height: 6, borderRadius: 3 },
  dockBar: { height: 88, marginHorizontal: 12, marginBottom: 12, paddingHorizontal: space.gutter, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockFoot: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 36, paddingBottom: 14 },
  lockRound: { width: 50, height: 50, borderRadius: 25, backgroundColor: photo.fill, alignItems: 'center', justifyContent: 'center' },
  homeInd: { width: 134, height: 5, borderRadius: 3, backgroundColor: photo.onPhoto, alignSelf: 'center', marginBottom: 9 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  share: { height: 470, padding: space.gutter, borderRadius: 28, overflow: 'hidden' },
  week: { flexDirection: 'row', gap: 5 },
  night: { width: 10, height: 10, borderRadius: 5 },
  made: { position: 'absolute', left: space.md, bottom: space.md, flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingLeft: 6, paddingRight: 12, borderRadius: radius.full },
  wrist: { width: 236, paddingVertical: 44 },
  strap: { position: 'absolute', left: 40, right: 40, height: 72 },
  case: { width: 236, height: 284, padding: 12, borderRadius: 64 },
  crown: { position: 'absolute', right: -6, top: 82, width: 9, height: 38, borderRadius: 4 },
  side: { position: 'absolute', right: -3, top: 142, width: 5, height: 58, borderRadius: 3 },
  face: { flex: 1, borderRadius: 52, paddingTop: 18, paddingHorizontal: 18, paddingBottom: space.md },
  watchDone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, marginTop: 10, borderRadius: 22 },
  comps: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  comp: { width: 96, alignItems: 'center', gap: space.xs },
  disc: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: 14, borderRadius: radius.xl },
  mark: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noteThumb: { width: 40, height: 40, borderRadius: 10, overflow: 'hidden' },
  tick: { width: 72, height: 72, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', gap: 2 },
  round56: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, marginTop: 18, paddingHorizontal: 18, borderRadius: 26 },
  gesture: { width: 108, height: 4, borderRadius: 2, backgroundColor: photo.onPhoto, alignSelf: 'center', marginTop: 14, marginBottom: 10 },
  say: { height: 32, paddingHorizontal: 12, borderRadius: radius.full, justifyContent: 'center' },
  orbTile: { flex: 1, minWidth: 0, borderRadius: radius.lg, padding: space.cardPad },
  spec: { marginTop: space.xs, paddingVertical: 4, borderRadius: radius.lg, overflow: 'hidden' },
  overPhoto: { height: 84, marginTop: space.xs, paddingTop: 6, borderRadius: 20, overflow: 'hidden' },
  stage: { minHeight: 148, alignItems: 'center', justifyContent: 'center', gap: space.sm, marginTop: space.sm, paddingVertical: space.sm },
  sizes: { marginTop: space.md, padding: space.md, borderRadius: radius.lg },
});
