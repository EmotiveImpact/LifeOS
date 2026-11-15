import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, MoreVertical, Plus } from 'lucide-react';
import { DottedOrbIcon } from '../LifeOSIcons';
import { AccessoryToolbarDock } from '../functions/DotMatrixPulseSheet';
import {
  ActiveFunctionOverlay,
  ChatMessage,
  LifeOSStateId,
  LifeTask,
  UserProfile,
} from '@life/core/types';

interface ChatStateProps {
  profile: UserProfile;
  darkMode?: boolean;
  messages: ChatMessage[];
  completedIds: string[];
  onNavigate: (state: LifeOSStateId) => void;
  onSendMessage: (text: string) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
}

export const ChatState: React.FC<ChatStateProps> = ({
  profile,
  darkMode = false,
  messages,
  completedIds,
  onNavigate,
  onSendMessage,
  onSelectTask,
  onOpenOverlay,
}) => {
  const [draft, setDraft] = useState('');
  const [freshMode, setFreshMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!freshMode && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, freshMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (freshMode) setFreshMode(false);
    onSendMessage(draft.trim());
    setDraft('');
  };

  const quickPrompts = [
    'Help me get my life together',
    'How does money work?',
    `What funding can I get in ${profile.city}?`,
    `What public schemes apply at ${profile.age}?`,
  ];

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between px-3.5 pt-13 pb-5 transition-colors duration-200 ${
        darkMode ? 'bg-[#0C0C0F] text-[#F5F4F0]' : 'bg-[#FFFFFF] text-[#141416]'
      }`}
    >
      {/* Top Floating Pill */}
      <div className="flex items-center justify-between px-0.5">
        <div
          className={`inline-flex items-center gap-1 rounded-full py-1 pr-2 pl-1.5 ${
            darkMode ? 'bg-[#17171B]' : 'bg-[#F4F2ED]'
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
              darkMode ? 'text-white hover:bg-white/10' : 'text-[#141416] hover:bg-black/5'
            }`}
            aria-label="Back to Home"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <img
            src="/art/aura-portrait.png"
            alt="Guide"
            className="h-6 w-6 rounded-full object-cover"
          />
          <button
            type="button"
            onClick={() => setFreshMode((f) => !f)}
            className={`flex h-6 w-5 items-center justify-center rounded-full transition ${
              darkMode ? 'text-white/70 hover:bg-white/10' : 'text-[#4A4A4F] hover:bg-black/5'
            }`}
            title="Switch view"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFreshMode((f) => !f)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
            darkMode
              ? 'bg-[#17171B] text-white/80 hover:bg-[#222228]'
              : 'bg-[#F4F2ED] text-[#4A4A4F] hover:bg-[#EAE6DD]'
          }`}
        >
          {freshMode ? 'Show thread' : 'New chat'}
        </button>
      </div>

      {/* Main Content */}
      {freshMode ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.16 }}
          className="flex flex-1 flex-col items-center justify-center px-4 text-center"
        >
          <div className="flex items-center justify-center -space-x-2">
            <img
              src="/art/aura-portrait.png"
              alt={profile.name}
              className="h-11 w-11 rounded-full object-cover shadow-sm"
            />
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#EAE6DD] to-[#D4CFC4]" />
          </div>
          <p className={`mt-3.5 max-w-[230px] text-[13.5px] leading-[1.42] ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
            Tell me what needs sorting first — bills, work, home, or admin.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setFreshMode(false);
                  onSendMessage(p);
                }}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                  darkMode
                    ? 'bg-[#17171B] text-white/90 hover:bg-[#222228]'
                    : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div
          ref={scrollRef}
          className="no-scrollbar my-2 flex-1 space-y-2.5 overflow-y-auto px-0.5 py-2"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              <div
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 text-[13px] leading-[1.42] ${
                    msg.sender === 'user'
                      ? 'bg-[#2347D8] text-white'
                      : darkMode
                        ? 'bg-[#17171B] text-[#F5F4F0]'
                        : 'bg-[#F4F2ED] text-[#141416]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>

              {/* Inline Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="no-scrollbar -mx-3.5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3.5 pt-1 pb-2">
                  {msg.cards[0] && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectTask(
                          msg.cards![0],
                          msg.cards![0].urgency === 'urgent'
                            ? 'urgent-alert'
                            : 'scheme-portal'
                        )
                      }
                      className="group relative h-[184px] w-[142px] shrink-0 snap-start overflow-hidden rounded-[22px] bg-[#141416] text-left text-white shadow-sm"
                    >
                      <img
                        src={msg.cards[0].imageUrl}
                        alt={msg.cards[0].shortTitle}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/15 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3">
                        <span className="inline-block rounded-full bg-white/22 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                          {completedIds.includes(msg.cards[0].id)
                            ? 'Done ✓'
                            : `+${msg.cards[0].scoreDelta} pts`}
                        </span>
                        <p className="mt-1 text-[13px] leading-tight font-semibold">
                          {msg.cards[0].shortTitle}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-white/80">
                          {msg.cards[0].valueBadge}
                        </p>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate('task-deck')}
                    className={`flex h-[184px] w-[160px] shrink-0 snap-start flex-col justify-between rounded-[22px] p-4 text-left transition ${
                      darkMode
                        ? 'bg-[#17171B] text-[#F5F4F0] hover:bg-[#222228]'
                        : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
                    }`}
                  >
                    <p className="font-serif-editorial text-[17.5px] leading-[1.22]">
                      Options and next moves matched to {profile.city}, age {profile.age}.
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
                      <span>See all moves</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </button>

                  {msg.cards.slice(1).map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() =>
                        onSelectTask(
                          card,
                          card.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                        )
                      }
                      className="group relative h-[184px] w-[142px] shrink-0 snap-start overflow-hidden rounded-[22px] bg-[#141416] text-left text-white"
                    >
                      <img
                        src={card.imageUrl}
                        alt={card.shortTitle}
                        className="h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3">
                        <span className="inline-block rounded-full bg-white/22 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                          {completedIds.includes(card.id) ? 'Done ✓' : card.valueBadge}
                        </span>
                        <p className="mt-1 text-[13px] leading-tight font-semibold">
                          {card.shortTitle}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-white/80">
                          {card.provider}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Accessory Toolbar + Quick Prompt Chips */}
      <div className="space-y-2 pt-1">
        <AccessoryToolbarDock
          activePulseLabel={profile.pulse?.label ?? 'Balanced'}
          householdSize={profile.householdSize ?? 1}
          onCalibrate={() => onNavigate('intake-portal')}
          onCategoryFilter={() => onNavigate('orb-radar')}
          onLearnSchemes={() => onNavigate('scheme-portal')}
          onAreaRadar={() => onNavigate('aura-search')}
          onOpenCrowd={() => onOpenOverlay('crowd-stepper')}
          onOpenPulseMatrix={() => onOpenOverlay('pulse-matrix')}
          onOpenPlaybook={() => onOpenOverlay('life-playbook')}
        />

        {!freshMode && (
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSendMessage(p)}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                  darkMode
                    ? 'bg-[#17171B] text-white/85 hover:bg-[#222228]'
                    : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {freshMode && (
            <button
              type="button"
              onClick={() => setFreshMode(false)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                darkMode ? 'text-white hover:bg-white/10' : 'text-[#111113] hover:bg-black/5'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <form
            onSubmit={handleSubmit}
            className={`flex flex-1 items-center gap-2 rounded-full px-2.5 py-2 ${
              darkMode ? 'bg-[#17171B]' : 'bg-[#F2F2F4]'
            }`}
          >
            <button
              type="button"
              onClick={() => onOpenOverlay('blur-intake')}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-2xs transition hover:scale-105 active:scale-95 ${
                darkMode ? 'bg-white/12 text-white' : 'bg-white text-[#111113]'
              }`}
              title="Attach / Scan Document (+)"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('aura-search')}
              className={`shrink-0 ${darkMode ? 'text-white' : 'text-[#111113]'}`}
              title="Open Aura Search"
            >
              <DottedOrbIcon size={16} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything or describe what happened…"
              className={`w-full bg-transparent text-[13.5px] focus:outline-none ${
                darkMode ? 'text-white placeholder-white/45' : 'text-[#141416] placeholder-[#6C6C72]'
              }`}
            />
            {draft.trim() && (
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
    </div>
  );
};
