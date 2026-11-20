/**
 * Your people and dates. Every screen is the V26 build in `v26/people.tsx`; this switch keeps the routes' entry point.
 * The birthday on Today (`birthdaynudge`) is a card inside Today, not a route.
 */
import type { ScreenKey } from '@/navigation/screens';
import { AddpersonV26, DatesV26, PeopleV26, PersonV26 } from './v26/people';

export function PeopleScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'people': return <PeopleV26 />;
    case 'person': return <PersonV26 />;
    case 'addperson': return <AddpersonV26 />;
    default: return <DatesV26 />;
  }
}
