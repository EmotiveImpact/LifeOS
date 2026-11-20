/**
 * Teach me. Every screen is the V26 build in `v26/teach.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { BiteV26, BitedrawnV26, GapsV26, GotitV26, LessonreadyV26, LessonrecapV26, PredictV26, PuzzleV26, TeachOfferV26, TellbackV26 } from './v26/teach';

export function TeachScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'lessonready': return <LessonreadyV26 />;
    case 'bite': return <BiteV26 />;
    case 'predict': return <PredictV26 />;
    case 'puzzle': return <PuzzleV26 />;
    case 'lessonrecap': return <LessonrecapV26 />;
    case 'tellback': return <TellbackV26 />;
    case 'gaps': return <GapsV26 />;
    case 'gotit': return <GotitV26 />;
    case 'bitedrawn': return <BitedrawnV26 />;
    default: return <TeachOfferV26 />;
  }
}
