import React from 'react';
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Compass,
  Lock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Users,
} from 'lucide-react';
import { PRESET_PROFILES, VIDEO_STATES } from '@life/core/engine';
import {
  ActiveFunctionOverlay,
  GameChapterSummary,
  LifeOSStateId,
  LifeTask,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';

interface StateRailProps {
  currentState: LifeOSStateId;
  autoPlaying: boolean;
  onSelectState: (id: LifeOSStateId) => void;
  onToggleAutoPlay: () => void;
  onStep: (dir: -1 | 1) => void;
}

export const StateRail: React.FC<StateRailProps> = ({
  currentState,
  autoPlaying,
  onSelectState,
  onToggleAutoPlay,
  onStep,
}) => {
  const currentIdx = VIDEO_STATES.findIndex((s) => s.id === currentState);
  const activeDesc = VIDEO_STATES[currentIdx];

  return (
    <aside className="flex w-full max-w-[268px] flex-col rounded-[24px] bg-white/58 p-3.5 text-[#141416] backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2.5">
        <div>
          <p className="text-[14px] font-semibold text-[#141416]">Studio · Screens</p>
          <p className="text-[12.5px] text-[#4A4A4F]">
            Screen {currentIdx + 1} of {VIDEO_STATES.length}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStep(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/75 text-[#141416] transition hover:bg-white"
            title="Previous screen (←)"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/75 text-[#141416] transition hover:bg-white"
            title="Next screen (→)"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleAutoPlay}
        className={`flex items-center justify-center gap-2 rounded-full py-2 text-[13px] font-semibold transition ${
          autoPlaying
            ? 'bg-[#C43929] text-white'
            : 'bg-[#141416] text-white hover:bg-black/85'
        }`}
      >
        {autoPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            <span>Pause Tour</span>
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Play Screen Tour</span>
          </>
        )}
      </button>

      {activeDesc && (
        <div className="mt-2.5 rounded-2xl bg-white/65 p-3">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#4A4A4F]">
            <span className="truncate">{activeDesc.videoScreenName}</span>
            <span className="ml-2 shrink-0">{activeDesc.videoTimestamp}</span>
          </div>
          <p className="mt-1 text-[13px] leading-[1.4] text-[#141416]">
            {activeDesc.lifeosRole}
          </p>
        </div>
      )}

      <div className="no-scrollbar mt-2.5 max-h-[470px] space-y-1 overflow-y-auto pr-0.5">
        {VIDEO_STATES.map((item) => {
          const selected = item.id === currentState;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectState(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                selected
                  ? 'bg-[#2347D8] text-white'
                  : 'text-[#141416] hover:bg-white/60'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    selected ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#4A4A4F]'
                  }`}
                >
                  {item.order}
                </span>
                <span className="truncate text-[13px] font-medium">{item.label}</span>
              </div>
              <span
                className={`ml-2 shrink-0 text-[11.5px] ${
                  selected ? 'text-white/75' : 'text-[#6C6C72]'
                }`}
              >
                {item.videoTimestamp}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

interface LifeInspectorProps {
  profile: UserProfile;
  score: ScoreBreakdown;
  lifeImpact: {
    unclaimedFormatted: string;
    claimedFormatted: string;
    urgentCount: number;
    fixReadyHeadline: string;
  };
  activeTasks: LifeTask[];
  comingUpTasks: LifeTask[];
  completedTasks: LifeTask[];
  chapter?: GameChapterSummary;
  activeOverlay: ActiveFunctionOverlay;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onApplyPreset: (profile: UserProfile) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onToggleComplete: (taskId: string) => void;
  onResetProgress: () => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
}

export const LifeInspector: React.FC<LifeInspectorProps> = ({
  profile,
  score,
  lifeImpact,
  activeTasks,
  comingUpTasks,
  completedTasks,
  chapter,
  activeOverlay,
  onUpdateProfile,
  onApplyPreset,
  onSelectTask,
  onToggleComplete,
  onResetProgress,
  onOpenOverlay,
}) => {
  return (
    <aside className="flex w-full max-w-[280px] flex-col gap-3 rounded-[24px] bg-white/58 p-3.5 text-[#141416] backdrop-blur-xl">
      {/* Readiness Card */}
      <div className="rounded-2xl bg-[#141416] p-3.5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-white/65">Readiness</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-serif-editorial text-[38px] leading-none">{score.total}</span>
              <span className="text-[13px] text-white/55">/ 100</span>
            </div>
            <p className="mt-1 text-[12.5px] font-medium text-[#72D2A3]">{score.tierLabel}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-right text-[12px]">
            <div>
              <span className="text-white/55">Work </span>
              <span className="font-semibold">{score.capital}%</span>
            </div>
            <div>
              <span className="text-white/55">Gov </span>
              <span className="font-semibold">{score.gov}%</span>
            </div>
            <div>
              <span className="text-white/55">Health </span>
              <span className="font-semibold">{score.health}%</span>
            </div>
            <div>
              <span className="text-white/55">Money </span>
              <span className="font-semibold">{score.growth}%</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-white/[0.08] px-2.5 py-1.5 text-[12px]">
          <span className="text-white/85">{lifeImpact.unclaimedFormatted} available</span>
          <span className="text-[#72D2A3]">Saved {lifeImpact.claimedFormatted}</span>
        </div>

        {chapter && (
          <div className="mt-2 rounded-xl bg-white/[0.06] px-2.5 py-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-white/85">{chapter.chapterLabel}</span>
              <span className="text-white/75">{chapter.readinessPct}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#2347D8] transition-all"
                style={{ width: `${chapter.readinessPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Studio Scenarios */}
      <div className="space-y-2 rounded-2xl bg-white/65 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#141416]">Studio · Scenario</span>
          <button
            type="button"
            onClick={onResetProgress}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4A4A4F] hover:text-[#141416]"
            title="Start fresh"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROFILES.map((preset) => {
            const active =
              preset.profile.city === profile.city &&
              preset.profile.age === profile.age &&
              preset.profile.isBusinessOwner === profile.isBusinessOwner;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.profile)}
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition ${
                  active
                    ? 'bg-[#2347D8] text-white'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[12.5px]">
          <label className="flex items-center justify-between rounded-xl bg-white px-2.5 py-1.5">
            <span className="text-[#4A4A4F]">Age</span>
            <input
              type="number"
              min={18}
              max={80}
              value={profile.age}
              onChange={(e) =>
                onUpdateProfile({ age: Math.max(18, Math.min(80, Number(e.target.value) || 18)) })
              }
              className="w-10 text-right font-semibold text-[#141416] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => onUpdateProfile({ isBusinessOwner: !profile.isBusinessOwner })}
            className={`rounded-xl px-2.5 py-1.5 font-medium transition ${
              profile.isBusinessOwner
                ? 'bg-[#16794F] text-white'
                : 'bg-white text-[#4A4A4F]'
            }`}
          >
            {profile.isBusinessOwner ? 'Self-employed' : 'Employed'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-0.5 text-[11.5px]">
          {[
            { key: 'needsTaxOrDebtFix' as const, label: 'Tax / Bills' },
            { key: 'needsCashRunway' as const, label: '30-Day Gap' },
            { key: 'overdueRoutineCare' as const, label: 'Health Due' },
          ].map((sig) => {
            const active = Boolean(profile[sig.key]);
            return (
              <button
                key={sig.key}
                type="button"
                onClick={() => onUpdateProfile({ [sig.key]: !active })}
                className={`rounded-lg px-1.5 py-1 font-medium transition ${
                  active ? 'bg-[#141416] text-white' : 'bg-white text-[#4A4A4F]'
                }`}
              >
                {sig.label}
              </button>
            );
          })}
        </div>

        {/* Tool Drawers */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() =>
              onOpenOverlay(activeOverlay === 'pulse-matrix' ? null : 'pulse-matrix')
            }
            className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 text-[12px] font-medium transition ${
              activeOverlay === 'pulse-matrix'
                ? 'bg-[#2347D8] text-white'
                : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="truncate">{profile.pulse?.label ?? 'Mood'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenOverlay(activeOverlay === 'blur-intake' ? null : 'blur-intake')
            }
            className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 text-[12px] font-medium transition ${
              activeOverlay === 'blur-intake'
                ? 'bg-[#2347D8] text-white'
                : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Letter</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenOverlay(activeOverlay === 'crowd-stepper' ? null : 'crowd-stepper')
            }
            className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 text-[12px] font-medium transition ${
              activeOverlay === 'crowd-stepper'
                ? 'bg-[#2347D8] text-white'
                : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Home ({profile.householdSize >= 16 ? '16+' : profile.householdSize})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpenOverlay(activeOverlay === 'life-playbook' ? null : 'life-playbook')
          }
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
            activeOverlay === 'life-playbook'
              ? 'bg-[#2347D8] text-white'
              : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#2347D8]" />
            <div>
              <p className="text-[13px] font-semibold">Life Map &amp; Rules</p>
              <p
                className={`text-[11.5px] ${
                  activeOverlay === 'life-playbook' ? 'text-white/75' : 'text-[#4A4A4F]'
                }`}
              >
                6 life areas · {(profile.setupRails?.length ?? 0)}/5 set up
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 opacity-60" />
        </button>
      </div>

      {/* Missions Stack */}
      <div className="no-scrollbar max-h-[260px] space-y-2.5 overflow-y-auto pr-0.5">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-[#141416]">
            Worth doing now ({activeTasks.length})
          </p>
          <div className="space-y-1.5">
            {activeTasks.length === 0 ? (
              <p className="rounded-xl bg-[#EAF6EF] px-3 py-2 text-[13px] text-[#16794F]">
                All current missions complete!
              </p>
            ) : (
              activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelectTask(
                        task,
                        task.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[13px] font-semibold text-[#141416]">
                      {task.shortTitle}
                    </p>
                    <p className="truncate text-[12px] text-[#4A4A4F]">
                      {task.valueBadge} · +{task.scoreDelta} pts
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task.id)}
                    className="ml-2 text-[#6C6C72] transition hover:text-[#16794F]"
                    title="Mark done"
                  >
                    <Circle className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {comingUpTasks.length > 0 && (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-[#4A4A4F]">
              Coming next ({comingUpTasks.length})
            </p>
            <div className="space-y-1">
              {comingUpTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectTask(task, 'scheme-portal')}
                  className="flex w-full items-center justify-between rounded-xl bg-white/60 px-2.5 py-1.5 text-left text-[#4A4A4F] transition hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate text-[12.5px]">{task.shortTitle}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-[12px]">{task.valueBadge}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-[#16794F]">
              Saved outcomes ({completedTasks.length})
            </p>
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleComplete(task.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-[#EAF6EF] px-2.5 py-1.5 text-left text-[#16794F]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-[12.5px] font-medium">
                      {profile.recordedOutcomes?.[task.id]?.summary ?? task.shortTitle}
                    </span>
                  </div>
                  <span className="ml-2 shrink-0 text-[12px] font-semibold">
                    +{task.scoreDelta}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
