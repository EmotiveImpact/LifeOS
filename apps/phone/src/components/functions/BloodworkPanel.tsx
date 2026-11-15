import { useState } from 'react';
import { interpretLabResult, LAB_GUIDES } from '@life/core/health';
import { THINKER_ATEAM } from '@life/core/engine';
import type { HealthSnapshot, LabMarkerId, LabResult } from '@life/core/types';
import { fieldSurface, NumberField } from './SheetControls';

function MarkerResult({ marker, health, darkMode, onUpdate }: {
  marker: typeof LAB_GUIDES[number];
  health: HealthSnapshot;
  darkMode: boolean;
  onUpdate: (id: LabMarkerId, result?: LabResult) => void;
}) {
  const result = health.labResults?.[marker.id];
  const [unit, setUnit] = useState(result?.unit ?? marker.units[0]);
  const [referenceLow, setLow] = useState(result?.referenceLow);
  const [referenceHigh, setHigh] = useState(result?.referenceHigh);
  const info = interpretLabResult(marker.id, health, result);
  const invalidRange = referenceLow !== undefined && referenceHigh !== undefined && referenceLow > referenceHigh;
  const card = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const quiet = darkMode ? 'text-white/70' : 'text-[#56565C]';
  const legacy = !result ? health.bloodwork?.find((previous) => previous.id === marker.id)?.currentValue : undefined;
  const legacyEntry = legacy && /\d/.test(legacy) ? legacy : undefined;

  return (
    <section className={`rounded-[20px] p-4 ${card}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{marker.name}</h3>
        <p className={`shrink-0 text-[13px] font-semibold ${info.status === 'optimal'
          ? darkMode ? 'text-[#72D2A3]' : 'text-[#16794F]'
          : info.status === 'check' ? darkMode ? 'text-[#FFBB82]' : 'text-[#9B4E14]' : quiet}`}>
          {info.status === 'optimal' ? 'Within guide' : info.status === 'check' ? 'Check' : marker.optional ? 'Optional' : 'Due to log'}
        </p>
      </div>
      <p className={`mt-1 text-[13px] leading-snug ${quiet}`}>{marker.meaning}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField label={`${marker.name} result`} darkMode={darkMode} value={result?.value}
          onChange={(value) => onUpdate(marker.id, value === undefined ? undefined : { value, unit, referenceLow, referenceHigh })} />
        <label className="text-[13px]">
          Unit on report
          <select aria-label={`${marker.name} unit`} value={unit} className={fieldSurface(darkMode)}
            onChange={(event) => {
              const selected = event.currentTarget.value;
              setUnit(selected);
              setLow(undefined);
              setHigh(undefined);
              if (result) onUpdate(marker.id, { value: result.value, unit: selected });
            }}>
            {marker.units.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      {legacyEntry && <p className={`mt-2 break-words text-[13px] ${quiet}`}>Previous note: {legacyEntry}. Confirm the value and unit on your report.</p>}
      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer font-medium">Lab reference interval</summary>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <NumberField label="Lower limit" darkMode={darkMode} value={referenceLow} onChange={(value) => {
            setLow(value);
            if (result) onUpdate(marker.id, { ...result, referenceLow: value });
          }} />
          <NumberField label="Upper limit" darkMode={darkMode} value={referenceHigh} onChange={(value) => {
            setHigh(value);
            if (result) onUpdate(marker.id, { ...result, referenceHigh: value });
          }} />
        </div>
        {invalidRange && <p className="mt-2">Enter the lower limit first and the higher limit second.</p>}
      </details>
      <div className="mt-3 space-y-1 text-[13px] leading-snug">
        <p><strong>Guide</strong> · {info.guide}</p>
        {result && info.labRange !== 'unknown' && <p><strong>Lab interval</strong> · {info.labRange === 'within' ? 'Within the supplied interval' : 'Outside the supplied interval'}</p>}
        {result && <p aria-live="polite">{info.explanation} {info.nextStep}</p>}
        <a href={marker.source} target="_blank" rel="noreferrer" className="inline-block underline underline-offset-2">Read the marker guidance</a>
      </div>
    </section>
  );
}

export function BloodworkPanel({ health, darkMode, onUpdateHealth }: {
  health: HealthSnapshot;
  darkMode: boolean;
  onUpdateHealth: (patch: Partial<HealthSnapshot>) => void;
}) {
  const updateResult = (id: LabMarkerId, result?: LabResult) => {
    const labResults = { ...health.labResults };
    if (result) labResults[id] = result;
    else delete labResults[id];
    onUpdateHealth({ labResults, bloodwork: health.bloodwork?.filter((marker) => marker.id !== id) });
  };
  const field = fieldSurface(darkMode);

  return (
    <div className="mt-4 space-y-3">
      <p className={`text-[13px] leading-relaxed ${darkMode ? 'text-white/75' : 'text-[#56565C]'}`}>
        Compare adult results with clinical guidance and your lab’s own interval. Use your clinician’s targets if they differ, including during pregnancy or treatment.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[13px]">
          ApoB risk group
          <select value={health.apoBRisk ?? 'intermediate'} className={field} onChange={(event) => onUpdateHealth({ apoBRisk: event.currentTarget.value as HealthSnapshot['apoBRisk'] })}>
            <option value="intermediate">Intermediate / general comparison</option>
            <option value="high">High (clinician confirmed)</option>
            <option value="very-high">Very high (clinician confirmed)</option>
          </select>
        </label>
        <label className="text-[13px]">
          Ferritin context
          <select value={health.ferritinContext ?? 'general'} className={field} onChange={(event) => onUpdateHealth({ ferritinContext: event.currentTarget.value as HealthSnapshot['ferritinContext'] })}>
            <option value="general">General adult guide</option>
            <option value="menstruating">Menstruating adult</option>
            <option value="inflammation">Known inflammation</option>
          </select>
        </label>
      </div>
      {LAB_GUIDES.map((marker) => (
        <MarkerResult key={marker.id} marker={marker} health={health} darkMode={darkMode} onUpdate={updateResult} />
      ))}
      <p className="text-[13px] leading-relaxed">
        Peter Attia’s preventive approach informs the focus on trends. Andrew Huberman and Matthew Walker inform the habit and sleep prompts.
      </p>
      <div className="flex flex-wrap gap-3 text-[13px]">
        {THINKER_ATEAM.filter((thinker) => ['attia', 'huberman', 'walker'].includes(thinker.id)).map((thinker) => (
          <a key={thinker.id} href={thinker.linkUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">{thinker.name}</a>
        ))}
      </div>
    </div>
  );
}
