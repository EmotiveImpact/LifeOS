import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ChevronRight,
  FileText,
  Folder,
  Image as ImageIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { SAMPLE_EVIDENCE_DOCS } from '@life/core/engine';
import { EvidenceDocument } from '@life/core/types';

interface BlurIntakeOverlayProps {
  scannedDocIds: string[];
  onProcessEvidence: (doc: EvidenceDocument) => void;
  onClose: () => void;
}

export const BlurIntakeOverlay: React.FC<BlurIntakeOverlayProps> = ({
  scannedDocIds,
  onProcessEvidence,
  onClose,
}) => {
  const [showRecents, setShowRecents] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleTrigger = (doc: EvidenceDocument) => {
    setProcessingId(doc.id);
    setTimeout(() => {
      onProcessEvidence(doc);
      setProcessingId(null);
      onClose();
    }, 450);
  };

  const primaryActions: Array<{
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    doc: EvidenceDocument;
  }> = [
    {
      label: 'Camera',
      subtitle: 'Scan NHS referral or tax letter',
      icon: Camera,
      doc: SAMPLE_EVIDENCE_DOCS[0],
    },
    {
      label: 'Photos',
      subtitle: 'Council bill or pay statement',
      icon: ImageIcon,
      doc: SAMPLE_EVIDENCE_DOCS[1],
    },
    {
      label: 'Files',
      subtitle: 'Companies House or P60 PDF',
      icon: Folder,
      doc: SAMPLE_EVIDENCE_DOCS[2],
    },
  ];

  const planDoc = SAMPLE_EVIDENCE_DOCS[3];

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(22px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.28 }}
      className="absolute inset-0 z-40 flex flex-col justify-between bg-white/72 px-6 pt-14 pb-8 text-[#111113]"
      onClick={onClose}
    >
      {/* Top Breadcrumb: Recents > & Close */}
      <div
        className="flex items-center justify-between pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowRecents((s) => !s)}
          className="inline-flex items-center gap-1 text-[16px] font-medium text-[#636366] transition hover:text-[#111113]"
        >
          <span>Recents</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${showRecents ? 'rotate-90' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-black/60 hover:bg-black/10"
          aria-label="Close Intake Overlay"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Expandable Recents Drawer */}
      <AnimatePresence>
        {showRecents && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="my-2 overflow-hidden rounded-2xl bg-white/85 p-2.5 shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
          >
            <p className="mb-1.5 px-1 text-[12px] font-semibold text-[#4A4A4F]">
              Recent letters &amp; bills
            </p>
            <div className="space-y-1">
              {SAMPLE_EVIDENCE_DOCS.slice(0, 3).map((doc) => {
                const already = scannedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleTrigger(doc)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] transition hover:bg-black/[0.04]"
                  >
                    <span className="flex items-center gap-2 truncate font-medium text-[#141416]">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#4A4A4F]" />
                      <span className="truncate">{doc.title}</span>
                    </span>
                    <span className="ml-2 shrink-0 text-[12px] font-medium text-[#16794F]">
                      {already ? 'Added ✓' : `+${doc.scoreBonus} pts`}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Action List matching Video 2 geometry */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        onClick={(e) => e.stopPropagation()}
        className="my-auto space-y-4"
      >
        <div className="space-y-4">
          {primaryActions.map(({ label, subtitle, icon: Icon, doc }) => {
            const busy = processingId === doc.id;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleTrigger(doc)}
                className="group flex w-full items-center gap-4 text-left transition active:scale-[0.98]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111113] text-white shadow-sm transition group-hover:scale-105">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[16px] font-medium text-[#111113]">
                    {busy ? `Scanning ${label}...` : label}
                  </p>
                  <p className="text-[11.5px] text-[#636366]">{subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="my-4 h-px w-full bg-black/[0.08]" />

        {/* Dashed Circle AI Action ("Create Image" -> "Create Plan") */}
        <button
          type="button"
          onClick={() => handleTrigger(planDoc)}
          className="group flex w-full items-center gap-4 text-left transition active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[#111113] transition group-hover:bg-black/[0.11]">
            <Sparkles className="h-[17px] w-[17px]" />
          </span>
          <div>
            <p className="text-[16px] font-medium text-[#111113]">
              {processingId === planDoc.id ? 'Generating Plan...' : 'Create Plan'}
            </p>
            <p className="text-[11.5px] text-[#636366]">
              Generate 30-day score & scheme roadmap
            </p>
          </div>
        </button>
      </motion.div>

      <p className="text-center text-[12.5px] text-[#4A4A4F]">
        Tap anywhere outside to close
      </p>
    </motion.div>
  );
};
