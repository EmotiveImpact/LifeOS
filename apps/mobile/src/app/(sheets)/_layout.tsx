import { Stack } from 'expo-router';
import { useTokens } from '@/design';
export default function SheetsLayout() { const t = useTokens(); return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.surface }, animation: 'fade' }} />; }
