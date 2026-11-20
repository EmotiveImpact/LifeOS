import { useRouter, type Href } from 'expo-router';
import { useSeed } from '@/state/SeedProvider';
import { screens, type ScreenKey } from './screens';
import { runWebExit } from './webExit';
const cameraRoutes: ScreenKey[] = ['snap', 'barcode', 'labelscan', 'scan'];
export function useNavigation() {
  const router = useRouter(), { data } = useSeed();
  return {
    go: (key: ScreenKey, params?: Record<string, string>) => {
      let target = key, nextParams = params;
      if (key === 'talk' && !data.flags['mic-preview']) target = data.choices['mic-permission'] === 'declined' ? 'chat' : 'micprimer';
      if (cameraRoutes.includes(key) && !data.flags['camera-preview'] && data.choices['camera-permission'] !== 'declined') { target = 'camprimer'; nextParams = { ...params, next: key }; }
      if (key === 'calendar' && !data.flags['calendar-preview'] && data.choices['calendar-permission'] !== 'declined') { target = 'calprimer'; nextParams = { ...params, next: key }; }
      const route = screens[target].route;
      if (route) router.push((nextParams ? { pathname: route, params: nextParams } : route) as Href);
    },
    replace: (key: ScreenKey) => { const route = screens[key].route; if (route) router.replace(route as Href); },
    // In the web preview the page animates out first (webExit.ts); on a phone this runs at once.
    close: () => runWebExit(() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/today' as Href); }),
    home: () => router.replace('/(tabs)/today' as Href),
  };
}
