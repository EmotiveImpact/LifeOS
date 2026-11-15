import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import type { ComponentProps, JSX } from 'react';
import type { ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconName; color: ColorValue }): JSX.Element {
  // RN 0.88 ColorValue also permits null and processed numbers, which Ionicons rejects.
  const iconColor = color === null || typeof color === 'number' ? undefined : color;
  return <Ionicons name={name} size={22} color={iconColor} />;
}

export default function TabsLayout(): JSX.Element {
  const bg = useThemeColor('surface');
  const fg = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: fg,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'layers' : 'layers-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
