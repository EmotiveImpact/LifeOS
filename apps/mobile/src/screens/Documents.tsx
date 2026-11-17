import { View } from 'react-native';
import { Button, Card, Checklist, DocumentRow, MoneyFigure, StatusPill, Text, Ticks, space } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { seed, seedDocuments } from '@/state/seed';
import { LocalNotice, Rows, Screen, Section } from './Screen';

export function DocumentsScreen({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), { data, flag, choose } = useSeed();
  const document = seedDocuments.find(d => d.id === data.choices.document) ?? seedDocuments.find(d => d.id === 'passport')!;
  const openDocument = (id: string) => { choose('document', id); nav.go(id === 'insurance' ? 'renewal' : 'docdetail'); };
  if (screen === 'vault') {
    const urgent = seedDocuments.filter(d => d.status === 'Act now'), filed = seedDocuments.filter(d => d.status !== 'Act now');
    return <Screen screen={screen} title="Documents and renewals" action={{ kind: 'icon', icon: 'add', label: 'Scan a document', onPress: () => nav.go('scan') }} footer={<Button variant="secondary" label="Scan a document" onPress={() => nav.go('scan')} />}>
      <Text variant="callout" tone="ink2">{`${urgent.length} to act on · ${filed.length} filed`}</Text>
      <Section title="Act now">{urgent.map(d => <Card key={d.id} padding={space.md}><DocumentRow name={d.name} expires={d.summary} status={d.status} onPress={() => openDocument(d.id)} /></Card>)}</Section>
      <Section title="Filed documents"><View style={{ gap: space.xs }}>{filed.map(d => <DocumentRow key={d.id} name={d.name} expires={d.summary} status={d.status} onPress={() => openDocument(d.id)} />)}</View></Section>
    </Screen>;
  }
  if (screen === 'docdetail') {
    const passport = document.id === 'passport', removed = !!data.flags[`document-removed-${document.id}`];
    const monthsToExpiry = document.expiresISO ? Math.max(0, (Number(document.expiresISO.slice(0, 4)) - Number(seed.date.slice(0, 4))) * 12 + Number(document.expiresISO.slice(5, 7)) - Number(seed.date.slice(5, 7))) : undefined;
    return <Screen screen={screen} title={document.name} action={{ kind: 'icon', icon: 'ellipsis-horizontal', label: 'Document actions', onPress: () => flag('document-actions') }}>
      <View style={{ gap: space.sm }}>
        <Text variant="callout" tone="ink2">Expires</Text><Text variant="headline">{document.expires}</Text>
        <StatusPill label={monthsToExpiry === undefined ? 'Saved date' : `In ${monthsToExpiry} months`} />
        <Text variant="title">{`Reminder planned for ${document.actFrom}`}</Text>
        <Text variant="body" tone="ink2">{passport ? 'Six months before expiry, with time to spare for summer travel.' : 'Review the saved date and renewal requirements before you act.'}</Text>
      </View>
      <Section title="When you renew"><Rows rows={passport ? [{ title: 'Renew online', sub: 'GOV.UK · about 3 weeks', onPress: () => flag('renew-passport-preview', true) }, { title: 'Cost', sub: 'Check the current fee on GOV.UK' }] : [{ title: 'Renewal details', sub: 'Check timing and fees with the issuer' }, { title: 'Reference', value: document.reference }]} /></Section>
      {passport && data.flags['renew-passport-preview'] ? <LocalNotice text="Online renewal is not connected in this preview. Visit GOV.UK to check passport fees and apply; no application has been opened or sent." /> : null}
      <Section title="Your copy"><Rows rows={[{ title: removed ? 'Copy marked for removal' : passport ? 'Photo page' : 'Document copy', sub: removed ? 'Local preview · you can undo this below' : 'Sample copy · encrypted storage planned', value: removed ? 'Removed locally' : 'Saved locally' }]} /></Section>
      {data.flags['document-actions'] ? <Rows rows={[{ title: 'Scan a new copy', to: 'scan' }, { title: removed ? 'Undo removal' : 'Remove this copy', onPress: () => { flag(`document-removed-${document.id}`, !removed); flag('document-removed', !removed); } }]} /> : null}
      <LocalNotice text="Sample document · encrypted file storage, scheduled reminders and online renewal are Track B." />
    </Screen>;
  }
  return <Screen screen={screen} title="Car insurance">
    <Card style={{ gap: space.sm }}><StatusPill label="Best window" /><Text variant="headline">Compare from 22 January</Text><Text variant="body" tone="ink2">Prices are usually lowest around three weeks before renewal.</Text><Ticks count={10} filled={3} /></Card>
    <View style={{ gap: space.xs }}><Text variant="callout" tone="ink2">Renews 14 February</Text><MoneyFigure value={seed.finance.insuranceRenewal} decimals={0} hidden={data.prefs.hideBalances} align="left" size="l" /><Text variant="callout" tone="ink2">a year with your current insurer</Text></View>
    <Section title="Before renewal"><Checklist items={[{ label: 'Turn off auto-renew', sub: 'By 13 February', done: !!data.flags['renew-auto'] }, { label: 'Compare quotes', sub: 'From 22 January', done: !!data.flags['renew-compare'] }, { label: 'Switch or haggle', sub: 'Your insurer often matches', done: !!data.flags['renew-switch'] }]} onToggle={i => flag(['renew-auto', 'renew-compare', 'renew-switch'][i])} /></Section>
    <LocalNotice text="These checks update your local plan only; nothing changes with your insurer." />
  </Screen>;
}
