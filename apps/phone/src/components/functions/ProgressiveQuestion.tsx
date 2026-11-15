import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { buildOnboardingAnswer, getNextOnboardingQuestion } from '@life/core/onboarding';
import type { OnboardingQuestion, UserProfile } from '@life/core/types';
import { fieldSurface } from './SheetControls';

type QuestionProps = {
  profile: UserProfile;
  darkMode: boolean;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
};

function QuestionOptions({ question, profile, darkMode, onUpdateProfile }: QuestionProps & { question: OnboardingQuestion }) {
  const [entry, setEntry] = useState('');
  const optionSurface = darkMode ? 'bg-[#16161B] hover:bg-[#2E2E35]' : 'bg-white hover:bg-[#EEEFF5]';
  const muted = darkMode ? 'text-white/70' : 'text-[#56565C]';
  const input = question.input;
  const answer = (patch: Partial<UserProfile>) => onUpdateProfile(buildOnboardingAnswer(profile, question.id, patch));

  return (
    <div className="mt-2.5 space-y-2">
      <p className={`text-[13px] leading-snug ${muted}`}>{question.whyItMatters}</p>
      {input && (
        <form className="flex items-end gap-2" onSubmit={(event) => {
          event.preventDefault();
          const value = entry.trim();
          if (!value) return;
          if (input.field === 'annualIncome') {
            const amount = Number(value);
            if (Number.isFinite(amount) && amount >= 0) answer({ annualIncome: amount });
          } else {
            answer({ taxCode: value.toUpperCase() });
          }
        }}>
          <label className="min-w-0 flex-1 text-[13px]">
            {input.label}
            <input type={input.field === 'annualIncome' ? 'number' : 'text'} min={0} step="any" required
              value={entry} onChange={(event) => setEntry(event.currentTarget.value)} className={fieldSurface(darkMode)} />
          </label>
          <button type="submit" className={`rounded-xl px-3 py-2 text-[13px] font-semibold ${darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'}`}>Save answer</button>
        </form>
      )}
      {question.options.map((option) => (
        <button key={option.label} type="button" onClick={() => answer(option.patch)}
          className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition ${optionSurface}`}>
          <span>
            <span className="block text-[13px] font-semibold">{option.label}</span>
            <span className={`mt-0.5 block text-[13px] ${muted}`}>{option.hint}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      ))}
    </div>
  );
}

export function ProgressiveQuestion({ compact = false, ...props }: QuestionProps & { compact?: boolean }) {
  const { profile, darkMode, onUpdateProfile } = props;
  const question = getNextOnboardingQuestion(profile);
  const surface = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';

  if (!question) {
    return compact ? null : (
      <div className={`rounded-[20px] p-4 text-[13px] ${surface}`}>
        <p>Your plan has the answers it needs for now.</p>
        <button className="mt-2 font-semibold underline underline-offset-2" type="button"
          onClick={() => onUpdateProfile({ answeredQuestionIds: [] })}>Review questions</button>
      </div>
    );
  }

  return compact ? (
    <details className={`rounded-[20px] p-4 ${surface}`}>
      <summary className="cursor-pointer text-[14px] font-semibold">{question.prompt}</summary>
      <QuestionOptions key={question.id} {...props} question={question} />
    </details>
  ) : (
    <section className={`rounded-[20px] p-4 ${surface}`}>
      <h3 className="text-[15px] font-semibold leading-snug">{question.prompt}</h3>
      <QuestionOptions key={question.id} {...props} question={question} />
    </section>
  );
}
