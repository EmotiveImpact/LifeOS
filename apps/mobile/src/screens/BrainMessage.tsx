import { useState } from 'react';
import { View } from 'react-native';
import { Button, LifeReply, Text, UserBubble, space } from '@/design';
import type { Message } from '@life/brain';

export function BrainMessage({ message, onReview }: { message: Message; onReview: () => void }) {
  const [details, setDetails] = useState(false);
  if (message.role === 'user') return <UserBubble text={message.text} />;
  return <View style={{ gap: space.sm }}>
    <LifeReply segments={[{ text: message.text }]} />
    {message.proposals?.length ? <Button variant="secondary" label={`Review ${message.proposals.length} ${message.proposals.length === 1 ? 'change' : 'changes'}`} onPress={onReview} /> : null}
    {message.detail || message.sources?.length ? <Button variant="link" label={details ? 'Hide explanation' : 'Why this answer'} onPress={() => setDetails(value => !value)} /> : null}
    {details ? <View style={{ gap: space.sm }}>{message.detail ? <Text variant="body" tone="ink2">{message.detail}</Text> : null}{message.sources?.map(source => <Text key={source.id} variant="callout" tone="ink2">{`${source.sample ? 'Sample · ' : ''}${source.label}${source.at ? ` · ${new Date(source.at).toLocaleDateString('en-GB')}` : ''}`}</Text>)}</View> : null}
    {message.sources?.some(source => source.sample) ? <Text variant="callout" tone="ink2">Uses sample information from the current profile.</Text> : null}
    {message.route ? <Text variant="callout" tone="ink2">{message.route.startsWith('rules') ? 'From saved facts and life’s engine · on this phone' : message.route.startsWith('device') ? 'On-device AI' : 'AI-assisted · outside this phone'}</Text> : null}
  </View>;
}
