import type { DietStyle, HealthSnapshot, LabMarkerId, LabResult } from '../types/lifeos';

type LabGuide = {
  id: LabMarkerId;
  name: string;
  units: readonly [string, ...string[]];
  optional?: boolean;
  meaning: string;
  source: string;
};

export const LAB_GUIDES: LabGuide[] = [
  {
    id: 'bw-vitd', name: 'Vitamin D (25-OH)', units: ['nmol/L', 'ng/mL'],
    meaning: 'Vitamin D helps maintain bones and supports calcium absorption.',
    source: 'https://ods.od.nih.gov/factsheets/Vitamind-HealthProfessional/',
  },
  {
    id: 'bw-apob', name: 'ApoB', units: ['mg/dL', 'g/L'],
    meaning: 'ApoB estimates the number of particles that can contribute to plaque in arteries.',
    source: 'https://www.lipid.org/resource/role-of-apolipoprotein-b-in-the-clinical-management-of-cardiovascular-risk-in-adults-an-expert-clinical-consensus-from-the-national-lipid-association/',
  },
  {
    id: 'bw-hba1c', name: 'HbA1c', units: ['%', 'mmol/mol'],
    meaning: 'HbA1c reflects average blood sugar over about three months. Anemia, pregnancy and some hemoglobin variants can affect it.',
    source: 'https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/diabetes/diabetes-prediabetes',
  },
  {
    id: 'bw-ferritin', name: 'Ferritin', units: ['µg/L', 'ng/mL'],
    meaning: 'Ferritin reflects stored iron and can rise with inflammation or infection.',
    source: 'https://www.who.int/publications/i/item/9789240000124',
  },
  {
    id: 'bw-hscrp', name: 'hs-CRP', units: ['mg/L'], optional: true,
    meaning: 'This is a marker of inflammation. Recent infection or injury can raise it.',
    source: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000678',
  },
  {
    id: 'bw-insulin', name: 'Fasting insulin', units: ['µIU/mL', 'mIU/L', 'pmol/L'], optional: true,
    meaning: 'Fasting insulin results depend on the assay and fasting conditions. A clinician uses glucose-based tests to assess prediabetes.',
    source: 'https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance',
  },
  {
    id: 'bw-tsh', name: 'TSH', units: ['mIU/L', 'µIU/mL'], optional: true,
    meaning: 'TSH helps assess thyroid function. Pregnancy, medication and supplements such as biotin can affect interpretation.',
    source: 'https://www.nice.org.uk/guidance/ng145/chapter/Recommendations',
  },
];

export const DIET_GUIDES: Record<DietStyle, { label: string; swaps: string[] }> = {
  'high-protein': {
    label: 'High protein',
    swaps: ['Swap a pastry-only breakfast for yogurt or fortified soy yogurt, oats and berries.', 'Try lentils, chicken or tofu in a rice bowl where rice usually takes up the whole plate.'],
  },
  mediterranean: {
    label: 'Mediterranean',
    swaps: ['Use olive oil and lemon in place of a butter-heavy dressing.', 'Try beans or sardines on whole-grain toast in place of processed meat.'],
  },
  'whole-food': {
    label: 'Whole food',
    swaps: ['Swap a sweetened cereal for oats, fruit and plain yogurt.', 'Batch-roast frozen vegetables and beans when you need a quick side.'],
  },
  'plant-forward': {
    label: 'Plant forward',
    swaps: ['Use lentils for half the mince in a familiar chili or stew.', 'Choose fortified unsweetened soy milk in place of a low-protein plant drink. Pair beans with vitamin C-rich peppers or citrus.'],
  },
  balanced: {
    label: 'Balanced',
    swaps: ['Try a whole-grain sandwich with eggs, hummus or fish in place of a snack-only lunch.', 'Keep an easy dinner pairing on hand, such as frozen greens with beans, potatoes and olive oil.'],
  },
};

