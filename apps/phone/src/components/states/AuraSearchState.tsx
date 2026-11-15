import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  HelpCircle,
  Lock,
  Navigation,
  Play,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react';
import { DottedOrbIcon } from '../LifeOSIcons';
import {
  ActiveFunctionOverlay,
  LifeOSStateId,
  LifeTask,
  ScoreBreakdown,
  TaskCategory,
  UserProfile,
} from '@life/core/types';

interface AuraSearchStateProps {
  mode: 'aura' | 'orb';
  profile: UserProfile;
  darkMode?: boolean;
  score: ScoreBreakdown;
  eligibleTasks: LifeTask[];
  onNavigate: (state: LifeOSStateId) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onSendMessage: (text: string) => void;
  onCycleProfile: () => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
}

const CATEGORIES: Array<{ id: TaskCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'loan', label: 'Business Loans' },
  { id: 'gov', label: 'Gov Schemes' },
  { id: 'health', label: 'Hospital' },
  { id: 'tax', label: 'Tax Relief' },
  { id: 'skills', label: 'Skills' },
];

export const AuraSearchState: React.FC<AuraSearchStateProps> = ({
  mode,
  profile,
  darkMode = false,
  score,
  eligibleTasks,
  onNavigate,
  onSelectTask,
  onSendMessage,
  onCycleProfile,
  onOpenOverlay,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<TaskCategory | 'all'>('all');
  const [auraSurface, setAuraSurface] = useState<'cosmos' | 'mesh'>('cosmos');

  const filteredTasks =
    selectedCat === 'all'
      ? eligibleTasks
      : eligibleTasks.filter((t) => t.category === selectedCat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onNavigate(mode === 'aura' ? 'orb-radar' : 'task-deck');
      return;
    }
    onSendMessage(query.trim());
    setQuery('');
    onNavigate('chat');
  };

  if (mode === 'aura') {
    const protocols = [
      {
        id: 'proto-goals',
        title: 'envision your next normal',
        duration: '5m',
        unlocked: true,
        image: '/art/horizon-urgent.png',
        action: () => onOpenOverlay('levels-ateam'),
      },
      {
        id: 'proto-cash',
        title: 'embrace calm cashflow',
        duration: '3m',
        unlocked: true,
        image: '/art/founder-portal.png',
        action: () => onOpenOverlay('cash-ledger'),
      },
      {
        id: 'proto-bloods',
        title: 'baseline labs & sleep',
        duration: '4m',
        unlocked: Boolean(profile.health?.waterMlToday && profile.health.waterMlToday >= 1250),
        image: '/art/aura-portrait.png',
        action: () => onOpenOverlay('health-stack'),
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="animate-mesh-drift relative flex h-full w-full flex-col justify-between overflow-hidden px-4 pt-12 pb-5"
        style={
          auraSurface === 'cosmos'
            ? {
                backgroundImage:
                  'radial-gradient(ellipse at 50% 10%, rgba(168, 128, 92, 0.28) 0%, rgba(28, 24, 34, 0.65) 38%, #0B0B0F 72%, #09090D 100%)',
              }
            : {
                backgroundImage:
                  'radial-gradient(circle at 20% 10%, #fbbfa8 0%, transparent 45%), radial-gradient(circle at 48% 45%, #ef2fd8 0%, transparent 60%), radial-gradient(circle at 80% 82%, #4cb8f0 0%, transparent 55%), linear-gradient(160deg, #f7b6a4 0%, #f02ad8 46%, #7d7ff2 76%, #56ccf2 100%)',
              }
        }
      >
        {/* Top Row: Context Chip + Mode Switcher (Cosmos Daily Visualisation / Mesh Aura) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onCycleProfile}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-white/25"
            title="Switch location & scenario"
          >
            <Navigation className="h-3 w-3 fill-current" />
            <span>
              {profile.city} · Age {profile.age}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAuraSurface((s) => (s === 'cosmos' ? 'mesh' : 'cosmos'))}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-white/25"
          >
            <Sparkles className="h-3 w-3" />
            <span>{auraSurface === 'cosmos' ? 'Aura Glow' : 'Visualise'}</span>
          </button>
        </div>

        {/* Center Section: Daily Visualisation & Goals Deck (07-cosmos-daily-visualisation.jpg) OR Aura Center */}
        {auraSurface === 'cosmos' ? (
          <div className="flex flex-col gap-3.5 text-white">
            <div className="text-center px-2">
              <p className="text-[19px] font-normal leading-snug text-white/85">
                clear focus daily grounding
              </p>
              <button
                type="button"
                onClick={() => onOpenOverlay('today-brief')}
                className="mt-3 flex w-full items-center justify-between rounded-[14px] bg-white/[0.08] px-3.5 py-2.5 text-left backdrop-blur-md transition hover:bg-white/[0.14]"
              >
                <div>
                  <p className="text-[13px] font-semibold text-white">open today&apos;s brief &amp; calendar</p>
                  <p className="text-[11.5px] text-white/55">
                    {eligibleTasks.length} matched options · A-Team rules active
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/60 shrink-0" />
              </button>
            </div>

            <div>
              <p className="mb-2 text-[14px] font-medium text-white/90">
                level-up protocols
              </p>
              <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                {protocols.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={card.action}
                    className="group relative h-[182px] w-[142px] shrink-0 overflow-hidden rounded-[18px] bg-[#18181D] text-left transition active:scale-[0.98]"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#141416]">
                        {card.unlocked ? (
                          <Unlock className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#141416]">
                        <Play className="h-2.5 w-2.5 fill-current" />
                        {card.duration}
                      </span>
                    </div>

                    <p className="absolute bottom-3 left-3 right-3 text-[15px] font-semibold leading-tight text-white">
                      {card.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamped Contextual Nudges (Ref 14 pattern with DottedOrbIcon) */}
            <div className="space-y-1.5">
              {[
                {
                  id: 'nudge-check',
                  time: 'NOW · 2M',
                  label: 'Run daily self check-in & preferences',
                  overlay: 'growth-checkins' as const,
                },
                {
                  id: 'nudge-docs',
                  time: 'DOCUMENTS',
                  label: 'Scan ID, tax letter or utility bill',
                  overlay: 'blur-intake' as const,
                },
              ].map((nudge) => (
                <button
                  key={nudge.id}
                  type="button"
                  onClick={() => onOpenOverlay(nudge.overlay)}
                  className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-white/[0.94] px-3.5 py-2.5 text-left text-[#141416] transition active:scale-[0.98]"
                >
                  <div className="min-w-0">
                    <span className="block font-mono text-[10.5px] tracking-wider text-[#6C6C72]">
                      {nudge.time}
                    </span>
                    <span className="block truncate text-[13px] font-semibold">{nudge.label}</span>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F2ED] text-[#141416]">
                    <DottedOrbIcon size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('orb-radar')}
            className="mx-auto flex flex-col items-center gap-1.5 rounded-3xl px-5 py-4 text-center text-white transition hover:bg-white/10"
          >
            <span className="text-[13px] font-medium text-white/85">
              {eligibleTasks.length} options matched for you
            </span>
            <span className="font-serif-editorial text-[32px] leading-tight">
              Explore what&rsquo;s open
            </span>
          </button>
        )}

        {/* Bottom Composer */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full bg-white px-2.5 py-2 text-[#141416] shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            onClick={() => onOpenOverlay('blur-intake')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4F2ED] text-[#141416] transition hover:bg-[#EAE6DD]"
            title="Attach a letter or bill"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orb-radar')}
            className="text-[#2347D8]"
          >
            <DottedOrbIcon size={16} spinning />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe a goal, bill, or business…"
            className="w-full bg-transparent text-[13.5px] text-[#141416] placeholder-[#6C6C72] focus:outline-none"
          />
        </form>
      </motion.div>
    );
  }

  // ORB RADAR STATE (f_5.1.png)
  const orbGradientByCat: Record<TaskCategory | 'all', string> = {
    all: 'radial-gradient(circle at 38% 42%, #ff36e4 0%, #a855f7 48%, #7dd3fc 90%)',
    loan: 'radial-gradient(circle at 38% 42%, #ec4899 0%, #8b5cf6 52%, #34d399 92%)',
    gov: 'radial-gradient(circle at 38% 42%, #f43f5e 0%, #a855f7 52%, #60a5fa 92%)',
    health: 'radial-gradient(circle at 38% 42%, #fb7185 0%, #ef4444 50%, #fbbf24 92%)',
    tax: 'radial-gradient(circle at 38% 42%, #c084fc 0%, #6366f1 55%, #38bdf8 92%)',
    skills: 'radial-gradient(circle at 38% 42%, #f472b6 0%, #818cf8 55%, #2dd4bf 92%)',
  };

  const featuredMatch = filteredTasks[0];

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between px-4 pt-13 pb-5 transition-colors duration-200 ${
        darkMode ? 'bg-[#0C0C0F] text-[#F5F4F0]' : 'bg-white text-[#111113]'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-serif-editorial text-[22px]">Explore</span>
          <button
            type="button"
            onClick={() => onNavigate('profile-pulse')}
            className={darkMode ? 'text-white/50 hover:text-white' : 'text-black/40 hover:text-black'}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('aura-search')}
          className={darkMode ? 'text-white transition hover:scale-110' : 'text-[#111113] transition hover:scale-110'}
          title="Back to Full Aura Gradient"
        >
          <DottedOrbIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
            darkMode
              ? 'bg-white/10 text-white/75 hover:bg-white/18'
              : 'bg-black/[0.06] text-black/60 hover:bg-black/10'
          }`}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Location Pill */}
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={onCycleProfile}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            darkMode
              ? 'bg-[#17171B] text-white/85 hover:bg-[#222228]'
              : 'bg-[#F4F2ED] text-[#3A3A3C] hover:bg-[#EAE6DD]'
          }`}
        >
          <Navigation className="h-3 w-3 text-[#2347D8]" />
          <span>
            {profile.city} · {score.total}/100
          </span>
        </button>
      </div>

      {/* Center Breathing Diffused Orb */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (featuredMatch) {
              onSelectTask(
                featuredMatch,
                featuredMatch.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
              );
            } else {
              onNavigate('task-deck');
            }
          }}
          className="group relative flex h-52 w-52 items-center justify-center focus:outline-none"
        >
          <div
            className="animate-aura-breathe absolute inset-0 rounded-full opacity-80 transition-all duration-700"
            style={{ background: orbGradientByCat[selectedCat] }}
          />
          <div className="relative flex h-34 w-34 flex-col items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition group-hover:scale-105">
            <span className="text-[12px] font-medium text-white/85">Readiness</span>
            <motion.span
              layoutId="hero-score-pill"
              className="font-serif-editorial text-[44px] leading-none"
            >
              {score.total}
            </motion.span>
            <span className="mt-0.5 text-[12px] font-medium text-white/90">
              {filteredTasks.length} matched
            </span>
          </div>
        </button>

        {featuredMatch && (
          <button
            type="button"
            onClick={() =>
              onSelectTask(
                featuredMatch,
                featuredMatch.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
              )
            }
            className={`mt-3 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition ${
              darkMode
                ? 'bg-[#17171B] text-white hover:bg-[#222228]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            Top match: {featuredMatch.shortTitle} →
          </button>
        )}
      </div>

      {/* Bottom Filter Row + Category Chips + Composer */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('task-deck')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              darkMode
                ? 'bg-[#17171B] text-white hover:bg-[#222228]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title="View mission queue"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                  active
                    ? 'bg-[#2347D8] text-white'
                    : darkMode
                      ? 'bg-[#17171B] text-white/85 hover:bg-[#222228]'
                      : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 rounded-full px-2.5 py-2 ${
            darkMode ? 'bg-[#17171B]' : 'bg-[#F4F2ED]'
          }`}
        >
          <button
            type="button"
            onClick={() => onOpenOverlay('blur-intake')}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-2xs transition ${
              darkMode
                ? 'bg-white/12 text-white hover:bg-white/20'
                : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title="Attach document or bill"
          >
            <Plus className="h-4 w-4" />
          </button>
          <DottedOrbIcon size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe a goal, bill, or scheme…"
            className={`w-full bg-transparent text-[13.5px] focus:outline-none ${
              darkMode ? 'text-white placeholder-white/45' : 'text-[#141416] placeholder-[#6C6C72]'
            }`}
          />
        </form>
      </div>
    </div>
  );
};
