import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Compass, ShieldCheck, Wallet, X } from 'lucide-react';
import { LIFE_DESTINATIONS } from '@life/core/engine';
import { LifeOSStateId, UserProfile } from '@life/core/types';
import { buildOnboardingAnswer } from '@life/core/onboarding';
import { ProgressiveQuestion } from '../functions/ProgressiveQuestion';

interface IntakeStateProps {
  mode: 'manifesto' | 'portal';
  profile: UserProfile;
  darkMode?: boolean;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onNavigate: (state: LifeOSStateId) => void;
}

const CITY_OPTIONS: Array<{
  city: string;
  countryCode: UserProfile['countryCode'];
  countryName: string;
}> = [
  { city: 'London', countryCode: 'UK', countryName: 'United Kingdom' },
  { city: 'Manchester', countryCode: 'UK', countryName: 'United Kingdom' },
  { city: 'New York', countryCode: 'US', countryName: 'United States' },
  { city: 'Berlin', countryCode: 'DE', countryName: 'Germany' },
  { city: 'Lagos', countryCode: 'NG', countryName: 'Nigeria' },
];

export const IntakeState: React.FC<IntakeStateProps> = ({
  mode,
  profile,
  darkMode = false,
  onUpdateProfile,
  onNavigate,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [planDepth, setPlanDepth] = useState<'Next 30 Days' | 'Balanced' | 'Full Audit'>('Next 30 Days');
  const [depthMenuOpen, setDepthMenuOpen] = useState(false);

  // ==================== MANIFESTO / STORY WELCOME (@roman_designer left screen) ====================
  if (mode === 'manifesto') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#141416] px-6 pt-13 pb-8 text-white"
      >
        <img
          src="/art/aura-portrait.png"
          alt="life"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-85"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/88" />

        {/* Top Dash Progress + Headline */}
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 pt-2">
            <span className="h-[3px] w-7 rounded-full bg-white" />
            <span className="h-[3px] w-2 rounded-full bg-white/40" />
            <span className="h-[3px] w-2 rounded-full bg-white/40" />
          </div>

          <h1 className="mt-5 text-[32px] leading-[1.08] font-semibold tracking-[-0.02em]">
            Run your life{' '}
            <span className="font-normal text-white/75">with clarity</span>
          </h1>
        </div>

        {/* Bottom Pillar Strip + Primary White CTA */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-4 text-white/80">
            <Wallet className="h-4 w-4" />
            <Compass className="h-4 w-4" />
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="max-w-[268px] text-[13.5px] leading-[1.48] text-white/85">
            Whether you’re sorting the next 30 days, changing work, or checking local schemes — start with one honest check-in.
          </p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('intake-portal')}
            className="mt-5 w-full rounded-full bg-white py-3.5 text-[14px] font-semibold text-[#141416] shadow-lg transition hover:bg-white/92"
          >
            Start building my plan
          </motion.button>

          <button
            type="button"
            onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
            className="mt-3 text-[13px] font-medium text-white/80 underline underline-offset-4 transition hover:text-white"
          >
            I already have a plan
          </button>
        </div>
      </motion.div>
    );
  }

  // ==================== PORTAL MULTI-STEP INTAKE (@roman_designer right screen) ====================
  const featuredDestinations = LIFE_DESTINATIONS;

  const handlePrimaryNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onNavigate(darkMode ? 'voice-dark' : 'hub-light');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden px-5 pt-13 pb-6 transition-colors duration-200 ${
        darkMode ? 'bg-[#0C0C0F] text-[#F5F4F0]' : 'bg-white text-[#141416]'
      }`}
    >
      {/* Top Close + Depth Pill */}
      <div className="relative z-20 flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
            darkMode ? 'bg-white/10 text-white hover:bg-white/16' : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
          }`}
          aria-label="Close check-in"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Clean Depth Picker inspired by video walkthrough */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDepthMenuOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              darkMode ? 'bg-[#17171B] text-white/85' : 'bg-[#F4F2ED] text-[#141416]'
            }`}
          >
            <span>Depth: {planDepth}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {depthMenuOpen && (
            <div
              className={`absolute right-0 mt-1.5 w-44 rounded-2xl p-1.5 shadow-xl ${
                darkMode ? 'bg-[#1D1D22] text-white' : 'bg-white text-[#141416] shadow-[0_12px_32px_rgba(0,0,0,0.12)]'
              }`}
            >
              {(['Next 30 Days', 'Balanced', 'Full Audit'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setPlanDepth(opt);
                    setDepthMenuOpen(false);
                    if (opt === 'Next 30 Days') {
                      onUpdateProfile({ needsCashRunway: true });
                    } else if (opt === 'Full Audit') {
                      onUpdateProfile({ needsCashRunway: true, needsTaxOrDebtFix: true, overdueRoutineCare: true });
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] transition ${
                    planDepth === opt
                      ? darkMode
                        ? 'bg-white/12 font-semibold'
                        : 'bg-[#F4F2ED] font-semibold'
                      : darkMode
                        ? 'hover:bg-white/[0.06]'
                        : 'hover:bg-[#F6F6F7]'
                  }`}
                >
                  <span>{opt}</span>
                  {planDepth === opt && <Check className="h-3.5 w-3.5 text-[#2347D8]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step Progression Indicator: 01 — 02 03 */}
      <div className="relative z-10 mt-3">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold">
          {([1, 2, 3] as const).map((n) => (
            <React.Fragment key={n}>
              <button
                type="button"
                onClick={() => setStep(n)}
                className={`transition ${
                  step === n
                    ? darkMode
                      ? 'text-white'
                      : 'text-[#141416]'
                    : darkMode
                      ? 'text-white/35 hover:text-white/70'
                      : 'text-[#8C8C92] hover:text-[#141416]'
                }`}
              >
                0{n}
              </button>
              {step === n && n < 3 && (
                <span className={`h-[2px] w-5 rounded-full ${darkMode ? 'bg-white' : 'bg-[#141416]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Two-tone Editorial Headline */}
        {step === 1 && (
          <h2 className="mt-3 font-serif-editorial text-[29px] leading-[1.16] tracking-[-0.02em]">
            What is your primary{' '}
            <span className={`block font-normal ${darkMode ? 'text-white/55' : 'text-[#6C6C72]'}`}>
              life focus right now?
            </span>
          </h2>
        )}
        {step === 2 && (
          <h2 className="mt-3 font-serif-editorial text-[29px] leading-[1.16] tracking-[-0.02em]">
            Where are you{' '}
            <span className={`block font-normal ${darkMode ? 'text-white/55' : 'text-[#6C6C72]'}`}>
              based?
            </span>
          </h2>
        )}
        {step === 3 && (
          <h2 className="mt-3 font-serif-editorial text-[29px] leading-[1.16] tracking-[-0.02em]">
            What needs{' '}
            <span className={`block font-normal ${darkMode ? 'text-white/55' : 'text-[#6C6C72]'}`}>
              sorting first?
            </span>
          </h2>
        )}
      </div>

      {/* Main Step Content */}
      <div className="no-scrollbar relative z-10 my-3 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {step === 1 &&
          featuredDestinations.map((dest) => {
            const selected = profile.destination === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  onUpdateProfile(buildOnboardingAnswer(profile, 'q-destination', { destination: dest.id }));
                }}
                className={`relative flex w-full flex-col overflow-hidden rounded-[22px] p-4 text-left transition ${
                  selected
                    ? 'bg-[#141416] text-white shadow-md'
                    : darkMode
                      ? 'bg-[#17171B] text-[#F5F4F0] hover:bg-[#1E1E24]'
                      : 'bg-[#F6F6F7] text-[#141416] hover:bg-[#ECEAE4]'
                }`}
              >
                {selected && (
                  <>
                    <img
                      src="/art/founder-portal.png"
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#141416]/90 via-[#141416]/75 to-[#141416]/45" />
                  </>
                )}
                <div className="relative z-10 flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-white text-[#141416]'
                        : darkMode
                          ? 'bg-white/15'
                          : 'bg-black/10'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-[#141416]" />}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{dest.label}</p>
                    <p
                      className={`mt-1 text-[13px] leading-[1.4] ${
                        selected
                          ? 'text-white/80'
                          : darkMode
                            ? 'text-white/65'
                            : 'text-[#4A4A4F]'
                      }`}
                    >
                      {dest.tagline}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

        {step === 2 && (
          <div className="space-y-4">
            <div className={`rounded-[22px] p-4 ${darkMode ? 'bg-[#17171B]' : 'bg-[#F6F6F7]'}`}>
              <p className={`text-[13px] font-semibold ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                City & jurisdiction
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {CITY_OPTIONS.map((opt) => {
                  const selected = profile.city === opt.city;
                  return (
                    <button
                      key={opt.city}
                      type="button"
                      onClick={() =>
                        onUpdateProfile({
                          city: opt.city,
                          countryCode: opt.countryCode,
                          countryName: opt.countryName,
                        })
                      }
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                        selected
                          ? 'bg-[#2347D8] text-white'
                          : darkMode
                            ? 'bg-white/10 text-white/85 hover:bg-white/16'
                            : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                      }`}
                    >
                      {opt.city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-[22px] p-4 ${darkMode ? 'bg-[#17171B]' : 'bg-[#F6F6F7]'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                  Your age (matches age schemes)
                </span>
                <span className="font-serif-editorial text-[26px] leading-none">{profile.age}</span>
              </div>
              <input
                type="range"
                min={18}
                max={68}
                value={profile.age}
                onChange={(e) => onUpdateProfile({ age: Number(e.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2347D8]/25 accent-[#2347D8]"
              />
              <div
                className={`mt-1.5 flex justify-between text-[12px] ${
                  darkMode ? 'text-white/55' : 'text-[#5A5A60]'
                }`}
              >
                <span>18</span>
                <span>LISA ≤39</span>
                <span>NHS 40+</span>
                <span>68</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateProfile({ isBusinessOwner: !profile.isBusinessOwner })}
                className={`rounded-[20px] p-3.5 text-left transition ${
                  profile.isBusinessOwner
                    ? 'bg-[#2347D8] text-white'
                    : darkMode
                      ? 'bg-[#17171B] text-white/85'
                      : 'bg-[#F6F6F7] text-[#141416]'
                }`}
              >
                <p className="text-[13.5px] font-semibold">Run a business</p>
                <p
                  className={`mt-0.5 text-[12.5px] ${
                    profile.isBusinessOwner ? 'text-white/80' : darkMode ? 'text-white/55' : 'text-[#4A4A4F]'
                  }`}
                >
                  {profile.isBusinessOwner ? 'Yes · funding on' : 'No · tap if building'}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateProfile({
                    hasPendingHospitalReferral: !profile.hasPendingHospitalReferral,
                  })
                }
                className={`rounded-[20px] p-3.5 text-left transition ${
                  profile.hasPendingHospitalReferral
                    ? 'bg-[#C43929] text-white'
                    : darkMode
                      ? 'bg-[#17171B] text-white/85'
                      : 'bg-[#F6F6F7] text-[#141416]'
                }`}
              >
                <p className="text-[13.5px] font-semibold">Hospital queue</p>
                <p
                  className={`mt-0.5 text-[12.5px] ${
                    profile.hasPendingHospitalReferral
                      ? 'text-white/80'
                      : darkMode
                        ? 'text-white/55'
                        : 'text-[#4A4A4F]'
                  }`}
                >
                  {profile.hasPendingHospitalReferral ? 'Pending referral' : 'None waiting'}
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <ProgressiveQuestion profile={profile} darkMode={darkMode} onUpdateProfile={onUpdateProfile} />
        )}
      </div>

      {/* Bottom Primary Pill CTA (@roman_designer bottom black pill) */}
      <div className="relative z-10 pt-2">
        <button
          type="button"
          onClick={handlePrimaryNext}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold transition active:scale-[0.98] ${
            darkMode
              ? 'bg-white text-[#141416] hover:bg-white/92'
              : 'bg-[#141416] text-white hover:bg-black/88'
          }`}
        >
          <span>
            {step === 1
              ? 'Next step: where you live'
              : step === 2
                ? 'Next step: what needs sorting'
                : 'Open my live plan'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};
