import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { feedback, type FeedbackKind } from './feedback';
import { springs } from './tokens';
import { useCalmMotion } from './theme';

const APressable = Animated.createAnimatedComponent(Pressable);

export type PressProps = Omit<PressableProps, 'style' | 'children'> & {
  /** Which haptic/sound fires on press. `null` for none. Defaults to a selection tick. */
  haptic?: FeedbackKind | null;
  /** How far it shrinks while held. DESIGN.md §7: 0.97. */
  pressScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Everything tappable in life is built on this: it scales to 0.97 on a spring while held,
 * fires the right haptic, and exposes a 44pt-friendly accessible button. No opacity flashes.
 */
export function Press({ haptic = 'select', pressScale = 0.97, style, onPressIn, onPressOut, onPress, children, ...rest }: PressProps) {
  const calm = useCalmMotion();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <APressable
      accessibilityRole="button"
      {...rest}
      onPressIn={(e) => {
        scale.value = calm || rest.disabled ? 1 : withSpring(pressScale, springs.snappy);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, springs.snappy);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) feedback[haptic]();
        onPress?.(e);
      }}
      style={[style, anim]}
    >
      {children}
    </APressable>
  );
}
