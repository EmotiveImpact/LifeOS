import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, Plus } from 'lucide-react';
import { DottedOrbIcon } from '../LifeOSIcons';
import { ActiveFunctionOverlay, LifeOSStateId, UserProfile } from '@life/core/types';

interface ScanningStateProps {
  profile: UserProfile;
  darkMode?: boolean;
  activeTaskCount: number;
  comingCount: number;
  onNavigate: (state: LifeOSStateId) => void;
  onSendMessage: (text: string) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
}

export const ScanningState: React.FC<ScanningStateProps> = ({
  profile,
  darkMode = false,
  activeTaskCount,
  comingCount,
  onNavigate,
  onSendMessage,
  onOpenOverlay,
}) => {
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft('');
    onNavigate('chat');
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between px-4 pt-[74px] pb-5 transition-colors duration-200 ${
        darkMode ? 'bg-[#0C0C0F] text-[#F5F4F0]' : 'bg-[#FFFFFF] text-[#141416]'
      }`}
    >
      {/* Top navigation sitting cleanly below the expanded Live Activity capsule */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-95 ${
            darkMode
              ? 'bg-[#17171B] text-white hover:bg-[#222228]'
              : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
          }`}
          aria-label="Open Home"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('task-deck')}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-95 ${
            darkMode
              ? 'bg-[#17171B] text-white hover:bg-[#222228]'
              : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
          }`}
          aria-label="View Active Missions"
        >
          <MoreHorizontal className="h-4 w-4 stroke-[2]" />
        </button>
      </div>

      {/* Center prompt inviting you into Today's Plan */}
      <div className="my-auto flex flex-col items-start px-1">
        <p className="font-serif-editorial text-[34px] leading-[1.08] tracking-[-0.01em]">
          life
        </p>
        <p
          className={`mt-2 max-w-[265px] text-[13.5px] leading-[1.48] ${
            darkMode ? 'text-white/75' : 'text-[#4A4A4F]'
          }`}
        >
          Get your life together from one place. Work out what matters today, follow step-by-step guides, and keep every result.
        </p>

        <button
          type="button"
          onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2347D8] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1833A3] active:scale-[0.98]"
        >
          <span>See your next move</span>
        </button>
      </div>

      {/* Bottom message cluster & composer pill */}
      <div className="flex flex-col gap-2.5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-end gap-2"
        >
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] leading-[1.4] transition active:scale-[0.99] ${
              darkMode
                ? 'bg-[#17171B] text-white hover:bg-[#222228]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            {profile.isBusinessOwner
              ? `What support, schemes & urgent tasks are open in ${profile.city} at ${profile.age}?`
              : `What support, health checks & schemes are open in ${profile.city} at ${profile.age}?`}
          </button>

          <button
            type="button"
            onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition hover:brightness-95 ${
              darkMode ? 'bg-[#16794F]/30 text-[#72D2A3]' : 'bg-[#EAF6EF] text-[#16794F]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#16794F]" />
            <span>
              {activeTaskCount} worth doing today · {comingCount} coming next
            </span>
          </button>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 rounded-full px-2.5 py-2 ${
            darkMode ? 'bg-[#17171B]' : 'bg-[#F4F2ED]'
          }`}
        >
          <button
            type="button"
            onClick={() => onOpenOverlay('blur-intake')}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-2xs transition hover:scale-105 active:scale-95 ${
              darkMode ? 'bg-white/12 text-white' : 'bg-white text-[#141416]'
            }`}
            title="Attach a letter or bill"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('aura-search')}
            className={`transition hover:scale-110 ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}
            title="Explore options around you"
          >
            <DottedOrbIcon size={16} spinning />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tell me what’s going on…"
            className={`w-full bg-transparent text-[13.5px] focus:outline-none ${
              darkMode ? 'text-white placeholder-white/45' : 'text-[#141416] placeholder-[#6C6C72]'
            }`}
          />
          {draft.trim().length > 0 && (
            <button
              type="submit"
              className="rounded-full bg-[#2347D8] px-3 py-1 text-[12px] font-semibold text-white"
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
