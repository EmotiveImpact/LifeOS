import { Image, ScrollView, View } from 'react-native';
import { Button, Card, Text, radius, space } from '@/design';
import type { Attachment } from '@life/brain';

/** A bounded attachment rail; several files never push the composer or the
 * conversation off the screen. Original files are not uploaded implicitly. */
export function ConversationAttachments({ attachments, onRemove }: { attachments: Attachment[]; onRemove: (attachment: Attachment) => void }) {
  if (!attachments.length) return null;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: space.xxxl * 3, flexGrow: 0 }} contentContainerStyle={{ gap: space.sm }}>
    {attachments.map(attachment => <Card key={attachment.id} padding={space.sm} style={{ width: space.xxxl * 4, gap: space.xxs }}>
      {attachment.mime.startsWith('image/') ? <Image accessibilityLabel={attachment.name} source={{ uri: attachment.uri }} resizeMode="cover" style={{ height: space.xxxl, width: '100%', borderRadius: radius.sm }} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>{attachment.name}</Text><Button variant="link" label="Remove" onPress={() => onRemove(attachment)} /></View>
      <Text variant="callout" tone="ink2">{attachment.status === 'ready' ? 'Text ready · on this phone' : 'Attached · reader unavailable'}</Text>
    </Card>)}
  </ScrollView>;
}
