import { processLifeOSMessage } from '@life/core/engine';
import type { UserProfile } from '@life/core/types';
import { local, records } from './local';
import { seed } from '@/state/seed';
export const ai = {
  talk: records.propose,
  ask: async (question: string, profile: UserProfile, completed: string[]) => {
    const patches: Partial<UserProfile>[] = [];
    const result = processLifeOSMessage(question, profile, completed, patch => patches.push(patch), () => {});
    return local({ answer: result.replyText, patches, records: [] });
  },
  extract: records.propose,
  lesson: async (_request: { topic: string; level: string }) => local(seed.lesson),
  analyse: async (text: string) => local({ covered: text.trim().length ? ['The purpose of a tax code'] : [], missing: ['What the number stands for'], quote: text.trim() }),
  showMe: async (_gap: string) => local('The number is usually your tax-free allowance divided by ten. Now tell me in your own words.'),
};
