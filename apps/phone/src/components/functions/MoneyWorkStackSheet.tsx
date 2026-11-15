import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import {
  computeIncomeBreakdown,
  DEFAULT_SUBSCRIPTIONS,
  getAvailableBankAccounts,
  getProtectionChecklist,
} from '@life/core/engine';
import type { UserProfile, WorkStatus } from '@life/core/types';
import { workSetupPatch } from '@life/core/onboarding';
import { IncomeDetails, IncomeWhatIf, TaxSettingsFields } from './IncomeDecisionPanel';
import { fieldSurface, NumberField } from './SheetControls';

interface MoneyWorkStackSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
}

const WORK_OPTIONS: Array<{ id: WorkStatus; label: string }> = [
  { id: 'employed', label: 'Employed' },
  { id: 'sole-trader', label: 'Sole trader' },
  { id: 'director', label: 'Company director' },
  { id: 'student-between', label: 'Studying / between jobs' },
];

export const MoneyWorkStackSheet: React.FC<MoneyWorkStackSheetProps> = ({
  profile,
  darkMode = false,
  onUpdateProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'work' | 'what-if' | 'accounts' | 'protection'>('work');

  const currency =
    profile.countryCode === 'UK'
      ? '£'
      : profile.countryCode === 'US'
      ? '$'
      : profile.countryCode === 'DE'
      ? '€'
      : '₦';

  const breakdown = computeIncomeBreakdown(profile);
  const accounts = getAvailableBankAccounts(profile);
  const policies = getProtectionChecklist(profile);
  const subs = profile.subscriptions ?? DEFAULT_SUBSCRIPTIONS;

  const activeSubsMonthly = subs
    .filter((s) => !s.cancelled)
    .reduce((sum, s) => sum + s.monthlyCost, 0);
  const savedSubsAnnual = Math.round(
    subs.filter((s) => s.cancelled).reduce((sum, s) => sum + s.monthlyCost, 0) * 12
  );

  const toggleAccount = (acctId: string) => {
    const current = profile.openedAccountIds ?? [];
    const next = current.includes(acctId)
      ? current.filter((x) => x !== acctId)
      : [...current, acctId];
    onUpdateProfile({ openedAccountIds: next });
  };

  const toggleSubscription = (subId: string) => {
    const next = subs.map((s) => (s.id === subId ? { ...s, cancelled: !s.cancelled } : s));
    onUpdateProfile({ subscriptions: next });
  };

  const togglePolicy = (policyId: string) => {
    const current = profile.protectedPolicyIds ?? [];
    const next = current.includes(policyId)
      ? current.filter((x) => x !== policyId)
      : [...current, policyId];
    onUpdateProfile({ protectedPolicyIds: next });
  };

  const selectedButton = darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white';
  const field = fieldSurface(darkMode);
  const payroll = profile.workStatus === 'employed' || profile.workStatus === 'director';
  const ukDirector = profile.countryCode === 'UK' && profile.workStatus === 'director';
  const annualLabel = ukDirector ? 'Company profit before director pay' : profile.workStatus === 'sole-trader' ? 'Annual profit after business costs' : 'Annual gross pay';
  const taxReviewed = profile.taxReviewed ?? (profile.answeredQuestionIds.includes('q-tax-compliance') && !profile.needsTaxOrDebtFix);

  const surfaceBg = darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]';
  const cardBg = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const subText = darkMode ? 'text-[#9C9CA4]' : 'text-[#6A6A72]';
  const positiveText = darkMode ? 'text-[#72D2A3]' : 'text-[#16794F]';
  const bluePill = darkMode ? 'bg-[#84A0FF]/12 text-[#84A0FF]' : 'bg-[#2347D8]/12 text-[#2347D8]';
  const redPill = darkMode ? 'bg-[#F0887A]/12 text-[#F0887A]' : 'bg-[#C43929]/12 text-[#C43929]';
  const greenPill = darkMode ? 'bg-[#72D2A3]/15 text-[#72D2A3]' : 'bg-[#16794F]/15 text-[#16794F]';
  const tabWrapBg = darkMode ? 'bg-[#202026]' : 'bg-[#F2F1EE]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/35"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Work and money"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-t-[28px] px-5 pt-4 pb-6 max-h-[88%] overflow-y-auto no-scrollbar ${surfaceBg}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-[28px] leading-[1.08] tracking-[-0.02em] mt-0.5">
              Work &amp; money
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Work and Money Stack"
            className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition ${cardBg}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`mt-4 grid grid-cols-4 gap-1 rounded-[16px] p-1 ${tabWrapBg}`}>
          {[
            { id: 'work' as const, label: 'Work & tax' },
            { id: 'what-if' as const, label: 'What If' },
            { id: 'accounts' as const, label: 'Accounts' },
            { id: 'protection' as const, label: 'Protection' },
          ].map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={activeTab === id} onClick={() => setActiveTab(id)}
              className={`rounded-xl px-1 py-2 text-[13px] font-medium leading-tight ${activeTab === id ? 'bg-white text-[#141416]' : subText}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'work' && (
          <div className="mt-4 space-y-3">
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">How you’re paid</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {WORK_OPTIONS.map(({ id, label }) => (
                  <button key={id} type="button" aria-pressed={profile.workStatus === id}
                    onClick={() => onUpdateProfile(workSetupPatch(profile, id))}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${profile.workStatus === id ? selectedButton : (darkMode ? 'bg-[#16161B]' : 'bg-white')}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberField label={`${annualLabel} (${currency})`} darkMode={darkMode} value={profile.annualIncome}
                  onChange={(value) => onUpdateProfile({ annualIncome: value ?? 0 })} />
                {profile.countryCode === 'UK' && payroll && (
                  <label className="text-[13px]">
                    PAYE code
                    <input type="text" value={profile.taxCode} onChange={(event) => onUpdateProfile({ taxCode: event.currentTarget.value })} className={field} />
                  </label>
                )}
                {profile.countryCode !== 'NG' && profile.workStatus !== 'student-between' && (
                  <>
                    <NumberField label={ukDirector ? 'Company pension (% of salary)' : 'Your pension contribution (%)'}
                      darkMode={darkMode} value={profile.monthlyPensionPct} max={40}
                      onChange={(value) => onUpdateProfile({ monthlyPensionPct: value ?? 0 })} />
                    {payroll && !ukDirector && (
                      <NumberField label="Employer pension contribution (%)" darkMode={darkMode} value={profile.employerMatchPct} max={20}
                        onChange={(value) => onUpdateProfile({ employerMatchPct: value ?? 0 })} />
                    )}
                  </>
                )}
              </div>
            </div>
            <TaxSettingsFields profile={profile} darkMode={darkMode}
              onChange={(patch) => onUpdateProfile({ taxSettings: { ...profile.taxSettings, ...patch } })} />
            <IncomeDetails profile={profile} darkMode={darkMode} breakdown={breakdown} />
            <label className={`flex items-start gap-2 rounded-[18px] p-3.5 text-[13px] ${cardBg}`}>
              <input type="checkbox" checked={taxReviewed} onChange={(event) => onUpdateProfile({
                taxReviewed: event.currentTarget.checked,
                needsTaxOrDebtFix: !event.currentTarget.checked,
              })} className="mt-0.5 accent-[#2347D8]" />
              I reviewed this year’s tax and pension contribution records.
            </label>
          </div>
        )}

        {activeTab === 'what-if' && <IncomeWhatIf profile={profile} darkMode={darkMode} />}

        {/* TAB 2: Bank Accounts & Subscriptions Purge */}
        {activeTab === 'accounts' && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold">Available Accounts & Tax Wrappers</p>
              {accounts.map((acct) => (
                <button
                  key={acct.id}
                  type="button"
                  onClick={() => toggleAccount(acct.id)}
                  className={`w-full text-left rounded-[20px] p-3.5 flex items-start justify-between gap-3 transition ${cardBg}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold">{acct.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[13px] font-medium ${
                          acct.priority === 'Core'
                            ? bluePill
                            : darkMode
                            ? 'bg-[#2C2C35] text-[#C8C8D0]'
                            : 'bg-white text-[#6A6A72]'
                        }`}
                      >
                        {acct.rateOrPerk}
                      </span>
                    </div>
                    <p className={`mt-1 text-[13px] leading-snug ${subText}`}>{acct.role}</p>
                  </div>
                  <div
                    className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      acct.opened
                        ? 'bg-[#16794F] text-white'
                        : darkMode
                        ? 'bg-[#2C2C35] text-[#9C9CA4]'
                        : 'bg-white text-[#6A6A72]'
                    }`}
                  >
                    {acct.opened ? <Check className="h-3.5 w-3.5" /> : <span className="text-[13px]">+</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold">Subscriptions Audit</p>
                  <p className={`text-[13px] ${subText}`}>
                    Active {currency}
                    {activeSubsMonthly.toFixed(2)}/mo · Reclaimed{' '}
                    <span className={`font-semibold ${positiveText}`}>
                      +{currency}
                      {savedSubsAnnual}/yr
                    </span>
                  </p>
                </div>
              </div>

              <label className={`flex items-center gap-2 rounded-[18px] p-3.5 text-[13px] ${cardBg}`}>
                <input type="checkbox" checked={Boolean(profile.subscriptionsReviewed)} onChange={(event) => onUpdateProfile({ subscriptionsReviewed: event.currentTarget.checked })} className="accent-[#2347D8]" />
                I reviewed my subscriptions and upcoming renewals.
              </label>
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  className={`flex items-center justify-between rounded-[18px] px-4 py-3 ${cardBg}`}
                >
                  <div>
                    <p
                      className={`text-[14px] font-medium ${
                        sub.cancelled ? 'line-through opacity-55' : ''
                      }`}
                    >
                      {sub.name}
                    </p>
                    <p className={`text-[13px] ${subText}`}>
                      {sub.category} · {currency}
                      {sub.monthlyCost.toFixed(2)}/mo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSubscription(sub.id)}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                      sub.cancelled
                        ? greenPill
                        : redPill
                    }`}
                  >
                    {sub.cancelled ? 'Marked cancelled' : 'Mark cancelled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Insurance, Dependents & Continuity */}
        {activeTab === 'protection' && (
          <div className="mt-4 space-y-2.5">
            <div className={`rounded-[20px] p-3.5 flex items-center justify-between ${cardBg}`}>
              <div>
                <p className="text-[14px] font-semibold">Dependents rely on your income?</p>
                <p className={`text-[13px] ${subText}`}>
                  Tailors whether Term Life & Will guardianship sit at Critical urgency
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateProfile({ hasDependents: !profile.hasDependents })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  profile.hasDependents
                    ? 'bg-[#141416] text-white'
                    : darkMode
                    ? 'bg-[#2C2C35] text-[#D0D0D8]'
                    : 'bg-white text-[#141416]'
                }`}
              >
                {profile.hasDependents ? 'Yes' : 'No'}
              </button>
            </div>

            {policies.map((pol) => (
              <button
                key={pol.id}
                type="button"
                onClick={() => togglePolicy(pol.id)}
                className={`w-full text-left rounded-[20px] p-4 flex items-start justify-between gap-3 transition ${cardBg}`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold">{pol.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[13px] font-semibold ${
                        pol.urgency === 'Critical'
                          ? redPill
                          : pol.urgency === 'Recommended'
                          ? bluePill
                          : darkMode
                          ? 'bg-[#2C2C35] text-[#9C9CA4]'
                          : 'bg-white text-[#6A6A72]'
                      }`}
                    >
                      {pol.urgency}
                    </span>
                  </div>
                  <p className={`mt-1 text-[13px] leading-snug ${subText}`}>{pol.whyNeeded}</p>
                </div>
                <div
                  className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    pol.inPlace
                      ? 'bg-[#16794F] text-white'
                      : darkMode
                      ? 'bg-[#2C2C35] text-[#9C9CA4]'
                      : 'bg-white text-[#6A6A72]'
                  }`}
                >
                  {pol.inPlace ? <Check className="h-3.5 w-3.5" /> : <span className="text-[13px]">+</span>}
                </div>
              </button>
            ))}

            <p className={`pt-1 text-[13px] leading-snug ${subText}`}>
              Check what you could cover from savings first. Then review which risks need insurance, a beneficiary or someone authorised to act.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
