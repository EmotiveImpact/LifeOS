import { PhoneApp } from '@life/phone';
import { WebAppShell } from './components/WebAppShell';
import { LifeInspector, StateRail } from './components/StudioSidebar';

export function WebApp({ defaultViewMode = 'app' }: { defaultViewMode?: 'phone' | 'app' } = {}) {
  return (
    <PhoneApp
      defaultViewMode={defaultViewMode}
      renderWebShell={(ctx) => <WebAppShell {...ctx} />}
      renderStudioRail={(ctx) => <StateRail {...ctx} />}
      renderStudioInspector={(ctx) => <LifeInspector {...ctx} />}
    />
  );
}

export default WebApp;
