import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GROWTH_LESSONS, RESET_STEPS, isGrowthProgressReviewDue, snoozeGrowthReview, startGrowthPlan } from '@life/core/growth';
import { localDateString } from '@life/core/engine';
import type { GrowthCheckInId, GrowthPath, GrowthPlan, LessonDepth, LessonId, UserProfile } from '@life/core/types';
import { fieldSurface } from './SheetControls';
import { GrowthCheckIns } from './GrowthCheckIns';
import type { GrowthPanelProps } from './GrowthCheckIns';

const PATHS: Array<{ id: GrowthPath; title: string; description: string }> = [
  { id: 'reset', title: 'Fix my life', description: 'Make tomorrow a little easier with a five-minute reset.' },
  { id: 'goal', title: 'Build toward a goal', description: 'Choose what would change and how you’ll recognise progress.' },
  { id: 'learn', title: 'Learn a skill', description: 'Try a short lesson and explain it in your own words.' },
];

const DEPTHS: Array<[LessonDepth, string]> = [
  ['starter', 'Quick idea'], ['practice', 'Try it'], ['deep', 'Go deeper'],
];

export function GrowthPathSheet({ profile, darkMode, initialTab = 'plan', onUpdateProfile, onClose }: {
  profile: UserProfile;
  darkMode: boolean;
  initialTab?: 'plan' | 'check-ins' | 'learn';
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'plan' | 'check-ins' | 'learn'>(initialTab);
  const [active, setActive] = useState<GrowthCheckInId>();
  const [lessonId, setLessonId] = useState<LessonId>();
  const [clearOpen, setClearOpen] = useState(false);
  const plan = profile.growth;
  const today = localDateString();
  const save = (growth: GrowthPlan) => onUpdateProfile({ growth });
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const mainButton = darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white';
  const initialDone = Boolean(plan?.checkIns?.preferences?.length || plan?.skippedCheckIns?.includes('preferences'));

  const openCheckIn = (id: GrowthCheckInId) => {
    setActive(id);
    setTab('check-ins');
  };
  const openLesson = (id: LessonId) => {
    setLessonId(id);
    setTab('learn');
  };
  const start = (skip: boolean) => {
    const fresh = startGrowthPlan(today);
    save(skip ? { ...fresh, skippedCheckIns: ['preferences'] } : fresh);
    if (!skip) openCheckIn('preferences');
  };

  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/35"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-label="Your growth plan" aria-modal="true"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
        className={`no-scrollbar max-h-[90%] overflow-y-auto rounded-t-[28px] px-5 py-5 ${darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]'}`}>
        <div className={`sticky top-0 z-10 -mx-5 flex items-start justify-between gap-3 px-5 pb-2 pt-1 ${darkMode ? 'bg-[#16161B]' : 'bg-white'}`}>
          <h2 className="font-serif-display text-[32px] leading-tight">{plan?.path === 'reset' ? 'Fix my life' : 'Your growth plan'}</h2>
          <button type="button" aria-label="Close growth plan" onClick={onClose} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${card}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {!plan ? (
          <section className={`mt-4 rounded-[22px] p-4 ${card}`}>
            <h3 className="font-serif-editorial text-[23px]">Find your starting point</h3>
            <p className="mt-2 text-[13px] leading-relaxed">A short preferences check-in can help you choose a way to plan and learn. Then pick a reset, a goal or a skill to work on.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
              <button type="button" onClick={() => start(false)} className={`rounded-full px-4 py-2 ${mainButton}`}>Start preferences check-in</button>
              <button type="button" onClick={() => start(true)} className="underline underline-offset-2">Skip to paths</button>
            </div>
          </section>
        ) : (
          <>
            <div className={`mt-4 grid grid-cols-3 gap-1 rounded-[16px] p-1 ${card}`}>
              {([
                ['plan', 'Plan'], ['check-ins', 'Check-ins'], ['learn', 'Learn'],
              ] as const).map(([key, label]) => (
                <button type="button" key={key} aria-pressed={tab === key} onClick={() => setTab(key)}
                  className={`rounded-xl px-2 py-2 text-[13px] font-semibold ${tab === key ? 'bg-white text-[#141416]' : 'opacity-80'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {tab === 'check-ins' && <GrowthCheckIns plan={plan} darkMode={darkMode} today={today} onSave={save} active={active} onOpen={setActive} onChoosePath={() => { setActive(undefined); setTab('plan'); }} />}
              {tab === 'learn' && <GrowthLearning plan={plan} darkMode={darkMode} today={today} onSave={save} lessonId={lessonId} onSelect={setLessonId} />}
              {tab === 'plan' && (
                <>
                  {!initialDone ? (
                    <section className={`rounded-[20px] p-4 text-[13px] ${card}`}>
                      <p>Finish the short preferences check-in or go straight to choosing a path.</p>
                      <button type="button" onClick={() => openCheckIn('preferences')} className={`mt-3 rounded-full px-4 py-2 font-semibold ${mainButton}`}>Continue check-in</button>
                      <button type="button" onClick={() => save({ ...plan, skippedCheckIns: [...(plan.skippedCheckIns ?? []), 'preferences'] })} className="ml-3 underline underline-offset-2">Skip to paths</button>
                    </section>
                  ) : (
                    <>
                      {!plan.path ? (
                        <section className="space-y-2">
                          <h3 className="font-serif-editorial text-[24px]">Where would you like to start?</h3>
                          {PATHS.map(({ id, title, description }) => (
                            <button key={id} type="button" onClick={() => { save({ ...plan, path: id }); if (id === 'learn') setTab('learn'); }}
                              className={`block w-full rounded-[19px] p-4 text-left ${card}`}>
                              <span className="block text-[15px] font-semibold">{title}</span>
                              <span className="mt-1 block text-[13px] opacity-80">{description}</span>
                            </button>
                          ))}
                        </section>
                      ) : (
                        <GrowthActions key={plan.path} plan={plan} darkMode={darkMode} today={today} onSave={save} onLesson={openLesson} />
                      )}
                      {Object.values(profile.recordedOutcomes ?? {}).length > 0 && (
                        <section className={`rounded-[18px] p-4 text-[13px] ${card}`}>
                          <h3 className="text-[14px] font-semibold">Recent outcomes from your plan</h3>
                          <ul className="mt-2 list-disc space-y-1 pl-4">
                            {Object.values(profile.recordedOutcomes ?? {}).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 3).map((outcome) => (
                              <li key={outcome.taskId} className="break-words">{outcome.summary}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {plan.path && <button type="button" onClick={() => save({ ...plan, path: undefined })} className="text-[13px] font-medium underline underline-offset-2">Choose a different path</button>}
                    </>
                  )}
                </>
              )}
            </div>
            <details className="mt-5 text-[13px] opacity-85">
              <summary className="cursor-pointer">Saved reflections and reading</summary>
              <p className="mt-2">Your growth plan and check-in answers are stored in this browser.</p>
              <ul className="mt-2 flex flex-wrap gap-3">
                <li><a href="https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1" target="_blank" rel="noreferrer" className="underline underline-offset-2">Dan Koe’s reflection prompts</a></li>
                <li><a href="https://www.oprah.com/app/iyanla-the-inside-fix.html" target="_blank" rel="noreferrer" className="underline underline-offset-2">Iyanla Vanzant on accountability</a></li>
                <li><a href="https://wp.nyu.edu/motivationlab/publications/peter-gollwitzer/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Gollwitzer’s if–then plans</a></li>
              </ul>
              {clearOpen ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => { onUpdateProfile({ growth: undefined }); setTab('plan'); setActive(undefined); setClearOpen(false); }}
                    className="font-semibold underline underline-offset-2">Confirm clear growth data</button>
                  <button type="button" onClick={() => setClearOpen(false)} className="underline underline-offset-2">Keep my entries</button>
                </div>
              ) : (
                <button type="button" onClick={() => setClearOpen(true)} className="mt-3 font-semibold underline underline-offset-2">Clear growth data</button>
              )}
            </details>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function GrowthActions({ plan, darkMode, today, onSave, onLesson }: GrowthPanelProps & { onLesson: (id: LessonId) => void }) {
  const [step, setStep] = useState(0);
  const [action, setAction] = useState('');
  const [cue, setCue] = useState('');
  const [editingAction, setEditingAction] = useState(false);
  const [result, setResult] = useState('');
  const [goal, setGoal] = useState(plan.direction?.goal ?? '');
  const [baseline, setBaseline] = useState(plan.direction?.baseline ?? '');
  const [measure, setMeasure] = useState(plan.direction?.measure ?? '');
  const [evidence, setEvidence] = useState('');
  const [nextDirection, setNextDirection] = useState('');
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const field = fieldSurface(darkMode);
  const button = `rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-45 ${darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'}`;
  const reset = plan.path === 'reset';
  const pending = plan.nextAction;
  const history = plan.records ?? [];
  const reviews = plan.reviews ?? [];
  const lastReview = reviews[reviews.length - 1];
  const lastAction = history[history.length - 1];
  const lastLesson = lastAction?.lessonId ? plan.lessons?.[lastAction.lessonId] : undefined;
  const lessonOffer = lastAction?.lessonId && !pending && (!lastLesson || lastLesson.on < lastAction.on || lastLesson.confidence === 'practise')
    ? lastAction.lessonId
    : undefined;
  const repeatDue = isGrowthProgressReviewDue(plan, today);
  const directionSaved = plan.direction?.goal === goal.trim()
    && plan.direction.baseline === baseline.trim() && plan.direction.measure === measure.trim();

  return (
    <div className="space-y-3">
      {reset && (
        <section className={`rounded-[20px] p-4 ${card}`}>
          <h3 className="font-serif-editorial text-[24px]">The reset</h3>
          <ol className="mt-2 space-y-2">
            {RESET_STEPS.map((part, index) => (
              <li key={part.lesson}>
                <button type="button" aria-pressed={step === index} onClick={() => setStep(index)}
                  className={`w-full rounded-xl p-2.5 text-left text-[13px] font-semibold ${step === index ? 'bg-white text-[#141416]' : ''}`}>
                  {index + 1}. {part.title}
                </button>
                {step === index && <p className="px-2.5 pb-1 pt-1.5 text-[13px] leading-snug opacity-80">{part.guidance}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {plan.path === 'goal' && (
        <form className={`space-y-3 rounded-[20px] p-4 ${card}`} onSubmit={(event) => {
          event.preventDefault();
          if (goal.trim()) onSave({ ...plan, direction: { goal: goal.trim(), baseline: baseline.trim(), measure: measure.trim() } });
        }}>
          <h3 className="font-serif-editorial text-[24px]">Choose a direction</h3>
          <label className="block text-[13px]">What would you like to change?
            <input value={goal} onChange={(event) => setGoal(event.currentTarget.value)} maxLength={200} className={field} />
          </label>
          <label className="block text-[13px]">What’s true today?
            <textarea value={baseline} onChange={(event) => setBaseline(event.currentTarget.value)} maxLength={600} rows={2} className={field} />
          </label>
          <label className="block text-[13px]">What could you observe to tell it’s working?
            <input value={measure} onChange={(event) => setMeasure(event.currentTarget.value)} maxLength={200} className={field} />
          </label>
          <button type="submit" className={button} disabled={!goal.trim()}>Save direction</button>
          {directionSaved && <p className="text-[13px]" aria-live="polite">Direction saved</p>}
        </form>
      )}
      {plan.path === 'learn' && <button type="button" onClick={() => onLesson('check-the-evidence')} className={button}>Open a lesson</button>}

      {pending && !editingAction ? (
        <form className={`space-y-2.5 rounded-[20px] p-4 ${card}`} onSubmit={(event) => {
          event.preventDefault();
          if (!result.trim()) return;
          onSave({
            ...plan, nextAction: undefined,
            records: [...history, { id: `${Date.now()}-${history.length}`, on: today, action: pending.text, outcome: result.trim(), lessonId: pending.lessonId }],
          });
          setResult('');
        }}>
          <h3 className="text-[14px] font-semibold">Your planned action</h3>
          <p className="break-words text-[13px]">{pending.cue && `When ${pending.cue}, I’ll `}{pending.text}</p>
          <label className="block text-[13px]">What happened when you tried it?
            <textarea value={result} onChange={(event) => setResult(event.currentTarget.value)} maxLength={600} rows={2} className={field} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!result.trim()} className={button}>Record what happened</button>
            <button type="button" onClick={() => {
              const matchingStep = RESET_STEPS.findIndex((part) => part.lesson === pending.lessonId);
              if (matchingStep >= 0) setStep(matchingStep);
              setAction(pending.text);
              setCue(pending.cue);
              setEditingAction(true);
            }}
              className="text-[13px] underline underline-offset-2">Change action</button>
          </div>
        </form>
      ) : (
        <form className={`space-y-2.5 rounded-[20px] p-4 ${card}`} onSubmit={(event) => {
          event.preventDefault();
          if (!action.trim()) return;
          const lessonId = reset ? RESET_STEPS[step].lesson : pending?.lessonId ?? 'next-step';
          onSave({ ...plan, nextAction: { text: action.trim(), cue: cue.trim(), lessonId } });
          setEditingAction(false);
          setResult('');
          setAction('');
          setCue('');
        }}>
          <h3 className="text-[14px] font-semibold">{editingAction ? 'Edit your planned action' : 'Choose one action'}</h3>
          <label className="block text-[13px]">When will you do it? (Optional)
            <input value={cue} onChange={(event) => setCue(event.currentTarget.value)} placeholder="e.g. I finish lunch" maxLength={180} className={field} />
          </label>
          <label className="block text-[13px]">What will you do?
            <input value={action} onChange={(event) => setAction(event.currentTarget.value)} placeholder="e.g. put the bill due date in my calendar" maxLength={240} className={field} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!action.trim()} className={button}>{editingAction ? 'Save action' : 'Plan the action'}</button>
            {editingAction && <button type="button" onClick={() => setEditingAction(false)} className="text-[13px] underline underline-offset-2">Cancel</button>}
          </div>
        </form>
      )}
      {lessonOffer && (
        <button type="button" onClick={() => onLesson(lessonOffer)} className={`w-full rounded-[19px] p-4 text-left text-[13px] font-semibold ${card}`}>
          Continue with a short lesson · {GROWTH_LESSONS.find((lesson) => lesson.id === lessonOffer)?.title}
        </button>
      )}

      {(history.length > 0 || reviews.length > 0 || repeatDue) && (
        <section className={`space-y-3 rounded-[20px] p-4 ${card}`}>
          <h3 className="font-serif-editorial text-[24px]">Notice what’s changing</h3>
          {plan.direction && <p className="break-words text-[13px] opacity-80">{plan.direction.baseline && `You started with ${plan.direction.baseline}. `}{plan.direction.measure && `Look for ${plan.direction.measure}.`}</p>}
          {history.slice(-3).reverse().map((item) => (
            <div key={item.id} className={`rounded-xl p-3 text-[13px] ${darkMode ? 'bg-[#16161B]' : 'bg-white'}`}>
              <p className="font-semibold break-words">{item.action}</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{item.outcome}</p>
              <p className="mt-1 opacity-70">{item.on}</p>
            </div>
          ))}
          {lastReview && (
            <div className="space-y-1 text-[13px]">
              <p className="font-semibold">Last review · {lastReview.on}</p>
              <p className="whitespace-pre-wrap break-words">{lastReview.evidence}</p>
              <p className="break-words opacity-80">Next aim · {lastReview.nextDirection}</p>
            </div>
          )}
          <details open={repeatDue || undefined} className="text-[13px]">
            <summary className="cursor-pointer font-semibold">{repeatDue ? 'Your review is ready' : 'Review where you’re heading'}</summary>
            <form className="mt-2 space-y-2.5" onSubmit={(event) => {
              event.preventDefault();
              if (!evidence.trim() || !nextDirection.trim()) return;
              onSave({ ...plan, reviews: [...reviews, { on: today, evidence: evidence.trim(), nextDirection: nextDirection.trim() }] });
              setEvidence('');
              setNextDirection('');
            }}>
              <label className="block">What changed? Name something you noticed.
                <textarea value={evidence} onChange={(event) => setEvidence(event.currentTarget.value)} maxLength={600} rows={2} className={field} />
              </label>
              <label className="block">What do you want to aim at now?
                <input value={nextDirection} onChange={(event) => setNextDirection(event.currentTarget.value)} maxLength={250} className={field} />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={!evidence.trim() || !nextDirection.trim()} className={button}>Save review</button>
                {repeatDue && <button type="button" onClick={() => onSave(snoozeGrowthReview(plan, today))} className="underline underline-offset-2">Revisit in a week</button>}
              </div>
            </form>
          </details>
        </section>
      )}
    </div>
  );
}

function GrowthLearning({ plan, darkMode, today, onSave, lessonId, onSelect }: GrowthPanelProps & {
  lessonId?: LessonId;
  onSelect: (lesson: LessonId) => void;
}) {
  const lesson = GROWTH_LESSONS.find((option) => option.id === lessonId) ?? GROWTH_LESSONS[0];
  return (
    <div className="space-y-3">
      <label className="block text-[13px]">Choose a lesson
        <select value={lesson.id} onChange={(event) => onSelect(event.currentTarget.value as LessonId)} className={fieldSurface(darkMode)}>
          {GROWTH_LESSONS.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
        </select>
      </label>
      <LessonPractice key={lesson.id} lesson={lesson} plan={plan} darkMode={darkMode} today={today} onSave={onSave} />
    </div>
  );
}

function LessonPractice({ lesson, plan, darkMode, today, onSave }: GrowthPanelProps & { lesson: typeof GROWTH_LESSONS[number] }) {
  const stored = plan.lessons?.[lesson.id];
  const [depth, setDepth] = useState<LessonDepth>(stored?.depth ?? 'starter');
  const [explanation, setExplanation] = useState(stored?.explanation ?? '');
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const record = (confidence: 'practise' | 'ready') => {
    if (!explanation.trim()) return;
    onSave({ ...plan, lessons: { ...plan.lessons, [lesson.id]: { explanation: explanation.trim(), depth, confidence, on: today } } });
  };

  return (
    <section className={`space-y-3 rounded-[20px] p-4 ${card}`}>
      <h3 className="font-serif-editorial text-[24px]">{lesson.title}</h3>
      <div className="flex flex-wrap gap-2">
        {DEPTHS.map(([key, label]) => (
          <button type="button" aria-pressed={depth === key} key={key} onClick={() => setDepth(key)}
            className={`rounded-full px-2.5 py-1.5 text-[13px] font-semibold ${depth === key ? 'bg-white text-[#141416]' : ''}`}>{label}</button>
        ))}
      </div>
      <p className="text-[13px] leading-relaxed">{lesson.depths[depth]}</p>
      <label className="block text-[13px]">
        Teach it back in your own words
        <span className="mt-1 block opacity-80">{lesson.teachBack}</span>
        <textarea rows={3} value={explanation} onChange={(event) => setExplanation(event.currentTarget.value)} maxLength={800} className={fieldSurface(darkMode)} />
      </label>
      <details className="text-[13px]">
        <summary className="cursor-pointer font-semibold">Compare with an example</summary>
        <p className="mt-1">{lesson.example}</p>
      </details>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!explanation.trim()} onClick={() => record('ready')}
          className={`rounded-full px-3.5 py-2 text-[13px] font-semibold disabled:opacity-45 ${darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'}`}>Ready to use it</button>
        <button type="button" disabled={!explanation.trim()} onClick={() => record('practise')}
          className="rounded-full px-3 py-2 text-[13px] font-semibold underline underline-offset-2 disabled:opacity-45">Practise again later</button>
      </div>
      {stored && <p aria-live="polite" className="text-[13px]">{stored.confidence === 'ready' ? 'Saved as ready to use.' : 'Saved for more practice.'}</p>}
    </section>
  );
}
