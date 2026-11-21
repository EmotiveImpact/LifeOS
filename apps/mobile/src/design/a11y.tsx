import { Children, isValidElement, type ReactNode } from 'react';
import { View, type AccessibilityActionEvent, type AccessibilityActionInfo } from 'react-native';

/**
 * A control that sits inside a row or card which VoiceOver and TalkBack read as one element (a switch at the end of a
 * settings row, a round + on a meal photo). On iPhone the children of an accessible element can't be reached, so the
 * row has to offer the control itself: as a switch when the row is only a label, or as a named action otherwise.
 */
export type NestedControl =
  | { kind: 'switch'; value: boolean; set: (value: boolean) => void; disabled?: boolean }
  | { kind: 'action'; label: string; run: () => void };

/** Reads the control out of a `right` or `topRight` slot: a switch (`value` + `onChange`) or a labelled button. */
export function nestedControl(node: ReactNode): NestedControl | null {
  if (!isValidElement(node)) return null;
  const p = node.props as Record<string, unknown>;
  if (p.disabled === true && typeof p.onPress === 'function') return null;
  if (typeof p.onChange === 'function' && typeof p.value === 'boolean') return { kind: 'switch', value: p.value, set: p.onChange as (value: boolean) => void, disabled: p.disabled === true };
  const label = typeof p.label === 'string' ? p.label : typeof p.accessibilityLabel === 'string' ? p.accessibilityLabel : '';
  if (typeof p.onPress === 'function' && label) return { kind: 'action', label, run: p.onPress as () => void };
  return null;
}

/** Keeps a control out of the screen reader's way when the row or card around it already offers it. Touch is unchanged. */
export function Unread({ children }: { children: ReactNode }) {
  return <View aria-hidden>{children}</View>;
}

/**
 * Screen-reader props for a row or card that holds a nested action: the action is listed by name (swipe up or down
 * with VoiceOver, the actions menu on TalkBack), and a double tap still does what the row itself does.
 */
export function nestedActionProps(control: NestedControl | null, onPress?: () => void): { accessibilityActions?: AccessibilityActionInfo[]; onAccessibilityAction?: (e: AccessibilityActionEvent) => void } {
  if (!control || control.kind !== 'action') return {};
  return {
    accessibilityActions: [...(onPress ? [{ name: 'activate' }] : []), { name: 'nested', label: control.label }],
    onAccessibilityAction: e => {
      if (e.nativeEvent.actionName === 'nested') control.run();
      else if (e.nativeEvent.actionName === 'activate') onPress?.();
    },
  };
}

/**
 * Whether something holds a control of its own (a button, a switch, a field, a set of choices). A card or tile that
 * holds one can't be read as a single element, or VoiceOver would never reach the control: its parts are read one
 * by one instead.
 */
export function containsControl(node: ReactNode, depth = 0): boolean {
  if (depth > 6) return false;
  let found = false;
  Children.forEach(node, child => {
    if (found || !isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    if (['onPress', 'onChange', 'onChangeText', 'onToggle', 'onScrub'].some(k => typeof p[k] === 'function')) found = true;
    else if (p.children !== undefined) found = containsControl(p.children as ReactNode, depth + 1);
  });
  return found;
}

/** The first control inside a pressable card, to offer as a named action on the card (see `nestedActionProps`). */
export function findControl(node: ReactNode, depth = 0): NestedControl | null {
  if (depth > 6) return null;
  let found: NestedControl | null = null;
  Children.forEach(node, child => {
    if (found || !isValidElement(child)) return;
    found = nestedControl(child) ?? ((child.props as { children?: ReactNode }).children !== undefined ? findControl((child.props as { children?: ReactNode }).children, depth + 1) : null);
  });
  return found;
}
