import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Description, Input, Label, TextField } from 'heroui-native';
import { buildOnboardingAnswer, getNextOnboardingQuestion } from '@life/core/onboarding';
import type { UserProfile } from '@life/core/types';
import { useLife } from '@/state/useLifeStore';
import { StyledIonicons, TonalCard } from './LifePrimitives';

export function ProgressiveQuestionCard({ compact = false }: { compact?: boolean }) {
  const { profile, updateProfile } = useLife();
  const question = getNextOnboardingQuestion(profile);
  const [entry, setEntry] = useState('');
  const [expanded, setExpanded] = useState(!compact);

  if (!question) {
    if (compact) return null;
    return (
      <TonalCard variant="secondary" className="gap-2">
        <Text className="text-[14px] text-foreground">
          Your plan has the answers it needs for now.
        </Text>
        <Button
          variant="ghost"
          size="sm"
          className="self-start px-0"
          onPress={() => updateProfile({ answeredQuestionIds: [] })}
        >
          <Button.Label className="underline">Review questions</Button.Label>
        </Button>
      </TonalCard>
    );
  }

  const answer = (patch: Partial<UserProfile>) => {
    updateProfile(buildOnboardingAnswer(profile, question.id, patch));
    setEntry('');
  };

  const submitInput = () => {
    const clean = entry.trim();
    if (!clean || !question.input) return;
    if (question.input.field === 'annualIncome') {
      const amount = Number(clean);
      if (Number.isFinite(amount) && amount >= 0) answer({ annualIncome: amount });
    } else {
      answer({ taxCode: clean.toUpperCase() });
    }
  };

  return (
    <TonalCard variant="secondary" className="gap-2.5">
      <Pressable
        onPress={() => compact && setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between gap-2"
      >
        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-muted">
            Progressive profile · 1 tap
          </Text>
          <Text className="mt-1 text-[16px] font-semibold leading-[21px] text-foreground">
            {question.prompt}
          </Text>
        </View>
        {compact && (
          <StyledIonicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            className="text-muted"
          />
        )}
      </Pressable>

      {expanded && (
        <View className="mt-1 gap-2.5">
          <Text className="text-[13px] leading-[18px] text-muted">{question.whyItMatters}</Text>

          {question.input && (
            <View className="gap-2">
              <TextField>
                <Label>{question.input.label}</Label>
                <Input
                  value={entry}
                  onChangeText={setEntry}
                  keyboardType={
                    question.input.field === 'annualIncome' ? 'numeric' : 'default'
                  }
                  placeholder={
                    question.input.field === 'annualIncome' ? 'e.g. 52000' : 'e.g. 1257L'
                  }
                  returnKeyType="done"
                  onSubmitEditing={submitInput}
                />
                <Description>Saved strictly on your device.</Description>
              </TextField>
              <Button size="sm" onPress={submitInput} className="self-start">
                <Button.Label>Save answer</Button.Label>
              </Button>
            </View>
          )}

          <View className="gap-2">
            {question.options.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => answer(opt.patch)}
                className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface p-3.5 active:opacity-80"
              >
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-foreground">{opt.label}</Text>
                  <Text className="mt-0.5 text-[12px] text-muted">{opt.hint}</Text>
                </View>
                <StyledIonicons name="arrow-forward" size={16} className="text-muted" />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </TonalCard>
  );
}