export function computeHealthTargets(health: HealthSnapshot) {
  const weight = health.weightKg;
  const training = Math.min(7, Math.max(0, health.trainingDays ?? 0));
  const personalised = typeof weight === 'number' && Number.isFinite(weight) && weight >= 35 && weight <= 250;
  return {
    personalised,
    waterMl: personalised ? Math.round((Math.min(3_000, Math.max(1_500, weight * 30)) + 400 * training / 7) / 50) * 50 : health.waterTargetMl,
    proteinG: personalised ? Math.round(weight * (training >= 3 ? 1.6 : training > 0 ? 1.4 : 0.8)) : health.proteinTargetG,
    caffeineCutoff: /^([01]\d|2[0-3]):[0-5]\d$/.test(health.caffeineCutoff ?? '') ? health.caffeineCutoff : undefined,
  };
}

export function isValidLabResult(id: LabMarkerId, result: LabResult | undefined): result is LabResult {
  return Boolean(result && Number.isFinite(result.value) && result.value >= 0
    && LAB_GUIDES.find((marker) => marker.id === id)?.units.includes(result.unit));
}

export function migrateLabResults(health: HealthSnapshot): HealthSnapshot {
  const labResults = { ...health.labResults };
  const migrateLegacy = health.labResults === undefined;
  for (const marker of LAB_GUIDES) {
    if (isValidLabResult(marker.id, labResults[marker.id])) continue;
    delete labResults[marker.id];
    if (!migrateLegacy) continue;
    const oldValue = health.bloodwork?.find((old) => old.id === marker.id)?.currentValue;
    if (typeof oldValue !== 'string') continue;
    const match = /^(\d+(?:\.\d+)?)\s*(\S+)\s*$/.exec(oldValue.trim());
    if (!match) continue;
    const unit = marker.units.find((candidate) => candidate.toLowerCase() === match[2].toLowerCase());
    if (unit) labResults[marker.id] = { value: Number(match[1]), unit };
  }
  return { ...health, labResults };
}

type Interpretation = {
  status: 'optimal' | 'check' | 'due';
  guide: string;
  explanation: string;
  nextStep: string;
  labRange: 'within' | 'outside' | 'unknown';
};

function referenceComparison(result: LabResult | undefined): Interpretation['labRange'] {
  if (!result) return 'unknown';
  const low = typeof result.referenceLow === 'number' && Number.isFinite(result.referenceLow) ? result.referenceLow : undefined;
  const high = typeof result.referenceHigh === 'number' && Number.isFinite(result.referenceHigh) ? result.referenceHigh : undefined;
  if ((low === undefined && high === undefined) || (low !== undefined && high !== undefined && low > high)) return 'unknown';
  return ((low !== undefined && result.value < low) || (high !== undefined && result.value > high))
    ? 'outside'
    : 'within';
}

