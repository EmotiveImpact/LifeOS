import type { Proposal } from '@life/brain';
import type { SeedData } from '@/state/SeedProvider';
import type { FiledRecord, MemoryCategory } from '@/state/seed';
import type { UserProfile } from '@life/core/types';

const ids: Record<Proposal['field'], string> = { age: 'age', location: 'location', household: 'home', work: 'work', income: 'income', rent: 'rent', goal: 'aim', note: '' };
export function proposalRecord(proposal: Proposal, source: 'talk' | 'chat' | 'document', at = new Date().toISOString()): FiledRecord & { brainField: Proposal['field'] } {
  let profilePatch: Partial<UserProfile> | undefined;
  if (proposal.field === 'age') profilePatch = { age: Number(proposal.value) };
  if (proposal.field === 'household') profilePatch = { householdSize: Number(proposal.value) };
  if (proposal.field === 'income') profilePatch = { annualIncome: Number(proposal.value) };
  if (proposal.field === 'work' && (proposal.value === 'sole-trader' || proposal.value === 'employed')) profilePatch = { workStatus: proposal.value, isBusinessOwner: proposal.value === 'sole-trader' };
  if (proposal.field === 'location') {
    const cities: Record<string, Pick<UserProfile, 'city' | 'countryCode' | 'countryName'>> = { London: { city: 'London', countryCode: 'UK', countryName: 'United Kingdom' }, Manchester: { city: 'Manchester', countryCode: 'UK', countryName: 'United Kingdom' }, 'New York': { city: 'New York', countryCode: 'US', countryName: 'United States' }, Berlin: { city: 'Berlin', countryCode: 'DE', countryName: 'Germany' }, Lagos: { city: 'Lagos', countryCode: 'NG', countryName: 'Nigeria' } };
    profilePatch = cities[String(proposal.value)];
  }
  if (proposal.field === 'goal' && proposal.value === 'buy-home') profilePatch = { destination: 'buy-home' };
  return { id: ids[proposal.field] || proposal.id, brainField: proposal.field, kind: proposal.field === 'goal' ? 'goal' : 'fact', area: proposal.area, label: proposal.field === 'income' || proposal.field === 'rent' ? `${proposal.label}: ${proposal.value}` : proposal.label, value: proposal.value, profilePatch, source: { type: source, at, excerpt: proposal.quote }, status: 'proposed' };
}

/** Confirmation is the sole bridge from a proposed model/rules result to memory.
 * Profile patching remains in the existing confirmation transaction. */
export function confirmBrainRecords(data: SeedData): Pick<SeedData, 'brain' | 'memories'> {
  const accepted = data.proposals.filter(record => record.status !== 'removed' && 'brainField' in record);
  const categories: Partial<Record<FiledRecord['area'], MemoryCategory>> = { money: 'Money', home: 'Money', work: 'Money', goal: 'Money', health: 'Body', you: 'People' };
  const memories = [...data.memories];
  for (const record of accepted) {
    const memory = { id: `confirmed:${record.id}`, recordId: record.id, text: record.label, source: `Confirmed from ${record.source.type} · ${new Date(record.source.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, category: categories[record.area] };
    const index = memories.findIndex(existing => existing.id === memory.id);
    if (index < 0) memories.push(memory); else memories[index] = memory;
  }
  return { memories, brain: { ...data.brain, confirmedRecordIds: [...new Set([...data.brain.confirmedRecordIds, ...accepted.map(record => record.id)])] } };
}
