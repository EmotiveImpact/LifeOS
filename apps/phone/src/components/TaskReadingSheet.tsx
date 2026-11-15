import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { buildTaskReadingCards } from '@life/core/engine';
import type { CountryCode, LifeTask, RecordedOutcome } from '@life/core/types';
import { HousingDecisionTools } from './functions/HousingDecisionTools';

interface TaskReadingSheetProps {
  task: LifeTask;
  countryCode: CountryCode;
  darkMode?: boolean;
  isCompleted: boolean;
  recordedOutcome?: RecordedOutcome;
  checkedSteps: number[];
  onToggleStep: (idx: number) => void;
  onComplete: (outcomeNote?: string) => void;
  onAskAboutTask?: (task: LifeTask) => void;
  onClose?: () => void;
  showDragHandle?: boolean;
}

export const TaskReadingSheet: React.FC<TaskReadingSheetProps> = ({
  task,
  countryCode,
  darkMode = false,
  isCompleted,
  recordedOutcome,
  checkedSteps,
  onToggleStep,
  onComplete,
  onAskAboutTask,
  onClose,
  showDragHandle = true,
}) => {
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [outcomeNote, setOutcomeNote] = useState(recordedOutcome?.summary ?? '');

  useEffect(() => {
    setOutcomeNote(recordedOutcome?.summary ?? '');
  }, [task.id, recordedOutcome?.summary]);

  const readingCards = buildTaskReadingCards(task);

  const handleCopyDraft = () => {
    if (!task.copilotDraft) return;
    try {
      navigator.clipboard?.writeText(task.copilotDraft);
    } catch {
      // ignore clipboard errors inside non-secure contexts
    }
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 1800);
  };

  return (
    <div
      className={`transition-colors duration-200 ${
        darkMode ? 'bg-[#141416] text-white' : 'bg-white text-[#141416]'
      }`}
    >
      {/* Top Drag Handle & Close Trigger */}
      {showDragHandle && (
        <div className="relative mb-3 flex items-center justify-center pt-1">
          <span
            className={`h-1 w-10 rounded-full ${
              darkMode ? 'bg-white/20' : 'bg-[#D6D4CE]'
            }`}
          />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full transition ${
                darkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/18'
                  : 'bg-[#F4F2ED] text-[#4A4A4F] hover:bg-[#EAE6DD]'
              }`}
              aria-label="Close guide"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Editorial Header + Right Product Thumbnail (@statsdesign style) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isCompleted && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] font-semibold ${
                  darkMode ? 'bg-[#16794F]/30 text-[#72D2A3]' : 'bg-[#EAF6EF] text-[#16794F]'
                }`}
              >
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
            <span
              className={`text-[13px] font-medium ${
                darkMode ? 'text-white/60' : 'text-[#5A5A60]'
              }`}
            >
              {task.provider} · {task.valueBadge}
            </span>
          </div>
          <h3 className="mt-1 font-serif-editorial text-[27px] leading-[1.14] tracking-[-0.02em]">
            {task.title}
          </h3>
          <p
            className={`mt-1 text-[13px] leading-[1.4] ${
              darkMode ? 'text-white/70' : 'text-[#4A4A4F]'
            }`}
          >
            {task.subtitle}
          </p>
        </div>

        <img
          src={task.imageUrl}
          alt={task.title}
          className="h-16 w-14 shrink-0 rounded-2xl object-cover shadow-xs"
        />
      </div>

      {/* 3-Stage Milestone Stepper Bar (Ref 09: Started -> Prepared -> Cleared) */}
      <div
        className={`mt-4 rounded-[18px] px-3.5 py-3 ${
          darkMode ? 'bg-[#1D1D22]' : 'bg-[#F6F6F7]'
        }`}
      >
        <div className="flex items-center justify-between text-[12px] font-semibold">
          <span>Progress</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
              isCompleted
                ? darkMode
                  ? 'bg-[#16794F]/30 text-[#72D2A3]'
                  : 'bg-[#EAF6EF] text-[#16794F]'
                : checkedSteps.length > 0 || Boolean(recordedOutcome)
                  ? darkMode
                    ? 'bg-[#2347D8]/30 text-[#A9BEFF]'
                    : 'bg-[#EEF2FD] text-[#2347D8]'
                  : darkMode
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white text-[#5A5A60]'
            }`}
          >
            {isCompleted
              ? 'Cleared'
              : checkedSteps.length > 0 || Boolean(recordedOutcome)
                ? 'In progress'
                : 'Ready to start'}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          {[
            {
              label: 'Matched',
              done: true,
            },
            {
              label: `Steps (${checkedSteps.length}/${task.steps.length})`,
              done: isCompleted || checkedSteps.length > 0 || Boolean(recordedOutcome),
            },
            {
              label: 'Saved',
              done: isCompleted || Boolean(recordedOutcome),
            },
          ].map((stage, sIdx, all) => (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    stage.done
                      ? darkMode
                        ? 'bg-white text-[#141416]'
                        : 'bg-[#141416] text-white'
                      : darkMode
                        ? 'bg-white/15 text-white/50'
                        : 'bg-[#DEDCD6] text-[#6C6C72]'
                  }`}
                >
                  {stage.done ? <Check className="h-3 w-3 stroke-[3]" /> : sIdx + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-[11px] font-medium ${
                    stage.done
                      ? darkMode
                        ? 'text-white/90'
                        : 'text-[#141416]'
                      : darkMode
                        ? 'text-white/45'
                        : 'text-[#6C6C72]'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {sIdx < all.length - 1 && (
                <div
                  className={`mb-4 h-[2px] flex-1 rounded-full ${
                    all[sIdx + 1].done
                      ? darkMode
                        ? 'bg-white/80'
                        : 'bg-[#141416]'
                      : darkMode
                        ? 'bg-white/15'
                        : 'bg-[#DEDCD6]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Emerald Match Callout Row */}
      <div className="mt-4">
        <div
          className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${
            task.urgency === 'urgent'
              ? darkMode
                ? 'text-[#F0887A]'
                : 'text-[#C43929]'
              : darkMode
                ? 'text-[#72D2A3]'
                : 'text-[#16794F]'
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>
            {task.urgency === 'urgent'
              ? 'Time-sensitive for your queue'
              : 'Why this is in your plan'}
          </span>
        </div>
        <p
          className={`mt-1 text-[13.5px] leading-[1.45] ${
            darkMode ? 'text-white/80' : 'text-[#3A3A40]'
          }`}
        >
          {task.whySurfaced ?? task.personalWhy}
        </p>
      </div>

      {/* Horizontal Snap-Scrolling Key Details & World Rules Cards (@statsdesign Actives strip) */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: task.urgency === 'urgent' ? '#C43929' : '#2347D8',
              }}
            />
            <span className="text-[14px] font-semibold">Show me how</span>
          </div>
          <span
            className={`text-[13px] ${darkMode ? 'text-white/50' : 'text-[#6C6C72]'}`}
          >
            Swipe rules →
          </span>
        </div>

        <div className="no-scrollbar mt-2.5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
          {readingCards.map((card) => (
            <div
              key={card.id}
              className={`min-w-[186px] max-w-[204px] shrink-0 snap-start rounded-[20px] p-3.5 ${
                darkMode ? 'bg-[#1D1D22]' : 'bg-[#F6F6F7]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: card.accentHex }}
                />
                <span
                  className={`text-[13px] font-medium ${
                    darkMode ? 'text-white/60' : 'text-[#5A5A60]'
                  }`}
                >
                  {card.eyebrow}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] leading-snug font-semibold">
                {card.title}
              </p>
              <p
                className={`mt-1.5 text-[13px] leading-[1.42] ${
                  darkMode ? 'text-white/75' : 'text-[#4A4A4F]'
                }`}
              >
                {card.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Still to Check */}
      {task.stillToCheck && task.stillToCheck.length > 0 && (
        <div
          className={`mt-4 rounded-[20px] p-3.5 ${
            darkMode ? 'bg-[#1D1D22]' : 'bg-[#F6F6F7]'
          }`}
        >
          <p
            className={`text-[13px] font-semibold ${
              darkMode ? 'text-white/85' : 'text-[#141416]'
            }`}
          >
            Still need to check
          </p>
          <ul
            className={`mt-1.5 space-y-1 text-[13px] leading-[1.42] ${
              darkMode ? 'text-white/75' : 'text-[#4A4A4F]'
            }`}
          >
            {task.stillToCheck.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {task.sourceUrl && (
        <a href={task.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] font-medium underline underline-offset-2">
          Open source guide
        </a>
      )}
      {task.calculator && <HousingDecisionTools key={task.id} calculator={task.calculator} countryCode={countryCode} darkMode={darkMode} />}

      {/* Actionable Checklist Steps */}
      <div className="mt-4 space-y-2">
        <p
          className={`text-[13px] font-semibold ${
            darkMode ? 'text-white/75' : 'text-[#4A4A4F]'
          }`}
        >
          Your action steps
        </p>
        {task.steps.map((step, idx) => {
          const checked = checkedSteps.includes(idx) || isCompleted;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onToggleStep(idx)}
              className={`flex w-full items-start gap-2.5 rounded-[18px] px-3.5 py-2.5 text-left text-[13px] leading-[1.4] transition ${
                checked
                  ? darkMode
                    ? 'bg-[#16794F]/30 text-white'
                    : 'bg-[#EAF6EF] text-[#141416]'
                  : darkMode
                    ? 'bg-[#1D1D22] text-white/90 hover:bg-[#24242A]'
                    : 'bg-[#F6F6F7] text-[#141416] hover:bg-[#EAE8E2]'
              }`}
            >
              <span
                className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                  checked
                    ? darkMode
                      ? 'bg-[#72D2A3] text-[#141416]'
                      : 'bg-[#16794F] text-white'
                    : darkMode
                      ? 'bg-white/15'
                      : 'bg-black/10'
                }`}
              >
                {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </span>
              <span>{step}</span>
            </button>
          );
        })}
      </div>

      {/* Ready-to-Send Draft */}
      {task.copilotDraft && (
        <div
          className={`mt-4 rounded-[20px] p-3.5 ${
            darkMode ? 'bg-[#2347D8]/22' : 'bg-[#EEF2FD]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[13px] font-semibold ${
                darkMode ? 'text-[#C2D0FF]' : 'text-[#2347D8]'
              }`}
            >
              Message you can send
            </span>
            <button
              type="button"
              onClick={handleCopyDraft}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium transition ${
                darkMode
                  ? 'bg-white/14 text-white hover:bg-white/22'
                  : 'bg-white text-[#141416] hover:bg-[#F4F2ED]'
              }`}
            >
              <Copy className="h-3 w-3" />
              <span>{copiedDraft ? 'Copied ✓' : 'Copy'}</span>
            </button>
          </div>
          <pre
            className={`mt-1.5 whitespace-pre-wrap font-sans text-[13px] leading-[1.45] ${
              darkMode ? 'text-white/90' : 'text-[#2B2B30]'
            }`}
          >
            {task.copilotDraft}
          </pre>
        </div>
      )}

      {/* Record Outcome Persistence */}
      <div
        className={`mt-4 rounded-[20px] p-3.5 ${
          darkMode ? 'bg-[#1D1D22]' : 'bg-[#F6F6F7]'
        }`}
      >
        <label className="block">
          <span
            className={`text-[13px] font-semibold ${
              darkMode ? 'text-white/85' : 'text-[#141416]'
            }`}
          >
            Record what happened
          </span>
          <input
            type="text"
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder="e.g. Checked eligibility, saved ref #4829, booked Tue 9am"
            className={`mt-1.5 w-full rounded-xl px-3 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
              darkMode
                ? 'bg-black/35 text-white placeholder-white/45'
                : 'bg-white text-[#141416] placeholder-[#6C6C72]'
            }`}
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Checked eligibility', 'Applied today', 'Appointment booked', 'Saved contact & ref'].map(
            (chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setOutcomeNote(chip)}
                className={`rounded-full px-2.5 py-1 text-[13px] transition ${
                  darkMode
                    ? 'bg-white/10 text-white/80 hover:bg-white/18'
                    : 'bg-white text-[#4A4A4F] hover:bg-[#EAE6DD]'
                }`}
              >
                {chip}
              </button>
            )
          )}
        </div>

        {/* Chronological Outcome Timeline (Ref 09) */}
        <div className={`mt-3 space-y-1.5 pt-2.5 text-[12px] ${darkMode ? 'text-white/70' : 'text-[#525258]'}`}>
          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16794F]" />
            <span>Matched against your {countryCode} profile and live rules</span>
          </div>
          {checkedSteps.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2347D8]" />
              <span>{checkedSteps.length} of {task.steps.length} action steps checked off</span>
            </div>
          )}
          {recordedOutcome && (
            <div className="flex items-start gap-2">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${darkMode ? 'bg-white' : 'bg-[#141416]'}`} />
              <span>
                <strong className={darkMode ? 'text-white' : 'text-[#141416]'}>{recordedOutcome.recordedAt}:</strong>{' '}
                {recordedOutcome.summary}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action + Secondary Ask */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onComplete(
              outcomeNote.trim() || recordedOutcome?.summary || `Sorted ${task.shortTitle}`
            );
            onClose?.();
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[13.5px] font-semibold transition active:scale-[0.98] ${
            darkMode
              ? 'bg-white text-[#141416] hover:bg-white/90'
              : 'bg-[#141416] text-white hover:bg-black/85'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isCompleted ? 'Update saved outcome' : 'Save outcome & complete'}</span>
        </button>

        {onAskAboutTask && (
          <button
            type="button"
            onClick={() => onAskAboutTask(task)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              darkMode
                ? 'bg-[#1D1D22] text-white hover:bg-[#27272E]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            aria-label="Ask follow-up"
            title="Ask follow-up"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