export function interpretLabResult(marker: LabMarkerId, health: Pick<HealthSnapshot, 'apoBRisk' | 'ferritinContext'>, result?: LabResult): Interpretation {
  const valid = isValidLabResult(marker, result);
  const labRange = referenceComparison(valid ? result : undefined);
  const assess = (guide: string, flag: boolean, explanation: string, flaggedStep: string, withinStep: string): Interpretation => {
    const needsReview = flag || labRange === 'outside';
    return {
      guide, labRange,
      status: valid ? (needsReview ? 'check' : 'optimal') : 'due',
      explanation: valid ? explanation : 'Enter the value and unit exactly as shown on your report.',
      nextStep: valid ? (needsReview ? flaggedStep : withinStep) : '',
    };
  };
  const value = valid ? result.value : 0;

  switch (marker) {
    case 'bw-vitd': {
      const nmol = result?.unit === 'ng/mL' ? value * 2.5 : value;
      return assess('20–50 ng/mL (50–125 nmol/L) is an adult adequacy guide.', nmol < 50 || nmol > 125,
        nmol < 30 ? 'This falls below the deficiency threshold.' : nmol < 50 ? 'This may be inadequate for bone health.' : nmol > 125 ? 'High levels can have adverse effects, especially with supplements.' : 'This is within the adequacy guide for most adults.',
        'Review your result and supplement doses with your clinician. Your diet and medical history affect the next step.',
        'Keep food sources such as oily fish or fortified foods in rotation and follow your clinician’s plan for any repeat test.');
    }
    case 'bw-apob': {
      const mgDl = result?.unit === 'g/L' ? value * 100 : value;
      const threshold = health.apoBRisk === 'very-high' ? 60 : health.apoBRisk === 'high' ? 70 : 90;
      return assess(`Below ${threshold} mg/dL is the comparison for this risk setting.`, mgDl >= threshold,
        mgDl >= threshold ? 'This meets a threshold for discussing cardiovascular risk and treatment with your clinician.' : 'This is below the selected guide. Your overall cardiovascular risk sets the personal target.',
        'Ask your GP to review overall risk with cholesterol, blood pressure, family history and any existing conditions. Try oats, beans, nuts and unsaturated fats in meals.',
        'Keep up regular activity and fiber-rich meals. Use the risk category agreed with your clinician.');
    }
    case 'bw-hba1c': {
      const ifcc = result?.unit === 'mmol/mol';
      const flag = value >= (ifcc ? 39 : 5.7);
      const high = value >= (ifcc ? 48 : 6.5);
      return assess('Below 5.7% (39 mmol/mol) is the NIDDK screening guide. At 6.5% (48 mmol/mol), confirmation is usually needed.', flag,
        high ? 'This reaches a diabetes screening threshold. A clinician can arrange a confirmatory test.' : flag ? 'This is in the increased-risk range in the NIDDK guide.' : 'This is below the increased-risk threshold in the guide.',
        'Share the result with your GP and ask when to confirm it. Gradual activity and meals with more whole grains, vegetables and legumes can support glucose control.',
        'Keep your usual screening plan and activity routine.');
    }
    case 'bw-ferritin': {
      const low = health.ferritinContext === 'inflammation' ? 70 : 15;
      const high = health.ferritinContext === 'menstruating' ? 150 : 200;
      return assess(`${low}–${high} µg/L is a review guide for this context. ng/mL has the same numeric value.`, value < low || value > high,
        value < low ? 'Low ferritin can point to reduced iron stores.' : value > high ? 'High ferritin can reflect inflammation, liver conditions or too much stored iron.' : 'This falls within the guide for the selected context.',
        'Ask your GP how to interpret this with a full blood count and, where appropriate, inflammation markers or transferrin saturation. Check before starting iron.',
        'Keep iron-containing foods in your diet. Pair legumes or greens with a vitamin C-rich food.');
    }
    case 'bw-hscrp':
      return assess('2 mg/L or above can add context to cardiovascular risk.', value >= 2,
        value >= 2 ? 'This is above the risk-marker threshold. A recent illness may explain a single high reading.' : 'This is below the risk-marker threshold.',
        'Share the result with your GP, including any recent illness, and ask if or when a repeat is useful.',
        'Consider the result alongside your overall risk and any testing plan agreed with your clinician.');
    case 'bw-insulin':
    case 'bw-tsh': {
      const thyroid = marker === 'bw-tsh';
      const flag = labRange === 'unknown' || (thyroid && (value >= 10 || value < 0.1));
      return assess(thyroid ? 'Use the TSH interval printed on your report.' : 'Use the fasting insulin interval printed on your report.', flag,
        labRange === 'unknown' ? 'Enter your lab’s reference interval for a useful comparison.'
          : labRange === 'outside' || flag ? 'This result deserves a review in context.' : 'This result is within the supplied interval.',
        thyroid ? 'Ask your clinician whether free T4 or a repeat TSH would help. Mention any thyroid medicines, supplements or pregnancy.'
          : 'Review the assay, fasting duration and glucose or HbA1c results with your clinician.',
        'Keep the report with your other results and follow the testing plan you agreed with your clinician.');
    }
  }
}
