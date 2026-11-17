// Compose V24 from the live V23 content nodes so existing listeners, choices,
// source notes, forms and charts survive both the board and full-size inspection.
(() => {
  const { icons, paper, photography, spotlights } = window.LIFE_BOARD;

  const permissionSymbols = {
    signin: 'shield',
    healthprimer: 'heart',
    notifprimer: 'bell',
    micprimer: 'mic',
    camprimer: 'camera',
    calprimer: 'calendar',
    devicesetup: 'watch',
    connectbank: 'cash',
    devices: 'watch',
    addperson: 'people',
  };
  const recoverySymbols = {
    offline: 'repeat',
    permdenied: 'shield',
    syncissue: 'swap',
    aidown: 'clock',
    forceupdate: 'arrowUp',
    signedout: 'shield',
    connectfail: 'watch',
    support: 'heart',
    why: 'info',
  };
  const shortenedTitles = {
    question: 'Get started',
    tell: 'Tell life',
    building: 'Your plan',
    healthprimer: 'Apple Health',
    notifprimer: 'Notifications',
    micprimer: 'Microphone',
    camprimer: 'Camera',
    calprimer: 'Calendar',
    devicesetup: 'Your devices',
    measuresetup: 'Your measurements',
    editfiled: 'Edit details',
    yourai: 'Your data in your AI',
    aimodels: 'On this phone',
    emptytoday: 'life',
    loadingtoday: 'life',
    emptyplan: 'Plan',
    chathistory: 'Conversations',
    lessonready: 'Teach me',
    idea: 'Learn',
    growth: 'Growth path',
    support: 'Support',
    foodday: 'Food log',
  };
  const previewLinks = {
    welcome: { 'Get started': 'question', 'I already have an account': 'signedout' },
    question: { 'Next: where you live': 'where' },
    where: { 'Next: your work': 'tell' },
    building: { 'See my plan': 'plan' },
    signin: { 'Not now, keep it on this phone': 'firstmove' },
    vault: { 'Scan a document': 'attach' },
    confirm: { 'Log meal': 'mealresult' },
    gotit: { 'Back to Today': 'today' },
  };

  const baseLead = {
    entry: 'span:not(.orb, .t-statement)',
    flow: '.t-title1, .t-statement, .t-title2',
    permission: '.t-title1, .t-statement',
    progress: '.t-statement, .t-title1',
    moment: '.t-title1, .t-display, .t-statement',
    diary: '.t-statement, .t-title1, .t-display',
    case: '.t-title1, .t-display, .t-statement',
    scene: '.t-title1, .t-statement',
    paper: '.t-display, .t-title1, .t-statement',
    ledger: '.t-display, .v21-m-budget-remaining, .t-title1, .t-statement',
    reading: '.t-title1, .t-title2, .t-statement',
    signal: '.t-display, .v21b-brief, .t-statement, .t-title1',
    fuel: '.t-display, .t-title1, .t-statement',
    recovery: '.t-title1, .t-statement, .t-title2',
  };

  function addSymbol(parent, key) {
    if (!key || !icons[key]) return;
    const mark = document.createElement('span');
    mark.className = 'v24-symbol';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">' + icons[key] + '</svg>';
    parent.prepend(mark);
  }

  function setHeader(screen, row) {
    const top = screen.querySelector('.v21-topbar');
    if (!top) return;
    const title = top.querySelector('.v21-title, .v21-page-title');
    if (title && shortenedTitles[row.key]) {
      title.textContent = shortenedTitles[row.key];
      title.title = title.textContent;
    }
    top.classList.toggle('v24-flow-bar', row.layout === 'flow' || row.layout === 'entry');
    const right = top.querySelector('.v21-right');
    if (row.opensAs === 'Sheet' && right && !right.children.length) {
      const close = top.querySelector('.v21-left > [aria-label="Close"]');
      if (close) right.append(close);
    }
  }

  function selectLead(content, screen, row) {
    const custom = spotlights[row.key];
    if (custom) {
      const lead = content.querySelector(custom);
      if (!lead) throw new Error('Missing V24 lead object: ' + row.key);
      return lead;
    }
    const selector = baseLead[row.layout];
    if (!selector) return null;
    const title = screen.querySelector('.v21-title, .v21-page-title')?.textContent.trim();
    const heads = [...content.querySelectorAll(selector)];
    return heads.find(head => !head.closest('button, [role="button"], [hidden]') &&
      head.textContent.trim() !== title) || null;
  }

  function styleContent(screen, content, row) {
    const lead = selectLead(content, screen, row);
    if (lead) {
      lead.classList.add('v24-lead');
      if (lead.children.length > 1 || lead.matches('button, section')) {
        lead.classList.add('v24-lead-object');
      }
    }

    // Keep recognizable source groups, but promote the actual data panels
    // instead of introducing a second summary with duplicate numbers.
    if (row.layout === 'ledger') {
      const value = lead?.matches('.t-display') ? lead : lead?.querySelector('.t-display, .tnum');
      value?.classList.add('v24-balance');
      const group = lead?.closest('.v21-content-group');
      const displayLeadOnly = row.key === 'subs' || row.key === 'income';
      const receipt = displayLeadOnly || lead?.classList.contains('v24-lead-object') ? lead : group;
      receipt?.classList.add('v24-ledger-lead');
    }
    if (row.layout === 'signal') {
      const value = lead?.matches('.t-display, .tnum') ? lead : lead?.querySelector('.t-display, .tnum');
      value?.classList.add('v24-signal-value');
      content.querySelectorAll('.v21b-history, .v21b-sleep-stages, .v21b-body-metrics, .v21b-evidence-list').forEach(section => {
        section.classList.add('v24-measurement');
      });
    }
    if (row.layout === 'case') {
      content.querySelectorAll('.v21-m-case-status, .v21-m-case-steps, .v21-m-document-action').forEach(section => {
        section.classList.add('v24-action-section');
      });
    }
    if (row.layout === 'reading') {
      content.querySelectorAll('canvas, svg:not([width])').forEach(visual => {
        const parent = visual.closest('.card, .v21-content-group');
        if (parent) parent.classList.add('v24-illustration');
      });
    }
    if (row.layout === 'paper' && lead) {
      const page = lead.classList.contains('v24-lead-object') ? lead : lead.parentElement;
      page.classList.add('v24-paper-object');
      addSymbol(page, paper[row.key]);
    }

    const permission = permissionSymbols[row.key];
    const recovery = recoverySymbols[row.key];
    if (permission || recovery) {
      const target = lead?.closest('.v21-content-group') || content.firstElementChild;
      if (target) addSymbol(target, permission || recovery);
    }

    if (row.layout === 'records' || row.layout === 'settings') {
      // Surface the first real list group as a unit, without duplicating its rows.
      const index = content.querySelector('.v21-shell-preference-list, .v21-m-document-archive, .card:has(> .li)');
      index?.classList.add('v24-index');
    }

    const headerTitle = screen.querySelector('.v21-title, .v21-page-title')?.textContent.trim();
    const firstGroup = content.firstElementChild;
    const repeatedTitle = firstGroup?.querySelector(':scope > .t-title1, :scope > .row > .t-title1');
    if (repeatedTitle && repeatedTitle !== lead && repeatedTitle.textContent.trim() === headerTitle &&
        !repeatedTitle.closest('[data-jump]')) {
      repeatedTitle.classList.add('v24-duplicate-title');
    }
  }

  function stylePhotography(screen, content, key) {
    const photo = photography[key];
    if (!photo) return;
    let canvas = screen.querySelector(':scope > .t-cover, :scope > .t-band');
    if (canvas) {
      canvas.classList.add('v24-scene-image');
    } else {
      canvas = document.createElement('div');
      canvas.className = 'v24-inline-image';
      canvas.setAttribute('aria-hidden', 'true');
      content.prepend(canvas);
    }
    canvas.style.setProperty('--v24-image', 'url("' + photo + '.webp")');
    screen.dataset.v24Photo = photo;
  }

  window.designLifeScreen = (shot, row) => {
    if (!row.layout) throw new Error('Missing V24 design for ' + row.key);
    const screen = shot.querySelector('.screen');
    const content = screen.querySelector('.v21-content');
    screen.dataset.v24Layout = row.layout;
    screen.dataset.v24Screen = row.key;
    if (row.opensAs === 'Sheet') screen.dataset.v24Sheet = 'true';
    shot.classList.add('v24-designed-shot');

    const links = previewLinks[row.key];
    if (links) {
      for (const action of screen.querySelectorAll('button:not([data-jump])')) {
        const destination = links[action.textContent.trim()];
        if (destination) action.dataset.jump = destination;
      }
    }
    if (content) {
      setHeader(screen, row);
      styleContent(screen, content, row);
      stylePhotography(screen, content, row.key);
    } else {
      // Special surfaces keep the camera, watch, widget and motion geometry
      // while using the same type, colour and control treatment.
      screen.classList.add('v24-special-surface');
    }
  };
})();
