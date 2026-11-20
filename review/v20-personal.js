/* v20 personal / learning / Aim / growth refinements.
   Loaded after v19 inside the board's original closure. */
(function registerV20PersonalPass() {
  var keys = [
    'library', 'lens', 'idea', 'lensask', 'recall', 'learning', 'recap', 'vantage',
    'levelup', 'aimnew', 'aim', 'teach', 'hill', 'gambit', 'glimpse', 'teachoffer',
    'lessonready', 'bite', 'predict', 'puzzle', 'lessonrecap', 'tellback', 'gaps',
    'gotit', 'learned', 'teachplay', 'tests', 'testq', 'bigfive', 'chronotype',
    'values', 'people', 'person', 'addperson', 'birthdaynudge', 'dates',
    'yourbirthday', 'drawkit', 'bitedrawn', 'measures'
  ];

  var immersive = new Set([
    'levelup', 'glimpse', 'lessonready', 'predict', 'puzzle', 'gotit', 'teachplay',
    'testq', 'yourbirthday', 'drawkit', 'bitedrawn'
  ]);

  function addClass(node, name) {
    if (!node || node.classList.contains(name)) return false;
    node.classList.add(name);
    return true;
  }

  function markAll(root, selector, name) {
    var changed = false;
    root.querySelectorAll(selector).forEach(function (node) {
      changed = addClass(node, name) || changed;
    });
    return changed;
  }

  function first(root, selector, name) {
    return addClass(root.querySelector(selector), name);
  }

  function wrapNodes(nodes, name) {
    nodes = nodes.filter(Boolean);
    if (!nodes.length || nodes.some(function (node) { return node.parentElement !== nodes[0].parentElement; })) return null;
    var parent = nodes[0].parentElement;
    if (!parent || parent.classList.contains(name)) return null;
    var wrapper = document.createElement('div');
    wrapper.className = name;
    parent.insertBefore(wrapper, nodes[0]);
    nodes.forEach(function (node) { wrapper.appendChild(node); });
    return wrapper;
  }

  function directChildren(parent, selector) {
    return parent ? Array.from(parent.children).filter(function (node) { return node.matches(selector); }) : [];
  }

  function contentColumn(root) {
    var columns = Array.from(root.querySelectorAll('.pad.col'));
    return columns.find(function (node) {
      return node.querySelector('.card, .t-statement, .t-title1, .t-title2') && !node.classList.contains('on-img');
    }) || null;
  }

  function addCommonHooks(root, key, changes) {
    var changed = false;
    changed = addClass(root, 'v20-personal') || changed;
    changed = addClass(root, 'v20-key-' + key) || changed;
    changed = first(root, '.pad.row.sb.rel, .pad.row.sb', 'v20-topline') || changed;
    changed = first(root, '.pad.col.rel:has(.t-title1), .pad.col:has(.t-title1)', 'v20-intro') || changed;
    changed = first(root, '.t-title1, .t-title2', 'v20-lead') || changed;
    changed = first(root, '.t-statement', 'v20-thesis') || changed;
    changed = markAll(root, '.card', 'v20-card') || changed;
    changed = markAll(root, '.li', 'v20-readable-row') || changed;
    changed = markAll(root, '.pad[style*="position:absolute"]:has(.btn)', 'v20-action-dock') || changed;
    var buttons = Array.from(root.querySelectorAll('.btn'));
    if (buttons.length) changed = addClass(buttons[buttons.length - 1], 'v20-primary-action') || changed;
    if (changed) changes.push('editorial hierarchy and action hooks');
  }

  function addChapterHooks(root, sc, changes) {
    var chapter = sc && sc.ch;
    if (chapter && addClass(root, 'v20-ch-' + chapter)) changes.push(chapter + ' context styling');

    if (['aimnew', 'aim', 'gambit'].indexOf(sc.key) >= 0) {
      addClass(root, 'v20-aim-context');
      markAll(root, '.pchip, .tag', 'v20-aim-meta');
      markAll(root, '.ticks', 'v20-aim-progress');
      changes.push('compact Aim context');
    }

    if (['library', 'lens', 'idea', 'learning', 'learned', 'hill'].indexOf(sc.key) >= 0) {
      addClass(root, 'v20-learning-index');
      changes.push('learning reading hierarchy');
    }

    if (['bite', 'lessonrecap', 'tellback', 'gaps'].indexOf(sc.key) >= 0) {
      addClass(root, 'v20-lesson-sequence');
      changes.push('bite, recap, and next-action grouping');
    }

    if (['tests', 'bigfive', 'chronotype', 'values', 'measures'].indexOf(sc.key) >= 0) {
      addClass(root, 'v20-self-profile');
      changes.push('personality detail hierarchy');
    }

    if (['people', 'person', 'addperson', 'birthdaynudge', 'dates'].indexOf(sc.key) >= 0) {
      addClass(root, 'v20-people-dates');
      changes.push('people and dates readability');
    }
  }

  function addStructuralGroups(root, key, changes) {
    var wrapper = null;
    var column = contentColumn(root);

    if (key === 'bite' && column) {
      wrapper = wrapNodes(Array.from(column.children), 'v20-learning-bite');
      if (wrapper) changes.push('grouped bite explanation');
    }

    if (key === 'aim' && column) {
      var cards = directChildren(column, '.card');
      if (cards.length > 1) {
        wrapper = wrapNodes(cards, 'v20-aim-stack');
        if (wrapper) changes.push('grouped Aim progress and plan');
      }
    }

    if (key === 'recap' && column) {
      var recapNodes = Array.from(column.children).slice(1);
      wrapper = wrapNodes(recapNodes, 'v20-recap-group');
      if (wrapper) changes.push('grouped weekly recap evidence');
    }

    if (key === 'bigfive' && column) {
      var traits = directChildren(column, '.card');
      if (traits.length > 1) {
        wrapper = wrapNodes(traits, 'v20-trait-stack');
        if (wrapper) changes.push('grouped personality traits');
      }
    }

    if (key === 'chronotype' && column) {
      var summary = Array.from(column.children).slice(0, 3);
      wrapper = wrapNodes(summary, 'v20-profile-summary');
      if (wrapper) changes.push('grouped body-clock summary');
    }

    if (key === 'people') {
      var peopleColumns = Array.from(root.querySelectorAll('.pad.col'));
      var peopleContent = peopleColumns.find(function (node) { return node.querySelector('.adot'); });
      if (peopleContent) {
        var upcoming = Array.from(peopleContent.children).slice(0, 2);
        wrapper = wrapNodes(upcoming, 'v20-upcoming-group');
        if (wrapper) changes.push('grouped upcoming people');
      }
    }

    if (key === 'person' && column) {
      var identity = Array.from(column.children).slice(0, 2);
      wrapper = wrapNodes(identity, 'v20-person-identity');
      if (wrapper) changes.push('grouped person identity and date');
    }

    return !!wrapper;
  }

  window.__V20Passes = window.__V20Passes || [];
  window.__V20Passes.push({
    id: 'personal',
    keys: keys,
    apply: function (sc, scr) {
      var changes = [];
      var root = scr && scr.nodeType === 1 ? scr : null;
      if (!root || !sc || keys.indexOf(sc.key) < 0) return { structural: false, changes: changes };

      addCommonHooks(root, sc.key, changes);
      addChapterHooks(root, sc, changes);

      if (immersive.has(sc.key)) {
        addClass(root, 'v20-immersive-preserved');
        changes.push('styling only; immersive canvas, puzzle, slider, or earned imagery preserved');
        return { structural: false, changes: changes };
      }

      var structural = addStructuralGroups(root, sc.key, changes);
      return { structural: structural, changes: changes };
    }
  });
})();
