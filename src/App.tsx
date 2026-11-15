import { PhoneApp } from '@life/phone';
import { WebAppShell, StateRail, LifeInspector } from '@life/web';

/**
 * Root composition entry for the `life` Phone-First Monorepo.
 * Defaults directly to Phone mode (`apps/phone`) while keeping Web (`apps/web`)
 * and Studio 13-state inspection 1-tap away on wider viewports.
 */
export function App() {
  return (
    <PhoneApp
      defaultViewMode="phone"
      renderWebShell={(ctx) => <WebAppShell {...ctx} />}
      renderStudioRail={(ctx) => <StateRail {...ctx} />}
      renderStudioInspector={(ctx) => <LifeInspector {...ctx} />}
    />
  );
}

export default App;
