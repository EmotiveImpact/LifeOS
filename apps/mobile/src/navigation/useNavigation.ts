import { useRouter, type Href } from 'expo-router';
import { screens, type ScreenKey } from './screens';
export function useNavigation() {
  const router = useRouter();
  return {
    go: (key: ScreenKey, params?: Record<string, string>) => {
      const route = screens[key].route;
      if (route) router.push((params ? { pathname: route, params } : route) as Href);
    },
    replace: (key: ScreenKey) => { const route = screens[key].route; if (route) router.replace(route as Href); },
    close: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/today' as Href); },
    home: () => router.replace('/(tabs)/today' as Href),
  };
}
