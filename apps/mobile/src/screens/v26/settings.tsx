/**
 * Settings and life Plus, restyled to the V26 board (`settings-people.js`, `core.js` plus). Settings stay calm and
 * typographic: one sentence that says how life is set right now, then groups that open one at a time. Board-only
 * words and figures live in `state/settings.ts`; every switch saves to the same preferences and flags as before.
 */
import React, { useEffect, useState, type ReactNode } from 'react';
import { Alert, Appearance, Platform, Share, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import {
  AccordionGroup, DotGrid, Field, Icon, InitialsAvatar, LifeOrb, LifeSays, PhotoCard, PhotoFill, Press, SectionHead, SegmentedV26, SwitchV26, Text, TileGrid,
  V26Tile, cardShadow, componentSize, feedback, photo, photos, radius, space, useTokens, type DotCell, type GlyphName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { money } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { ai } from '@/services/ai';
import { voice } from '@/services/voice';
import { faces } from '@/state/people';
import { workTitle } from '@/state/you';
import {
  aiScopes, cloudJobs, connections, helpAnswers, modelParts, notifGroups, nudgeWindow, onPhoneMB, openSource, phoneJobs, plusOpens, plusPrice, quietHours,
} from '@/state/settings';
import { Between, Body, Btn, Callout, Chip, Display, Eyebrow, Figure, Micro, Page, QuietLink, Row, RowsCard, Statement } from './kit';
import { OnPhotoRound } from './learn';
import { RoundPhoto } from './you';
import { Composer } from './talk';

/* ───────────────────────── Shared pieces ───────────────────────── */

const n = (v: number) => Math.round(v).toLocaleString('en-GB');
const hh = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;

/** Whether life Plus is on: the sample account is a member; a real account is once it subscribes. */
function usePlus() {
  const { data } = useSeed();
  return (SHOW_SAMPLES || !!data.flags['plus-preview']) && !data.flags['plus-cancelled'];
}

/** Your data as one file through the phone's share sheet. */
function useExport() {
  const { exportEverything } = useSeed();
  return async () => {
    try { await Share.share({ title: 'Your life data', message: JSON.stringify(await exportEverything(), null, 2) }); }
    catch { Alert.alert('Couldn’t export your data', 'Your data has not changed. Please try again.'); }
  };
}

/** What this phone can run itself (checked, never assumed). The web preview shows the board's phone with samples on. */
function useCapabilities(on: boolean) {
  const [caps, setCaps] = useState<{ model: boolean; speech: boolean; speaker: boolean; reason?: string; cloud: boolean } | null>(null);
  useEffect(() => {
    if (!on) return;
    let live = true;
    void Promise.all([ai.capabilities(), voice.capabilities()])
      .then(([models, speech]) => { if (live) setCaps({ model: models.some(m => m.location === 'device' && m.id !== 'life-rules' && m.available), speech: speech.speechAvailable, speaker: speech.speakerAvailable, reason: speech.reason, cloud: models.some(m => m.location === 'cloud' && m.available) }); })
      .catch(() => { if (live) setCaps({ model: false, speech: false, speaker: false, cloud: false }); });
    return () => { live = false; };
  }, [on]);
  const builtIn = !!caps?.model || (Platform.OS === 'web' && SHOW_SAMPLES);
  return { caps, builtIn };
}

const releaseLabel = `Version ${Constants.expoConfig?.version ?? '1.0'}${Constants.nativeBuildVersion ? ` (${Constants.nativeBuildVersion})` : ''}`;

/** A row that ends in a switch (board `swRow`). */
function SwitchRow({ icon, title, sub, value, onChange }: { icon?: GlyphName; title: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return <Row icon={icon} title={title} sub={sub} right={<SwitchV26 value={value} onChange={onChange} accessibilityLabel={title} />} style={sub ? null : { minHeight: 56 }} />;
}

/** The white card that holds one choice and its switch (board `card pad16 between`). */
function SwitchCard({ title, sub, value, onChange, style }: { title: string; sub?: string; value: boolean; onChange: (v: boolean) => void; style?: object }) {
  const t = useTokens();
  return (
    <View style={[styles.switchCard, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="title">{title}</Text>
        {sub ? <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{sub}</Text> : null}
      </View>
      <SwitchV26 value={value} onChange={onChange} accessibilityLabel={title} />
    </View>
  );
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  const t = useTokens();
  return <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>{children}</View>;
}

/** Your nudges, connections and switches in words, shared by the hub and its rows. */
function useSettingsWords() {
  const { data } = useSeed();
  const nudges = Number(data.choices.nudges ?? '1');
  const live = SHOW_SAMPLES ? connections.filter(c => !(c.to === 'yourai' && data.flags['mcp-revoked'])) : [];
  const appearance = data.choices.appearance ?? (data.prefs.dark ? 'Dark' : 'Light');
  return { nudges, live, appearance };
}

/* ───────────────────────── Settings: the hub ───────────────────────── */

export function SettingsV26() {
  const t = useTokens(), nav = useNavigation(), { data, pref } = useSeed(), plus = usePlus(), exportData = useExport();
  const { nudges, live, appearance } = useSettingsWords();
  const p = data.prefs, mcp = live.some(c => c.to === 'yourai');
  const sentence = `life sends {@bell ${nudges} nudge${nudges === 1 ? '' : 's'} a day}, has {@swap ${live.length ? `${live.length} connection${live.length === 1 ? '' : 's'}` : 'no connections'}} on and sells {@shield nothing}.`;
  const face = faces.ama;
  const lineOf = [workTitle, data.profile.city].filter(Boolean).join(' · ');
  return (
    <Page screen="settings" bar={{ kind: 'push', title: 'Settings' }}>
      <Press haptic="open" onPress={() => nav.go('profile')} accessibilityLabel="Your details" pressScale={0.99} style={[styles.me, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        {SHOW_SAMPLES ? <RoundPhoto source={photos[face.photo]} focal={face.focal} size={72} /> : <InitialsAvatar initials={(data.profile.name || 'Y').slice(0, 1).toUpperCase()} lg />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="headline" numberOfLines={1}>{data.profile.name || 'You'}</Text>
          {lineOf ? <Text variant="callout" tone="ink2" numberOfLines={1}>{lineOf}</Text> : null}
          <Chip label={plus ? 'life Plus · Active' : 'Free plan'} style={{ marginTop: space.xs }} />
        </View>
        <Icon name="chev" size={componentSize.iconXs} color={t.inkQuiet} />
      </Press>
      <Display s={sentence} style={{ marginTop: space.lg }} />
      <AccordionGroup style={{ marginTop: space.lg }} initial="behaves" items={[
        { key: 'behaves', title: 'How life behaves', count: '4', content: <View>
          <Row icon="bell" title="Notifications" sub={`At most ${nudges} a day · ${nudgeWindow.replace(' and ', '–')}`} onPress={() => nav.go('notifs')} />
          <Row icon="sun" title="Look, sound and feel" sub={`${appearance} · sounds ${p.sounds ? 'on' : 'off'}, haptics ${p.haptics ? 'on' : 'off'}`} onPress={() => nav.go('appearance')} />
          <Row icon="images" title="Pictures" sub={`${p.look === 'mix' ? 'Mixed cast' : 'Places only'}${p.followMood ? ' · follows your mood' : ''}`} onPress={() => nav.go('appearance')} />
          <Row icon="food" title="Calorie numbers" sub={p.hideNumbers ? 'Balance-only · switch to numbers' : 'Shown · switch to balance-only'} onPress={() => pref('hideNumbers', !p.hideNumbers)} />
        </View> },
        { key: 'reach', title: 'What life can reach', count: '3', content: <View>
          <Row icon="swap" title="Connected services" sub={`${live.length} on · bank not connected`} onPress={() => nav.go('services')} />
          <Row icon="shield" title="Private mode" sub={p.privateMode ? `AI kept on this phone · ${onPhoneMB} MB` : 'Off · cloud work asks first'} onPress={() => nav.go('ondevice')} />
          <Row icon="spark" title="Your AI" sub={mcp ? 'Read-only · last used 2h ago' : 'Not connected'} onPress={() => nav.go('yourai')} />
        </View> },
        { key: 'data', title: 'Your data and account', count: '4', content: <View>
          <Row icon="folder" title="What life knows" sub={`${n(data.knowledge.recordCount)} records · see and edit everything`} onPress={() => nav.go('knows')} />
          <Row icon="arrowDown" title="Export your data" sub="A copy of everything, as a file" onPress={() => { void exportData(); }} />
          <Row icon="wallet" title="life Plus" sub={plus ? `Yearly · renews ${plusPrice.renews}` : 'Free · see what life Plus adds'} onPress={() => nav.go(plus ? 'subscription' : 'plus')} />
          <Row icon="trash" title="Delete everything" sub="This can’t be undone" onPress={() => nav.go('deleteacct')} />
        </View> },
        { key: 'help', title: 'Help and about', count: '2', content: <View>
          <Row icon="help" title="Help" sub="Ask life how anything works" onPress={() => nav.go('help')} />
          <Row icon="info" title="About life" sub={releaseLabel} onPress={() => nav.go('legal')} />
        </View> },
      ]} />
    </Page>
  );
}

/* ───────────────────────── Notifications ───────────────────────── */

/** Twenty-four short bars, one an hour, the quiet ones in ink (board `.ruler` of hours). */
function QuietHoursRuler({ from, until }: { from: number; until: number }) {
  const t = useTokens();
  return (
    <View style={styles.hours} accessible accessibilityRole="image" accessibilityLabel={`Quiet from ${hh(from)} until ${hh(until)}`}>
      {Array.from({ length: 24 }, (_, h) => <View key={h} style={{ flex: 1, borderRadius: 1, backgroundColor: h < until || h >= from ? t.ink : t.surface3 }} />)}
    </View>
  );
}

const FROM = [20, 21, 22, 23], UNTIL = [6, 7, 8, 9];

export function NotifsV26() {
  const { data, flag, choose } = useSeed();
  const nudges = data.choices.nudges ?? '1';
  const from = Number(data.choices['quiet-from'] ?? quietHours.from), until = Number(data.choices['quiet-until'] ?? quietHours.until);
  const isOn = (key: string, fallback: boolean) => data.flags[`notification-off-${key}`] === undefined ? fallback : !data.flags[`notification-off-${key}`];
  const kinds = notifGroups.flatMap(g => g.kinds), on = kinds.filter(k => isOn(k.key, k.on)).length;
  const next = (list: number[], v: number) => list[(list.indexOf(v) + 1) % list.length];
  return (
    <Page screen="notifs" bar={{ kind: 'push', title: 'Notifications' }}>
      <Eyebrow>{`${on} of ${kinds.length} kinds are on`}</Eyebrow>
      <Display s={`At most {@bell ${nudges} nudge${nudges === '1' ? '' : 's'} a day}, and {@moon nothing at night}.`} />
      <Card style={{ marginTop: space.lg }}>
        <Micro>NUDGES A DAY, AT MOST</Micro>
        <Between style={{ alignItems: 'flex-end', marginTop: 6 }}>
          <Figure value={nudges} unit="a day" />
          <SegmentedV26 style={{ width: 150, marginBottom: space.xs }} options={['1', '2', '3'].map(v => ({ value: v, label: v }))} value={nudges} onChange={v => choose('nudges', v)} />
        </Between>
        <Callout style={{ marginTop: space.xs }}>{`Sent between ${nudgeWindow}. Too many? Turn it down here.`}</Callout>
        <Micro style={{ marginTop: space.lg }}>QUIET HOURS</Micro>
        <QuietHoursRuler from={from} until={until} />
        <Between style={{ marginTop: space.xs }}><Callout>00:00</Callout><Callout>12:00</Callout><Callout>24:00</Callout></Between>
        <Between style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Chip label={`From ${hh(from)}`} onPress={() => choose('quiet-from', String(next(FROM, from)))} />
            <Chip label={`Until ${hh(until)}`} onPress={() => choose('quiet-until', String(next(UNTIL, until)))} />
          </View>
          <Callout>{`${24 - from + until} quiet hours`}</Callout>
        </Between>
      </Card>
      <Callout style={{ marginTop: space.sm }}>life learns your timing. You always have the final say.</Callout>
      <SectionHead title="What can reach you" />
      {notifGroups.map((g, i) => (
        <View key={g.title} style={{ marginTop: i ? space.lg : 0 }}>
          <Micro>{g.title.toUpperCase()}</Micro>
          <RowsCard style={{ marginTop: space.xs }}>
            {g.kinds.map(k => <SwitchRow key={k.key} icon={k.icon} title={k.title} sub={k.sub} value={isOn(k.key, k.on)} onChange={v => flag(`notification-off-${k.key}`, !v)} />)}
          </RowsCard>
        </View>
      ))}
    </Page>
  );
}

/* ───────────────────────── Private mode ───────────────────────── */

export function OndeviceV26() {
  const t = useTokens(), nav = useNavigation(), { data, pref } = useSeed(), { caps, builtIn } = useCapabilities(true);
  const voiceSub = caps && !caps.speech && Platform.OS !== 'web' ? 'Needs the phone’s speech pack' : phoneJobs[0].sub;
  return (
    <Page screen="ondevice" bar={{ kind: 'push', title: 'Private mode', action: { kind: 'icon', icon: 'info', label: 'How Private mode works', onPress: () => nav.go('aimodels') } }}
      footer={<Btn label="What gets downloaded" icon="arrow" trail onPress={() => nav.go('aimodels')} />}>
      <Display s="{Three jobs} stay on this phone. {Two} still ask before using the cloud." flush style={{ marginTop: space.xxs }} />
      <SwitchCard style={{ marginTop: space.lg }} title="Keep AI on this phone" value={data.prefs.privateMode} onChange={v => pref('privateMode', v)}
        sub={builtIn ? `${onPhoneMB} MB on this phone · built-in AI found` : 'No built-in AI found · about 1 to 2 GB to add'} />
      <View style={[styles.slab, { backgroundColor: t.ink }]}>
        <View style={[styles.island, { backgroundColor: t.inverseFill }]} />
        <Text variant="micro" style={{ color: t.inverse2, paddingBottom: space.xxs }}>ON YOUR PHONE · NOTHING LEAVES</Text>
        {phoneJobs.map((j, i) => (
          <View key={j.title} style={styles.job}>
            <View style={[styles.jobIcon, { backgroundColor: t.inverseFill }]}><Icon name={j.icon} size={componentSize.iconSm} color={t.canvas} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="title" style={{ color: t.canvas }}>{j.title}</Text>
              <Text variant="callout" style={{ color: t.inverse2 }}>{i === 0 ? voiceSub : j.sub}</Text>
            </View>
          </View>
        ))}
      </View>
      <Micro style={{ marginTop: space.lg }}>STILL ASKS BEFORE USING THE CLOUD</Micro>
      <RowsCard style={{ marginTop: space.xs }}>
        {cloudJobs.map(j => <Row key={j.title} icon={j.icon} title={j.title} sub={j.sub} right={<Chip label="Asks" tone="q" />} />)}
      </RowsCard>
      <LifeSays style={{ marginTop: space.lg }}>Your numbers always come from life’s own engine, never from a guess by the AI.</LifeSays>
    </Page>
  );
}

/* ───────────────────────── Your AI ───────────────────────── */

export function YouraiV26() {
  const t = useTokens(), { data, flag } = useSeed(), [copied, setCopied] = useState(false);
  const revoked = !!data.flags['mcp-revoked'] || !SHOW_SAMPLES && !data.flags['mcp-on'];
  const isOn = (i: number) => data.flags[`mcp-off-${i}`] === undefined ? aiScopes[i].on : !data.flags[`mcp-off-${i}`];
  const count = aiScopes.filter((_, i) => isOn(i)).length;
  const node = (lead: ReactNode, label: string) => <View style={[styles.node, { backgroundColor: t.surface2 }]}>{lead}<Text variant="buttonCompact">{label}</Text></View>;
  const down = <Icon name="arrowDown" size={componentSize.iconXs} color={t.inkQuiet} />;
  const explain = () => Alert.alert('How the connection works', 'Your assistant sends a question to life over a private connection (MCP). life answers from what you allow here, read-only. It can never change anything, and switching it off ends the connection at once.');
  return (
    <Page screen="yourai" bar={{ kind: 'push', title: 'Your AI', action: { kind: 'icon', icon: 'info', label: 'How the connection works', onPress: explain } }}
      footer={<Btn ghost label={revoked ? 'Switch the connection on' : 'Switch off and revoke'} onPress={() => { if (revoked) { flag('mcp-revoked', false); flag('mcp-on', true); } else { flag('mcp-revoked', true); flag('mcp-on', false); } feedback.select(); }} />}>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: space.xxs }}>
        <Chip label={revoked ? 'Off' : 'Read-only'} />
        {!revoked && SHOW_SAMPLES ? <Chip label="Last used 2h ago" tone="q" /> : null}
      </View>
      <Text variant="titleSerif" style={{ marginTop: space.md }}>Ask your usual assistant. It answers from life.</Text>
      <View style={[styles.flow, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <View style={[styles.said, { backgroundColor: t.surface2 }]}><Text variant="body">“How did I sleep this month?”</Text></View>
        {down}
        {node(<Icon name="spark" size={componentSize.iconSm} color={t.ink} />, 'Your usual assistant')}
        {down}
        {node(<LifeOrb size={22} />, 'life answers, read-only')}
      </View>
      <Body s="A private connection (MCP). {You pick exactly what it can see}, and can switch it off any time." style={{ marginTop: space.md }} />
      <SectionHead title="What it can see" link={`${count} of ${aiScopes.length} on`} />
      <RowsCard>
        {aiScopes.map((s, i) => <SwitchRow key={s.title} icon={s.icon} title={s.title} value={isOn(i)} onChange={v => flag(`mcp-off-${i}`, !v)} />)}
      </RowsCard>
      <Card style={{ marginTop: space.sm }}>
        <Micro>CONNECTION ADDRESS</Micro>
        <Between style={{ marginTop: space.xs }}>
          <Text variant="title" style={{ fontVariant: ['tabular-nums'], flexShrink: 1 }} numberOfLines={1}>mcp.life.app/u/••••••</Text>
          <Chip label={copied ? 'Copied' : 'Copy'} icon={copied ? 'check' : 'copy'} onPress={async () => { await Clipboard.setStringAsync('mcp.life.app/u/local-preview'); setCopied(true); feedback.select(); }} />
        </Between>
      </Card>
    </Page>
  );
}

/* ───────────────────────── Look, sound and feel ───────────────────────── */

/** A small phone drawn in light or dark (board `.sp-mini`): the signal dot, three lines, a photograph, a slab. */
function MiniPhone({ dark, source }: { dark: boolean; source: number }) {
  const t = useTokens();
  const bg = dark ? photo.ink : photo.onPhoto, ink = dark ? photo.onPhoto : photo.ink;
  const line = (w: `${number}%`, soft?: boolean) => <View style={{ width: w, height: 8, borderRadius: 4, backgroundColor: ink, opacity: soft ? 0.32 : 1 }} />;
  return (
    <View style={[styles.stage, { backgroundColor: t.surface3 }]}>
      <View style={[styles.mini, { backgroundColor: bg }]}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.ember, marginBottom: 4 }} />
        {line('92%')}{line('100%', true)}{line('58%')}
        <View style={styles.shot}><PhotoFill source={source} /></View>
        <View style={{ height: 18, borderRadius: 6, backgroundColor: ink }} />
      </View>
    </View>
  );
}

export function AppearanceV26() {
  const t = useTokens(), { data, pref, choose } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const p = data.prefs;
  const system = (data.choices.appearance ?? '') === 'System';
  const dark = params.state === 'dark' ? true : params.state === 'light' ? false : p.dark;
  const pick = (d: boolean) => { choose('appearance', d ? 'Dark' : 'Light'); pref('dark', d); feedback.select(); };
  const option = (label: string, d: boolean, source: number) => (
    <Press key={label} haptic={null} onPress={() => pick(d)} accessibilityLabel={label} accessibilityState={{ selected: dark === d }} style={{ flex: 1 }}>
      <MiniPhone dark={d} source={source} />
      <Between style={{ marginTop: 10, paddingHorizontal: 4 }}>
        <Text variant="title" tone={dark === d ? 'ink' : 'quiet'}>{label}</Text>
        <View style={[styles.tick, { backgroundColor: dark === d ? t.ink : t.surface3 }]}>{dark === d ? <Icon name="check" size={14} color={t.canvas} /> : null}</View>
      </Between>
    </Press>
  );
  return (
    <Page screen="appearance" bar={{ kind: 'push', title: 'Look, sound and feel' }}>
      <Display flush style={{ marginTop: space.xxs }}
        s={`{@${dark ? 'moon' : 'sun'} ${dark ? 'Dark'.trim() : 'Light'}}, with ${p.sounds ? '{sounds}' : 'no sounds'} and ${p.haptics ? '{haptics}' : 'no haptics'} ${p.sounds || p.haptics ? 'on' : ''}. Pictures ${p.followMood ? '{follow your mood}' : 'stay {as they are}'}.`.replace('  ', ' ').replace(' .', '.')} />
      <View style={{ flexDirection: 'row', gap: space.tile, marginTop: space.lg }}>
        {option('Light', false, photos.calmdesk)}
        {option('Dark', true, photos.vantage)}
      </View>
      <SwitchCard style={{ marginTop: space.md }} title="Match my phone" sub="Follows your phone’s light and dark setting" value={system}
        onChange={v => { choose('appearance', v ? 'System' : dark ? 'Dark' : 'Light'); if (v) pref('dark', Appearance.getColorScheme() === 'dark'); }} />
      <TileGrid style={{ marginTop: space.sm }}>
        <ToggleTile icon="bell" title="Sounds" value={p.sounds} onChange={v => pref('sounds', v)} />
        <ToggleTile icon="pulse" title="Haptics" value={p.haptics} onChange={v => pref('haptics', v)} />
      </TileGrid>
      <SectionHead title="Pictures" />
      <RowsCard>
        <Row thumb={photos.walk} title="Pictures follow your mood" sub={p.look === 'mix' ? 'A mixed cast, in daylight' : 'Places only, in daylight'} right={<SwitchV26 value={p.followMood} onChange={v => pref('followMood', v)} accessibilityLabel="Pictures follow your mood" />} />
        <Row thumb={photos.keyshome} title="Glimpses of your Aim" sub="Unlocked as you get closer" right={<SwitchV26 value={p.glimpses} onChange={v => pref('glimpses', v)} accessibilityLabel="Glimpses of your Aim" />} />
        <SwitchRow icon="bulb" title="Hand-drawn diagrams in lessons" sub="In Teach me" value={p.handDrawn} onChange={v => pref('handDrawn', v)} />
      </RowsCard>
      <RowsCard style={{ marginTop: space.sm }}>
        <SwitchRow icon="eyeOff" title="Hide balances" sub="Covers money figures on screen" value={p.hideBalances} onChange={v => pref('hideBalances', v)} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Reduce Motion follows your phone’s setting.</Callout>
    </Page>
  );
}

function ToggleTile({ icon, title, value, onChange }: { icon: GlyphName; title: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTokens();
  return (
    <View style={[styles.toggleTile, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <Between><Icon name={icon} size={componentSize.iconSm} color={t.ink} /><SwitchV26 value={value} onChange={onChange} accessibilityLabel={title} /></Between>
      <Text variant="title" style={{ marginTop: 14 }}>{title}</Text>
      <Text variant="callout" tone="ink2">{value ? 'On' : 'Off'}</Text>
    </View>
  );
}

/* ───────────────────────── Connected services ───────────────────────── */

export function ServicesV26() {
  const nav = useNavigation(), { live } = useSettingsWords();
  return (
    <Page screen="services" bar={{ kind: 'push', title: 'Connected', action: { kind: 'icon', icon: 'add', label: 'Add a connection', onPress: () => nav.go('devices') } }}>
      <Display flush style={{ marginTop: space.xxs }} s={live.length ? `{${live.length} connection${live.length === 1 ? '' : 's'}} ${live.length === 1 ? 'is' : 'are'} on. Your {@wallet bank} isn’t one of them.` : 'Nothing is connected yet. {Add one} when it helps.'} />
      <TileGrid style={{ marginTop: space.lg }}>
        {live.map(c => (
          <V26Tile key={c.name} label={c.name} dot={c.dot} scale="On" onPress={() => nav.go(c.to)}>
            <Text variant="headline" style={{ marginTop: 14 }}>{c.shares}</Text>
            <Text variant="callout" tone="ink2" style={{ marginTop: 'auto', paddingTop: 10 }}>{c.when}</Text>
          </V26Tile>
        ))}
        <V26Tile wide label="Bank" dot="money" scale="Not connected" style={{ minHeight: 0 }}>
          <Between style={{ marginTop: space.sm }}>
            <Text variant="body" style={{ flexShrink: 1 }}>Open Banking, read-only.</Text>
            <Btn ghost sm fit label="Add" onPress={() => nav.go('connectbank')} style={{ width: undefined }} />
          </Between>
        </V26Tile>
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>Disconnecting takes one tap. You choose whether to delete what came from it too.</Callout>
    </Page>
  );
}

/* ───────────────────────── Your data ───────────────────────── */

export function PrivacyV26() {
  const nav = useNavigation(), { data } = useSeed(), exportData = useExport();
  return (
    <Page screen="privacy" bar={{ kind: 'push', title: 'Your data' }}>
      <Eyebrow icon="shield">The promise</Eyebrow>
      <Display s="We never {sell your data}, {use it for ads}, or {train AI on it} without asking." />
      <Card style={{ marginTop: space.lg }}>
        <Between style={{ alignItems: 'flex-start' }}>
          <View><Micro>WHAT LIFE KNOWS</Micro><Figure value={n(data.knowledge.recordCount)} unit="records" style={{ marginTop: 6 }} /></View>
          <Chip label="All editable" />
        </Between>
        <Body s="Your copy, your facts. {See it, take it, delete it.}" style={{ marginTop: space.xs }} />
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.md }}>
          <Btn ghost sm fit label="See it all" onPress={() => nav.go('knows')} />
          <Btn sm label="Download everything" icon="arrowDown" onPress={() => { void exportData(); }} style={{ flex: 1 }} />
        </View>
        <Callout style={{ marginTop: space.sm }}>One file with all your data, as JSON.</Callout>
      </Card>
      <SectionHead title="How it is looked after" />
      <RowsCard>
        <Row icon="shield" title="Backed up" sub="Encrypted, in the UK and EU" />
        <Row icon="people" title="Who helps run life" sub="Hosting, AI, email · 4 companies" onPress={() => nav.go('legal')} />
      </RowsCard>
      <Row icon="trash" title="Delete my account" sub="30 days to change your mind" onPress={() => nav.go('deleteacct')} style={{ marginTop: space.xl }} />
    </Page>
  );
}

/* ───────────────────────── Delete your account ───────────────────────── */

export function DeleteacctV26() {
  const t = useTokens(), nav = useNavigation(), { reset } = useSeed(), exportData = useExport();
  const params = useLocalSearchParams<{ state?: string }>();
  const [typed, setTyped] = useState(params.state === 'typed' ? 'DELETE' : '');
  const armed = typed.trim() === 'DELETE';
  const plus = SHOW_SAMPLES ? 'a life Plus refund is owed' : 'a refund is owed';
  return (
    <Page screen="deleteacct" bar={{ kind: 'push', title: '' }}
      footer={<View style={{ gap: space.xs }}>
        <Field label="Type DELETE to confirm" value={typed} placeholder="DELETE" onChangeText={setTyped} />
        <Btn ghost={!armed} disabled={!armed} label="Delete account" onPress={async () => { if (!armed) return; feedback.select(); if (await reset()) nav.replace('welcome'); }} />
        <Callout center>{armed ? 'Your account closes today. 30 days to change your mind.' : 'The button wakes when you type DELETE.'}</Callout>
      </View>}>
      <Text variant="titleSerif" style={{ marginTop: space.xxs }}>Delete your account?</Text>
      <Body s="Read this once. {After 30 days it can’t be undone.}" style={{ marginTop: space.xs }} />
      <Micro style={{ marginTop: space.xl }}>DELETED</Micro>
      <Statement s="{Everything you’ve told life}, your health data and your chats." style={{ marginTop: space.xs }} />
      <Micro style={{ marginTop: space.lg }}>KEPT</Micro>
      <Statement s={`{Nothing}, unless ${plus}.`} style={{ marginTop: space.xs }} />
      <Micro style={{ marginTop: space.lg }}>GRACE PERIOD</Micro>
      <Statement s="{30 days} to change your mind." style={{ marginTop: space.xs }} />
      <DotGrid cells={Array<DotCell>(30).fill('')} columns={15} label="30 days" style={{ marginTop: space.sm }} />
      <Press haptic="select" onPress={() => { void exportData(); }} accessibilityLabel="Download my data first" pressScale={0.99} style={[styles.switchCard, { backgroundColor: t.surface, ...cardShadow(t.scheme), marginTop: space.lg }]}>
        <View style={{ flex: 1 }}><Text variant="title">Download my data first</Text><Text variant="callout" tone="ink2">One file with everything in it</Text></View>
        <View style={[styles.round, { backgroundColor: t.surface2 }]}><Icon name="arrowDown" size={componentSize.iconSm} color={t.ink} /></View>
      </Press>
    </Page>
  );
}

/* ───────────────────────── Your life Plus ───────────────────────── */

/** Months into the paid year, counted from the renewal date. */
function planMonth() {
  const renews = new Date(`${plusPrice.renews} 00:00`);
  if (Number.isNaN(renews.getTime())) return 1;
  const started = new Date(renews); started.setFullYear(started.getFullYear() - 1);
  const now = new Date();
  const months = (now.getFullYear() - started.getFullYear()) * 12 + now.getMonth() - started.getMonth() - (now.getDate() < started.getDate() ? 1 : 0);
  return Math.max(1, Math.min(12, months + 1));
}

export function SubscriptionV26() {
  const nav = useNavigation(), { flag } = useSeed(), plus = usePlus();
  const month = planMonth();
  if (!plus) return (
    <Page screen="subscription" bar={{ kind: 'push', title: 'life Plus' }} footer={<Btn label="See life Plus" onPress={() => nav.go('plus')} />}>
      <Display flush style={{ marginTop: space.xxs }} s="You’re on the {free plan}. Everything free {stays free}." />
      <Statement s={`life Plus adds {@grid every tool} at every level, {@repeat your routines}, {@book unlimited Teach me} and {@shield Private mode}, for ${money(plusPrice.annual)} a year.`} style={{ marginTop: space.lg }} />
    </Page>
  );
  return (
    <Page screen="subscription" bar={{ kind: 'push', title: 'life Plus' }}
      footer={<View style={{ gap: space.xs }}>
        <Btn ghost label={`Switch to monthly · ${money(plusPrice.monthly)} a month`} onPress={() => nav.go('plus')} />
        <QuietLink label="Cancel life Plus" onPress={() => { flag('plus-cancelled', true); feedback.select(); }} />
        <Micro center>One tap, then managed by the App Store</Micro>
      </View>}>
      <PhotoCard source={photos.gotit} focal={{ y: 0.37 }} height={200} chips={['Active']} title="Your life Plus" sub="Yearly plan" />
      <Between style={{ alignItems: 'flex-end', marginTop: space.lg }}>
        <Figure value={money(plusPrice.annual)} unit="a year" />
        <Chip label={`${money(plusPrice.perMonth)} a month · saves ${plusPrice.save}%`} style={{ marginBottom: 10 }} />
      </Between>
      <Card style={{ marginTop: space.md }}>
        <Between><Micro>RENEWS</Micro><Text variant="title">{plusPrice.renews}</Text></Between>
        <DotGrid cells={Array.from({ length: 12 }, (_, i): DotCell => (i < month ? 'on' : ''))} columns={12} label={`Month ${month} of 12`} style={{ marginTop: space.md }} />
        <Callout style={{ marginTop: space.md }}>{`Month ${month} of 12. Paid once a year.`}</Callout>
      </Card>
      <Statement s="Includes {@grid every tool} at every level, {@repeat your routines}, {@book unlimited Teach me} and {@shield Private mode}." style={{ marginTop: space.lg }} />
    </Page>
  );
}

/* ───────────────────────── life Plus (the offer) ───────────────────────── */

export function PlusV26() {
  const t = useTokens(), nav = useNavigation(), { flag } = useSeed();
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const line = plan === 'annual' ? `${money(plusPrice.annual)} a year · ${money(plusPrice.perMonth)} a month` : `${money(plusPrice.monthly)} a month · ${money(plusPrice.monthly * 12)} a year`;
  return (
    <Page screen="plus" bar={{ kind: 'flow', left: 'Back', leftIcon: 'back', action: { kind: 'text', label: 'Skip', onPress: nav.close } }}
      footer={<View style={{ gap: space.xs }}>
        <Btn label="Subscribe" onPress={() => { flag('plus-preview', true); flag('plus-cancelled', false); feedback.select(); nav.replace('plussuccess'); }} style={{ minHeight: 56 }} />
        <QuietLink label="Restore purchases" onPress={() => Alert.alert('Nothing to restore', 'No earlier life Plus purchase was found on this account.')} />
        <Micro center>Recurring billing · cancel any time</Micro>
      </View>}>
      <Text variant="title" style={{ marginTop: space.xl }}>life Plus</Text>
      <Display s="Unlock {@mic unlimited Talk}, {@book every lesson}, {@repeat your routines} and more." style={{ marginTop: 6 }} />
      <Press haptic="select" onPress={() => setPlan(plan === 'annual' ? 'monthly' : 'annual')} accessibilityLabel={`${plan === 'annual' ? 'Annual' : 'Monthly'}, ${line}. Tap to switch`} pressScale={0.99}
        style={[styles.pick, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="title">{plan === 'annual' ? 'Annual' : 'Monthly'}</Text>
          <Text variant="callout" tone="ink2">{line}</Text>
        </View>
        {plan === 'annual' ? <Chip label={`Save ${plusPrice.save}%`} tone="live" /> : <Chip label="Switch to annual" tone="q" />}
      </Press>
    </Page>
  );
}

/* ───────────────────────── Welcome to life Plus ───────────────────────── */

export function PlussuccessV26() {
  const nav = useNavigation(), { data } = useSeed();
  useEffect(() => { feedback.cleared(); }, []);
  const name = data.profile.name ? `, ${data.profile.name}` : '';
  return (
    <Page screen="plussuccess" scroll={false}
      backdrop={<View pointerEvents="none" style={StyleSheet.absoluteFill}><PhotoFill source={photos.sky} focal={{ x: 0.4, y: 0, zoom: 2.9 }} settle /></View>}
      bar={{ kind: 'photo', left: <View />, right: <OnPhotoRound icon="close" label="Close" onPress={nav.home} /> }}
      footer={<Btn onPhoto label="Back to what I was doing" onPress={nav.home} />}
      contentStyle={{ justifyContent: 'flex-end', paddingBottom: space.sm }}>
      <LifeOrb size={72} state="done" color={photo.onPhoto} />
      <Text variant="welcome" style={{ color: photo.onPhoto, marginTop: 10 }}>You’re on life Plus.</Text>
      <Statement onPhoto size="lead" s={`Thank you${name}. {${plusOpens.length === 4 ? 'Four' : plusOpens.length} things just opened.}`} style={{ marginTop: space.xs, marginBottom: 14 }} />
      <View style={styles.opens}>
        {plusOpens.map(o => (
          <View key={o.label} style={[styles.open, { backgroundColor: photo.fill }]}>
            <Icon name={o.icon} size={20} color={photo.onPhoto} />
            <Text variant="title" style={{ color: photo.onPhoto }}>{o.label}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

/* ───────────────────────── Help ───────────────────────── */

export function HelpV26() {
  const nav = useNavigation(), { data, flag } = useSeed(), [q, setQ] = useState('');
  const reported = !!data.flags['support-report'];
  return (
    <Page screen="help" bar={{ kind: 'push', title: 'Help' }}>
      <View style={{ alignItems: 'center', paddingTop: space.sm }}><LifeOrb size={56} /></View>
      <Text variant="titleSerif" align="center" style={{ marginTop: 18 }}>Ask life how anything works</Text>
      <View style={{ marginTop: space.lg }}>
        <Composer value={q} onChange={setQ} placeholder="Type your question" onSend={() => { const s = q.trim(); if (!s) return; setQ(''); nav.go('chat', { question: s }); }} />
      </View>
      <Micro style={{ marginTop: space.xl }}>ASKED MOST</Micro>
      <AccordionGroup style={{ marginTop: space.sm }} initial={helpAnswers[0].key} items={helpAnswers.map(a => ({
        key: a.key, title: a.title, count: a.count,
        content: <View>
          <Body s={a.text} />
          {a.link && a.to ? <Press haptic="select" onPress={() => nav.go(a.to!)} accessibilityLabel={a.link} style={styles.link}><Text variant="buttonCompact">{a.link}</Text><LinkChevIcon /></Press> : null}
          {a.button ? <Btn ghost sm fit label={reported ? 'Thanks, a person will look' : a.button} onPress={() => { flag('support-report', true); feedback.select(); }} style={{ marginTop: space.sm }} /> : null}
        </View>,
      }))} />
      <Press haptic="open" onPress={() => flag('support-email', true)} accessibilityLabel="Email us" pressScale={0.99} style={{ marginTop: space.sm }}>
        <EmailCard sent={!!data.flags['support-email']} />
      </Press>
    </Page>
  );
}

function LinkChevIcon() { const t = useTokens(); return <Icon name="chev" size={componentSize.iconXs} color={t.ink} />; }

function EmailCard({ sent }: { sent: boolean }) {
  const t = useTokens();
  return (
    <View style={[styles.switchCard, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <View style={[styles.well, { backgroundColor: t.surface2 }]}><Icon name="people" size={componentSize.iconSm} color={t.ink} /></View>
      <View style={{ flex: 1 }}>
        <Text variant="title">Email us</Text>
        <Text variant="callout" tone="ink2">{sent ? 'Opens your mail app once support is connected' : 'A person replies within a day'}</Text>
      </View>
      <Icon name="chev" size={componentSize.iconXs} color={t.inkQuiet} />
    </View>
  );
}

/* ───────────────────────── About life ───────────────────────── */

export function LegalV26() {
  const t = useTokens(), nav = useNavigation(), { data, flag } = useSeed();
  return (
    <Page screen="legal" bar={{ kind: 'push', title: 'About' }}>
      <View style={{ alignItems: 'center', paddingTop: space.md }}>
        <View style={[styles.mark, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><LifeOrb size={34} /></View>
        <Text variant="titleSerif" style={{ marginTop: space.md }}>life</Text>
        <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'], marginTop: 2 }}>{releaseLabel}</Text>
      </View>
      <Display center s="{@heart Wellness}, not medical. {@cash Guidance}, not advice." style={{ marginTop: space.xl }} />
      <Body align="center" s="life helps you notice and decide. It doesn’t diagnose, and it isn’t a financial adviser." style={{ marginTop: space.sm }} />
      <RowsCard style={{ marginTop: space.xl }}>
        <Row icon="doc" title="Terms" onPress={() => flag('legal-terms')} style={{ minHeight: 56 }} />
        <Row icon="shield" title="Privacy policy" onPress={() => nav.go('privacy')} style={{ minHeight: 56 }} />
        <Row icon="layers" title="Open-source notices" sub={`${openSource.count} libraries · ${openSource.licences}`} onPress={() => flag('legal-notices')} />
      </RowsCard>
      {data.flags['legal-terms'] ? <Body s="life is a wellness and life-admin app, not a medical service or a regulated financial adviser. {Full terms are published before launch.}" style={{ marginTop: space.md }} /> : null}
      {data.flags['legal-notices'] ? <Body s="Expo, React, React Native, Reanimated, Gesture Handler and SVG: MIT. Atria and Cal-AI: MIT. Fenny teaching references: the owner’s code, reused with permission. {Every notice is kept in THIRD_PARTY_NOTICES.md.}" style={{ marginTop: space.md }} /> : null}
    </Page>
  );
}

/* ───────────────────────── What stays on your phone ───────────────────────── */

export function AimodelsV26() {
  const t = useTokens(), { caps, builtIn } = useCapabilities(true);
  const phone = Platform.OS === 'ios' || Platform.OS === 'web' ? 'iPhone' : 'phone';
  const parts = modelParts.map(m => m.key === 'out' && caps?.speaker ? { ...m, size: 'Installed' } : m);
  return (
    <Page screen="aimodels" bar={{ kind: 'push', title: 'On this phone' }}>
      <Eyebrow style={{ marginTop: space.xxs }}>{`On this ${phone}`}</Eyebrow>
      <Between style={{ alignItems: 'flex-end', marginTop: space.xs }}>
        {builtIn ? <Figure value={String(onPhoneMB)} unit="MB" /> : <Figure value="1–2" unit="GB" />}
        <Chip label={builtIn ? 'Built-in AI found' : 'No built-in AI'} style={{ marginBottom: 10 }} />
      </Between>
      <Statement style={{ marginTop: space.sm }} s={builtIn ? `This ${phone} brings {its own AI}, so life downloads only {what’s missing}.` : `This ${phone} has {no built-in AI}, so life adds {a small open model} over Wi-Fi.`} />
      <Card style={{ marginTop: space.lg }}>
        <Between><Text variant="callout">{`This ${phone}`}</Text><Text variant="callout">{builtIn ? `${onPhoneMB} MB` : 'about 1 to 2 GB'}</Text></Between>
        <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: builtIn ? '12%' : '100%', height: '100%', borderRadius: radius.full, backgroundColor: t.ink }} /></View>
        <Between style={{ marginTop: space.md }}><Callout>A phone with no built-in AI</Callout><Callout>about 1 to 2 GB</Callout></Between>
        <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: '100%', height: '100%', borderRadius: radius.full, backgroundColor: t.inkQuiet }} /></View>
      </Card>
      <AccordionGroup style={{ marginTop: space.sm }} initial={parts[0].key} items={parts.map(m => ({
        key: m.key, title: m.title, count: m.size,
        content: <View>
          <Text variant="body" tone="ink2">{m.text}</Text>
          <View style={styles.uses}>
            <Callout style={{ marginRight: 2 }}>Used for</Callout>
            {m.uses.map(u => <Chip key={u} label={u} />)}
          </View>
        </View>,
      }))} />
      <Callout style={{ marginTop: space.md }}>Downloads over Wi-Fi, can be removed any time, and are checked against life’s tests before each update. Reading a photo and building a new lesson still ask before using the cloud.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  me: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: space.md, borderRadius: radius.lg },
  card: { borderRadius: radius.lg, padding: space.cardPad },
  switchCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg },
  hours: { flexDirection: 'row', gap: 3, height: 16, marginTop: space.sm },
  slab: { borderRadius: 36, paddingTop: 14, paddingHorizontal: 20, paddingBottom: 20, marginTop: space.sm },
  island: { width: 72, height: 20, borderRadius: 10, alignSelf: 'center', marginBottom: 18 },
  job: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 9 },
  jobIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  node: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 40, paddingLeft: 10, paddingRight: space.md, borderRadius: radius.full },
  flow: { alignItems: 'center', gap: space.xs, borderRadius: radius.xl, paddingVertical: 22, paddingHorizontal: space.md, marginTop: space.lg },
  said: { alignSelf: 'stretch', borderRadius: radius.tile, paddingVertical: 14, paddingHorizontal: space.md },
  stage: { height: 196, paddingTop: space.md, paddingHorizontal: 20, borderRadius: radius.lg, overflow: 'hidden' },
  mini: { flex: 1, gap: 6, paddingTop: 14, paddingHorizontal: space.sm, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  shot: { height: 54, borderRadius: radius.sm, marginTop: 6, overflow: 'hidden' },
  tick: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleTile: { borderRadius: radius.lg, padding: space.md },
  round: { width: componentSize.round, height: componentSize.round, borderRadius: componentSize.round / 2, alignItems: 'center', justifyContent: 'center' },
  pick: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 72, paddingHorizontal: 18, borderRadius: radius.lg, marginTop: space.lg },
  opens: { flexDirection: 'row', flexWrap: 'wrap', gap: space.tile },
  open: { flexBasis: '45%', flexGrow: 1, gap: space.sm, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, borderRadius: radius.lg },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm, alignSelf: 'flex-start' },
  well: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  meter: { height: 6, borderRadius: radius.full, overflow: 'hidden', marginTop: space.xs },
  uses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: space.sm },
});
