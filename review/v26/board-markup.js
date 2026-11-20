// life · V26 board: the board's own markup as plain strings. Nothing here touches the page, so
// build.mjs can run it and write every screen into board.html. The page then shows every screen
// even where scripts do not run (file previews), and board.js only adds the parts that move.
(() => {
  'use strict';
  const K = window.L26, C = window.L26_CATALOGUE, { esc } = K;

  const REFS = [
    ['Identity reflection', 'A habit app that asks who you are becoming, on a NO to YES line, and keeps the streak quiet.', 'You, Morning walk', 'The serif. You asked for Inter only.'],
    ['Agreement under a sky', 'A confirmation written as one sentence, with the names set inside it, on open sky.', 'Marked as cleared', 'The glassy Cancel button. Ours is a flat tint.'],
    ['Joi Pro', 'The offer is one big sentence with icons inside it. One price, one black button.', 'life Plus, Today’s briefing', ''],
    ['Neuecast', 'A huge title, lots of air, and one big round control.', 'Lesson player', ''],
    ['Stoic', 'Your life counted in dots. Filled is lived, grey is ahead.', 'Morning walk, Body, streaks', ''],
    ['Oppie', 'A dot for a logo and two soft rows. Nothing else to do.', 'One question at a time', ''],
    ['AI summary editing', 'The summary stays put and you fix it by typing one line.', 'What life understood', 'The rainbow text.'],
    ['Pocket', 'Onboarding that draws what the product does: you talk, it summarises.', 'How life works', 'The colour-cloud square. You ruled out mesh gradients.'],
    ['Zero', 'The product speaks in the first person beside its mark. Back and Next as a pair.', 'How life works', 'The blurred light.'],
    ['ALONE', 'Photograph edge to edge, words low and left, one round arrow, a dash pager.', 'Welcome', 'The blurred glass panel. No blur, ever.'],
    ['Notes checklist', 'A heading in your own words, round checkboxes, tools floating in pills.', 'Your Aim, in your words', ''],
    ['Health overview', 'Every number is a calm tile: label, target, one big figure. Food gets the wide tile.', 'Today’s Body, Body', 'A different colour per metric. We keep 6pt area dots.'],
    ['Health at a glance', 'A greeting, a two-line promise, then a floating pill for navigation.', 'The dock, Today', 'Pastel chart cards.'],
    ['Kiwifruit', 'The food fills the screen. Name on the photo, numbers in clean columns.', 'Meal result', 'The ruled table. Columns separate by space.'],
    ['Grocery search', 'Search opens on photographs and chips, not an empty list.', 'Search', ''],
    ['Materials dashboard', 'In and out as pairs of capsules around one line, with one week picked out.', '30-day cash plan', 'Red and green. We use ink and one signal.'],
    ['Villa', 'A big two-tone heading, then sections that open with a round plus.', 'Plan, the briefing', 'The hairline dividers. Ours separate by fill.'],
    ['Saved emails', 'One card in front, the others resting behind it.', 'Today’s next move', ''],
    ['Mike’s case', 'A case told as a dated timeline with voice notes, and a dark drawer that asks one question.', 'Tax rebate, Talk', 'The dashed line. Our spine is the orb’s dots.'],
    ['Body metrics', 'Each reading with its trend, a status word and a band for normal.', 'Readiness', 'Coloured icons and red lines.'],
    ['7 day streak (video)', 'A sentence with icons in it, a month of filled days, and a sheet that asks one small thing.', 'How much time today?, Today', 'Green as a second accent beyond the streak number.'],
  ];
  const MOVES = [
    ['3 · 17 · video', 'The briefing is the hero', 'Today opens on one 34pt two-tone sentence with the icons inside it. The big “Today” title steps back into the bar.'],
    ['18', 'One move in front', 'Your next move is a card with the next two resting behind it. One thing to do, and you can see there is more.'],
    ['12 · 13', 'Numbers as calm tiles', 'Readiness, sleep, fuel, load and stress each get a tile: label, target, one figure. Fuel gets the wide one.'],
    ['5 · video', 'Dots for counted days', 'Ticks stay for percentages. Days you actually lived (habits, streaks, months) are counted in the orb’s chunky dots.'],
    ['19', 'A case is a timeline', 'Missions and situations read as a dated story: what life noticed, what you said, what’s next, what’s coming.'],
    ['19 · 2', 'One question, one gesture', 'Filing asks one thing in a dark drawer: leave it, ask, or file. Nothing is saved until you say so.'],
    ['2', 'Moments get a sky', 'Clearing a mission happens on open daylight sky, written as one sentence. Reserved for moments, not everyday screens.'],
    ['14 · 15 · 10', 'Photographs do work', 'Food fills the screen. Search opens on your areas as photographs. Welcome is one photograph, edge to edge.'],
    ['20 · 16', 'Your own normal on every chart', 'Each reading shows its week and a band for your normal range, in ink. Money shows in and out as pairs.'],
    ['1', 'Who you’re becoming', 'Every few check-ins life asks whether that felt like you, on a NO to YES line. New for life; it fits the habit science.'],
    ['13 · 11', 'A floating dock, round controls', 'Navigation is a solid pill resting on the canvas, with the current tab named. Icon buttons become circles.'],
    ['video · 6', 'Ask one small thing', '“How much time do you have today?” picks the move that fits. Onboarding is one question and three soft rows.'],
  ];

  const byKey = Object.fromEntries(C.rows.map(r => [r.key, r]));
  const extras = Object.keys(K.screens).filter(k => !byKey[k]);
  const done = C.rows.filter(r => K.screens[r.key]).length;
  const failed = [];
  const draw = key => { try { return K.screens[key].build(''); } catch (err) { failed.push(key + ': ' + err.message); return ''; } };

  const slot = (key, filled) => {
    const row = byKey[key], def = K.screens[key];
    const title = row ? row.title : (def && def.title) || key;
    const opens = row ? `${row.opensAs} · opens from ${row.from}` : 'New idea · not in the screen list yet';
    return `<article class="slot ${def ? '' : 'todo'}" id="slot-${key}" data-key="${key}" data-name="${esc(title)}"><div class="phone"><div class="screen" data-screen="${key}">${def ? (filled ? draw(key) : '') : `<div class="pending"><b>${esc(title)}</b><span>Not redesigned yet. The V23 screen still stands.</span></div>`}</div></div><div class="cap"><b>${esc(title)}</b>${def && def.note ? `<span>${esc(def.note)}</span>` : ''}<span class="opens">${esc(opens)}</span>${def && def.from ? `<span class="from">From references ${esc(def.from)}</span>` : ''}${def ? '<div class="rv"><button data-v="ok">Approve</button><button data-v="fix">Needs work</button><textarea hidden placeholder="What should change?" aria-label="What should change on ' + esc(title) + '?"></textarea></div>' : ''}</div></article>`;
  };
  const section = (title, keys, id, filled) => { const n = keys.filter(k => K.screens[k]).length; return `<section class="sec" id="${id}"><h2>${esc(title)} <span>${n} of ${keys.length}</span></h2><div class="phones">${keys.map(k => slot(k, filled)).join('')}</div></section>`; };
  const chapters = [...C.chapters.map((ch, k) => ['ch-' + (k + 1), ch]), ...(extras.length ? [['ch-new', 'New ideas']] : [])];

  window.L26_BOARD = {
    extras, done, failed,
    progress: done + ' of ' + C.rows.length + ' screens redesigned',
    refs: () => REFS.map(([name, take, lands, leave], k) => `<article class="ref"><div class="thumb" style="background-image:url('refs/${k + 1}.jpg')"></div><div><h3><em>${String(k + 1).padStart(2, '0')}</em>${esc(name)}</h3><p>${esc(take)}</p><p><b>Lands in</b> ${esc(lands)}</p>${leave ? `<p class="leave"><b>We leave</b> ${esc(leave)}</p>` : ''}</div></article>`).join(''),
    moves: () => MOVES.map(([from, name, text]) => `<article class="move"><small>From ${from}</small><b>${esc(name)}</b><p>${esc(text)}</p></article>`).join(''),
    jump: () => chapters.map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join(''),
    /** Every chapter in catalogue order. `filled` draws each screen's first state into its phone. */
    screens: ({ only = [], filled = false } = {}) => only.length
      ? `<div class="phones">${only.map(k => slot(k, filled)).join('')}</div>`
      : C.chapters.map((ch, k) => section(ch, C.rows.filter(r => r.chapter === ch).map(r => r.key), 'ch-' + (k + 1), filled)).join('') + (extras.length ? section('New ideas, not in the screen list yet', extras, 'ch-new', filled) : ''),
  };
})();
