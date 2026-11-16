import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { ChipGroup, Press, SceneView, Segmented, Text, space, radius, useTokens } from '@/design';
import { SCENE_EXAMPLES } from '@/learn/scene/examples';
import { THINGS } from '@/learn/scene/things';
export function FullDrawingGallery() {
  const [index, setIndex] = useState(0), [hand, setHand] = useState(false), [thing, setThing] = useState('house');
  const tokens = useTokens(), names = Object.keys(THINGS);
  return <View nativeID="full-drawing-kit" style={{ gap: space.md }}><Text variant="headline">Full drawing kit · 30 devices · {names.length} objects</Text><Segmented options={[{ value: 'clean', label: 'Clean lines' }, { value: 'hand', label: 'Hand-drawn' }]} value={hand ? 'hand' : 'clean'} onChange={v => setHand(v === 'hand')} /><ChipGroup options={SCENE_EXAMPLES.map((s, i) => ({ value: String(i), label: s.family }))} value={String(index)} onChange={v => setIndex(Number(v))} /><SceneView key={`${index}-${hand}`} scene={SCENE_EXAMPLES[index]} progress={1} handDrawn={hand} accessibilityLabel={`Full drawing kit: ${SCENE_EXAMPLES[index].family}`} /><Text variant="title">Every drawn object</Text><FlatList horizontal showsHorizontalScrollIndicator={false} data={names} keyExtractor={v => v} initialNumToRender={10} windowSize={3} renderItem={({ item }) => <Press onPress={() => setThing(item)} accessibilityLabel={`Draw ${item}`} accessibilityState={{ selected: thing === item }} style={{ paddingHorizontal: space.sm, minHeight: 44, marginRight: space.xs, justifyContent: 'center', borderRadius: radius.md, backgroundColor: item === thing ? tokens.ink : tokens.surface2 }}><Text variant="callout" style={{ color: item === thing ? tokens.canvas : tokens.ink }}>{item}</Text></Press>} /><SceneView key={`${thing}-${hand}`} scene={{ family: 'things', layout: 'row', items: [{ thing, label: thing.replace(/_/g, ' '), size: 1 }], lit: 0 }} handDrawn={hand} /></View>;
}
