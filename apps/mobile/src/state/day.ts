import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDayKey } from './dayCore';
export { aimReadKey, isOnLocalDay, localDayKey } from './dayCore';
/** Refresh at greeting boundaries/midnight and on foreground, without polling. */
export function useLocalDay() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const current = new Date();
      setNow(current);
      clearTimeout(timer);
      const boundary = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours() < 12 ? 12 : current.getHours() < 18 ? 18 : 24);
      timer = setTimeout(refresh, Math.max(1, boundary.getTime() - current.getTime()));
    };
    refresh();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  return { now, day: localDayKey(now) };
}
