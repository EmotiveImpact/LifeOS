/* life v21 — shell/content pass. The lead owns every header, footer and viewport. */
(function () {
  'use strict';

  var reviewed = {
    welcome: 'Retain the full-bleed arrival photograph, oversized Life handled headline and two original entry actions; this is an immersive brand moment, not a settings page.',
    question: 'Give the actual question a page-title measure and space the existing selectable answers as a deliberate decision list; preserve the step strip and Next action.',
    tell: 'Retain the spoken-setup invitation, five concrete prompts and isolated microphone; moving the microphone into the prompt list would confuse the recording interaction.',
    building: 'Retain the orb-led waiting composition and live progress hooks; the working state must not become a static summary card.',
    talk: 'Retain the live transcript, waveform, filing tray and microphone proportions; the lead normalizes the recording shell without disturbing its listeners.',
    understood: 'Make removable facts the main review surface; move the consequence summary below that review and give confirmation and continued conversation distinct action weights.',
    ask: 'Retain the two-tone answer, source-year estimate, business comparison and save-decision offer; the numerical comparison already has a clear reading order.',
    attach: 'Retain the action-sheet ordering of scan, camera, photos, files and Pulse; preserve the contextual conversation and native composer proportions.',
    scan: 'Lead with what the council letter means, followed by its authoritative source and exact bill fields; separate the two filed consequences from the document surface.',
    nudge: 'Retain the Lock Screen demonstration and its transition into the P87 action; moving either layer would break the notification-to-task story.',
    pulse: 'Retain all four mood-field axes and the canvas interaction; no cosmetic repackaging of this spatial input.',
    household: 'Retain the figure silhouettes, centred counter and Fewer/More/Save controls in the original native sheet.',
    mood: 'Retain the 14-day check-in field, three observed patterns and explicit Applied status; the pattern-to-response sequence is already coherent.',
    plus: 'Retain the full-bleed freedom image, entitlement list and two selectable billing periods; preserve the photo-band geometry and trial action.',
    settings: 'Replace five equal boxes with appearance, open preference rows, a distinct connected-services section and separated account/destructive actions.',
    checkin: 'Retain the compassionate lead, three support options and emergency caveat; do not subordinate support beneath a new decorative hero.',
    where: 'Retain postcode search, suggested cities and the exact-area privacy promise; this is a short onboarding decision with no extra grouping needed.',
    signin: 'Retain Apple, Google, email and local-only choices in their original order; the account-saving explanation already precedes the decision.',
    healthprimer: 'Keep the wellness explanation first, then make the three main Health permissions an open readable list and visibly separate the optional food/water permission.',
    notifprimer: 'Retain the real notification example above quiet-hours and deadline controls; preserve the explicit opt-out and quiet-hours copy.',
    children: 'Retain the dynamic child-count sheet, silhouettes, question and dependent caption; never rearrange its geometry-sensitive controls.',
    knows: 'Prioritize the editable fact inventory and category filters; stack export and deletion actions below the facts with deletion and its warning kept together.',
    notifs: 'Retain the daily-cap segmented control, individually explained notification switches and separate quiet-hours row; no information is gained by another grouping layer.',
    emptytoday: 'Retain the Talk invitation and content-shaped placeholders; these explain what will arrive without presenting invented account data.',
    offline: 'Retain the stale-data timestamp before saved balance and transactions, with the bank-retry explanation adjacent; freshness must remain unmistakable.',
    widgets: 'Retain native iOS widget and Live Activity proportions; these are operating-system previews, not app content cards.',
    sharecard: 'Retain the self-contained portrait share image and Hide numbers/Share actions; its export aspect ratio is intentional.',
    customise: 'Retain the live numbers preview immediately above the editable list; preserve both dynamic preview hooks and their relationship.',
    levels: 'Retain the current-level checklist ahead of future unlocks and season context; preserve all unlock copy and progress controls.',
    routines: 'Feature the next payday sweep, give the second active routine open breathing room, and separate future level-3 routines without washing their text out.',
    why: 'Retain the compact native explanation sheet: changed plan, three evidence rows, then the two user choices; the sheet/background relationship must stay intact.',
    calendar: 'Turn the boxed agenda into an open time-aligned schedule; reserve filled emphasis for the existing 13:40 free slot and retain the busy/free privacy note.',
    experiment: 'Retain experiment progress, baseline comparisons and the five-days-remaining uncertainty statement; no chart or stronger causal claim is introduced.',
    watch: 'Retain the actual wrist-sized preview and complication examples; scaling these to phone-width cards would misrepresent the target device.',
    ondevice: 'Keep the privacy switch prominent, expose the existing On your phone and Still asks labels as section headings, and flatten the nested capability lists.',
    memory: 'Group the three already-marked used-today memories together, ahead of the three other memories; retain every provenance caption and removal control.',
    yourai: 'Retain per-category sharing switches above the read-only connection address and revoke action; access scope is the primary decision.',
    shared: 'Retain the shared goal, individual contributions, shared bills and Never shared promise; that privacy boundary must remain explicit.',
    orb: 'Retain the live orb gallery and state selector; do not resize or reparent the renderer mounts.',
    chat: 'Keep the user prompt right-aligned, give the reply its own reading lane and remove the arbitrary indentation from dynamically inserted action cards; leave composer and Island geometry to the lead.',
    chathistory: 'Feature the latest Going freelance conversation above an open earlier-conversation list, keeping search first and every Filed count attached to its own record.',
    editfiled: 'Put the editable values before the quoted source, distinguish field labels from actual values and keep Save/Unfile in their existing order.',
    micprimer: 'Retain the listening orb and plain-language recording promise with microphone and typing choices; this primer already earns its whitespace.',
    camprimer: 'Retain the three concrete camera uses and photo-deletion promise; preserve its single native permission action.',
    calprimer: 'Retain the miniature agenda demonstrating where a nudge fits and the explicit never-changes-calendar promise; this is not a full agenda screen.',
    devicesetup: 'Retain all five device routes, including Just my phone and WHOOP account access; no new Bluetooth or platform behavior is introduced.',
    firstmove: 'Retain the photographic two-minute invitation and exact tax-code mission; the image/title spacing and paired completion exits are geometry-sensitive.',
    loadingtoday: 'Retain content-shaped skeletons and live orb placeholder; never turn loading into a false populated dashboard.',
    morningbrief: 'Retain the photographic morning greeting, spoken brief and single Start the day action; preserve the full-bleed band and Listen control.',
    evening: 'Retain the completion summary, tomorrow carry-forward and editable journal line in that order; closing the day remains a single clear action.',
    inbox: 'Separate the two unread notices from the three earlier notices; make the tax-rebate notice the first reading priority without changing any amounts or times.',
    search: 'Retain Money and Conversations grouping plus the contextual Ask life option; the cross-domain search hierarchy is already explicit.',
    emptyplan: 'Retain the suggested first mission above empty domain categories; avoid making empty-state tiles look like active tasks.',
    emptybody: 'Retain phone-derived steps and estimated sleep above device-only metrics; the estimated qualifier and unavailable states must stay honest.',
    profile: 'Retain Ama’s identity and field-level Changes explanations; these are useful consequences of editing, not redundant subtitles.',
    appearance: 'Retain theme controls, individual sensory/imagery switches and Reduce Motion system-policy copy; do not replace native preference behavior.',
    services: 'Retain each service’s last-sync/source caption and explicit bank-not-connected state; freshness is more important than decorative service tiles.',
    privacy: 'Lead with the original privacy promise, bring editable/downloadable data together and separate infrastructure disclosure from the destructive account action.',
    deleteacct: 'Retain deleted/kept/grace-period disclosure, download-first route and DELETE confirmation before the destructive action; no streamlined destructive shortcut.',
    subscription: 'Retain the actual yearly renewal record before entitlements, monthly switch and cancellation; do not reconcile differing marketing prices by inventing data.',
    plussuccess: 'Retain the completion orb, unlocked-item hooks and return-to-previous-task action; this is a short celebratory transition.',
    help: 'Retain contextual Ask life above guides and human contact routes; wrong-number reporting remains directly discoverable.',
    legal: 'Retain version/build, terms, privacy, notices and the wellness/guidance caveat; legal text is not decorative copy to compress.',
    permdenied: 'Retain the camera-specific recovery explanation and Open Settings action; the lead removes the inherited oversized top offset.',
    syncissue: 'Retain the exact two-device conflict description and sole original Keep the 28th action; flag the missing alternative to the lead rather than inventing a new control.',
    aidown: 'Replace the floating giant-offset error stack with an icon/headline reading row and separate continuity explanation; keep the original queue-and-answer-later action.',
    forceupdate: 'Retain the tax-year reason before Update life; this is a required rules update, not a marketing interstitial.',
    signedout: 'Retain the restore-plan explanation and Apple sign-in action; keep the recovery path shorter than first-time onboarding.',
    connectfail: 'Retain the device-specific Oura recovery instruction above unavailable readiness and its last-known timestamp; never display stale readiness as current.',
    lockpush: 'Retain native Lock Screen notification stacking and photographic background; no app header or phone-card treatment belongs inside this preview.',
    androidwidget: 'Retain Android widget sizes and the hidden balance example; preserve operating-system home-screen proportions.',
    siri: 'Retain the voice-command quotation, Filed confirmation and reminder destination inside the native assistant preview.',
    topbars: 'Retain the component comparison gallery unchanged; the lead alone owns header implementation and fixes actual header geometry globally.',
    support: 'Retain immediate free support routes followed by the 999 emergency instruction; keep safety copy and contact numbers untouched.',
    focus: 'Retain the large live countdown, orb and Pause/End early hierarchy; the timer is an immersive control surface, not an ordinary detail page.',
    orbnext: 'Retain four live renderer previews and real-size examples; never wrap or resize the orb mount nodes.',
    measuresetup: 'Retain Metric/Imperial and all three measurement steppers with optional waist clearly identified; avoid a new layout that changes control geometry.',
    aimodels: 'Retain storage totals, model-size ranges, platform availability and Wi-Fi/removal/testing caveats; do not turn technical disclosure into a new capability claim.'
  };

  function children(node, selector) {
    return node ? Array.prototype.filter.call(node.children, function (child) { return child.matches(selector); }) : [];
  }
  function mark(node, name) { if (node) node.classList.add('v21-shell-' + name); return node; }
  function parentInBody(node, body) {
    if (!node) return null;
    var parent = node.closest('.pad.col');
    return parent && body.contains(parent) ? parent : node.parentElement;
  }
  function section(parent, label, nodes, name, before) {
    var group = document.createElement('div');
    group.className = 'col v21-shell-section' + (name ? ' v21-shell-' + name : '');
    if (label) {
      var heading = document.createElement('span');
      heading.className = 't-callout c2 v21-shell-section-label';
      heading.textContent = label;
      group.appendChild(heading);
    }
    parent.insertBefore(group, before || null);
    nodes.forEach(function (node) { group.appendChild(node); });
    return group;
  }

  var composers = {
    question: function (body) {
      var options = body.querySelector('[data-dest]');
      var root = parentInBody(options, body);
      if (!options || !root) return [];
      mark(root, 'question');
      mark(children(root, '.t-statement')[0], 'question-title');
      mark(options, 'choices');
      return ['Question now leads at the existing page-title scale; choice rows have equal readable spacing while selection listeners and data-next stay intact.'];
    },
    healthprimer: function (body) {
      var control = body.querySelector('[aria-label="Sleep"]');
      if (!control) return [];
      var list = control.closest('.card');
      var root = parentInBody(list, body);
      var rows = children(list, '.li');
      if (!root || rows.length !== 4) return [];
      mark(root, 'health');
      mark(list, 'permission-list');
      section(root, '', [rows[3]], 'optional-permission', list.nextSibling);
      mark(children(root, '.t-callout')[0], 'permission-note');
      return ['The optional food/water permission is separated from the three core choices; the remaining permission list loses its enclosing box and every original switch stays attached to its description.'];
    },
    understood: function (body) {
      var facts = body.querySelector('[data-ul]');
      var root = parentInBody(facts, body);
      if (!facts || !root) return [];
      var cards = children(root, '.card');
      var impact = cards.filter(function (card) { return card !== facts; })[0];
      mark(root, 'understood');
      mark(facts, 'fact-review');
      mark(impact, 'impact');
      var save = root.querySelector('[data-ok]');
      var actions = children(root, '.btn');
      if (save && actions.length) section(root, '', actions, 'confirm-actions');
      return ['Removable facts become an open per-record review list, impact reads as a quiet explanatory note, and confirmation is separated from the secondary Keep talking action.'];
    },
    scan: function (body) {
      var statement = body.querySelector('.t-statement');
      var root = parentInBody(statement, body);
      if (!root || !statement) return [];
      var cards = children(root, '.card');
      if (cards.length !== 2) return [];
      mark(root, 'letter');
      mark(statement, 'letter-meaning');
      root.insertBefore(statement, cards[0]);
      mark(cards[0], 'letter-source');
      mark(cards[1], 'letter-filed');
      section(root, 'Filed into your life', [cards[1]], 'filed-section', cards[1]);
      return ['The explanation leads before the bill metadata; exact amount/due/band/account fields remain one source block, with filed consequences in a separate open section.'];
    },
    settings: function (body) {
      var appearance = body.querySelector('[data-ap]');
      if (!appearance) return [];
      var root = parentInBody(appearance, body);
      var cards = children(root, '.card');
      if (cards.length !== 5) return [];
      mark(root, 'settings');
      mark(cards[0], 'appearance');
      mark(cards[1], 'preference-list');
      mark(cards[2], 'preference-list');
      mark(cards[3], 'settings-connections');
      var connectionHeading = children(cards[3], '.row')[0];
      if (connectionHeading) root.insertBefore(connectionHeading, cards[3]);
      var accountRows = children(cards[4], '.li');
      mark(cards[4], 'account-list');
      if (accountRows.length === 3) section(root, '', [accountRows[2]], 'destructive');
      section(root, 'Data and account', [cards[4]], 'account-section', cards[4]);
      return ['Appearance and preferences are no longer five competing cards; Connected gains a real section break and the irreversible Delete row sits apart from editable/exportable account data.'];
    },
    knows: function (body) {
      var list = body.querySelector('[data-kl]');
      var root = parentInBody(list, body);
      if (!list || !root) return [];
      mark(root, 'knowledge');
      mark(list, 'knowledge-list');
      mark(body.querySelector('[data-kf]'), 'knowledge-filters');
      var actions = children(root, '.row')[0];
      var warning = children(root, '.t-callout')[0];
      if (actions) {
        mark(actions, 'knowledge-actions');
        var buttons = children(actions, 'button');
        if (buttons[1] && warning) {
          section(root, '', [buttons[1], warning], 'knowledge-delete');
        }
      }
      return ['Inventory and live category filters lead; export gets its own full-width row, while deletion and its irreversible warning form a separate quiet block.'];
    },
    memory: function (body) {
      var filter = body.querySelector('.segm');
      var root = parentInBody(filter, body);
      if (!root) return [];
      var list = children(root, '.card')[0];
      var rows = children(list, '.li');
      if (rows.length !== 6) return [];
      mark(root, 'memory');
      mark(list, 'memory-other');
      section(root, 'Used today', [rows[0], rows[1], rows[5]], 'memory-used', list);
      section(root, 'Other memories', [list], 'memory-other-section', list);
      rows.forEach(function (row) { mark(row, 'memory-record'); });
      return ['The three records whose original provenance says used today now appear together; all other memories, source captions, category controls and six remove targets remain.'];
    },
    chat: function (body) {
      var thread = body.querySelector('[data-th]');
      var reply = body.querySelector('[data-rp]');
      if (!thread || !reply) return [];
      mark(thread, 'chat-thread');
      mark(reply, 'chat-reply');
      mark(children(thread, '.card')[0], 'chat-question');
      return ['The prompt remains a right-aligned bubble; dynamic answer cards align with the thread gutter instead of inheriting a cramped 30px inset. Composer, live Island and all timed response hooks stay untouched.'];
    },
    chathistory: function (body) {
      var list = body.querySelector('.card.col');
      var root = parentInBody(list, body);
      var rows = children(list, '.li');
      if (!root || rows.length !== 5) return [];
      mark(root, 'history');
      mark(list, 'history-earlier');
      mark(rows[0], 'history-latest');
      section(root, 'Latest conversation', [rows[0]], 'history-feature', list);
      section(root, 'Earlier conversations', [list], 'history-section', list);
      return ['Latest conversation becomes a readable featured record; four older records become an open history list below search, with every original date and Filed count preserved.'];
    },
    editfiled: function (body) {
      var root = Array.prototype.find.call(body.querySelectorAll('.pad.col'), function (node) { return children(node, '.card').length === 2; });
      if (!root) return [];
      var cards = children(root, '.card');
      var rows = children(cards[1], '.li');
      if (rows.length !== 4) return [];
      mark(root, 'edit');
      mark(cards[0], 'edit-source');
      mark(cards[1], 'edit-fields');
      root.insertBefore(cards[1], cards[0]);
      rows.forEach(function (row) {
        var text = row.querySelector('.lt');
        mark(text && children(text, '.t-body')[0], 'field-label');
        mark(text && children(text, '.t-callout')[0], 'field-value');
      });
      return ['Editable facts now lead, field values outweigh their labels, and the exact source quotation follows as provenance rather than another equal card.'];
    },
    privacy: function (body) {
      var deleteButton = body.closest('.screen').querySelector('[data-jump="deleteacct"]');
      var root = parentInBody(body.querySelector('.card > .li'), body);
      var cards = children(root, '.card');
      if (!root || cards.length !== 2) return [];
      var rows = children(cards[0], '.li');
      if (rows.length !== 4) return [];
      mark(root, 'privacy');
      mark(cards[1], 'privacy-promise');
      root.insertBefore(cards[1], cards[0]);
      mark(cards[0], 'privacy-infrastructure');
      section(root, 'Your copy, your facts', [rows[0], rows[3]], 'privacy-data', cards[0]);
      section(root, 'How it is looked after', [cards[0]], 'privacy-disclosure', cards[0]);
      mark(deleteButton, 'delete-account');
      return ['The existing We never promise is the lead; download and editable facts sit together before backup/vendor disclosure, while Delete my account remains isolated at the end.'];
    },
    ondevice: function (body) {
      var toggle = body.querySelector('[aria-label="Private mode"]');
      var root = parentInBody(toggle, body);
      var cards = children(root, '.card');
      if (!root || cards.length !== 3) return [];
      mark(root, 'private');
      mark(cards[0], 'private-switch');
      mark(cards[1], 'local-capabilities');
      mark(cards[2], 'cloud-capabilities');
      [cards[1], cards[2]].forEach(function (card) {
        var heading = children(card, '.li')[0];
        if (heading) {
          mark(heading, 'capability-heading');
          root.insertBefore(heading, card);
        }
      });
      return ['The privacy switch leads, existing local/cloud labels become genuine section headings and local capability rows lose their enclosing card; cloud permissions remain a separate subdued surface.'];
    },
    routines: function (body) {
      var statement = body.querySelector('.t-statement');
      var root = parentInBody(statement, body);
      var cards = children(root, '.card');
      if (!root || cards.length !== 4) return [];
      mark(root, 'routines');
      mark(statement, 'routine-summary');
      mark(cards[0], 'routine-next');
      mark(cards[1], 'routine-active');
      mark(cards[2], 'routine-locked');
      mark(cards[3], 'routine-locked');
      section(root, 'Available at level 3', [cards[2], cards[3]], 'routine-future');
      return ['The upcoming payday routine is the single featured surface, the annual tax check reads as an open active item and level-3 routines become a distinct legible future section.'];
    },
    calendar: function (body) {
      var statement = body.querySelector('.t-statement');
      var root = parentInBody(statement, body);
      var agenda = children(root, '.card')[0];
      var slots = children(agenda, '.row');
      if (!root || slots.length !== 7) return [];
      mark(root, 'calendar');
      mark(statement, 'calendar-summary');
      mark(agenda, 'agenda');
      slots.forEach(function (slot, index) {
        mark(slot, 'agenda-slot');
        mark(slot.children[0], 'agenda-time');
        mark(slot.children[1], index === 4 ? 'agenda-opportunity' : 'agenda-event');
      });
      return ['Open time-aligned agenda replaces a card of seven mini-cards; the existing 13:40 free gap is the sole filled signal and the privacy caveat stays below the schedule.'];
    },
    inbox: function (body) {
      var list = body.querySelector('.card.col');
      var root = parentInBody(list, body);
      var rows = children(list, '.li');
      if (!root || rows.length !== 5) return [];
      mark(root, 'inbox');
      mark(list, 'inbox-earlier');
      mark(rows[0], 'inbox-priority');
      section(root, 'New', [rows[0], rows[1]], 'inbox-new', list);
      section(root, 'Earlier', [list], 'inbox-history', list);
      return ['Two original unread notices now form the New section, led by the rebate; the three already-read notices become an open Earlier list with all notification dates and destinations intact.'];
    },
    aidown: function (body) {
      var icon = body.querySelector('.sqb');
      var root = parentInBody(icon, body);
      if (!root) return [];
      var title = children(root, '.t-title1')[0];
      var explanation = children(root, '.t-body')[0];
      if (!icon || !title || !explanation) return [];
      mark(root, 'recovery');
      mark(icon, 'recovery-icon');
      mark(title, 'recovery-title');
      section(root, '', [icon, title], 'recovery-heading', root.firstChild);
      mark(explanation, 'recovery-continuity');
      return ['A compact icon/headline row replaces the stranded icon stack; the unchanged explanation of what still works becomes the reading focus above the original queued-message action.'];
    }
  };

  var results = new WeakMap();
  window.__V21Passes = window.__V21Passes || [];
  window.__V21Passes.push({
    id: 'shell',
    keys: Object.keys(reviewed),
    reviewed: reviewed,
    apply: function (sc, scr) {
      var key = sc.key;
      if (!Object.prototype.hasOwnProperty.call(reviewed, key)) return { changes: [], retained: [], reviewed: false };
      if (results.has(scr)) return results.get(scr);
      scr.classList.add('v21-shell');
      var body = scr.querySelector('.v21-body');
      var decision = reviewed[key];
      var changes = [];
      var retained = [];
      if (!composers[key]) retained.push(decision);
      else if (scr.getAttribute('data-v21-mode') === 'preserve') retained.push('Native/immersive geometry retained by the lead; reviewed content decision: ' + decision);
      else if (!body) retained.push('No normalized content body was exposed; retained original content rather than touching shared geometry. ' + decision);
      else {
        changes = composers[key](body);
        if (!changes.length) retained.push('Expected content anchors were not present after normalization; original nodes retained. ' + decision);
      }
      var result = { changes: changes, retained: retained, reviewed: true };
      results.set(scr, result);
      return result;
    }
  });
}());
