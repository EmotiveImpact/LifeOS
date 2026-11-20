/* life v21 — Money/admin. Original nodes move; controls and calculated outputs survive. */
(function () {
  'use strict';
  var keys = [
    'mission', 'draft', 'ttk', 'cashplan', 'taxcheck', 'money', 'subs', 'income',
    'rentbuy', 'blood', 'protect', 'growth', 'bedrooms', 'buffer', 'unlock',
    'decisions', 'area', 'history', 'doitforme', 'missions', 'newgoal', 'areahome',
    'areahealth', 'areawork', 'tools', 'healthstack', 'txn', 'bill', 'budget',
    'networth', 'connectbank', 'vault', 'docdetail', 'renewal'
  ];
  var reviewed = {
    mission: 'Make the submitted rebate a working case file: progress/reference, visible vertical next steps, draft, then rationale and activity. Keep the fixed clearance action outside this pass.',
    draft: 'Retain the editable HMRC letter, recipient, subject, approval warning and two actions; its sheet/editor geometry belongs to the shared normalizer.',
    ttk: 'Retain the live filter rail and dynamically populated knowledge list; the empty catalogue containers are populated by original listeners, not missing content to replace.',
    cashplan: 'Bring the adjustable income directly below safe-to-spend; keep the original 30-day timeline intact and separate fixed commitments from the editable assumption.',
    taxcheck: 'Separate the actionable 2024/25 overpayment from settled years; give the NI explanation its own reading space and retain HMRC verification caveats.',
    money: 'Lead with the live balance and date, then monthly movement; make all three account pots visible in one row and turn the ledger into an open, legible receipt.',
    subs: 'Bring both unused subscriptions and their cancel actions ahead of active renewals; retain the monthly total and provider-consent disclaimer verbatim.',
    income: 'Read input, engine conclusion, then a side-by-side sole-trader/company comparison; keep both existing bars, slider and accountant/tax caveats unchanged.',
    rentbuy: 'Put the funding shortfall and Plan action before the wealth projection so modelled upside cannot hide present affordability; retain every model assumption and original chart.',
    blood: 'Retain all four marker cards, units, range positions and GP advice; regrouping abnormal results would change the clinical reading order without a clinical brief.',
    protect: 'Retain the risk-ordered checklist: income gap first, nominations/will next, emergency contacts complete. Preserve checkbox state and the explicit solicitor cost.',
    growth: 'Retain the personal two-tone brief, due-Sunday check-in, selectable answers and lessons; no extra finance wrapper around a reflective screen.',
    bedrooms: 'Retain the illustrated count picker, count listeners and full-width confirmation. Figure positions and native sheet geometry are deliberately not reflowed.',
    buffer: 'Retain the interactive buffer-month picker and its generated explanation. Do not restyle the counted figures or move its confirmation into the dimmed underlay.',
    unlock: 'Retain the clear level gate, two prerequisite checks and visible open-early escape; do not make a locked state look like an unavailable purchase.',
    decisions: 'Retain four complete decision cards with their level and thinker context; preserve both locked cards and their opacity rather than silently hiding future capability.',
    area: 'Retain the Money strength signal, active missions, routine and tool groups. These are different navigation purposes, not interchangeable balance cards.',
    history: 'Set cleared outcomes as a readable audit trail with right-aligned amounts and wrapping outcome notes; retain zero-value confirmation and health outcomes, not just cash wins.',
    doitforme: 'Retain the explicit three-step approval preview and never-do safety statement; shared footer owns approval versus manual alternative.',
    missions: 'Promote today’s £840 rebate as the single lead task, preserve the other needs-you rows and keep waiting work visibly secondary under its existing label.',
    newgoal: 'Retain the original editable intention, generated July plan and four starting prompts; do not split the staged input/result interaction or relocate the fixed Add action.',
    areahome: 'Retain the full-bleed home photograph and its contextual hero whitespace; deposit progress and home-admin links remain together, with no rounded image wrapper.',
    areahealth: 'Retain the distinction between health administration and Body, its progress and four links. Shared normalizer resolves the legacy absolute scroll/padding geometry.',
    areawork: 'Retain the full-bleed work photograph, freelance aim and work-admin list; no background-band clipping or independent header positioning.',
    tools: 'Retain the eight-tool two-column directory with visible open/level states. Its compact navigation grid is already purpose-built, not a financial result dashboard.',
    healthstack: 'Retain dose/timing records, the iron GP flag and pharmacist caveat. No financial hierarchy imposed on supplement guidance.',
    txn: 'Compose Tesco identity and timestamp as a receipt header, the payment as the sole large number, and category/repeat/budget facts as aligned key-value lines.',
    bill: 'Keep the £148 charge and due date together without a squeezed badge; make the £37 saving and claim action the one focus, with the untouched payment history below.',
    budget: 'Lead the flexible-spend list with nearly-full Going out, followed by groceries and transport; move fully covered rent and tax into a quieter group without changing any meter.',
    networth: 'Use a fitting 32/36 total, preserve the year trend and chart, then align assets/debt as a balance sheet with the student-loan explanation on its own line.',
    connectbank: 'Retain read-only permission, bank-owned login, 90-day expiry, all six bank names and the shared fixed Choose your bank action; consent is not a marketing hero.',
    vault: 'Pull the sole Act now insurance renewal out of the archive into a clear lead record; keep all five remaining documents and Scan action intact.',
    docdetail: 'Make expiry and reminder one coherent document summary, then separate renewal service/cost from the encrypted saved copy; retain GOV.UK source and timing.',
    renewal: 'Lead with the comparison window instead of an isolated quote; keep current-insurer annual cost as context and present the three original deadline-bearing checklist actions below.'
  };

  function all(root, selector) { return Array.from(root.querySelectorAll(selector)); }
  function mark(node, name) { if (node) node.classList.add(name); return node; }
  function findText(root, selector, text) {
    return all(root, selector).find(function (node) { return node.textContent.trim() === text; });
  }
  function section(parent, name, before) {
    var node = parent.ownerDocument.createElement('section');
    node.className = name;
    parent.insertBefore(node, before || null);
    return node;
  }
  function label(parent, text, before) {
    var node = parent.ownerDocument.createElement('span');
    node.className = 't-callout c2 v21-m-label';
    node.textContent = text;
    parent.insertBefore(node, before || null);
    return node;
  }
  function direct(node, selector) {
    return node ? Array.from(node.children).filter(function (child) { return child.matches(selector); }) : [];
  }
  function paper(node) { return mark(node, 'v21-m-paper'); }
  function stack(node) { return mark(node, 'v21-m-stack'); }
  function rows(node, className) {
    direct(node, '.li').forEach(function (row) { mark(row, className || 'v21-m-record'); });
  }
  function factRows(card) {
    direct(card, '.li').forEach(function (row) {
      mark(row, 'v21-m-fact');
      mark(row.querySelector('.lt'), 'v21-m-fact-pair');
    });
  }

  var composers = {
    mission: function (body) {
      var content = body.querySelector('.pad.col');
      if (!content) return false;
      var why = findText(content, '.t-title3', 'Why this matters');
      var what = findText(content, '.t-title3', 'What to do');
      var steps = content.querySelector('.hrow');
      var draft = content.querySelector('[data-jump="draft"]');
      if (!why || !what || !steps || !draft) return false;
      var rationale = why.nextElementSibling;
      var activity = findText(content, '.t-title3', 'Activity');
      // Put actual next actions before the explanatory essay, without losing that essay.
      content.insertBefore(what, why);
      content.insertBefore(steps, why);
      content.insertBefore(draft, why);
      stack(content);
      mark(content.firstElementChild, 'v21-m-case-intro');
      mark(content.querySelector('.stepper').parentElement, 'v21-m-case-status');
      mark(steps, 'v21-m-case-steps');
      direct(steps, '.card').forEach(function (step) { paper(step); mark(step, 'v21-m-case-step'); });
      paper(draft); mark(draft, 'v21-m-draft-link');
      mark(why, 'v21-m-section-title'); mark(rationale, 'v21-m-reading');
      mark(what, 'v21-m-section-title'); mark(activity, 'v21-m-section-title');
      if (activity) { paper(activity.nextElementSibling); rows(activity.nextElementSibling); }
      return true;
    },
    money: function (body) {
      var balance = body.querySelector('[data-bal]');
      var pots = body.querySelector('.hrow');
      var ledgerTitle = findText(body, '.t-title3', 'Ledger');
      if (!balance || !pots || !ledgerTitle) return false;
      var hero = balance.parentElement;
      var movement = hero.firstElementChild;
      var date = body.querySelector('[data-bd]');
      if (date) hero.insertBefore(date, balance);
      hero.appendChild(movement);
      mark(hero, 'v21-m-balance');
      mark(pots, 'v21-m-pots');
      direct(pots, '.card').forEach(function (pot) { mark(pot, 'v21-m-pot'); });
      var ledger = ledgerTitle.parentElement.parentElement;
      paper(ledger); mark(ledger, 'v21-m-ledger'); rows(ledger);
      stack(pots.parentElement);
      return true;
    },
    txn: function (body) {
      var amount = body.querySelector('.t-display');
      var icon = body.querySelector('.adot');
      if (!amount || !icon) return false;
      var content = amount.parentElement;
      var merchant = icon.nextElementSibling;
      var facts = direct(content, '.card')[0];
      var identity = section(content, 'v21-m-receipt-identity', icon);
      identity.appendChild(icon); identity.appendChild(merchant);
      stack(content); mark(content, 'v21-m-receipt');
      mark(icon, 'v21-m-merchant');
      mark(amount, 'v21-m-payment');
      paper(facts); mark(facts, 'v21-m-receipt-facts'); factRows(facts);
      return true;
    },
    bill: function (body) {
      var content = body.querySelector('.pad.col');
      if (!content) return false;
      var head = content.firstElementChild;
      var benefit = direct(content, '.card')[0];
      if (!head || !benefit) return false;
      var due = head.querySelector('.tag');
      if (due) head.firstElementChild.appendChild(due);
      stack(content); mark(head, 'v21-m-bill-head');
      mark(head.querySelector('.t-title1'), 'v21-m-bill-amount');
      mark(benefit, 'v21-m-opportunity');
      mark(benefit.querySelector('.t-body'), 'v21-m-opportunity-title');
      var history = direct(content, '.card')[1];
      paper(history); mark(history, 'v21-m-bill-history');
      return true;
    },
    budget: function (body) {
      var title = findText(body, '.t-title1', 'November');
      var going = findText(body, '.t-body', 'Going out');
      if (!title || !going) return false;
      var content = going.closest('.card').parentElement;
      var cards = direct(content, '.card');
      if (cards.length !== 5) return false;
      var flexible = section(content, 'v21-m-budget-group', cards[0]);
      var covered = section(content, 'v21-m-budget-group v21-m-budget-covered');
      label(flexible, 'Flexible spending'); label(covered, 'Already covered');
      [cards[2], cards[1], cards[3]].forEach(function (card) { flexible.appendChild(card); });
      [cards[0], cards[4]].forEach(function (card) { covered.appendChild(card); });
      cards.forEach(function (card) { paper(card); mark(card, 'v21-m-budget-line'); });
      mark(cards[2], 'v21-m-budget-attention');
      mark(title.nextElementSibling, 'v21-m-budget-remaining');
      stack(content);
      return true;
    },
    networth: function (body) {
      var amount = body.querySelector('.t-display');
      var loanTitle = findText(body, '.t-body', 'Student loan');
      if (!amount || !loanTitle) return false;
      var content = amount.parentElement;
      var loan = loanTitle.closest('.li');
      var facts = loan.parentElement;
      mark(amount, 'v21-m-worth-total');
      stack(content);
      paper(facts); mark(facts, 'v21-m-balance-sheet'); factRows(facts);
      label(content, 'What makes it up', facts);
      var note = direct(loan, '.t-callout')[0];
      if (note) { mark(note, 'v21-m-debt-note'); loan.querySelector('.lt').appendChild(note); }
      // The existing SVG and its containing card are intentionally not touched.
      return true;
    },
    subs: function (body) {
      var netflix = findText(body, '.t-body', 'Netflix');
      var gym = findText(body, '.t-body', 'Gym Group');
      if (!netflix || !gym) return false;
      var original = netflix.closest('.li').parentElement;
      var content = original.parentElement;
      var inactive = section(content, 'v21-m-subscriptions-unused', original);
      label(inactive, 'Not being used');
      [netflix, gym].forEach(function (title) {
        var row = title.closest('.li');
        inactive.appendChild(row); mark(row, 'v21-m-subscription');
        mark(row.querySelector('.col'), 'v21-m-subscription-copy');
        mark(row.querySelector('[data-cx]'), 'v21-m-cancel');
      });
      label(content, 'Still in use', original);
      paper(original); rows(original);
      stack(content);
      return true;
    },
    cashplan: function (body) {
      var safe = body.querySelector('[data-cs]');
      var input = body.querySelector('[data-cin]');
      if (!safe || !input) return false;
      var content = safe.parentElement.parentElement;
      var original = input.closest('.li').parentElement;
      var incoming = input.closest('.li');
      var timeline = body.querySelector('[data-ct]').closest('.card');
      var assumption = section(content, 'v21-m-income-assumption', timeline);
      label(assumption, 'Adjust income');
      assumption.appendChild(incoming); mark(incoming, 'v21-m-income-line');
      paper(original); mark(original, 'v21-m-commitments'); rows(original);
      label(content, 'Already accounted for', original);
      mark(safe.parentElement, 'v21-m-cash-answer');
      stack(content);
      return true;
    },
    taxcheck: function (body) {
      var currentYear = findText(body, '.t-body', '2024/25');
      var niTitle = findText(body, '.t-title3', 'National Insurance record');
      if (!currentYear || !niTitle) return false;
      var row = currentYear.closest('.li');
      var prior = row.parentElement;
      var content = prior.parentElement;
      var action = section(content, 'v21-m-tax-action', prior);
      action.appendChild(row); mark(row, 'v21-m-tax-year');
      label(content, 'Previous years', prior);
      paper(prior); rows(prior);
      var insurance = niTitle.closest('.card');
      paper(insurance); mark(insurance, 'v21-m-ni');
      mark(niTitle.parentElement, 'v21-m-ni-heading');
      mark(insurance.querySelector('.t-body'), 'v21-m-reading');
      stack(content);
      return true;
    },
    income: function (body) {
      var input = body.querySelector('[data-ir]');
      var sole = body.querySelector('[data-is]');
      var company = body.querySelector('[data-il]');
      var conclusion = body.querySelector('[data-iv]');
      if (!input || !sole || !company || !conclusion) return false;
      var card = sole.closest('.card');
      var content = card.parentElement;
      var soleRow = sole.parentElement, soleBar = soleRow.nextElementSibling;
      var companyRow = company.parentElement, companyBar = companyRow.nextElementSibling;
      var first = section(card, 'v21-m-compare-option', soleRow);
      first.appendChild(soleRow); first.appendChild(soleBar);
      var second = section(card, 'v21-m-compare-option', companyRow);
      second.appendChild(companyRow); second.appendChild(companyBar);
      mark(soleRow, 'v21-m-compare-value'); mark(companyRow, 'v21-m-compare-value');
      paper(card); mark(card, 'v21-m-compare');
      mark(card.querySelector('.hair'), 'v21-m-unused-separator');
      direct(card, '.t-callout').forEach(function (note) { mark(note, 'v21-m-compare-note'); });
      content.insertBefore(conclusion, card);
      mark(conclusion, 'v21-m-engine-conclusion');
      stack(content);
      return true;
    },
    rentbuy: function (body) {
      var statement = body.querySelector('.t-statement');
      var plan = findText(body, '.chipb', 'Plan');
      if (!statement || !plan) return false;
      var content = statement.parentElement;
      var warning = plan.closest('.card');
      content.insertBefore(warning, statement.nextElementSibling);
      mark(warning, 'v21-m-affordability');
      var mortgage = findText(content, '.t-body', 'Mortgage payment');
      if (mortgage) {
        var facts = mortgage.closest('.li').parentElement;
        paper(facts); mark(facts, 'v21-m-model-facts');
        rows(facts, 'v21-m-model-fact');
      }
      stack(content);
      return true;
    },
    missions: function (body) {
      var rebate = findText(body, '.t-body', 'Claim your tax rebate');
      if (!rebate) return false;
      var row = rebate.closest('.li');
      var other = row.parentElement;
      var content = other.parentElement;
      var lead = section(content, 'v21-m-lead-mission', other);
      lead.appendChild(row); mark(row, 'v21-m-lead-mission-row');
      paper(other); rows(other);
      var waiting = findText(content, '.t-callout', 'Waiting');
      if (waiting && waiting.nextElementSibling) {
        paper(waiting.nextElementSibling); mark(waiting.nextElementSibling, 'v21-m-waiting');
        rows(waiting.nextElementSibling);
      }
      stack(content);
      return true;
    },
    history: function (body) {
      var amount = body.querySelector('.t-display');
      if (!amount) return false;
      var content = amount.parentElement.parentElement;
      var card = direct(content, '.card')[0];
      if (!card) return false;
      mark(amount, 'v21-m-history-total');
      paper(card); mark(card, 'v21-m-audit-trail');
      direct(card, '.li').forEach(function (row) {
        mark(row, 'v21-m-audit-row');
        mark(direct(row, '.t-callout')[0], 'v21-m-audit-outcome');
      });
      stack(content);
      return true;
    },
    vault: function (body) {
      var urgent = body.querySelector('[data-jump="renewal"]');
      if (!urgent) return false;
      var archive = urgent.parentElement;
      var content = archive.parentElement;
      var lead = section(content, 'v21-m-document-action', archive);
      lead.appendChild(urgent); mark(urgent, 'v21-m-document-action-row');
      label(content, 'Filed documents', archive);
      paper(archive); mark(archive, 'v21-m-document-archive'); rows(archive);
      stack(content);
      return true;
    },
    docdetail: function (body) {
      var expiry = findText(body, '.t-callout', 'Expires');
      var savedTitle = findText(body, '.t-body', 'Your copy');
      if (!expiry || !savedTitle) return false;
      var head = expiry.parentElement.parentElement;
      var content = head.parentElement;
      var reminder = head.nextElementSibling;
      var summary = section(content, 'v21-m-document-summary', head);
      summary.appendChild(head); summary.appendChild(reminder);
      mark(head, 'v21-m-expiry'); paper(reminder); mark(reminder, 'v21-m-reminder');
      var saved = savedTitle.closest('.li');
      var service = saved.parentElement;
      paper(service); rows(service);
      var copy = section(content, 'v21-m-saved-copy');
      copy.appendChild(saved); mark(saved, 'v21-m-record');
      label(content, 'When you renew', service);
      stack(content);
      return true;
    },
    renewal: function (body) {
      var compare = findText(body, '.t-body', 'Compare from 22 January');
      if (!compare) return false;
      var windowCard = compare.closest('.card');
      var content = windowCard.parentElement;
      var quote = content.firstElementChild;
      content.insertBefore(windowCard, quote);
      mark(windowCard, 'v21-m-renewal-window');
      mark(compare.parentElement, 'v21-m-window-heading');
      mark(quote, 'v21-m-renewal-quote');
      var checklist = direct(content, '.card').find(function (card) { return !!card.querySelector('[data-chk]'); });
      if (checklist) { paper(checklist); mark(checklist, 'v21-m-renewal-actions'); rows(checklist); }
      stack(content);
      return true;
    }
  };

  window.__V21Passes = window.__V21Passes || [];
  window.__V21Passes.push({
    id: 'money', keys: keys, reviewed: reviewed,
    apply: function (sc, scr) {
      var key = typeof sc === 'string' ? sc : (sc && (sc.key || sc.k));
      if (!key && scr) key = (scr.id || '').replace(/^s-/, '');
      if (keys.indexOf(key) < 0 || !scr) return {changes: [], retained: [], reviewed: false};
      mark(scr, 'v21-money');
      if (scr.dataset.v21MoneyApplied) return {changes: [], retained: ['Money pass already applied.'], reviewed: true};
      if (scr.dataset.v21Mode === 'preserve') {
        return {changes: [], retained: [reviewed[key] + ' Shared-shell preserve mode respected.'], reviewed: true};
      }
      var body = scr.querySelector('.v21-body');
      if (!body) return {changes: [], retained: [reviewed[key] + ' No normalized body; original geometry retained.'], reviewed: true};
      var compose = composers[key];
      if (!compose) return {changes: [], retained: [reviewed[key]], reviewed: true};
      var changed = compose(body);
      if (changed) scr.dataset.v21MoneyApplied = 'true';
      return {
        changes: changed ? [reviewed[key]] : [],
        retained: changed ? [] : [reviewed[key] + ' Expected original nodes absent; no replacement content inserted.'],
        reviewed: true
      };
    }
  });
}());
