import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Check,
  Map as MapIcon,
  SlidersHorizontal,
  Tag,
  User,
  X,
} from 'lucide-react';
import { PulseFeeling } from '@life/core/types';

interface DotMatrixPulseSheetProps {
  initialPulse: PulseFeeling;
  onApply: (pulse: PulseFeeling) => void;
  onClose: () => void;
}

const COLS = 13;
const ROWS = 9;

function resolvePulseFromCoords(nx: number, ny: number): PulseFeeling {
  const x = Math.max(0, Math.min(1, nx));
  const y = Math.max(0, Math.min(1, ny));
  const dx = x - 0.5;
  const dy = y - 0.5;
  const distCenter = Math.hypot(dx, dy);

  if (distCenter < 0.16) {
    return {
      x,
      y,
      label: 'Balanced',
      accentHex: '#6366F1',
      bgTint: 'rgba(245, 245, 250, 0.96)',
      focusBias: 'balanced',
      guidance: 'Even pacing across loans, gov schemes & urgent health tasks.',
    };
  }

  if (dx < 0 && dy < 0) {
    return {
      x,
      y,
      label: 'Driven',
      accentHex: '#D97706',
      bgTint: 'rgba(255, 245, 232, 0.96)',
      focusBias: 'growth',
      guidance: 'Prioritizing business loans, tax relief & capital expansion.',
    };
  }

  if (dx >= 0 && dy < 0) {
    return {
      x,
      y,
      label: 'Optimistic',
      accentHex: '#65A30D',
      bgTint: 'rgba(243, 250, 230, 0.96)',
      focusBias: 'explore',
      guidance: 'Surfacing future wave schemes, grants & funded skills.',
    };
  }

  if (dx < 0 && dy >= 0) {
    return {
      x,
      y,
      label: 'Urgent',
      accentHex: '#EA580C',
      bgTint: 'rgba(255, 239, 235, 0.96)',
      focusBias: 'urgent',
      guidance: 'Putting overdue hospital appointments & deadlines at the front.',
    };
  }

  return {
    x,
    y,
    label: 'Calm',
    accentHex: '#0284C7',
    bgTint: 'rgba(232, 246, 252, 0.96)',
    focusBias: 'calm',
    guidance: 'Gentle, zero-stress government bonuses & savings checkups first.',
  };
}

export const DotMatrixPulseSheet: React.FC<DotMatrixPulseSheetProps> = ({
  initialPulse,
  onApply,
  onClose,
}) => {
  const [pulse, setPulse] = useState<PulseFeeling>(initialPulse);
  const [dragging, setDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientPos = (clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    setPulse(resolvePulseFromCoords(nx, ny));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/20 px-2 pb-2 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 36, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 330, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: pulse.bgTint }}
        className="relative overflow-hidden rounded-[34px] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.16)] transition-colors duration-300"
      >
        {/* Top Row + Close */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-[19px] leading-[1.22] font-semibold tracking-[-0.02em] text-[#1C1C1E]">
            Right now my life focus feels aligned toward{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={pulse.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                style={{ color: pulse.accentHex }}
                className="inline-block"
              >
                {pulse.label}
              </motion.span>
            </AnimatePresence>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-black/60 hover:bg-black/10"
            aria-label="Close Life Pulse"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mb-3 text-[11.5px] leading-snug text-[#636366]">{pulse.guidance}</p>

        {/* Interactive 2D Proximity Ripple Dot Matrix */}
        <div
          ref={gridRef}
          onPointerDown={(e) => {
            setDragging(true);
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            updateFromClientPos(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging) updateFromClientPos(e.clientX, e.clientY);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          className="relative touch-none select-none overflow-hidden rounded-[24px] bg-white/60 p-3.5 shadow-inner"
        >
          {/* Ambient radial glow beneath thumb */}
          <div
            className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-xl transition-all duration-150"
            style={{
              left: `${pulse.x * 100}%`,
              top: `${pulse.y * 100}%`,
              backgroundColor: pulse.accentHex,
            }}
          />

          <div
            className="relative grid gap-y-2.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((__, c) => {
                const gx = c / (COLS - 1);
                const gy = r / (ROWS - 1);
                const dist = Math.hypot(gx - pulse.x, gy - pulse.y);
                const influence = Math.max(0, 1 - dist / 0.29);
                const scale = 1 + influence * 2.15;
                const isCenterRef = r === 4 && c === 6;

                return (
                  <div key={`${r}-${c}`} className="flex h-4 items-center justify-center">
                    <span
                      className="block rounded-full transition-transform duration-100"
                      style={{
                        width: 3.5,
                        height: 3.5,
                        transform: `scale(${scale.toFixed(2)})`,
                        backgroundColor:
                          influence > 0.08 ? pulse.accentHex : 'rgba(120, 120, 128, 0.25)',
                        opacity: influence > 0.08 ? 0.25 + influence * 0.72 : isCenterRef ? 0.55 : 0.4,
                        boxShadow: isCenterRef ? '0 0 0 1px rgba(0,0,0,0.22)' : 'none',
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Glowing Luminous Thumb Puck */}
          <div
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_14px_rgba(0,0,0,0.16),0_0_18px_rgba(255,255,255,0.95)] transition-[left,top] duration-75"
            style={{
              left: `${pulse.x * 100}%`,
              top: `${pulse.y * 100}%`,
            }}
          />
        </div>

        {/* Apply CTA */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-[#636366]">
            Drag matrix to re-weight life priorities
          </span>
          <button
            type="button"
            onClick={() => {
              onApply(pulse);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#111113] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-black/85 active:scale-95"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Focus</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface AccessoryToolbarDockProps {
  activePulseLabel: string;
  householdSize: number;
  onCalibrate: () => void;
  onCategoryFilter: () => void;
  onLearnSchemes: () => void;
  onAreaRadar: () => void;
  onOpenCrowd: () => void;
  onOpenPulseMatrix: () => void;
  onOpenPlaybook?: () => void;
}

export const AccessoryToolbarDock: React.FC<AccessoryToolbarDockProps> = ({
  activePulseLabel,
  householdSize,
  onCalibrate,
  onCategoryFilter,
  onLearnSchemes,
  onAreaRadar,
  onOpenCrowd,
  onOpenPulseMatrix,
  onOpenPlaybook,
}) => {
  const items = [
    { icon: SlidersHorizontal, label: 'Onboard & Calibrate', onClick: onCalibrate },
    { icon: Tag, label: 'Categories', onClick: onCategoryFilter },
    { icon: BookOpen, label: 'Life Playbook', onClick: onOpenPlaybook ?? onLearnSchemes },
    { icon: MapIcon, label: 'Area Radar', onClick: onAreaRadar },
    {
      icon: User,
      label: `Group (${householdSize >= 16 ? '16+' : householdSize})`,
      onClick: onOpenCrowd,
    },
    { icon: Brain, label: activePulseLabel, onClick: onOpenPulseMatrix },
  ];

  return (
    <div className="flex items-center justify-between rounded-full bg-white/95 px-2.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
      {items.map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          title={label}
          className="group flex h-7 w-9 items-center justify-center rounded-full text-[#1C1C1E] transition hover:bg-black/[0.05] active:scale-90"
        >
          <Icon className="h-[15px] w-[15px] stroke-[1.65]" />
        </button>
      ))}
    </div>
  );
};
