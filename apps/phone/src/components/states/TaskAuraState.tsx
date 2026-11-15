import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { DottedOrbIcon } from '../LifeOSIcons';
import { LifeOSStateId, LifeTask } from '@life/core/types';

interface TaskAuraStateProps {
  tasks: LifeTask[];
  onNavigate: (state: LifeOSStateId) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
}

export const TaskAuraState: React.FC<TaskAuraStateProps> = ({
  tasks,
  onNavigate,
  onSelectTask,
}) => {
  const [index, setIndex] = useState(0);
  const [dissolving, setDissolving] = useState(false);

  const currentTask = tasks[index % Math.max(1, tasks.length)];

  const triggerDissolve = () => {
    setDissolving(true);
    setTimeout(() => {
      setDissolving(false);
      onNavigate('aura-search');
    }, 520);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-white px-4 pt-13 pb-6 text-[#141416]">
      {/* Top Serif Brand */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onNavigate('hub-light')}
          className="font-serif-editorial text-[25px] leading-none"
        >
          life
        </button>
        {tasks.length > 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % tasks.length)}
            className="rounded-full bg-[#F4F2ED] px-3 py-1 text-[12px] font-medium text-[#4A4A4F] transition hover:bg-[#EAE6DD]"
          >
            Next ({(index % tasks.length) + 1}/{tasks.length})
          </button>
        )}
      </div>

      {/* Main Feathered Organic Portal Card */}
      <div className="relative my-auto flex flex-1 items-center py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask?.id ?? 'empty'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={
              dissolving
                ? {
                    opacity: 0.25,
                    scale: 1.08,
                  }
                : {
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full max-h-[435px] w-full flex-col items-center justify-between rounded-[30px] bg-[#F4F2ED] px-5 py-6 text-center"
          >
            <p className="max-w-[245px] font-serif-editorial text-[19px] leading-[1.25] text-[#4A4A4F]">
              {currentTask
                ? currentTask.headlinePrompt
                : 'All current tasks complete — check upcoming opportunities.'}
            </p>

            {/* Feathered Edge Atmospheric Crimson/Warm Photo Portal */}
            <button
              type="button"
              onClick={() => {
                if (!currentTask) {
                  onNavigate('task-deck');
                  return;
                }
                onSelectTask(
                  currentTask,
                  currentTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                );
              }}
              className="group relative my-2 flex h-56 w-56 items-center justify-center focus:outline-none"
              title="Tap portal to open full scheme / task"
            >
              <div className="mask-feathered-portal relative h-full w-full overflow-hidden">
                <img
                  src={currentTask?.imageUrl ?? '/art/horizon-urgent.png'}
                  alt={currentTask?.title ?? 'LifeOS Task'}
                  className="h-full w-full scale-110 object-cover saturate-150 transition duration-500 group-hover:scale-115"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/45 via-transparent to-red-600/20 mix-blend-multiply" />
              </div>

              {/* Subtle Hover Action Label */}
              <span className="pointer-events-none absolute bottom-5 rounded-full bg-black/65 px-3 py-1 text-[10.5px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                {currentTask?.valueBadge ?? 'View Queue'} · +{currentTask?.scoreDelta ?? 0} pts
              </span>
            </button>

            {/* Agent Footer Badge ("Agent ?") */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerDissolve}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-[#636366] transition hover:bg-black/5 hover:text-black"
              >
                <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600" />
                <span>Agent</span>
                <HelpCircle className="h-3 w-3 opacity-60" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Luminous White Pill */}
      <div className="flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={triggerDissolve}
          className="flex h-11 w-20 items-center justify-center rounded-full bg-white text-[#111113] shadow-[0_0_32px_rgba(255,255,255,1),0_6px_22px_rgba(0,0,0,0.1)]"
          title="Dissolve into Aura Context Search"
        >
          <DottedOrbIcon size={17} />
        </motion.button>
      </div>
    </div>
  );
};
