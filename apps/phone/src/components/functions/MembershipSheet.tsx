import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft } from 'lucide-react';
import { UserProfile } from '@life/core/types';

interface MembershipSheetProps {
  profile: UserProfile;
  onClose: () => void;
}

export const MembershipSheet: React.FC<MembershipSheetProps> = ({ profile, onClose }) => {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [activated, setActivated] = useState(false);

  const currency =
    profile.countryCode === 'UK'
      ? '£'
      : profile.countryCode === 'US'
      ? '$'
      : profile.countryCode === 'DE'
      ? '€'
      : '₦';

  const annualPrice = profile.countryCode === 'NG' ? '₦24,000' : `${currency}48.00`;
  const annualSub = profile.countryCode === 'NG' ? '₦2,000/month' : `${currency}4.00/month`;
  const monthlyPrice = profile.countryCode === 'NG' ? '₦3,000' : `${currency}6.00`;
  const monthlySub = profile.countryCode === 'NG' ? '₦36,000/year' : `${currency}72.00/year`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-[28px] px-5 pt-5 pb-7 text-white max-h-[90%] overflow-y-auto no-scrollbar"
        style={{
          backgroundImage:
            'radial-gradient(circle at 68% 6%, rgba(234, 88, 12, 0.34) 0%, rgba(124, 45, 18, 0.16) 28%, #0C0C0F 62%, #08080A 100%)',
        }}
      >
        {/* Top Back Chevron (02-membership-subscribe-dark.jpg) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Centered Editorial Proposition */}
        <div className="mt-6 text-center px-2">
          <h2 className="font-serif-editorial text-[34px] leading-[1.08] tracking-[-0.02em]">
            Unlock life+
          </h2>
          <p className="mt-3 text-[15px] font-medium leading-snug text-white/90">
            Live tax-code watches, annual biomarker tracking & full coaching playbooks.
          </p>
          <p className="mt-3 text-[14px] leading-snug text-white/55">
            Your data stays private and is never sold or rented to lenders.
          </p>
        </div>

        {/* Two Side-by-Side Pricing Tiles */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBilling('annual')}
            className={`relative rounded-[18px] px-3 py-5 text-center transition ${
              billing === 'annual'
                ? 'bg-white/[0.12] shadow-[0_0_0_1.5px_rgba(255,255,255,0.92)]'
                : 'bg-white/[0.04] text-white/65 hover:bg-white/[0.08]'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-[#0C0C0F]">
              33% OFF
            </span>
            <p className="text-[14.5px] font-semibold">{annualPrice}/year</p>
            <p className="mt-0.5 text-[12.5px] opacity-70">({annualSub})</p>
          </button>

          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`relative rounded-[18px] px-3 py-5 text-center transition ${
              billing === 'monthly'
                ? 'bg-white/[0.12] shadow-[0_0_0_1.5px_rgba(255,255,255,0.92)]'
                : 'bg-white/[0.04] text-white/65 hover:bg-white/[0.08]'
            }`}
          >
            <p className="text-[14.5px] font-semibold">{monthlyPrice}/month</p>
            <p className="mt-0.5 text-[12.5px] opacity-70">({monthlySub})</p>
          </button>
        </div>

        {/* White Pill Primary Action */}
        <button
          type="button"
          onClick={() => setActivated(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] font-semibold text-[#0C0C0F] transition hover:bg-white/92 active:scale-[0.99]"
        >
          {activated ? (
            <>
              <Check className="h-4 w-4 text-[#16794F]" />
              <span>life+ 7-day trial preview active</span>
            </>
          ) : (
            <span>Start 7-day free trial</span>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-1.5 text-center text-[14px] font-medium text-white/60 hover:text-white/90"
        >
          Maybe later
        </button>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-white/45">
          All core life map, runway math, tax & health tools stay free. Cancel any time before renewal.
        </p>
      </motion.div>
    </motion.div>
  );
};
