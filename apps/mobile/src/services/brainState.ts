import type { Proposal } from '@life/brain';
import type { SeedData } from '@/state/SeedProvider';
import type { FiledRecord } from '@/state/seed';
import { rememberConfirmed } from './memory';
import type { UserProfile } from '@life/core/types';

// Profile facts replace one known record each; notes and the record kinds
// (bills, dates, people, documents, appointments) keep their own ids.
const ids: Record<Proposal['field'], string> = { age: 'age', location: 'location', household: 'home', work: 'work', income: 'income', rent: 'rent', payday: 'payday', goal: 'aim', note: '', bill: '', subscription: '', date: '', person: '', document: '', appointment: '' };
export function proposalRecord(proposal: Proposal, source: 'talk' | 'chat' | 'document', at = new Date().toISOString()): FiledRecord & { brainField: Proposal['field'] } {
  let profilePatch: Partial<UserProfile> | undefined;
  if (proposal.field === 'age') profilePatch = { age: Number(proposal.value) };
  if (proposal.field === 'household') profilePatch = { householdSize: Number(proposal.value) };
  if (proposal.field === 'income') profilePatch = { annualIncome: Number(proposal.value) };
  if (proposal.field === 'payday') profilePatch = { payDay: Number(proposal.value) };
  if (proposal.field === 'work' && (proposal.value === 'sole-trader' || proposal.value === 'employed')) profilePatch = { workStatus: proposal.value, isBusinessOwner: proposal.value === 'sole-trader' };
  if (proposal.field === 'location') {
    const cities: Record<string, Pick<UserProfile, 'city' | 'countryCode' | 'countryName'>> = { London: { city: 'London', countryCode: 'UK', countryName: 'United Kingdom' }, Manchester: { city: 'Manchester', countryCode: 'UK', countryName: 'United Kingdom' }, 'New York': { city: 'New York', countryCode: 'US', countryName: 'United States' }, Berlin: { city: 'Berlin', countryCode: 'DE', countryName: 'Germany' }, Lagos: { city: 'Lagos', countryCode: 'NG', countryName: 'Nigeria' } };
    profilePatch = cities[String(proposal.value)];
  }
  if (proposal.field === 'goal' && proposal.value === 'buy-home') profilePatch = { destination: 'buy-home' };
  // Bills and subscriptions keep their payee, amount, how often and due day, so Money can add them up (F-37).
  const details = proposal.details?.kind === 'bill' || proposal.details?.kind === 'subscription' ? { details: proposal.details } : {};
  return { id: ids[proposal.field] || proposal.id, brainField: proposal.field, kind: proposal.field === 'goal' ? 'goal' : 'fact', area: proposal.area, label: proposal.field === 'income' || proposal.field === 'rent' ? `${proposal.label}: ${proposal.value}` : proposal.label, value: proposal.value, ...details, profilePatch, source: { type: source, at, excerpt: proposal.quote }, status: 'proposed' };
}

/** Confirmation is the sole bridge from a proposed model/rules result to memory, through the memory loop
 * (services/memory.ts). Profile patching remains in the existing confirmation transaction. */
export function confirmBrainRecords(data: SeedData, now = Date.now()): Pick<SeedData, 'brain' | 'memories'> {
  const accepted = data.proposals.filter(record => record.status !== 'removed' && 'brainField' in record) as (FiledRecord & { brainField: Proposal['field'] })[];
  return { memories: accepted.length ? rememberConfirmed(data.memories, accepted, now) : data.memories, brain: { ...data.brain, confirmedRecordIds: [...new Set([...data.brain.confirmedRecordIds, ...accepted.map(record => record.id)])] } };
}
