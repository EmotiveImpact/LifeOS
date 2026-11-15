import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleCloudCanvas } from './LifeOSIcons';

interface DynamicIslandProps {
  expanded: boolean;
  scanText?: string;
  flashTrigger?: number;
  onTap?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  expanded,
  scanText = 'Looking up local support & schemes…',
  flashTrigger = 0,
  onTap,
}) => {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-col items-center pt-[10px]">
      {/* Dynamic Island Completion Flash Burst */}
      <AnimatePresence>
        {flashTrigger > 0 && (
          <motion.div
            key={flashTrigger}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.92, 0], scale: [0.45, 1.35, 2.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(235,240,255,0.65)_42%,transparent_72%)] blur-xl"
          />
        )}
      </AnimatePresence>

      {/* Authentic iOS Capsule -> Wide Live Activity Capsule Pill (no black square box) */}
      <motion.button
        type="button"
        onClick={onTap}
        layout
        initial={false}
        animate={
          expanded
            ? {
                width: 312,
                height: 54,
                borderRadius: 27,
              }
            : {
                width: 102,
                height: 30,
                borderRadius: 999,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 30,
          mass: 0.8,
        }}
        className="pointer-events-auto relative flex items-center justify-center overflow-hidden bg-[#0A0A0C] text-white shadow-[0_8px_22px_rgba(0,0,0,0.22)]"
        title={expanded ? 'Tap to minimize Live Activity' : 'life · Active'}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex h-full w-full items-center justify-between px-3.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="scale-[0.44]">
                    <ParticleCloudCanvas active />
                  </div>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-medium text-white/60">life</p>
                  <p className="truncate text-[12.5px] font-medium leading-tight text-white">
                    {scanText}
                  </p>
                </div>
              </div>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2EA86F] shadow-[0_0_10px_#2EA86F]" />
            </motion.div>
          ) : (
            <motion.div
              key="pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex h-full w-full items-center justify-end pr-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#23232A]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
