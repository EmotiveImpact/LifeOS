import { useState } from 'react';
import { getGrowthTimeline, preferenceSnapshot, saveGrowthCheckIn, snoozeGrowthReview } from '@life/core/growth';
import type { GrowthCheckInId, GrowthPlan } from '@life/core/types';
import { fieldSurface } from './SheetControls';

export type GrowthPanelProps = {
  plan: GrowthPlan;
  darkMode: boolean;
  today: string;
  onSave: (plan: GrowthPlan) => void;
};

export function GrowthCheckIns({ plan, darkMode, today, onSave, active, onOpen, onChoosePath }: GrowthPanelProps & {
  active?: GrowthCheckInId;
  onOpen: (id?: GrowthCheckInId) => void;
  onChoosePath: () => void;
}) {
  const timeline = getGrowthTimeline(plan, today);
  const selected = timeline.find((item) => item.id === active);
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const button = darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white';

  return selected ? (
    <CheckInForm key={selected.id} plan={plan} item={selected} darkMode={darkMode} today={today} onSave={onSave} onClose={() => onOpen()} onChoosePath={onChoosePath} />
  ) : (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed">One check-in opens each day for six days. You can go ahead, skip a topic or come back when it suits you.</p>
      {timeline.map((item) => (
        <section key={item.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-[18px] p-3.5 ${card}`}>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold">{item.label}{item.optional && <span className="ml-2 text-[13px] font-normal opacity-70">Optional</span>}</h3>
            <p className="mt-0.5 text-[13px] opacity-75">
              {item.reviewDue ? 'Ready to revisit'
                : item.last ? `Last checked ${item.last.on}`
                  : item.skipped ? 'Skipped'
                    : item.available ? 'Ready when you are' : `Opens ${item.availableOn}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!item.last && !item.skipped && (
              <button type="button" className="rounded-full px-2 py-1.5 text-[13px] underline underline-offset-2"
                onClick={() => onSave({ ...plan, skippedCheckIns: [...(plan.skippedCheckIns ?? []), item.id] })}>Skip</button>
            )}
            <button type="button" className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${button}`}
              onClick={() => onOpen(item.id)}>
              {item.last ? 'Revisit' : item.available ? 'Open' : 'Open early'}
              <span className="sr-only"> {item.label}</span>
            </button>
          </div>
        </section>
      ))}
      <section className={`rounded-[18px] p-3.5 ${card}`}>
        <label className="block text-[13px]">
          How often to suggest a review
          <select value={plan.cadenceDays} onChange={(event) => onSave({
            ...plan, cadenceDays: Number(event.currentTarget.value) as GrowthPlan['cadenceDays'], snoozeUntil: undefined,
          })} className={fieldSurface(darkMode)}>
            <option value={14}>Every two weeks</option>
            <option value={30}>About once a month</option>
            <option value={60}>Every two months</option>
            <option value={0}>Only when I choose</option>
          </select>
        </label>
        {timeline.some((item) => item.reviewDue) && (
          <button type="button" className="mt-2 text-[13px] font-medium underline underline-offset-2" onClick={() => onSave(snoozeGrowthReview(plan, today))}>Remind me in a week</button>
        )}
      </section>
    </div>
  );
}

function CheckInForm({ plan, item, darkMode, today, onSave, onClose, onChoosePath }: GrowthPanelProps & {
  item: ReturnType<typeof getGrowthTimeline>[number];
  onClose: () => void;
  onChoosePath: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const previous = plan.checkIns?.[item.id] ?? [];
  const last = previous[previous.length - (submitted ? 2 : 1)];
  const typedPreferences = item.id === 'preferences' ? preferenceSnapshot(answers) : null;
  const priorPreferences = item.id === 'preferences' && last ? preferenceSnapshot(last.answers) : null;
  const hasChoices = item.prompts.every((prompt) => Boolean(prompt.options));
  const canSave = hasChoices
    ? item.prompts.every((prompt) => answers[prompt.id] !== undefined)
    : item.prompts.some((prompt) => answers[prompt.id]?.trim());
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const button = darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white';
  const id = item.id;

  return (
    <div className="space-y-3">
      <button type="button" className="text-[13px] font-medium underline underline-offset-2" onClick={onClose}>All check-ins</button>
      <h3 className="font-serif-editorial text-[26px] leading-tight">{item.label}</h3>
      <p className="text-[13px] leading-relaxed opacity-80">{item.intro}</p>
      {submitted ? (
        <div className={`space-y-3 rounded-[20px] p-4 text-[13px] ${card}`} aria-live="polite">
          {typedPreferences && (
            <>
              <p>Your current preferences lean toward</p>
              <p className="font-serif-display text-[32px] leading-none">{typedPreferences.code}</p>
              <p>{typedPreferences.labels.join(' · ')}</p>
              {priorPreferences && <p>Your previous snapshot leaned toward {priorPreferences.code}.</p>}
              <p>These preferences can shift with your situation. {typedPreferences.practiceTip}</p>
            </>
          )}
          {id === 'reasoning' && (
            <>
              <p className="font-semibold">{item.prompts.filter((prompt) => Number(answers[prompt.id]) === prompt.correct).length} of {item.prompts.length} exercises correct</p>
              <ul className="list-disc space-y-2 pl-4">{item.prompts.map((prompt) => <li key={prompt.id}>{prompt.explanation}</li>)}</ul>
            </>
          )}
          {id !== 'preferences' && id !== 'reasoning' && <p>Your reflection is saved. Try one change you can observe this week.</p>}
          {last && id !== 'preferences' && id !== 'reasoning' && <p className="opacity-75">Previous reflection · {last.on}</p>}
          <button type="button" onClick={id === 'preferences' && !plan.path ? onChoosePath : onClose} className={`rounded-full px-3 py-1.5 font-semibold ${button}`}>
            {id === 'preferences' && !plan.path ? 'Choose your path' : 'Done'}
          </button>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={(event) => {
          event.preventDefault();
          if (!canSave) return;
          onSave(saveGrowthCheckIn(plan, id, Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, value.trim()])), today));
          setSubmitted(true);
        }}>
          {item.prompts.map((prompt) => (
            <div key={prompt.id} className={`rounded-[17px] p-3.5 ${card}`}>
              {prompt.options ? (
                <fieldset className="space-y-2">
                  <legend className="mb-2 text-[14px] font-semibold leading-snug">{prompt.text}</legend>
                  {prompt.options.map((option, index) => (
                    <label key={option} className="flex items-start gap-2 text-[13px]">
                      <input type="radio" name={`${id}-${prompt.id}`} value={index} checked={answers[prompt.id] === String(index)}
                        onChange={() => setAnswers({ ...answers, [prompt.id]: String(index) })} className="mt-0.5 accent-[#2347D8]" />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ) : (
                <label className="block text-[14px] font-semibold leading-snug">
                  {prompt.text}
                  <textarea rows={2} maxLength={600} value={answers[prompt.id] ?? ''} className={`${fieldSurface(darkMode)} font-normal`}
                    onChange={(event) => setAnswers({ ...answers, [prompt.id]: event.currentTarget.value })} />
                </label>
              )}
              {last?.answers[prompt.id] && !prompt.options && (
                <details className="mt-2 text-[13px] opacity-80">
                  <summary className="cursor-pointer">Your previous answer</summary>
                  <p className="mt-1 whitespace-pre-wrap break-words">{last.answers[prompt.id]}</p>
                </details>
              )}
            </div>
          ))}
          <button type="submit" disabled={!canSave} className={`rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-45 ${button}`}>Save check-in</button>
        </form>
      )}
    </div>
  );
}
