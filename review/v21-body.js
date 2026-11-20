/* life v21 — Body / Fuel / Habits. Existing nodes only; shared chrome belongs to the lead. */
(function () {
  'use strict';

  const reviewed = {
    body: 'Lead with the sleep shortfall: full-width sleep, paired readiness/load, then a quiet Fuel summary; keep the habit actions and every tool.',
    devices: 'Retain the permission-first connection list, platform distinctions and on-device privacy copy; these are more important than decorative device cards.',
    readiness: 'Put what to do with the score before its evidence; remove the extra box around the baseline explanations and retain the complete gauge and history.',
    sleep: 'Bring tonight’s bedtime and its reminder immediately after the sleep-debt briefing; keep stages, weekly chart, source and NHS guidance intact.',
    load: 'Read current effort and its suggested range together; move the activities that explain the total before the heart-rate-zone breakdown.',
    snap: 'Retain the immersive camera and food annotations without moving the capture controls or portion-estimate warning.',
    confirm: 'Prioritise the editable meal estimate over protein; place the adjustment warning immediately before ingredients and preserve dynamic ingredient controls.',
    fuel: 'Retain the numbers-visibility control, meal photography and adult-only target explanation; avoid disrupting the dynamic food totals.',
    habits: 'Put the unfinished bedtime habit first and attach its rescue offer directly underneath; keep completed habits and the daylight automaticity question together.',
    habitnew: 'Show the live habit sentence before the builder so the cue/action relationship is legible; keep all fields, auto-complete toggle and slot limit.',
    trends: 'Retain the three aligned trend charts, range selector and correlation disclaimer; their shared time comparison must not be recomposed.',
    hrv: 'Retain the baseline-band chart, journal comparisons and SDNN/RMSSD caveat; no rearrangement that could detach the method from its source.',
    signals: 'Give the safety explanation one clear lead, group the three off-normal signals, and distinguish the normal oxygen reading without resizing any charts.',
    stress: 'Retain the 30-minute timeline and calm-time summary; keep the breathing action with the caffeine/movement uncertainty explanation.',
    breathe: 'Retain the breathing orb, timing, start target and live heart-rate layout exactly; this is an immersive timed interaction.',
    journal: 'Retain the quick evening tag grid, logging progress and single save action; moving the tags would weaken the ten-second task.',
    insights: 'Retain the ranked journal effects, sample counts and patterns-not-proof qualifier; these already form a coherent evidence view.',
    workout: 'Retain live heart-rate, elapsed time, zone geometry and pause/end positions; no visual change may threaten a live-workout control.',
    detected: 'Retain each detected workout as a self-contained choice and confirm/reject unit; preserve all activity-type controls.',
    sleepplan: 'Retain the wake-time picker and calculated bedtime grouping; their calculation and reminder relationship is already clear.',
    math: 'Retain the score-by-score method, confidence badges, evidence references and medical-device disclaimer in their existing order.',
    coach: 'Retain the conversation, linked body evidence and NHS safety copy; the chat composer and immersive spacing belong to shared geometry.',
    mealresult: 'Identify the salmon bowl before its photo; give the logged nutrients a flat strip and put non-moralising score context before the reasons.',
    cook: 'Retain the photographed ingredients, dietary filters and remaining-target context; recipe results are dynamically populated.',
    mealplan: 'Retain the Plan/Shopping list switch and its dynamic content region; do not build static replacements for generated meal rows.',
    sayit: 'Retain the listening transcript, individually editable foods, privacy note and explicit total-log action as one voice-confirmation flow.',
    forecast: 'Retain the three bedtime scenarios and estimate badge; their side-by-side readiness alternatives already support one clear decision.',
    cycle: 'Retain the phase strip, phase-aware baseline and privacy/contraception disclaimer; avoid suggesting a diagnostic interpretation.',
    fitnessage: 'Retain the estimate badge and six-month trend with its underlying fitness metrics; do not enlarge the age into a health claim.',
    sources: 'Retain each metric/source pairing and the Oura/Garmin disagreement explanation; source provenance is the purpose of this screen.',
    cgm: 'Retain the glucose timeline, meal annotations and GP guidance; chart geometry and wellness limitations are inseparable.',
    strength: 'Explain the missed-Saturday dip before the ten-week heatmap; place the day-count milestone beneath the strength reading instead of squeezing it beside it.',
    basics: 'Retain water logging, the sitting break and recovery as separate tasks; keep their controls and personal-baseline context.',
    sleepnight: 'Retain the single-night stage geometry and the associated timing, deep-sleep and journal context.',
    workoutdetail: 'Retain distance/time/pace and zone proportions as a workout record; no recomposition of the proportional zone graphic.',
    weight: 'Retain the seven-day trend and daily-dot explanation beside the chart; keep the Show on Today preference independent.',
    foodday: 'Make calories the day-level headline with protein/fibre below; turn four floating meal cards into one ordered meal log without losing amounts.',
    barcode: 'Retain the scanner frame, barcode target and found-product sheet; these are camera-aligned controls.',
    foodsearch: 'Retain the live search input, Recent/Everything grouping and each add control; avoid disturbing query focus and result interactions.',
    bmi: 'Retain both measurement scales, waist-first context and GP guidance; do not turn the rough-guide BMI into a dominant diagnosis.',
    strain: 'Retain the target-band geometry, current effort and activity contribution list; the proposed run remains explicitly a suggestion.',
    zones: 'Retain ordered zone thresholds and minutes with the resting/max-rate explanation; the aligned scale is already legible.',
    illness: 'Retain cautious wording, the three signal comparisons and NHS/GP direction; do not reframe the warning as a diagnosis.',
    breathlib: 'Retain each breathing method with its timing and use case; do not alter the targets that launch immersive sessions.',
    provenance: 'Pair source with sync time first, then readings/baseline/confidence; preserve the number, confidence dots and method action.',
    regularity: 'Retain the weekday sleep-position plot and time axis; the weekend-shift callout needs that exact temporal geometry.',
    loadtrend: 'Retain the ratio band and eight-week load chart; no visual rewrite of training recommendations or range thresholds.',
    healthdigest: 'Retain Wins, Watch and the two-week experiment as a balanced weekly narrative rather than converting it into score tiles.',
    fuelhome: 'Retain the remaining-energy hero, macro progress, meals and two food-capture entry points; dynamic totals and progress geometry stay untouched.',
    fuelgoal: 'Put the calorie rationale before the prescribed totals, then distinguish the daily energy target from protein/fibre; leave goal and pace controls intact.',
    savedmeals: 'Retain recognisable meal names, provenance and one add target per row; a flat familiar-food list is the right hierarchy.',
    fuelprogress: 'Retain the weight-change/trend relationship, average intake and month control; no invented target or recalculated series.',
    exerciseadd: 'Retain both workout estimates, the None/Half/All selector and the overestimation explanation directly with the choice.',
    fuelplan: 'Retain the plan-complete date, three targets, healthy-floor reassurance and single Start action; keep full-screen completion geometry.',
    weighin: 'Retain the large adjustable weight, plus/minus controls and trend context; do not resize or relocate the picker.',
    labelscan: 'Retain camera label alignment, per-100g context and portion selector; nutrient recognition must remain attached to its scan.',
    menuscan: 'Retain ranked menu choices, remaining-target context and portion-estimate warning; no moralising replacement labels.',
    fixwords: 'Show the revised total immediately after the user’s correction, then the ingredient-level audit trail and original confirmation action.',
    nutrients: 'Retain daily nutrients followed by weekly micronutrients and UK adult reference guidance; do not mix the two reporting periods.',
    describeexercise: 'Retain the original description, classified effort and half-calorie add-back before the single Add action; estimates remain explicit.',
    weekbudget: 'Retain the weekly energy chart, birthday-dinner explanation and carry-over switch; do not change target or chart geometry.',
    mealtiming: 'Retain the eating-window chart and two-week experiment with correlation language; meal/sleep timing stays evidence, not causation.',
    foodquality: 'Retain whole/processed proportions and the separate plant-diversity count; no new good/bad-food badges.',
    alcohol: 'Retain weekly units, drink-free days, quick-log controls and Drinkline number; the support copy must stay visible and unchanged.',
    quicklog: 'Retain Recent/Usual/Quick add and the familiar-food add targets; reordering would undermine the two-tap task.',
    importfood: 'Retain the local-storage explanation and provider-specific import actions; do not merge Connect with file-picking controls.'
  };

  const keys = [
    'body', 'devices', 'readiness', 'sleep', 'load', 'snap', 'confirm', 'fuel', 'habits', 'habitnew',
    'trends', 'hrv', 'signals', 'stress', 'breathe', 'journal', 'insights', 'workout', 'detected',
    'sleepplan', 'math', 'coach', 'mealresult', 'cook', 'mealplan', 'sayit', 'forecast', 'cycle',
    'fitnessage', 'sources', 'cgm', 'strength', 'basics', 'sleepnight', 'workoutdetail', 'weight',
    'foodday', 'barcode', 'foodsearch', 'bmi', 'strain', 'zones', 'illness', 'breathlib', 'provenance',
    'regularity', 'loadtrend', 'healthdigest', 'fuelhome', 'fuelgoal', 'savedmeals', 'fuelprogress',
    'exerciseadd', 'fuelplan', 'weighin', 'labelscan', 'menuscan', 'fixwords', 'nutrients',
    'describeexercise', 'weekbudget', 'mealtiming', 'foodquality', 'alcohol', 'quicklog', 'importfood'
  ];

  function direct(el, selector) {
    return Array.from(el.children).filter(function (node) { return node.matches(selector); });
  }

  function mark(el, name) {
    if (el) el.classList.add('v21b-' + name);
    return el;
  }

  function content(root) {
    if (root.matches('.pad.col')) return root;
    return root.querySelector('.pad.col') || root;
  }

  function before(node, anchor) {
    if (node && anchor && node !== anchor) anchor.parentNode.insertBefore(node, anchor);
  }

  function group(parent, anchor, nodes, name) {
    const section = parent.ownerDocument.createElement('div');
    section.className = 'v21b-' + name;
    parent.insertBefore(section, anchor);
    nodes.forEach(function (node) { if (node) section.appendChild(node); });
    return section;
  }

  const compose = {
    body: function (p) {
      mark(direct(p, '.t-statement')[0], 'brief');
      const sleep = p.querySelector('button.card[data-jump="sleep"]');
      const readiness = p.querySelector('button.card[data-jump="readiness"]');
      const load = p.querySelector('button.card[data-jump="load"]');
      const fuel = p.querySelector('button.card[data-jump="fuel"]');
      if (sleep && readiness && load && fuel && sleep.parentNode === readiness.parentNode) {
        mark(sleep.parentNode, 'body-metrics');
        mark(sleep, 'sleep-priority');
        mark(readiness, 'support-metric');
        mark(load, 'support-metric');
        mark(fuel, 'fuel-summary');
        before(sleep, readiness);
      }
      const habit = p.querySelector('[data-chk]');
      if (habit) mark(habit.parentNode, 'today-habits');
      const tool = p.querySelector('button[data-jump="signals"]');
      if (tool) mark(tool.parentNode, 'body-tools');
      return ['Sleep is now the full-width lead metric, readiness/load share the next line and Fuel becomes a compact summary.', 'The sleep number no longer overflows a half-width tile; habit rows and every original tool remain.'];
    },
    readiness: function (p) {
      const cards = direct(p, '.card');
      mark(direct(p, '.col')[0], 'score');
      mark(cards[0], 'evidence-list');
      mark(cards[1], 'history');
      mark(cards[2], 'action-note');
      before(cards[2], cards[0]);
      return ['The practical recommendation precedes Why and Last 30 days; baseline evidence is unboxed.', 'Score, gauge, historical bars and the non-medical estimate disclaimer are retained.'];
    },
    sleep: function (p) {
      const cards = direct(p, '.card');
      mark(direct(p, '.t-statement')[0], 'brief');
      mark(cards[0], 'sleep-stages');
      mark(cards[1], 'evidence-list');
      mark(cards[3], 'tonight');
      before(cards[3], cards[0]);
      return ['Tonight’s bedtime and reminder now come before the overnight stage breakdown and weekly history.', 'Sleep-stage lengths, chart marks, source labels and NHS copy remain unchanged.'];
    },
    load: function (p) {
      const cards = direct(p, '.card');
      const score = direct(p, '.col')[0];
      if (score && cards[0]) {
        group(p, score, [score, cards[0]], 'load-hero');
        mark(cards[0], 'load-range');
      }
      mark(cards[2], 'movement-records');
      before(cards[2], cards[1]);
      return ['Current effort and the personal suggested range read as one hero; activity contributions now precede heart-rate zones.', 'All range ticks, proportional zone marks, activity amounts and effort-estimate copy are retained.'];
    },
    confirm: function (p) {
      const total = p.querySelector('[data-fk]');
      const protein = p.querySelector('[data-fp]');
      if (total) {
        mark(total.closest('.card'), 'meal-estimate');
        mark(total, 'estimate-total');
      }
      mark(protein, 'estimate-protein');
      const ingredients = p.querySelector('[data-fi]');
      mark(ingredients, 'editable-ingredients');
      before(direct(p, 'span.t-callout')[0], ingredients);
      return ['The meal estimate is visually primary, protein secondary; adjustment guidance now introduces the editable ingredient list.', 'The food image, dynamic ingredient host, data-fk/data-fp fields and Log meal listener are preserved.'];
    },
    mealresult: function (p) {
      const photo = p.querySelector('.ph-img');
      const identity = direct(p, '.row')[0];
      if (photo) before(identity, photo.parentNode);
      mark(identity, 'meal-identity');
      const cards = direct(p, '.card');
      mark(cards[0], 'macro-strip');
      mark(cards[1], 'meal-reasons');
      before(direct(p, 'span.cq')[0], cards[1]);
      return ['The meal name and logged state precede its photograph; nutrients form one quiet strip and score context precedes Why it fits.', 'Original photograph dimensions, every nutrient value and both protein/fibre explanations remain.'];
    },
    foodday: function (p) {
      const grid = Array.from(p.children).find(function (node) {
        return node.style.display === 'grid' && direct(node, '.card').length === 3;
      });
      if (grid) {
        mark(grid, 'day-summary');
        mark(grid.children[0], 'day-energy');
      }
      const meals = direct(p, '.card.row');
      if (meals.length) {
        meals.forEach(function (node) { mark(node, 'meal-record'); });
        group(p, meals[0], meals, 'meal-log');
      }
      return ['The daily energy total spans the summary, with protein and fibre as supporting measures; meal cards are now a single chronological log.', 'All meals, times, calories and the unlogged-dinner state are preserved.'];
    },
    habits: function (p) {
      const cards = direct(p, '.card');
      const rescue = cards[0];
      const water = cards[1];
      const daylight = cards[2];
      const bedtime = cards[3];
      mark(direct(p, '.t-statement')[0], 'brief');
      mark(rescue, 'habit-rescue');
      mark(water, 'habit-record');
      mark(daylight, 'habit-record');
      mark(bedtime, 'habit-next');
      mark(p.querySelector('[data-auto]'), 'automaticity');
      before(bedtime, rescue);
      return ['The bedtime habit leads the list, immediately followed by its specific rescue offer instead of a blanket warning above all habits.', 'Water, daylight, fourteen-day marks, rescue choices, automaticity rating and research qualifier are intact.'];
    },
    habitnew: function (p) {
      const previewText = p.querySelector('[data-hp]');
      const preview = previewText && previewText.closest('.card');
      const builder = p.querySelector('[data-hb]');
      mark(preview, 'habit-preview');
      mark(builder, 'habit-builder');
      before(preview, builder);
      const automatic = direct(p, '.li')[0];
      mark(automatic, 'habit-automatic');
      return ['The live cue/action sentence now anchors the composer above its individual fields; automatic completion remains below construction.', 'Dynamic input host, preview field, toggle, save target and slot-limit text retain their original identities.'];
    },
    strength: function (p) {
      const cards = direct(p, '.card');
      mark(direct(p, '.row')[0], 'strength-reading');
      mark(cards[0], 'strength-history');
      mark(cards[1], 'strength-context');
      before(cards[1], cards[0]);
      return ['The day-count milestone sits beneath the reading; the explanation of the strength dip comes before the ten-week history.', 'Every heatmap cell and its intrinsic geometry are unchanged.'];
    },
    signals: function (p) {
      const cards = direct(p, '.card');
      mark(cards[0], 'signal-guidance');
      if (cards.length >= 5) {
        const abnormal = cards.slice(1, 4);
        abnormal.forEach(function (node) { mark(node, 'signal-record'); });
        group(p, cards[1], abnormal, 'signal-stack');
        mark(cards[4], 'normal-signal');
      }
      return ['One safety lead introduces a continuous group of the three off-normal signals, followed by a quieter normal oxygen reading.', 'All four sparkline geometries, source ranges, NHS 111 wording and never-diagnoses disclaimer remain.'];
    },
    provenance: function (p) {
      mark(direct(p, '.row')[0], 'source-reading');
      const table = direct(p, '.card')[0];
      if (table) {
        mark(table, 'provenance-table');
        const rows = direct(table, '.li');
        if (rows.length === 5) group(table, rows[0], [rows[0], rows[4]], 'source-pair');
      }
      return ['Source and last-sync time now form the first provenance pair; readings, baseline and confidence follow as evidence.', 'HRV value, source name, reading counts, confidence dots and method-navigation button are unchanged.'];
    },
    fuelgoal: function (p) {
      const cards = direct(p, '.card');
      mark(cards[0], 'goal-pace');
      mark(cards[1], 'target-totals');
      if (cards[1]) mark(direct(cards[1], '.li')[0], 'target-energy');
      const rationale = direct(p, 'span.t-callout')[0];
      mark(rationale, 'target-rationale');
      before(rationale, cards[1]);
      return ['The expenditure/deficit explanation now introduces the daily targets; energy is the headline and protein/fibre form a supporting pair.', 'Lose/Keep/Gain, target weight, pace slider geometry and every amount remain unchanged.'];
    },
    fixwords: function (p) {
      const cards = direct(p, '.card');
      mark(cards[0], 'correction-request');
      mark(cards[1], 'correction-audit');
      const total = mark(direct(p, '.row')[0], 'correction-total');
      before(total, cards[1]);
      return ['The revised total follows the user’s words immediately; the three ingredient adjustments become the audit trail underneath.', 'Original calorie deltas, portion changes and Looks right listener are preserved.'];
    }
  };

  window.__V21Passes = window.__V21Passes || [];
  window.__V21Passes.push({
    id: 'body',
    keys: keys,
    reviewed: reviewed,
    apply: function (sc, scr) {
      const key = typeof sc === 'string' ? sc : sc && sc.key;
      if (!reviewed[key]) return { changes: [], retained: [], reviewed: false };
      const root = scr.querySelector('.v21-body');
      if (!root) return { changes: [], retained: ['No normalised content viewport; deferred to the shared shell. ' + reviewed[key]], reviewed: true };
      if (scr.getAttribute('data-v21-mode') === 'preserve') {
        return { changes: [], retained: ['Geometry-sensitive shell retained. ' + reviewed[key]], reviewed: true };
      }
      if (!compose[key]) return { changes: [], retained: [reviewed[key]], reviewed: true };
      if (root.getAttribute('data-v21-body-composed') === key) {
        return { changes: [], retained: ['Screen-specific composition already applied.'], reviewed: true };
      }
      root.classList.add('v21-body-domain');
      const decisions = compose[key](content(root));
      root.setAttribute('data-v21-body-composed', key);
      return { changes: decisions, retained: [], reviewed: true };
    }
  });
}());
