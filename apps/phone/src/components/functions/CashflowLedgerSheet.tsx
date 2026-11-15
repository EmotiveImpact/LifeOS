import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Search,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { computeIncomeBreakdown, DEFAULT_SUBSCRIPTIONS } from '@life/core/engine';
import { ActiveFunctionOverlay, UserProfile } from '@life/core/types';

interface CashflowLedgerSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  onUpdateProfile?: (patch: Partial<UserProfile>) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
  onClose: () => void;
}

const TIMELINE_POINTS = [
  { id: 't-2', label: '-2w · Nov 01', tag: 'History', multiplier: 0.91, deltaLabel: '+1.8%' },
  { id: 't-1', label: '-1w · Nov 08', tag: 'Recent', multiplier: 0.96, deltaLabel: '+3.1%' },
  { id: 't-0', label: 'Nov 15 · Today', tag: 'Today', multiplier: 1.0, deltaLabel: '+4.8%' },
  { id: 't+1', label: '+15d · Payday', tag: 'Forecast', multiplier: 1.12, deltaLabel: '+12.0%' },
  { id: 't+2', label: '+30d · Net End', tag: '30d Est', multiplier: 1.21, deltaLabel: '+21.0%' },
];

export const CashflowLedgerSheet: React.FC<CashflowLedgerSheetProps> = ({
  profile,
  darkMode = false,
  onUpdateProfile,
  onOpenOverlay,
  onClose,
}) => {
  const [pointIdx, setPointIdx] = useState(2); // Today default
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterKind, setFilterKind] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [localHidden, setLocalHidden] = useState(Boolean(profile.hideBalances));
  const hideBalances = onUpdateProfile ? Boolean(profile.hideBalances) : localHidden;
  const toggleHideBalances = () => {
    const next = !hideBalances;
    setLocalHidden(next);
    onUpdateProfile?.({ hideBalances: next });
  };

  const currency =
    profile.countryCode === 'UK'
      ? '£'
      : profile.countryCode === 'US'
      ? '$'
      : profile.countryCode === 'DE'
      ? '€'
      : '₦';

  const breakdown = computeIncomeBreakdown(profile);
  const subs = profile.subscriptions ?? DEFAULT_SUBSCRIPTIONS;
  const activeSubsTotal = subs.filter((s) => !s.cancelled).reduce((acc, s) => acc + s.monthlyCost, 0);
  const reclaimedAnnual = subs.filter((s) => s.cancelled).reduce((acc, s) => acc + s.monthlyCost * 12, 0);

  const baseBalance =
    profile.runway !== undefined
      ? Math.max(0, profile.runway.balance + profile.runway.expectedIncome - profile.runway.essentialBills) +
        (profile.openedAccountIds?.includes('acct-cash-buffer') ? 2400 : 850)
      : Math.max(1200, breakdown.netTakeHomeMonthly + 940);

  const currentPoint = TIMELINE_POINTS[pointIdx] ?? TIMELINE_POINTS[2];
  const scrubbedAmount = Number((baseBalance * currentPoint.multiplier).toFixed(2));
  const [wholePart, decPart] = scrubbedAmount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).split('.');
  const deltaCash = Math.round(scrubbedAmount * 0.048);

  const ledgerEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      group: 'TODAY' | 'MONTHLY FLOWS';
      kind: 'inflow' | 'outflow' | 'sweep';
      title: string;
      amount: string;
      subDetail: string;
      positive?: boolean;
      overlay: ActiveFunctionOverlay;
    }> = [
      {
        id: 'tx-net-pay',
        group: 'TODAY',
        kind: 'inflow',
        title:
          profile.workStatus === 'sole-trader'
            ? 'Client Invoice Settlement'
            : 'Monthly Net Take-Home',
        amount: `+${currency}${breakdown.netTakeHomeMonthly.toLocaleString()}`,
        subDetail: `Tax code ${profile.taxCode} · Net after pension`,
        positive: true,
        overlay: 'money-work',
      },
      {
        id: 'tx-bills',
        group: 'TODAY',
        kind: 'outflow',
        title: profile.runway?.dueSoonLabel || 'Rent & Fixed Essentials',
        amount: `-${currency}${(profile.runway?.essentialBills ?? 1420).toLocaleString()}`,
        subDetail: '30-day core bills envelope',
        overlay: 'runway-calc',
      },
    ];

    if (breakdown.taxReserveMonthly > 0) {
      entries.push({
        id: 'tx-tax-sweep',
        group: 'TODAY',
        kind: 'sweep',
        title: 'Sole-Trader Tax Vault Sweep',
        amount: `${currency}${breakdown.taxReserveMonthly.toLocaleString()}`,
        subDetail: 'Reserved for SA-UTR & NI',
        overlay: 'money-work',
      });
    }

    entries.push({
      id: 'tx-pension',
      group: 'MONTHLY FLOWS',
      kind: 'sweep',
      title: 'Pension + Employer Match',
      amount: `+${currency}${(breakdown.pensionEmployeeMonthly + breakdown.pensionEmployerMonthly).toLocaleString()}`,
      subDetail: `${profile.monthlyPensionPct}% you + ${profile.employerMatchPct}% employer`,
      positive: true,
      overlay: 'money-work',
    });

    entries.push({
      id: 'tx-subs',
      group: 'MONTHLY FLOWS',
      kind: 'outflow',
      title: 'Active Subscriptions Pool',
      amount: `-${currency}${activeSubsTotal.toFixed(2)}`,
      subDetail:
        reclaimedAnnual > 0
          ? `+${currency}${Math.round(reclaimedAnnual)}/yr already reclaimed`
          : 'Tap to audit & cancel unused trials',
      overlay: 'money-work',
    });

    return entries.filter((item) => {
      if (filterKind === 'inflow' && !item.positive) return false;
      if (filterKind === 'outflow' && item.positive) return false;
      if (
        searchTerm.trim() &&
        !`${item.title} ${item.subDetail}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [breakdown, profile, currency, activeSubsTotal, reclaimedAnnual, filterKind, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="overflow-hidden rounded-t-[28px] max-h-[90%] flex flex-col text-white"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, #0E5045 0%, #062520 45%, #03120F 100%)',
        }}
      >
        {/* Top Deep Emerald Balance + Timeline Scrubber Header (06-emerald-ledger-transactions.jpg) */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Cash Ledger"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/18"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenOverlay('runway-calc')}
              aria-label="Edit 30-day numbers"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/18"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[13px] font-medium text-[#34D399]">
              ▲ {currentPoint.deltaLabel}{' '}
              <span className="text-white/65 ml-1">
                {hideBalances ? '••••' : `+${currency}${deltaCash.toLocaleString()}`}
              </span>
            </p>
            <div className="mt-1 inline-flex items-baseline justify-center gap-2">
              <p className="text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums">
                {hideBalances ? (
                  <span>••••••</span>
                ) : (
                  <>
                    {currency}
                    {wholePart}
                    <span className="text-white/45">.{decPart}</span>
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={toggleHideBalances}
                aria-label={hideBalances ? 'Show balance' : 'Hide balance'}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-white/85 transition hover:bg-white/20"
              >
                {hideBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Date Capsule + Today Button */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/12 px-3.5 py-1 text-[12.5px] font-medium text-white">
              {currentPoint.label}
            </span>
            {pointIdx !== 2 && (
              <button
                type="button"
                onClick={() => setPointIdx(2)}
                className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium text-white/90 hover:bg-white/25"
              >
                Today
              </button>
            )}
          </div>

          {/* Tick Timeline Scrubber */}
          <div className="mt-4 flex items-center justify-between px-2">
            {TIMELINE_POINTS.map((pt, i) => {
              const isSelected = i === pointIdx;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setPointIdx(i)}
                  className="group flex flex-col items-center gap-1 py-1 px-2"
                  title={pt.label}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-[1.5px] rounded-full bg-white/20" />
                    <span
                      className={`transition-all rounded-full ${
                        isSelected
                          ? 'h-6 w-2.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                          : 'h-3.5 w-[2px] bg-white/45 group-hover:bg-white/80'
                      }`}
                    />
                    <span className="h-2.5 w-[1.5px] rounded-full bg-white/20" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rising White/Dark Cashflow & Sweeps Sheet */}
        <div
          className={`flex-1 overflow-y-auto no-scrollbar rounded-t-[26px] px-5 pt-4 pb-6 ${
            darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[17px] font-bold tracking-[-0.01em]">Cashflow & Sweeps</h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSearch((v) => !v)}
                aria-label="Search cashflow"
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  darkMode ? 'bg-[#22222A]' : 'bg-[#F4F2ED]'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilterKind((k) => (k === 'all' ? 'inflow' : k === 'inflow' ? 'outflow' : 'all'))
                }
                aria-label="Filter inflows or outflows"
                className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold ${
                  darkMode ? 'bg-[#22222A]' : 'bg-[#F4F2ED]'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span className="capitalize">{filterKind}</span>
              </button>
            </div>
          </div>

          {showSearch && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter salary, rent, tax vault..."
              className={`mt-2.5 w-full rounded-[14px] px-3.5 py-2 text-[13px] outline-none ${
                darkMode ? 'bg-[#202026] text-white' : 'bg-[#F6F6F7] text-[#141416]'
              }`}
            />
          )}

          <div className="mt-4 space-y-2.5">
            {ledgerEntries.map((item) => {
              const Icon =
                item.kind === 'inflow'
                  ? ArrowDownLeft
                  : item.kind === 'sweep'
                  ? ArrowLeftRight
                  : ArrowUpRight;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenOverlay(item.overlay)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[18px] px-3 py-2.5 text-left transition ${
                    darkMode ? 'hover:bg-[#202026]' : 'hover:bg-[#F7F7F8]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        item.positive
                          ? 'bg-[#16794F]/12 text-[#16794F]'
                          : darkMode
                          ? 'bg-[#22222A] text-white/80'
                          : 'bg-[#F3F3F5] text-[#141416]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold">{item.title}</p>
                      <p
                        className={`truncate text-[12px] ${
                          darkMode ? 'text-white/50' : 'text-[#6A6A72]'
                        }`}
                      >
                        {item.subDetail}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-[14.5px] font-semibold tabular-nums ${
                        item.positive ? 'text-[#16794F]' : ''
                      }`}
                    >
                      {item.amount}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
