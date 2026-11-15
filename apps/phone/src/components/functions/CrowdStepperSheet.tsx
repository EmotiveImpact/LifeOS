import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { getCrowdUnlockSummary } from '@life/core/engine';
import { UserProfile } from '@life/core/types';

interface CrowdStepperSheetProps {
  profile: UserProfile;
  onApplyCount: (count: number) => void;
  onClose: () => void;
}

const CHARACTER_PALETTE = [
  { coat: '#3E2F5B', head: '#E6B89C', height: 34 },
  { coat: '#5E2B41', head: '#C68642', height: 42 },
  { coat: '#2D4A53', head: '#F1C27D', height: 44 },
  { coat: '#734B2D', head: '#8D5524', height: 39 },
  { coat: '#1D3557', head: '#FFDBAC', height: 45 },
  { coat: '#4A5759', head: '#D2996C', height: 41 },
  { coat: '#6D3D14', head: '#F5CBA7', height: 37 },
  { coat: '#2B2D42', head: '#7B4B2A', height: 44 },
  { coat: '#8D493A', head: '#E0AC69', height: 40 },
  { coat: '#386641', head: '#C68642', height: 43 },
  { coat: '#4F378B', head: '#F1C27D', height: 36 },
  { coat: '#7F4F24', head: '#8D5524', height: 42 },
  { coat: '#283618', head: '#FFDBAC', height: 40 },
  { coat: '#540B0E', head: '#D2996C', height: 43 },
  { coat: '#3D405B', head: '#F5CBA7', height: 38 },
  { coat: '#B07D62', head: '#B07D62', height: 22, isDog: true },
];

export const CrowdStepperSheet: React.FC<CrowdStepperSheetProps> = ({
  profile,
  onApplyCount,
  onClose,
}) => {
  const [count, setCount] = useState(profile.householdSize || 1);

  const visibleMembers = CHARACTER_PALETTE.slice(0, Math.min(16, count));
  const summary = getCrowdUnlockSummary(count, profile);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center rounded-t-[34px] bg-white px-6 pt-5 pb-7 text-center text-[#111113] shadow-[0_-18px_50px_rgba(0,0,0,0.22)]"
      >
        {/* Top-Right Close Button matching Video 3 */}
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-black/60 transition hover:bg-black/[0.06] hover:text-black"
            aria-label="Close Stepper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Living Crowd Lineup (grows smoothly 1 -> 16+!) */}
        <div className="mt-2 flex h-16 w-full items-end justify-center gap-[2px] overflow-hidden px-1">
          <AnimatePresence initial={false}>
            {visibleMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.3, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.2, y: 10 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="shrink-0"
              >
                {member.isDog ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="11" width="11" height="7" rx="3" fill="#B07D62" />
                    <circle cx="17" cy="10" r="3" fill="#9C6644" />
                    <rect x="7" y="17" width="2" height="4" rx="1" fill="#9C6644" />
                    <rect x="14" y="17" width="2" height="4" rx="1" fill="#9C6644" />
                    <path d="M6 12 L3 9" stroke="#9C6644" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg
                    width={count > 10 ? 15 : 20}
                    height={member.height}
                    viewBox="0 0 24 48"
                    fill="none"
                  >
                    <circle cx="12" cy="8" r="4.5" fill={member.head} />
                    <path
                      d="M6 17 C6 14 18 14 18 17 L19 32 L15 32 L14.5 45 L12.5 45 L12 32 L11.5 45 L9.5 45 L9 32 L5 32 Z"
                      fill={member.coat}
                    />
                  </svg>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Prompt */}
        <p className="mt-4 max-w-[235px] text-[13.5px] leading-[1.35] font-medium text-[#636366]">
          How many people are in your household or team?
        </p>

        {/* Numeric Counter with - and + Circular Steppers */}
        <div className="my-5 flex items-center justify-center gap-8">
          <button
            type="button"
            disabled={count <= 1}
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F6] text-[#111113] transition hover:bg-[#E5E5EA] disabled:opacity-25"
            aria-label="Decrease count"
          >
            <Minus className="h-4 w-4" />
          </button>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={count}
              initial={{ opacity: 0.4, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="min-w-[82px] text-[56px] leading-none font-bold tracking-[-0.03em] text-[#111113]"
            >
              {count >= 16 ? '16+' : count}
            </motion.span>
          </AnimatePresence>

          <button
            type="button"
            disabled={count >= 16}
            onClick={() => setCount((c) => Math.min(16, c + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F6] text-[#111113] transition hover:bg-[#E5E5EA] disabled:opacity-25"
            aria-label="Increase count"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Live Scheme Impact Summary */}
        <div className="mb-4 w-full rounded-2xl bg-[#F6F6F8] px-4 py-3 text-[12px] leading-snug text-[#3A3A3C]">
          {summary}
        </div>

        <button
          type="button"
          onClick={() => {
            onApplyCount(count);
            onClose();
          }}
          className="w-full rounded-full bg-[#111113] py-3 text-[13px] font-semibold text-white transition hover:bg-black/85 active:scale-[0.98]"
        >
          Update Household & Team
        </button>
      </motion.div>
    </motion.div>
  );
};
