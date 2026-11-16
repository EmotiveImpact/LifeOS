import type { SharedValue } from 'react-native-reanimated';
import type { Change, Scene } from './types';
export type SceneViewProps = {
  scene?: Scene;
  changes?: Change[];
  device?: string;
  labels?: string[];
  values?: string[];
  handDrawn?: boolean;
  progress?: number;
  value?: SharedValue<number>;
  build?: SharedValue<number>;
  moving?: SharedValue<number>;
  caption?: string;
  accessibilityLabel?: string;
};
export function sceneForDevice(device = 'flow', labels: string[] = ['Your pay', 'Tax-free part', 'Taxed at 20%'], values?: string[]): Scene {
  switch (device) {
    case 'cycle': return { family: 'radial', centre: '', spokes: labels, lit: 1, cycle: true };
    case 'compare': return { family: 'compare', style: 'bars', items: labels.map((label, i) => ({ label: `${label}${values?.[i] ? ` · ${values[i]}` : ''}`, value: i ? 92 : 96 })) };
    case 'layers': return { family: 'layers', layers: labels, style: 'stack', at: 2, whole: '' };
    case 'timeline': return { family: 'timeline', events: labels.map((label, i) => ({ label, when: '', t: i / Math.max(1, labels.length - 1) })), scale: 'even', at: .66 };
    case 'venn': return { family: 'venn', a: labels[0] ?? 'What you love', b: labels[1] ?? 'What pays', both: 'Your work', overlap: .5 };
    case 'funnel': return { family: 'funnel', stages: labels.map((label, i) => ({ label, value: [240, 40, 6, 1][i] ?? 1 })), lit: labels.length - 1 };
    case 'things': return { family: 'things', layout: 'row', items: ['coin', 'house', 'person', 'clock'].map((thing, i) => ({ thing, label: labels[i] ?? '', size: 1 })), lit: 1 };
    default: return { family: 'links', layout: 'line', nodes: labels, boxes: labels.map((label, i) => ({ label, value: values?.[i] })), links: labels.slice(1).map((_, i) => ({ from: i, to: i + 1, kind: 'flow' })) };
  }
}
