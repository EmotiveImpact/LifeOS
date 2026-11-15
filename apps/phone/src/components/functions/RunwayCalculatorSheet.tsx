import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Check, X } from 'lucide-react';
import { getCurrencySymbol } from '@life/core/engine';
import { RunwaySnapshot, UserProfile } from '@life/core/types';

interface RunwayCalculatorSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  onSaveRunway: (snapshot: RunwaySnapshot) => void;
  onClose: () => void;
}

export const RunwayCalculatorSheet: React.FC<RunwayCalculatorSheetProps> = ({
  profile,
  darkMode = false,
  onSaveRunway,
  onClose,
}) => {
  const symbol = getCurrencySymbol(profile.countryCode);
  const existing = profile.runway;

  const [balanceStr, setBalanceStr] = useState(String(existing?.balance ?? 640));
  const [incomeStr, setIncomeStr] = useState(String(existing?.expectedIncome ?? 1850));
  const [billsStr, setBillsStr] = useState(String(existing?.essentialBills ?? 1620));
  const [dueSoonLabel, setDueSoonLabel] = useState(
    existing?.dueSoonLabel ?? 'Rent due in 6 days'
  );
  const [followUpLabel, setFollowUpLabel] = useState(
    existing?.followUpLabel ?? 'Call about final pay on Tuesday'
  );

  const balance = Math.max(0, Number(balanceStr) || 0);
  const expectedIncome = Math.max(0, Number(incomeStr) || 0);
  const essentialBills = Math.max(0, Number(billsStr) || 0);
  const netRunway = balance + expectedIncome - essentialBills;
  const isCovered = netRunway >= 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRunway({
      balance,
      expectedIncome,
      essentialBills,
      dueSoonLabel: dueSoonLabel.trim() || 'Essential bills due soon',
      followUpLabel: followUpLabel.trim() || 'Payday follow-up',
      netRunway,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSave}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className={`no-scrollbar flex max-h-[88%] flex-col overflow-y-auto rounded-t-[32px] px-5 pt-5 pb-6 shadow-[0_-18px_48px_rgba(0,0,0,0.28)] ${
          darkMode ? 'bg-[#141416] text-white' : 'bg-[#FFFFFF] text-[#141416]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-[13px] font-medium ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
              Money · First 30 days
            </p>
            <h3 className="mt-0.5 font-serif-editorial text-[26px] leading-tight">
              Work out your next 30 days
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
              darkMode
                ? 'bg-white/10 text-white/80 hover:bg-white/18'
                : 'bg-[#F4F2ED] text-[#4A4A4F] hover:bg-[#EAE6DD]'
            }`}
            aria-label="Close 30-day calculator"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Result Summary Card */}
        <div
          className={`mt-4 rounded-[22px] p-4 ${
            isCovered
              ? darkMode
                ? 'bg-[#16794F]/28 text-white'
                : 'bg-[#EAF6EF] text-[#141416]'
              : darkMode
                ? 'bg-[#C43929]/28 text-white'
                : 'bg-[#FCECE9] text-[#141416]'
          }`}
        >
          <p className={`text-[13px] font-medium ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
            {isCovered ? 'Left after essential bills' : 'Gap to cover over the next 30 days'}
          </p>
          <p
            className={`mt-0.5 font-serif-editorial text-[36px] leading-none ${
              isCovered
                ? darkMode
                  ? 'text-[#72D2A3]'
                  : 'text-[#16794F]'
                : darkMode
                  ? 'text-[#F0887A]'
                  : 'text-[#C43929]'
            }`}
          >
            {isCovered ? '+' : '-'}
            {symbol}
            {Math.abs(netRunway).toLocaleString()}
          </p>
          <p className={`mt-1.5 text-[13px] leading-[1.4] ${darkMode ? 'text-white/80' : 'text-[#4A4A4F]'}`}>
            {isCovered
              ? 'Your essentials are covered. We will keep this buffer and unlock your next move.'
              : 'You have an exact target now. Next we check support and cash leaks to close it.'}
          </p>
        </div>

        {/* Numbers Input Stack */}
        <div className="mt-4 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Balance', val: balanceStr, set: setBalanceStr },
              { label: 'Income', val: incomeStr, set: setIncomeStr },
              { label: 'Bills', val: billsStr, set: setBillsStr },
            ].map((fld) => (
              <label
                key={fld.label}
                className={`block rounded-2xl px-3 py-2.5 ${
                  darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'
                }`}
              >
                <span className={`block text-[13px] font-medium ${darkMode ? 'text-white/65' : 'text-[#4A4A4F]'}`}>
                  {fld.label}
                </span>
                <div className="mt-0.5 flex items-center gap-0.5 text-[15px] font-semibold">
                  <span>{symbol}</span>
                  <input
                    type="number"
                    min={0}
                    value={fld.val}
                    onChange={(e) => fld.set(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
              </label>
            ))}
          </div>

          <div className={`rounded-2xl p-3 ${darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'}`}>
            <div className={`flex items-center gap-1.5 text-[13px] font-medium ${darkMode ? 'text-white/70' : 'text-[#4A4A4F]'}`}>
              <CalendarClock className="h-3.5 w-3.5 text-[#2347D8]" />
              <span>Coming up on your calendar</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <input
                type="text"
                value={dueSoonLabel}
                onChange={(e) => setDueSoonLabel(e.target.value)}
                placeholder="e.g. Rent due in 6 days"
                className={`w-full rounded-xl px-3 py-2 text-[13px] focus:outline-none ${
                  darkMode
                    ? 'bg-black/35 text-white placeholder-white/45'
                    : 'bg-white text-[#141416] placeholder-[#6C6C72]'
                }`}
              />
              <input
                type="text"
                value={followUpLabel}
                onChange={(e) => setFollowUpLabel(e.target.value)}
                placeholder="e.g. Call about final pay on Tuesday"
                className={`w-full rounded-xl px-3 py-2 text-[13px] focus:outline-none ${
                  darkMode
                    ? 'bg-black/35 text-white placeholder-white/45'
                    : 'bg-white text-[#141416] placeholder-[#6C6C72]'
                }`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#2347D8] py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#1833A3] active:scale-[0.985]"
        >
          <Check className="h-4 w-4" />
          <span>Save my 30-day plan</span>
        </button>
      </motion.form>
    </motion.div>
  );
};
