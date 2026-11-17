(() => {
  'use strict';
  const { catalogue, chapters, icons } = window.LIFE_BOARD;
  const index = new Map(catalogue.map(row => [row.key, row]));
  const featured = ['today', 'plan', 'you', 'talk'];
  const names = { today: 'Today', plan: 'Plan', you: 'You', talk: 'Talk', letter: 'Tax letter', situation: 'Rent situation', filing: 'Review details' };
  const dockIcons = ['home', 'calendar', 'person', 'mic'];
  const state = { segment: 'Situations', steps: [false, false], saved: [], pending: ['document', 'date'] };
  const host = document.getElementById('v24-interface-host');
  const ui = host.attachShadow({ mode: 'open' });
  ui.append(document.getElementById('v24-interface').content.cloneNode(true));
  const $ = id => ui.getElementById(id);
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const icon = (name, size = 20) => '<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>';
  const button = (key, name, symbol) => '<button class="ic" data-key="'+key+'" aria-label="'+name+'">'+icon(symbol)+'</button>';
  const link = (key, title, small, symbol) => '<button class="list-row" data-key="'+key+'">'+icon(symbol)+'<span class="line-copy"><b>'+title+'</b><small>'+small+'</small></span>'+icon('chev',15)+'</button>';
  const cta = (key, title) => '<button class="big-button" data-key="'+key+'">'+title+icon('arrow',19)+'</button>';
  const avatar = '<button class="avatar" data-key="profile" aria-label="Open Ama’s profile"></button>';
  const mark = '<i class="dotring"></i>life';
  function head(key) {
    const primary = featured.includes(key);
    const left = key === 'talk' ? button('today', 'Close Talk', 'close') : primary ? button('search','Search life','search') : button(key === 'filing' ? 'talk' : key === 'situation' ? 'plan' : 'today','Go back','back');
    const right = key === 'talk' ? button('chathistory','Conversation history','clock') : (key === 'today' ? button('notifs','Notifications','bell') : key === 'plan' ? button('newgoal','Add to plan','add') : '') + avatar;
    return '<header class="a-head"><span>'+left+'</span><h2 class="'+(key === 'today' ? 'life-mark' : '')+'">'+(key === 'today' ? mark : names[key])+'</h2><span class="actions">'+right+'</span></header>';
  }
  function dock(key) {
    return '<nav class="a-dock" aria-label="Life sections">'+featured.map((k,i) => '<button data-key="'+k+'" '+(k===key ? 'aria-current="page"' : '')+'>'+icon(dockIcons[i],21)+names[k]+'</button>').join('')+'</nav>';
  }
  function event(day, month, name, when, target) {
    return '<button class="event" data-key="'+target+'"><span class="date-box"><b>'+day+'</b><small>'+month+'</small></span><span class="line-copy"><b>'+name+'</b><small>'+when+'</small></span>'+icon('chev',14)+'</button>';
  }
  function today() {
    return '<div class="lead today-photo"><small>Tuesday, 17 November</small><h3>Good morning,<br>Ama.</h3></div><div class="zone"><p class="brief">Your tax letter <span>is ready to check.</span></p><div class="letter"><div class="overline"><i></i>Next move</div><strong>Check your P800</strong><div class="hint">HMRC · 6 min</div><button class="micro-button" data-key="letter">Open letter '+icon('arrow',15)+'</button></div><h3 class="section-name space">Coming up</h3><div class="schedule">'+event('18','NOV','Kofi’s birthday','Tomorrow','person')+event('01','DEC','Council tax','In 14 days','bill')+'</div><button class="text-action" data-key="calendar">View calendar →</button></div>';
  }
  const stepNames = ['Find the review date in my tenancy agreement','Compare the new rent with my monthly budget'];
  function plan() {
    const pending = state.steps.filter(step => !step).length;
    const tabs = ['Situations','Missions','Toolkit'].map(item => '<button data-segment="'+item+'" aria-pressed="'+(state.segment===item)+'">'+item+'</button>').join('');
    let panel = '<button class="situation-row" data-key="situation"><span class="keys"></span><span class="line-copy"><b>My rent is going up</b><small>From March · '+pending+' open steps</small></span>'+icon('chev',16)+'</button><div class="step-preview"><span class="overline">Next step</span><b>'+(stepNames[state.steps.indexOf(false)] || 'Both steps complete')+'</b></div>';
    if (state.segment==='Missions') panel = link('mission','Check your P800','Money · 6 min','doc')+link('missions','All missions','See the full plan','layers');
    if (state.segment==='Toolkit') panel = link('cashplan','30-day cash plan','Money','cash')+link('rentbuy','Rent vs buy','Home','home')+link('tools','All tools','Explore the toolkit','grid');
    return '<div class="lead plan-photo"><small>Chief Aim</small><h3>A place of my own</h3><p>South London &nbsp;·&nbsp; June 2029</p></div><div class="zone"><div class="meter"><div class="meter-line"><b>£11,760 saved</b><b>24%</b></div><div class="ruler" style="--value:24%"></div><div class="hint">£49,000 deposit goal</div></div><div class="segments">'+tabs+'</div>'+panel+'</div>';
  }
  function you() {
    return '<div class="identity"><h3>Ama</h3><p>Designer &nbsp;·&nbsp; London</p></div><div class="portraits">'+[['Home','areahome'],['Work','areawork'],['People','people']].map(([title,key])=>'<button class="portrait-'+title.toLowerCase()+'" data-key="'+key+'">'+title+'</button>').join('')+'</div><div class="zone"><div class="section-line space"><h3 class="section-name">What life knows</h3><button class="text-action" data-key="knows">Review →</button></div><div class="knowledge"><div><b>'+(214+state.saved.length)+'</b><span class="hint">saved records</span></div><div><b>64%</b><span class="hint">of your profile filled in</span></div></div><div class="ruler" style="--value:64%"></div><h3 class="section-name space">From your words</h3><div class="memory"><div class="overline">◌ &nbsp; From Talk &nbsp;·&nbsp; '+(state.saved.length?'Just now':'12 Nov')+'</div><p>'+(state.saved.includes('date')?'“The review is on 3 March.”':'“My rent goes up in March.”')+'</p><button class="text-action" data-key="'+(state.saved.length?'situation':'memory')+'">Review memory →</button></div><button class="text-action" data-key="settings">Settings →</button></div>';
  }
  function buildOrb() {
    let dots = '';
    for (let i=0;i<1850;i++) {
      const y = (i+.5)/925-1, a = i*2.39996323, r = Math.sqrt(1-y*y);
      const x = r*Math.cos(a), z = r*Math.sin(a);
      if (z < -.05) continue;
      const wave = Math.sin(15*y+4*x+2*z), warm = x*.45+y*.7>.42;
      const opacity = (.16+.49*Math.pow(1-Math.max(0,z),.7)+.19*(wave+1)/2).toFixed(2);
      dots += '<circle cx="'+(88+72*x+wave*.9).toFixed(1)+'" cy="'+(88+74*y).toFixed(1)+'" r="'+(.36+.43*(wave+1)/2).toFixed(2)+'" fill="'+(warm?'#ef9869':'currentColor')+'" opacity="'+opacity+'"/>';
    }
    return '<div class="orb-stage"><svg aria-hidden="true" viewBox="0 0 176 176">'+dots+'</svg></div>';
  }
  const orb = buildOrb();
  const facts = {document: ['doc','Document','Rent letter'], date: ['calendar','Review date','3 March']};
  const fact = id => '<div class="factline">'+icon(facts[id][0],16)+facts[id][1]+'<strong>'+facts[id][2]+'</strong></div>';
  function talk() {
    return orb+'<div class="zone"><div class="utterance">I found the rent letter. The review is on 3 March.</div><div class="reply"><i class="dotring"></i><span>I can keep that date with your rent situation.</span></div><div class="filing"><h3>'+(state.saved.length?'Filed in Plan':'Ready to file')+'</h3><p class="hint">My rent is going up</p>'+(state.saved.length?state.saved:['document','date']).map(fact).join('')+cta(state.saved.length?'situation':'filing',state.saved.length?'View situation':'Review 2 details')+'</div></div>';
  }
  function situation() {
    return '<div class="subpage"><p class="overline">Plan / Situations</p><h3>My rent is going up</h3><p class="hint">From March · Home</p><h4>Next steps</h4>'+stepNames.map((s,i)=>'<label class="check-row"><input type="checkbox" data-step="'+i+'" '+(state.steps[i]?'checked':'')+'>'+s+'</label>').join('')+'<h4>Filed here</h4>'+(state.saved.length?state.saved.map(fact).join(''): '<p class="hint">Talk has two details for you to review.</p>')+cta('talk',state.saved.length?'Open conversation':'Review in Talk')+'</div>';
  }
  function filing() {
    return '<div class="subpage"><p class="overline">Talk / My rent is going up</p><h3>Keep these details?</h3><p class="review-note">Choose what to save to your rent situation.</p>'+Object.keys(facts).map(k=>'<label class="check-row"><input type="checkbox" data-fact="'+k+'" '+(state.pending.includes(k)?'checked':'')+'>'+facts[k][1]+' · '+facts[k][2]+'</label>').join('')+'<button class="big-button" data-save '+(!state.pending.length?'disabled':'')+'>Save to situation '+icon('arrow')+'</button></div>';
  }
  function letter() {
    return '<div class="subpage"><p class="overline">Today / Next move</p><h3>Check your P800</h3><p class="hint">HMRC · Sample letter</p><img class="document" src="v24/p800.webp" alt="The P800 tax calculation letter"><p class="review-note">Open the tax mission to review the figures in your letter and keep your next step with it.</p>'+cta('mission','Open tax mission')+'</div>';
  }
  const screens = { today, plan, you, talk, situation, filing, letter };
  function phone(key) {
    const footer = key === 'talk' ? '<div class="composer">'+button('attach','Attach a document','add')+'<button class="write" data-key="chat">Message life</button>'+button('micprimer','Voice input','mic')+'</div>' : dock(key==='situation'?'plan':key==='letter'?'today':key);
    return '<article class="phone">'+head(key)+'<div class="scroller">'+screens[key]()+'</div>'+footer+'</article>';
  }
  function gallery() {
    $('gallery').innerHTML = featured.map(key=>'<article class="tile"><button class="caption" data-key="'+key+'" aria-label="Open '+names[key]+' full size">'+names[key]+icon('arrow',16)+'</button><div class="frame" data-key="'+key+'" aria-hidden="true"><div inert class="phone-preview">'+phone(key)+'</div></div></article>').join('');
    const observer = new ResizeObserver(items=>items.forEach(item=> item.target.style.setProperty('--scale',item.contentRect.width/390)));
    ui.querySelectorAll('.frame').forEach(frame=>observer.observe(frame));
  }
  function mountChapters() {
    const board = document.getElementById('v24-chapters');
    const chapterList = new Map();
    for (const row of catalogue) {
      if (!chapterList.has(row.chapter)) chapterList.set(row.chapter, []);
      chapterList.get(row.chapter).push(row);
    }
    const gridResize = new ResizeObserver(items => {
      for (const { target, contentRect } of items) {
        const columns = contentRect.width > 900 ? 4 : contentRect.width > 620 ? 3 : 2;
        const gap = contentRect.width > 620 ? 20 : 10;
        const width = (contentRect.width - gap * (columns - 1)) / columns;
        target.style.setProperty('--columns', columns);
        target.style.setProperty('--slot-gap', gap + 'px');
        target.style.setProperty('--z', Math.min(width / 415, 0.78));
      }
    });
    let chapterNumber = 0;
    for (const [name, rows] of chapterList) {
      const section = document.createElement('section');
      section.className = 'v24-chapter';
      section.id = 'board-chapter-' + (++chapterNumber);
      const grid = document.createElement('div');
      grid.className = 'v24-chapter-grid';
      section.innerHTML = '<h2>'+html(name)+'</h2>';
      section.append(grid);
      $('chapter').add(new Option(name, section.id));

      for (const row of rows) {
        const shot = document.getElementById('s-' + row.key);
        if (!shot) throw new Error('Board screen is missing: ' + row.key);
        if (featured.includes(row.key)) continue;
        const slot = document.createElement('article');
        slot.className = 'v24-board-slot';
        const inspect = document.createElement('button');
        inspect.className = 'v24-inspect';
        inspect.dataset.v24Open = row.key;
        inspect.textContent = row.title;
        inspect.setAttribute('aria-label', 'Open ' + row.title);
        shot.querySelector('.frame').inert = true;
        slot.append(inspect, shot);
        grid.append(slot);
      }
      board.append(section);
      gridResize.observe(grid);
    }
    $('board-count').textContent = catalogue.length + ' screens across ' + chapters + ' chapters';
  }

  let active = null;
  const viewer = $('viewer');
  const legacyInspector = document.querySelector('.v21-inspector');
  const legacyStage = legacyInspector.querySelector('[data-v21-stage]');
  new MutationObserver(records => {
    for (const record of records) {
      for (const previous of record.removedNodes) {
        if (previous.nodeType === Node.ELEMENT_NODE) previous.querySelector('.frame').inert = true;
      }
    }
    const current = legacyStage.querySelector('.frame');
    if (current) current.inert = false;
  }).observe(legacyStage, { childList: true });

  function open(key, trigger) {
    if (!screens[key]) {
      if (!index.has(key)) return;
      if (viewer.open) viewer.close();
      window.__V21Inspect(key, trigger);
      return;
    }
    if (!legacyInspector.hidden) window.__V21Close();
    active = key;
    $('screen-name').textContent = names[key];
    $('forward').hidden = !featured.includes(key);
    $('full-phone').innerHTML = phone(key);
    if (!viewer.open) viewer.showModal();
  }
  document.addEventListener('click', event => {
    const card = event.target.closest('[data-v24-open]');
    const link = event.target.closest('[data-jump], [data-v21-open]');
    const step = event.target.closest('[data-v21-next],[data-v21-prev]');
    let key = card?.dataset.v24Open || link?.dataset.jump || link?.dataset.v21Open;
    if (step && !legacyInspector.hidden) {
      const current = catalogue.findIndex(row => row.key === window.__V21_INSPECTING);
      const offset = step.hasAttribute('data-v21-prev') ? -1 : 1;
      key = catalogue[(current + offset + catalogue.length) % catalogue.length].key;
    }
    if (card || step || featured.includes(key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      open(key, card);
    }
  }, true);
  function refresh() {
    ui.querySelectorAll('.frame').forEach(f=>f.querySelector('.phone-preview').innerHTML=phone(f.dataset.key));
    if (screens[active]) open(active);
  }
  ui.addEventListener('click',e=>{
    const target=e.target.closest('[data-key],[data-segment],[data-save]');
    if (!target) return;
    if (target.dataset.key) open(target.dataset.key);
    else if (target.dataset.segment) {state.segment=target.dataset.segment;refresh();}
    else if (state.pending.length) {state.saved=[...state.pending];refresh();open('situation');}
  });
  viewer.addEventListener('change',e=>{
    if (e.target.hasAttribute('data-step')) {
      state.steps[Number(e.target.dataset.step)]=e.target.checked;
      ui.querySelector('.frame[data-key="plan"] .phone-preview').innerHTML=phone('plan');
    }
    if (e.target.hasAttribute('data-fact')) {
      state.pending=[...viewer.querySelectorAll('[data-fact]:checked')].map(el=>el.dataset.fact);
      viewer.querySelector('[data-save]').disabled=!state.pending.length;
    }
  });
  function theme() {
    const light=document.documentElement.dataset.theme==='light';
    host.dataset.theme = light ? 'light' : 'dark';
    $('theme').innerHTML=icon(light?'moon':'sun');
    $('theme').setAttribute('aria-label','Switch to '+(light?'dark':'light')+' theme');
  }
  $('chapter').addEventListener('change', event => {
    document.getElementById(event.target.value)?.scrollIntoView();
  });
  $('close').onclick=()=>viewer.close();
  viewer.onclose=()=>{active=null;};
  $('forward').onclick=()=>open(featured[(featured.indexOf(active)+1)%featured.length]);
  $('theme').onclick = () => {
    const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.querySelector('[data-th="' + newTheme + '"]').click();
  };
  new MutationObserver(theme).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });
  function fitInspector() {
    const width = document.documentElement.clientWidth;
    const zoom = width < 440 ? (width - 16) / 415 : 1;
    document.documentElement.style.setProperty('--v24-phone-zoom', zoom);
  }
  window.addEventListener('resize', fitInspector);
  fitInspector();
  mountChapters();
  gallery();
  theme();
  const start = new URLSearchParams(location.search).get('screen');
  if (start) open(start);
})();
