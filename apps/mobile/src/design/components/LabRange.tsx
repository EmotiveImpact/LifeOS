import { View } from 'react-native';
import { Text } from '../Text';
import { space } from '../tokens';
import { RangeBar, type RangeSegment } from './Lists';

/** Reference intervals are supplied by the report, never inferred as clinical cutoffs.
 * previewPosition is explicitly a board example, not an actual lab interval. */
export function LabRange({ value, unit, low, high, previewPosition }: { value: number; unit: string; low?: number; high?: number; previewPosition?: number }) {
  const hasLow = typeof low === 'number' && Number.isFinite(low), hasHigh = typeof high === 'number' && Number.isFinite(high);
  const valid = Number.isFinite(value) && (hasLow || hasHigh) && !(hasLow && hasHigh && low >= high);
  if (!valid) return <View style={{ gap: space.xs }}>{previewPosition !== undefined ? <RangeBar value={previewPosition} segments={[{ label: '', from: 0, to: 25, tone: 'ember' }, { label: ' ', from: 25, to: 75, tone: 'gain' }, { label: '  ', from: 75, to: 100, tone: 'ember' }]} /> : <RangeBar value={0} labels={[]} showMarker={false} />}<Text variant="callout" tone="ink2">{previewPosition !== undefined ? 'Illustrative preview · lab interval not supplied' : 'Lab reference interval not supplied'}</Text></View>;
  const span = hasLow && hasHigh ? high - low : Math.max(1, Math.abs(value), Math.abs(low ?? high ?? 0));
  const min = Math.min(value, low ?? value, high ?? value) - span / 4;
  const max = Math.max(value, low ?? value, high ?? value) + span / 4;
  const bands: RangeSegment[] = hasLow && hasHigh ? [{ label: 'Below', from: min, to: low, tone: 'ember' }, { label: 'Lab interval', from: low, to: high, tone: 'gain' }, { label: 'Above', from: high, to: max, tone: 'ember' }] : [{ label: '', from: min, to: max, tone: 'neutral' }];
  return <View style={{ gap: space.xs }} accessibilityLabel={`Result ${value} ${unit}; lab reference ${hasLow ? low : 'no lower bound'} to ${hasHigh ? high : 'no upper bound'}`}><RangeBar value={value} min={min} max={max} segments={bands} /><Text variant="callout" tone="ink2">{`Lab reference: ${hasLow && hasHigh ? `${low}–${high}` : hasLow ? `≥ ${low}` : `≤ ${high}`} ${unit}`}</Text></View>;
}
