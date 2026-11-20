/* life v21 — personal / learning. Existing nodes only; the orchestrator owns chrome. */
(function () {
  'use strict';

  const reviewed = {
    library: 'Recompose: put the level-appropriate next ideas immediately after the photographic lead; lenses become discovery rather than an interruption, with quieter collection tiles.',
    lens: 'Recompose: lead from the author and two-tone explanation into real-life uses, then an open idea syllabus and a quieter reading list.',
    idea: 'Retain: the three-step live idea renderer, barbell SVG and Next/Save controls already form one clear teaching beat; preserve its dynamic selectors.',
    lensask: 'Retain: keep the question, switchable lens response, financial-guidance caveat and follow-up composer in their conversational order.',
    recall: 'Retain: one question, three full-width choices and the existing spaced-repetition schedule are already the right focused hierarchy.',
    learning: 'Recompose: show the concrete idea-to-result ledger before the streak; keep every amount and the original tick renderer intact.',
    recap: 'Recompose: put the reflection next to the weekly story, followed by a spacious unboxed record of the three outcomes; do not touch the peek renderer.',
    vantage: 'Retain: preserve the landscape SVG, level-specific gates and live next-step button; this screen depends on their coordinated geometry.',
    levelup: 'Retain: immersive level-up stages, image caption placement and Next/Show-me controls must remain coordinated with the original player.',
    aimnew: 'Retain: the four-step Aim input, suggestion and live preview already support writing without competing panels; retain all input and progress hooks.',
    aim: 'Recompose: preserve the home photograph and two-tone promise, bring today’s move ahead of this month’s gambit, then the reading ritual and progress.',
    teach: 'Retain: the explanation prompt, editable response and live feedback are already a focused writing flow; preserve input and feedback geometry.',
    hill: 'Retain: the photographic desk lead, two-tone argument and four-step purpose checklist already connect the lens to the Aim without extra framing.',
    gambit: 'Recompose: make the live commitment an unboxed editorial lead; give suggestions breathing room and subordinate the weekly check-in to one quiet scheduling block.',
    glimpse: 'Retain: keep the earned front-door photograph, achievement evidence and next-glimpse cue as one intentional reward composition.',
    teachoffer: 'Recompose: pull Teach me tax codes out of the diagnostic card into its own clear action, leaving the tax-code evidence above and supporting detail below.',
    lessonready: 'Recompose: make the three lesson bites an open, numbered syllabus, with difficulty selection after the syllabus rather than another enclosing panel.',
    bite: 'Retain: the number/letter teaching picture and two-tone explanation are the lesson; do not reframe or resize the picture and annotations.',
    predict: 'Retain: preserve the explanatory lead, More/Less prediction and inline feedback; they already express a single teaching decision.',
    puzzle: 'Retain: preserve the correct/emergency code comparison and the original answer/feedback group; reshuffling would weaken the comparison.',
    lessonrecap: 'Retain: the live three-line recap and Tell it back action are deliberately sparse and should not acquire decorative cards.',
    tellback: 'Retain: keep the alternating learner/life conversation, waveform and microphone as a coordinated voice lesson, not a feed of cards.',
    gaps: 'Recompose: promote the one actionable gap first, with its existing Show me control; place the successful explanation evidence below as quieter validation.',
    gotit: 'Retain: the photographic learned moment, recall booking and real-world tax-code action already carry the completion-to-application transition.',
    learned: 'Recompose: move the two recall-due records to the front, let statuses sit beneath each idea instead of squeezing beside it, and keep the existing recall action.',
    teachplay: 'Retain: the seven-stage teaching player owns its absolute stage viewport and progress; no domain geometry changes are safe here.',
    tests: 'Retain: preserve the full-bleed self-knowledge image and the three assessment entry cards with their Done states and purpose statements.',
    testq: 'Retain: the statement and five ordered answers are a deliberate assessment surface; preserve the Likert control geometry and progress.',
    bigfive: 'Recompose: replace five competing trait cards with an open trait reading; stack each name and description to avoid collisions, leaving meter geometry untouched.',
    chronotype: 'Retain: the body-clock summary, day spectrum and concrete scheduling windows already read as one coherent interpretation; do not alter the spectrum.',
    values: 'Recompose: turn five repeated boxes into one open ranked reading, giving the first two priorities emphasis and keeping the explanation of how life uses them.',
    people: 'Recompose: make Kofi’s imminent birthday the full-width first upcoming event, keep Priya and Sam beneath, and open the people directory into calm rows.',
    person: 'Recompose: put Kofi’s avatar and identity in one compact profile row, keep the birthday checklist prominent, and separate gift memory from contact cadence without repeated boxes.',
    addperson: 'Retain: explicit contact selection and Add 3 people already communicate consent and scope; preserve checkbox listeners and selected count.',
    birthdaynudge: 'Retain: keep the birthday photograph and Order his card today lead, with Done/Gift ideas and the Saturday-message promise together.',
    dates: 'Recompose: make each month an open agenda section and the imminent 18 November record the single filled event; preserve remembered-quietly copy.',
    yourbirthday: 'Retain: the birthday photograph and four retrospective outcomes are an earned moment, not another task list; preserve their paired layout.',
    drawkit: 'Retain: every original teaching-picture host and style-switch listener stays unchanged; the drawing kit is geometry-sensitive content, not a card catalogue to redesign.',
    bitedrawn: 'Retain: preserve the live flow picture, replay host, Clean lines/Hand-drawn switch and one-twelfth explanation as one teaching beat.',
    measures: 'Recompose: split the long ledger into measurements, heart/fitness and profile/targets; move each provenance below its name so long labels never fight the source.'
  };

  const keys = Object.keys(reviewed);
  const composed = new Set(['library', 'lens', 'learning', 'recap', 'aim', 'gambit', 'teachoffer', 'lessonready', 'gaps', 'learned', 'bigfive', 'values', 'people', 'person', 'dates', 'measures']);
  const children = (node, selector) => node ? Array.from(node.children).filter(child => child.matches(selector)) : [];
  const mark = (node, name) => { if (node) node.classList.add(name); return node; };
  const open = (node, name) => mark(node, name || 'v21p-open');
  const rootFor = (body, selector) => { const node = body.querySelector(selector); return node && node.closest('.pad.col'); };
  const section = (doc, name) => { const node = doc.createElement('div'); node.className = 'col ' + name; return node; };
  const title = (doc, text) => { const node = doc.createElement('span'); node.className = 't-title3'; node.textContent = text; return node; };

  function composeLibrary(body) {
    const root = rootFor(body, '[data-jump="idea"]');
    if (!root) return false;
    const groups = children(root, '.col');
    const syllabus = groups.find(group => group.classList.contains('card'));
    const lenses = groups.find(group => group.querySelector('.hrow'));
    const collections = groups.find(group => group.querySelector('.tools'));
    if (!syllabus || !lenses || !collections) return false;
    root.insertBefore(syllabus, lenses);
    mark(root, 'v21p-library');
    open(syllabus, 'v21p-library-syllabus');
    mark(lenses, 'v21p-lenses');
    mark(collections, 'v21p-collections');
    children(syllabus, '.li').forEach(row => mark(row, 'v21p-syllabus-row'));
    body.querySelectorAll('.hrow > button > span:first-child, .v21p-syllabus-row > span:first-child').forEach(node => mark(node, 'v21p-identity-mark'));
    return true;
  }

  function composeLens(body) {
    const root = rootFor(body, '.t-statement');
    if (!root) return false;
    const cards = children(root, '.card');
    if (cards.length < 3) return false;
    const [ideas, uses, books] = cards;
    root.insertBefore(uses, ideas);
    mark(root, 'v21p-lens');
    open(ideas, 'v21p-lens-ideas');
    open(uses, 'v21p-lens-uses');
    open(books, 'v21p-lens-books');
    children(ideas, '.li').forEach(row => mark(row, 'v21p-syllabus-row'));
    const author = children(root, '.row')[0];
    if (author) mark(author.firstElementChild, 'v21p-identity-mark');
    return true;
  }

  function composeLearning(body) {
    const root = rootFor(body, '.t-statement');
    if (!root) return false;
    const cards = children(root, '.card');
    if (cards.length < 2) return false;
    const [streak, ledger] = cards;
    root.insertBefore(ledger, streak);
    mark(root, 'v21p-learning');
    open(ledger, 'v21p-result-list');
    mark(streak, 'v21p-support');
    children(ledger, '.li').forEach(row => mark(row, 'v21p-result-row'));
    return true;
  }

  function composeRecap(body) {
    const root = rootFor(body, '[data-pk]');
    if (!root) return false;
    const outcomes = children(root, '.card')[0];
    const reflection = children(root, '.t-callout')[0];
    if (!outcomes || !reflection) return false;
    root.insertBefore(reflection, outcomes);
    mark(root, 'v21p-recap');
    mark(reflection, 'v21p-reflection');
    open(outcomes, 'v21p-week-outcomes');
    return true;
  }

  function composeAim(body) {
    const root = rootFor(body, '.t-statement');
    if (!root) return false;
    const cards = children(root, '.card');
    if (cards.length < 3) return false;
    const [ritual, progress, breakdown] = cards;
    const moves = children(breakdown, '.li');
    if (moves.length < 3) return false;
    breakdown.insertBefore(moves[1], moves[0]);
    root.insertBefore(breakdown, ritual);
    mark(root, 'v21p-aim');
    open(breakdown, 'v21p-aim-moves');
    mark(moves[1], 'v21p-today-move');
    mark(ritual, 'v21p-support');
    mark(progress, 'v21p-support');
    return true;
  }

  function composeGambit(body) {
    const root = rootFor(body, '[data-gs]');
    const statement = body.querySelector('[data-gs]');
    const days = body.querySelector('[data-gday]');
    if (!root || !statement || !days) return false;
    mark(root, 'v21p-gambit');
    open(statement.parentElement, 'v21p-gambit-commitment');
    mark(body.querySelector('[data-gopt]'), 'v21p-gambit-options');
    mark(days.parentElement, 'v21p-checkin');
    mark(days, 'v21p-checkin-times');
    return true;
  }

  function composeTeachOffer(body) {
    const offer = body.querySelector('button[data-jump="lessonready"]');
    if (!offer) return false;
    const diagnostic = offer.closest('.card');
    const root = diagnostic && diagnostic.parentElement;
    if (!root) return false;
    root.insertBefore(offer, diagnostic.nextSibling);
    mark(root, 'v21p-teach-offer');
    open(diagnostic, 'v21p-tax-evidence');
    mark(offer, 'v21p-teach-action');
    const supporting = children(root, '.card');
    if (supporting[1]) open(supporting[1], 'v21p-tax-details');
    return true;
  }

  function composeLessonReady(body) {
    const root = rootFor(body, '.segm[data-lv]');
    if (!root) return false;
    const syllabus = children(root, '.card')[0];
    if (!syllabus) return false;
    mark(root, 'v21p-lesson-ready');
    open(syllabus, 'v21p-lesson-syllabus');
    children(syllabus, '.li').forEach(row => mark(row, 'v21p-lesson-stop'));
    return true;
  }

  function composeGaps(body) {
    const show = body.querySelector('[data-sm]');
    const gap = show && show.closest('.card');
    const root = gap && gap.parentElement;
    if (!root) return false;
    const evidence = children(root, '.card').find(card => card !== gap);
    if (!evidence) return false;
    root.insertBefore(gap, evidence);
    mark(root, 'v21p-gaps');
    mark(gap, 'v21p-actionable-gap');
    open(evidence, 'v21p-gap-evidence');
    return true;
  }

  function composeLearned(body) {
    const root = rootFor(body, '.card > .li');
    if (!root) return false;
    const ledger = children(root, '.card')[0];
    const rows = children(ledger, '.li');
    if (rows.length !== 5) return false;
    const originalFirst = rows[0];
    ledger.insertBefore(rows[1], originalFirst);
    ledger.insertBefore(rows[4], originalFirst);
    mark(root, 'v21p-learned');
    open(ledger, 'v21p-learned-ledger');
    rows.forEach(row => mark(row, 'v21p-learned-row'));
    mark(rows[1], 'v21p-recall-due');
    mark(rows[4], 'v21p-recall-due');
    return true;
  }

  function composeBigFive(body) {
    const root = rootFor(body, '.t-statement');
    const traits = children(root, '.card');
    if (traits.length !== 5) return false;
    mark(root, 'v21p-personality');
    traits.forEach(trait => {
      open(trait, 'v21p-trait');
      mark(children(trait, '.row')[0], 'v21p-trait-heading');
      mark(trait.lastElementChild, 'v21p-trait-meaning');
    });
    return true;
  }

  function composeValues(body) {
    const root = rootFor(body, '.t-title2');
    if (!root) return false;
    const ranks = children(root, '.col').find(group => !group.classList.contains('card'));
    const rows = children(ranks, '.card');
    if (rows.length !== 5) return false;
    mark(root, 'v21p-values');
    mark(ranks, 'v21p-ranked-values');
    rows.forEach((row, index) => {
      open(row, 'v21p-value-row');
      if (index < 2) mark(row, 'v21p-leading-value');
    });
    mark(children(root, '.card')[0], 'v21p-value-meaning');
    return true;
  }

  function composePeople(body) {
    const firstPerson = body.querySelector('button[data-jump="person"]');
    const directory = firstPerson && firstPerson.parentElement;
    const root = directory && directory.parentElement;
    if (!root) return false;
    const upcoming = children(root, '.row')[0];
    if (!upcoming || upcoming.children.length !== 3) return false;
    mark(root, 'v21p-people');
    mark(upcoming, 'v21p-upcoming');
    mark(upcoming.firstElementChild, 'v21p-next-person');
    open(directory, 'v21p-people-directory');
    children(directory, '.li').forEach(row => mark(row, 'v21p-person-row'));
    root.querySelectorAll('.adot').forEach(node => mark(node, 'v21p-person-mark'));
    return true;
  }

  function composePerson(body) {
    const root = rootFor(body, '[data-tog]');
    if (!root) return false;
    const avatar = children(root, '.adot')[0];
    const identity = children(root, '.col').find(node => !node.classList.contains('card'));
    const cards = children(root, '.card');
    if (!avatar || !identity || cards.length < 3) return false;
    const profile = section(body.ownerDocument, 'v21p-person-identity');
    root.insertBefore(profile, avatar);
    profile.append(avatar, identity);
    mark(avatar, 'v21p-person-mark');
    mark(root, 'v21p-person');
    mark(cards[0], 'v21p-birthday-plan');
    open(cards[1], 'v21p-gift-memory');
    open(cards[2], 'v21p-contact-cadence');
    return true;
  }

  function composeDates(body) {
    const root = rootFor(body, '.li .tnum');
    if (!root) return false;
    const labels = children(root, '.t-callout');
    if (labels.length !== 3) return false;
    const pairs = labels.map(label => [label, label.nextElementSibling]);
    if (pairs.some(pair => !pair[1] || !pair[1].matches('.card'))) return false;
    mark(root, 'v21p-dates');
    pairs.forEach(([label, agenda], index) => {
      const month = section(body.ownerDocument, 'v21p-agenda-month');
      root.insertBefore(month, label);
      month.append(label, agenda);
      open(agenda, 'v21p-agenda-items');
      children(agenda, '.li').forEach(row => mark(row, 'v21p-agenda-event'));
      if (index === 0) mark(agenda.firstElementChild, 'v21p-next-date');
    });
    return true;
  }

  function composeMeasures(body) {
    const root = rootFor(body, '.card > .li');
    if (!root) return false;
    const original = children(root, '.card')[0];
    const rows = children(original, '.li');
    if (rows.length !== 10) return false;
    const doc = body.ownerDocument;
    mark(root, 'v21p-measures');
    open(original, 'v21p-measure-group');
    const headings = ['Measurements', 'Heart & fitness', 'Profile & targets'];
    const bounds = [[0, 5], [5, 8], [8, 10]];
    const groups = [original, section(doc, 'v21p-measure-group'), section(doc, 'v21p-measure-group')];
    root.insertBefore(groups[1], original.nextSibling);
    root.insertBefore(groups[2], groups[1].nextSibling);
    groups.forEach((group, index) => {
      group.prepend(title(doc, headings[index]));
      rows.slice(bounds[index][0], bounds[index][1]).forEach(row => {
        const detail = children(row, '.lt')[0];
        const source = row.lastElementChild;
        if (detail && source !== detail) {
          detail.insertBefore(source, detail.children[1] || null);
          mark(source, 'v21p-measure-source');
        }
        mark(row, 'v21p-measure-row');
        group.append(row);
      });
    });
    return true;
  }

  const composers = {
    library: composeLibrary, lens: composeLens, learning: composeLearning,
    recap: composeRecap, aim: composeAim, gambit: composeGambit,
    teachoffer: composeTeachOffer, lessonready: composeLessonReady,
    gaps: composeGaps, learned: composeLearned, bigfive: composeBigFive,
    values: composeValues, people: composePeople, person: composePerson,
    dates: composeDates, measures: composeMeasures
  };

  window.__V21Passes = window.__V21Passes || [];
  window.__V21Passes.push({
    id: 'personal', keys: keys, reviewed: reviewed,
    apply: function (sc, scr) {
      const key = typeof sc === 'string' ? sc : sc && (sc.key || sc.id);
      if (!keys.includes(key)) return { changes: [], retained: [], reviewed: false };
      if (!composed.has(key)) return { changes: [], retained: [reviewed[key]], reviewed: true };
      if (scr.dataset.v21Personal === 'applied') return { changes: [], retained: ['Already composed; original node identity retained.'], reviewed: true };
      if (scr.dataset.v21Mode === 'preserve') return { changes: [], retained: [reviewed[key], 'Shared normalizer marked this screen geometry-sensitive; domain changes deliberately skipped.'], reviewed: true };
      const body = scr.querySelector('.v21-body');
      if (!body) return { changes: [], retained: ['No normalized body; leave original geometry untouched.'], reviewed: true };
      scr.classList.add('v21-personal');
      const changed = composers[key](body);
      if (changed) scr.dataset.v21Personal = 'applied';
      return changed
        ? { changes: [reviewed[key]], retained: ['Original text, controls, images, dynamic hosts and node identities retained; no header/footer changes.'], reviewed: true }
        : { changes: [], retained: ['Expected original content group missing; no substitute content or geometry invented.'], reviewed: true };
    }
  });
})();
