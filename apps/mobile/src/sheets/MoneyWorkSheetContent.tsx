import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TextField,
  useBottomSheetAwareHandlers,
} from 'heroui-native';
import {
  computeIncomeBreakdown,
  DEFAULT_SUBSCRIPTIONS,
  getAvailableBankAccounts,
  getProtectionChecklist,
} from '@life/core/engine';
import { compareUKBusinessStructures } from '@life/core/finance';
import { workSetupPatch } from '@life/core/onboarding';
import type { WorkStatus } from '@life/core/types';
import { useLife, hapticLight, hapticSuccess } from '@/state/useLifeStore';
import { StatusBadge, StyledIonicons, TonalCard } from '@/components/LifePrimitives';

const WORK_OPTIONS: Array<{ id: WorkStatus; label: string }> = [
  { id: 'employed', label: 'Employed (PAYE)' },
  { id: 'sole-trader', label: 'Sole trader' },
  { id: 'director', label: 'Company director' },
  { id: 'student-between', label: 'Studying / between' },
];

export function MoneyWorkSheetContent() {
  const { profile, updateProfile, currency } = useLife();
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const [tab, setTab] = useState<'work' | 'accounts' | 'subs' | 'protection'>('work');
  const [incomeDraft, setIncomeDraft] = useState(String(profile.annualIncome));
  const [taxCodeDraft, setTaxCodeDraft] = useState(profile.taxCode);

  const breakdown = computeIncomeBreakdown(profile);
  const accounts = getAvailableBankAccounts(profile);
  const policies = getProtectionChecklist(profile);
  const subs = profile.subscriptions ?? DEFAULT_SUBSCRIPTIONS;
  const ukCompare =
    profile.countryCode === 'UK' && profile.annualIncome > 0
      ? compareUKBusinessStructures(profile)
      : null;

  const activeSubsMonthly = subs
    .filter((s) => !s.cancelled)
    .reduce((sum, s) => sum + s.monthlyCost, 0);
  const savedAnnual = Math.round(
    subs.filter((s) => s.cancelled).reduce((sum, s) => sum + s.monthlyCost, 0) * 12
  );

  const applyIncomeAndTax = () => {
    const parsedIncome = Number(incomeDraft);
    updateProfile({
      annualIncome:
        Number.isFinite(parsedIncome) && parsedIncome >= 0 ? parsedIncome : profile.annualIncome,
      taxCode: taxCodeDraft.trim().toUpperCase() || profile.taxCode,
      taxReviewed: true,
    });
    hapticSuccess();
  };

  const toggleAccount = (id: string) => {
    hapticLight();
    const current = profile.openedAccountIds ?? [];
    updateProfile({
      openedAccountIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    });
  };

  const toggleSub = (id: string) => {
    hapticLight();
    updateProfile({
      subscriptions: subs.map((s) => (s.id === id ? { ...s, cancelled: !s.cancelled } : s)),
      subscriptionsReviewed: true,
    });
  };

  const togglePolicy = (id: string) => {
    hapticLight();
    const current = profile.protectedPolicyIds ?? [];
    updateProfile({
      protectedPolicyIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    });
  };

  return (
    <View className="gap-4 pb-6">
      <TonalCard variant="secondary" className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-muted">
            Monthly net take-home ({profile.countryCode})
          </Text>
          <StatusBadge label={`Tax rate ${breakdown.effectiveTaxRatePct}%`} tone="accent" />
        </View>
        <Text className="text-[32px] font-bold tracking-tight text-foreground">
          {currency}
          {Math.round(breakdown.netTakeHomeMonthly).toLocaleString()}/mo
        </Text>
        <Text className="text-[13px] text-muted">
          {breakdown.socialSecurityLabel}: {currency}
          {Math.round(breakdown.socialSecurityMonthly).toLocaleString()}/mo · Pension:{' '}
          {currency}
          {Math.round(
            breakdown.pensionEmployeeMonthly + breakdown.pensionEmployerMonthly
          ).toLocaleString()}
          /mo
        </Text>
        {breakdown.taxReserveMonthly > 0 && (
          <Text className="text-[13px] font-semibold text-amber-600 dark:text-amber-300">
            Sole-trader tax reserve needed: {currency}
            {Math.round(breakdown.taxReserveMonthly).toLocaleString()}/mo
          </Text>
        )}
      </TonalCard>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} variant="primary">
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="work" className="flex-1">
            <Tabs.Label>Work & Tax</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="accounts" className="flex-1">
            <Tabs.Label>Accounts</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="subs" className="flex-1">
            <Tabs.Label>Subs</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="protection" className="flex-1">
            <Tabs.Label>Cover</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="work" className="mt-3 gap-3">
          <TonalCard variant="secondary" className="gap-3">
            <Text className="text-[15px] font-semibold text-foreground">Work structure</Text>
            <View className="flex-row flex-wrap gap-2">
              {WORK_OPTIONS.map((opt) => {
                const active = profile.workStatus === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      hapticLight();
                      updateProfile(workSetupPatch(profile, opt.id));
                    }}
                    className={`rounded-full px-3.5 py-2 ${active ? 'bg-accent' : 'bg-surface'}`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        active ? 'text-accent-foreground' : 'text-foreground'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <TextField>
                  <Label>Annual income ({currency})</Label>
                  <Input
                    value={incomeDraft}
                    onChangeText={setIncomeDraft}
                    keyboardType="numeric"
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </TextField>
              </View>
              <View className="w-28">
                <TextField>
                  <Label>Tax code</Label>
                  <Input
                    value={taxCodeDraft}
                    onChangeText={setTaxCodeDraft}
                    autoCapitalize="characters"
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </TextField>
              </View>
            </View>

            <Button size="sm" onPress={applyIncomeAndTax} className="self-start">
              <Button.Label>Recalculate pay & tax</Button.Label>
            </Button>

            <Text className="text-[12px] leading-[17px] text-muted">
              {breakdown.statePensionNote}
            </Text>
          </TonalCard>

          {ukCompare && (
            <TonalCard variant="secondary" className="gap-2">
              <Text className="text-[14px] font-semibold text-foreground">
                Sole trader vs Ltd director comparison (UK)
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1 rounded-2xl bg-surface p-3">
                  <Text className="text-[11px] font-semibold text-muted">SOLE TRADER</Text>
                  <Text className="mt-1 text-[17px] font-bold text-foreground">
                    £{Math.round(ukCompare.soleTrader.netTakeHomeMonthly).toLocaleString()}/mo
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-surface p-3">
                  <Text className="text-[11px] font-semibold text-muted">DIRECTOR + DIVIDENDS</Text>
                  <Text className="mt-1 text-[17px] font-bold text-foreground">
                    £{Math.round(ukCompare.director.netTakeHomeMonthly).toLocaleString()}/mo
                  </Text>
                </View>
              </View>
            </TonalCard>
          )}
        </Tabs.Content>

        <Tabs.Content value="accounts" className="mt-3 gap-2.5">
          {accounts.map((acct) => {
            const opened = (profile.openedAccountIds ?? []).includes(acct.id);
            return (
              <TonalCard key={acct.id} variant="secondary" className="gap-2">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                      {acct.priority}
                    </Text>
                    <Text className="text-[15px] font-semibold text-foreground">{acct.name}</Text>
                  </View>
                  <Switch isSelected={opened} onSelectedChange={() => toggleAccount(acct.id)} />
                </View>
                <Text className="text-[13px] leading-[18px] text-muted">
                  {acct.role} · {acct.rateOrPerk}
                </Text>
              </TonalCard>
            );
          })}
        </Tabs.Content>

        <Tabs.Content value="subs" className="mt-3 gap-2.5">
          <TonalCard variant="secondary" className="flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] text-muted">Active recurring bleed</Text>
              <Text className="text-[20px] font-bold text-foreground">
                {currency}
                {activeSubsMonthly.toFixed(0)}/mo
              </Text>
            </View>
            <StatusBadge
              label={`Saved ${currency}${savedAnnual}/yr`}
              tone={savedAnnual > 0 ? 'positive' : 'neutral'}
            />
          </TonalCard>

          {subs.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() => toggleSub(sub.id)}
              className="flex-row items-center justify-between rounded-[18px] bg-surface-secondary p-3.5"
            >
              <View className="flex-1">
                <Text
                  className={`text-[15px] font-semibold ${
                    sub.cancelled ? 'text-muted line-through' : 'text-foreground'
                  }`}
                >
                  {sub.name}
                </Text>
                <Text className="text-[12px] text-muted">
                  {sub.category} · {currency}
                  {sub.monthlyCost}/mo {sub.essential ? '· Essential' : '· Optional'}
                </Text>
              </View>
              <StyledIonicons
                name={sub.cancelled ? 'checkmark-circle' : 'close-circle-outline'}
                size={22}
                className={sub.cancelled ? 'text-emerald-500' : 'text-muted'}
              />
            </Pressable>
          ))}
        </Tabs.Content>

        <Tabs.Content value="protection" className="mt-3 gap-2.5">
          {policies.map((pol) => {
            const active = (profile.protectedPolicyIds ?? []).includes(pol.id);
            return (
              <TonalCard key={pol.id} variant="secondary" className="gap-2">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
                      {pol.urgency}
                    </Text>
                    <Text className="text-[15px] font-semibold text-foreground">{pol.name}</Text>
                  </View>
                  <Switch isSelected={active} onSelectedChange={() => togglePolicy(pol.id)} />
                </View>
                <Text className="text-[13px] leading-[18px] text-muted">{pol.whyNeeded}</Text>
              </TonalCard>
            );
          })}
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
