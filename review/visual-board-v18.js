/* Injected into the original board before its renderer. All v17 screen keys,
 * components, drawing-kit scenes and initialisers are retained. */
(function refineCompleteBoard(){
  soundOn=false;
  var sourceKeys=SC.map(function(s){return s.key});
  window.__V18_COVERAGE={sourceVersion:'v17',sourceKeys:sourceKeys.slice(),sourceCount:SC.length,missing:[],added:[]};
  if(new Set(sourceKeys).size!==sourceKeys.length)throw new Error('Original board has duplicate keys');
  var rootKeys=['today','plan','you'];
  CUST.forEach(function(c){if(c[0]==='Stress')c[1]=1});
  var metricData={Readiness:['72','readiness'],Sleep:['7h 10m','sleep'],Load:['11.4','load'],Stress:['1.4','stress','Estimate'],Fuel:['1,420','fuel'],HRV:['58','hrv'],'Resting heart rate':['54','hrv'],Steps:['8.2k','body'],'Body signals':['3 off','signals']};
  function metricsMarkup(){return CUST.filter(function(c){return c[1]}).map(function(c){var d=metricData[c[0]];return metric(c[0],d[0],d[1],d[2])}).join('')}
  function syncMetrics(){var home=document.querySelector('#s-today [data-v18-pane="body"] .v18-metrics');if(home)home.innerHTML=metricsMarkup()}
  function refineCustomise(scr){scr.classList.add('v18-customise');function render(){var on=CUST.filter(function(c){return c[1]});scr.querySelector('[data-cpv]').innerHTML='<div class="v18-metrics" style="width:100%">'+metricsMarkup()+'</div>';scr.querySelector('[data-cc]').textContent=on.length+' of 5 chosen · updates Today’s Body snapshot';var list=scr.querySelector('[data-cl]');list.innerHTML='';CUST.forEach(function(c,i){var row=document.createElement('div');row.className='li';row.draggable=true;row.innerHTML='<span class="cq" style="width:18px">⋮⋮</span><span class="t-body" style="flex:1">'+c[0]+'</span><button class="toggle" role="switch" aria-checked="'+!!c[1]+'" aria-label="'+c[0]+'"></button>';row.querySelector('button').addEventListener('click',function(){if(!c[1]&&on.length>=5){scr.querySelector('[data-cc]').textContent='Choose up to five. Switch one off to replace it.';return}c[1]=c[1]?0:1;render();syncMetrics()});row.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',String(i))});row.addEventListener('dragover',function(e){e.preventDefault()});row.addEventListener('drop',function(e){e.preventDefault();var from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from)&&from>=0&&from<CUST.length){var moved=CUST.splice(from,1)[0];CUST.splice(i,0,moved);render();syncMetrics()}});list.appendChild(row)});syncMetrics()}render()}

  ROOTS.today[0]='Monday, 16 Nov';
  ROOTS.you[0]='Level 1 · Stabilize';
  // The old referral expiry is not a clinical rule. Keep the referral, but use
  // an explicitly dated administrative bill to demonstrate deadline treatment.
  var hi=state.ins.find(function(x){return x[0]==='health'});
  if(hi){hi[1]='11 weeks';hi[2]='You have been waiting for a referral. Check its status with the provider; no expiry has been verified.';hi[3]='Illustrative saved referral'}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  function nav18(active){return '<nav class="v18-nav" aria-label="Main navigation"><div class="v18-nav-row">'+[['today','Today',IC.today],['plan','Plan',IC.plan],['you','You',IC.you],['chat','Talk',IC.mic]].map(function(t){return '<button class="press'+(t[0]===active?' on':'')+'" data-jump="'+t[0]+'" aria-label="'+t[1]+'"'+(t[0]===active?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></button>'}).join('')+'</div><div class="v18-homebar"></div></nav>'}
  function getDirect(el,parent){while(el&&el.parentElement!==parent)el=el.parentElement;return el}
  function contains(el,text){return el&&el.textContent.toLowerCase().indexOf(text.toLowerCase())>=0}
  function levelText(){return 'Level '+state.level}
  function metric(name,value,key,unit){return '<button class="v18-metric press" data-jump="'+key+'"><span class="name">'+name+'</span><span class="value">'+value+'</span>'+(unit?'<span class="unit">'+unit+'</span>':'')+'</button>'}
  function installNav(scr,key,type){
    var active=rootKeys.indexOf(key)>=0?key:key==='emptyplan'?'plan':'today';
    var roots=rootKeys.indexOf(key)>=0||['emptytoday','loadingtoday','emptyplan'].indexOf(key)>=0;
    if(roots){scr.classList.add('v18-screen');scr.querySelectorAll('.askbar').forEach(function(n){n.remove()});scr.insertAdjacentHTML('beforeend',nav18(active))}
    else if(type!=='Component'){scr.querySelectorAll('.askbar').forEach(function(n){n.remove()})}
  }
  function refineToday(scr){
    var feed=scr.querySelector('.scroll > .pad.col');
    if(!feed)throw new Error('Today feed missing');
    feed.classList.add('v18-feed');
    var kids=Array.from(feed.children), used=new Set();
    function directFind(predicate){return kids.find(predicate)}
    var aim=directFind(function(n){return n.matches('[data-jump="aim"]')});
    var greeting=directFind(function(n){return contains(n,'Good morning')});
    var brief=directFind(function(n){return n.classList.contains('t-statement')});
    var mood=directFind(function(n){return n.hasAttribute('data-moodcard')});
    var oldBody=directFind(function(n){return n.matches('[data-jump="body"]')&&contains(n,'Readiness')});
    var know=directFind(function(n){return n.classList.contains('know')});
    var asking=directFind(function(n){return n.querySelector('[data-asked]')});
    var insights=directFind(function(n){return n.querySelector('[data-ins]')});
    var level=directFind(function(n){return contains(n,'To reach level')});
    var idea=directFind(function(n){return n.matches('[data-jump="idea"]')});
    var work=directFind(function(n){return contains(n,'Worth doing today')});
    var sourcePrimary=work&&Array.from(work.children).find(function(n){return n.classList.contains('card')&&contains(n,'HMRC tax rebate')});
    var primary=document.createElement('section');primary.className='card col v18-next';primary.setAttribute('data-v18-next','');
    if(!aim||!brief||!know||!asking||!oldBody||!sourcePrimary)throw new Error('A retained Today module was not found');
    if(greeting){greeting.querySelectorAll('.t-callout').forEach(function(n){if(/Monday|Tuesday|Nov/.test(n.textContent))n.remove()});greeting.querySelectorAll('.t-title1').forEach(function(n){n.className='v18-greeting';n.textContent='Good morning, Ama'});var lb=greeting.querySelector('.tag');if(lb){lb.className='v18-level';lb.setAttribute('data-v18-level','');lb.textContent=levelText()}}
    else{greeting=document.createElement('div');greeting.className='row sb';greeting.innerHTML='<span class="v18-greeting">Good morning, Ama</span><button class="v18-level press" data-v18-level data-jump="levels">'+levelText()+'</button>'}
    brief.innerHTML='<span class="q">Your rebate needs</span> one form. <span class="q">Your council tax bill is due in</span> 15 days<span class="q">. Your first home is still the bigger picture.</span>';
    primary.innerHTML='<div class="row sb" style="gap:12px"><div class="col" style="gap:4px;flex:1"><span class="v18-next-label">Your next useful step</span><span class="t-title3">HMRC tax rebate</span><span class="t-callout c2">One form left · takes 6 min</span></div><button class="btn press v18-continue" data-jump="mission">Continue '+IC.chev+'</button></div><div class="v18-due-summary"><span>Also due · council tax bill</span><button class="v18-countdown press" data-jump="bill">1 Dec · in 15 days '+IC.chev+'</button></div>';
    if(mood)mood.classList.add('v18-photo');
    var values={};Array.from(oldBody.children).forEach(function(cell){var texts=Array.from(cell.querySelectorAll('span')).map(function(n){return n.textContent.trim()});if(texts.length>=2)values[texts[0]]=texts[texts.length-1]});
    var snap=document.createElement('section');snap.className='card v18-snapshot';snap.setAttribute('data-v18-snapshot','');
    snap.innerHTML='<div class="v18-snapshot-head"><span>Your snapshot</span><small>Illustrative readings</small></div><div class="v18-tabs" role="tablist" aria-label="Snapshot category">'+['Body','Money','Learning'].map(function(t,i){return '<button class="press" role="tab" aria-selected="'+(i===0)+'" data-v18-tab="'+t.toLowerCase()+'">'+t+'</button>'}).join('')+'</div><div class="v18-pane" data-v18-pane="body"><div class="v18-metrics">'+metric('Readiness',esc(values.Readiness||'72'),'readiness')+metric('Sleep',esc(values.Sleep||'7h 10m'),'sleep')+metric('Load',esc(values.Load||'11.4'),'load')+metric('Stress','1.4','stress','Estimate')+metric('Fuel',esc(values.Fuel||'1,420'),'fuel')+'<button class="v18-body-link press" data-jump="customise">Choose your numbers '+IC.chev+'</button></div></div><div class="v18-pane" data-v18-pane="money" hidden><button class="v18-money-row press" style="width:100%" data-jump="money"><span>Saved accounts</span><strong>£2,340.50 '+IC.chev+'</strong></button><button class="v18-money-row press" style="width:100%" data-jump="cashplan"><span>Your cash plan</span><strong>Open '+IC.chev+'</strong></button><button class="v18-money-row press" style="width:100%" data-jump="subs"><span>Subscriptions</span><strong>Review '+IC.chev+'</strong></button><span class="t-callout c2">The same v17 sample data, grouped—not removed.</span></div><div class="v18-pane" data-v18-pane="learning" hidden></div>';
    var snapshotHead=snap.querySelector('.v18-snapshot-head'), choose=snap.querySelector('.v18-body-link');
    snapshotHead.querySelector('small').remove();choose.innerHTML='Your snapshot '+IC.chev;choose.setAttribute('aria-label','Customise your Today numbers');snapshotHead.querySelector('span').replaceWith(choose);snapshotHead.appendChild(snap.querySelector('.v18-tabs'));
    if(idea)snap.querySelector('[data-v18-pane="learning"]').appendChild(idea);
    var learnRow=document.createElement('button');learnRow.className='v18-money-row press';learnRow.style.width='100%';learnRow.setAttribute('data-jump','learning');learnRow.innerHTML='<span>Your learning and recalls</span><strong>Open '+IC.chev+'</strong>';snap.querySelector('[data-v18-pane="learning"]').appendChild(learnRow);
    oldBody.remove();used.add(oldBody);used.add(idea);
    snap.querySelectorAll('[data-v18-tab]').forEach(function(button){button.addEventListener('click',function(){snap.querySelectorAll('[data-v18-tab]').forEach(function(b){b.setAttribute('aria-selected',String(b===button))});snap.querySelectorAll('[data-v18-pane]').forEach(function(p){p.hidden=p.dataset.v18Pane!==button.dataset.v18Tab})})});
    asking.classList.add('v18-question');
    if(work){work.classList.add('v18-other');var title=work.querySelector('.t-title3');if(title&&title.textContent==='Worth doing today')title.textContent='Also needs your attention';work.querySelectorAll('.card').forEach(function(card){if(contains(card,'Hospital referral'))card.innerHTML=card.innerHTML.replace(/Expires in 9 days/g,'Waiting 11 weeks')});work.insertAdjacentHTML('beforeend','<button class="card col press" style="gap:8px;text-align:left" data-jump="bill"><span class="row sb"><span class="t-title3">Council tax bill</span><span class="tag">Due in 15 days</span></span><span class="row sb t-callout c2"><span>From the sample bill</span><span class="tnum">1 Dec 2026</span></span></button>')}
    var fragment=document.createDocumentFragment();[aim,greeting,brief,primary,mood,snap,know,asking,work,insights,level].forEach(function(node){if(node){used.add(node);fragment.appendChild(node)}});kids.forEach(function(node){if(!used.has(node))fragment.appendChild(node)});feed.appendChild(fragment);
    // Preserve the original question/knowledge listeners. Only module order and
    // grouping change; answering still updates the exact original controls.
    listeners.push(function(){scr.querySelectorAll('[data-v18-level]').forEach(function(n){n.textContent=levelText()})});
    if(!scr.querySelector('[data-v18-level]')){var badge=document.createElement('button');badge.className='v18-level press';badge.setAttribute('data-v18-level','');badge.setAttribute('data-jump','levels');badge.textContent=levelText();greeting.appendChild(badge)}
    renderMoodCards();
    window.__V18_COVERAGE.todayModules={aim:!!aim,level:!!scr.querySelector('[data-v18-level]'),brief:!!brief,readiness:true,sleep:true,load:true,stress:true,fuel:true,knows:!!know,asking:!!asking,deadlines:!!work,learning:!!idea};
  }
  function refinePlan(scr){
    var cards=Array.from(scr.querySelectorAll('.scroll .card'));
    cards.forEach(function(card){if(contains(card,'HMRC tax rebate')&&card.querySelector('.ticks')){var tag=card.querySelector('.tag');if(tag)tag.textContent='One form left';card.innerHTML=card.innerHTML.replace(/Decision in 6 days/g,'Takes 6 min')}if(contains(card,'Hospital referral')&&card.querySelector('.ticks'))card.innerHTML=card.innerHTML.replace(/Expires in 9 days/g,'Waiting 11 weeks')});
    var areas=scr.querySelector('[data-areas]');if(!areas)return;
    var all=document.createElement('button');all.className='chipb press on';all.textContent='All areas';areas.querySelectorAll('.chipb').forEach(function(b){b.classList.remove('on')});areas.prepend(all);
    var buttons=Array.from(areas.querySelectorAll('button'));
    function apply(area,chosen){buttons.forEach(function(b){b.classList.toggle('on',b===chosen)});var tools=Array.from(scr.querySelectorAll('[data-tools] .tool'));tools.forEach(function(t,i){var name=TOOLS[i]?TOOLS[i][0]:t.textContent;var group=/Body|Bloodwork/.test(name)?'health':/Learn/.test(name)?'you':/Income|Growth/.test(name)?'work':/Rent|Mortgage/.test(name)?'home':'money';t.hidden=!!area&&area!==group&&!(area==='goal'&&/Growth|Learn/.test(name))});cards.forEach(function(c){if(!c.querySelector('.ticks'))return;var category=contains(c,'Hospital')?'health':contains(c,'Council')?'home':'money';c.hidden=!!area&&area!==category})}
    all.addEventListener('click',function(){apply('',all)});buttons.slice(1).forEach(function(button,i){var keys=['money','work','home','health','you','goal'];button.addEventListener('click',function(){apply(keys[i],button)})});
  }
  SC.forEach(function(sc){
    if(sc.key==='attach'){sc.type='Full screen';NAV.attach=['talk','Full screen','+ in Chat'];sc.from='+ in Chat';sc.html='<div class="scroll">'+STATUS+nav('Attach')+'<div class="pad col" style="gap:16px;padding-top:16px"><div class="t-statement"><span class="q">Add something</span> to the conversation.</div><div class="card col" style="padding:16px;gap:0">'+[['Scan a letter','Use your camera','scan',IC.tax],['Camera','Take a photo','snap',IC.camera||IC.tax],['Photos','Choose an image','scan',IC.home],['Files','Choose a document','scan',IC.ledger],['How I’m feeling','Open Pulse','pulse',IC.spark]].map(function(r){return '<button class="li press" data-jump="'+r[2]+'"><span class="ic">'+r[3]+'</span><span class="col" style="gap:3px;flex:1;text-align:left"><span class="t-body">'+r[0]+'</span><span class="t-callout c2">'+r[1]+'</span></span>'+IC.chev+'</button>'}).join('')+'</div><span class="t-callout c2">Full-screen fade; local selection first. Read, review, then confirm.</span></div></div>'}
    var init=sc.init;sc.init=function(scr){if(init&&sc.key!=='attach'&&sc.key!=='customise')init(scr);installNav(scr,sc.key,sc.type);if(sc.key==='today')refineToday(scr);if(sc.key==='plan')refinePlan(scr);if(sc.key==='customise')refineCustomise(scr)};
    if(sc.key==='customise'){sc.desc='Choose and reorder up to five Today Body numbers. Stress is included in the default snapshot; your choices update the homepage preview.';sc.feat='prefs.todayMetrics · v18 proposal: up to 5, shared live preview'}
    if(sc.key==='doitforme'){sc.title+=' · parked';sc.desc='Preserved reference only. This feature remains parked and is not part of the current application build.';sc.feat='Parked · original reference retained, not an adopted integration'}
    if(sc.key==='today'){sc.desc='The original complete Today, enhanced rather than reduced: Aim, level, editorial brief, next move, mood photo, Body / Money / Learning snapshot, life knows you, life is asking, progress and visible due dates.';sc.feat+=' · v18 grouped feed';}
  });
  window.__finishV18Board=function(){
    var originalCount=SC.length, current=SC.map(function(s){return s.key});window.__V18_COVERAGE.currentCount=originalCount;window.__V18_COVERAGE.missing=sourceKeys.filter(function(k){return current.indexOf(k)<0});window.__V18_COVERAGE.added=current.filter(function(k){return sourceKeys.indexOf(k)<0});
    var studio=document.createElement('section');studio.id='feed-studio';studio.className='chap';studio.innerHTML='<div class="sec-head"><span class="eyebrow">Merged direction · the same three root screens</span><h2 class="h-sec">Keep the richness. Give it a rhythm.</h2><p class="p-sec">Nothing has been replaced with a three-screen task app. These are the actual Today, Plan and You screens from the complete board, reorganised and brought forward for review.</p></div><div class="v18-studio-legend"><span>Aim + level retained</span><span>Editorial briefing retained</span><span>Readiness · sleep · load · stress</span><span>life knows you + life is asking</span><span>Due dates stay visible</span></div><div class="rail"></div>';
    var first=document.querySelector('.wrap > section');first.insertAdjacentElement('afterend',studio);
    rootKeys.forEach(function(key){var shot=byKey[key].el;var oldRail=shot.parentElement;studio.querySelector('.rail').appendChild(shot);if(!oldRail.querySelector('.shot')){var link=document.createElement('button');link.className='v18-chapter-link';link.dataset.jump=key;link.textContent='Open '+(key==='you'?'You':key==='plan'?'Plan':'Today')+' in the merged overview ↑';oldRail.appendChild(link)}});
    var legend=document.createElement('div');legend.className='v18-note';legend.innerHTML='<strong>'+originalCount+' original screen keys preserved.</strong><span>All '+CH.length+' chapters, the drawing kit, orb family, tools, learning and states remain below. Sample data and dates—not live integrations or medical rules.</span><button data-jump="today">Review Today</button><button data-jump="customise">Choose your numbers</button><button data-jump="topbars">Top bars</button>';
    studio.insertAdjacentElement('beforebegin',legend);
    var review=document.createElement('div');review.className='v18-review-controls';review.innerHTML='<span class="t-callout c2" style="align-self:center">Inspect the same Today feed:</span>'+[['top','Top'],['body','Body + stress'],['asking','Knows + asking'],['dates','Due dates'],['full','Entire feed']].map(function(x){return '<button data-feed-review="'+x[0]+'">'+x[1]+'</button>'}).join('');studio.querySelector('.rail').insertAdjacentElement('beforebegin',review);
    review.addEventListener('click',function(e){var b=e.target.closest('[data-feed-review]');if(!b)return;var shot=byKey.today.el,scr=shot.querySelector('.screen'),scroll=scr.querySelector('.scroll'),mode=b.dataset.feedReview;shot.scrollIntoView({behavior:'auto',block:'start',inline:'center'});if(mode==='full'){var expanded=shot.classList.toggle('v18-expanded');if(expanded){function fitFeed(){if(!shot.classList.contains('v18-expanded'))return;var feed=scr.querySelector('.v18-feed'),style=getComputedStyle(scroll),height=Math.ceil(feed.offsetHeight+(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0)+86);if(parseFloat(scr.style.height)!==height){scr.style.height=height+'px';shot.querySelector('.phone').style.height=(height+22)+'px';shot.querySelector('.frame').style.height='calc('+(height+22)+'px * var(--z,1))'}}fitFeed();document.fonts.ready.then(function(){requestAnimationFrame(fitFeed)});if(window.ResizeObserver){shot._v18Fit=new ResizeObserver(fitFeed);shot._v18Fit.observe(scr.querySelector('.v18-feed'));shot._v18Fit.observe(scroll)}scroll.scrollTop=0;b.textContent='Normal phone'}else{if(shot._v18Fit)shot._v18Fit.disconnect();scr.style.removeProperty('height');shot.querySelector('.phone').style.removeProperty('height');shot.querySelector('.frame').style.removeProperty('height');b.textContent='Entire feed'}return}if(mode==='top'){scroll.scrollTop=0;return}var target=mode==='body'?scr.querySelector('[data-v18-snapshot]'):mode==='asking'?scr.querySelector('.know'):scr.querySelector('.v18-other');if(mode==='body')scr.querySelector('[data-v18-tab="body"]').click();if(target)scroll.scrollTop+=target.getBoundingClientRect().top-scroll.getBoundingClientRect().top-(scr.querySelector('.pinned')?.offsetHeight||128)-16});
    var tools=document.createElement('div');tools.className='v18-board-tools';tools.innerHTML='<input aria-label="Find a screen on this board" placeholder="Find any screen or feature…"><button>Clear search</button><span class="t-callout c2" data-v18-count>'+originalCount+' screens</span>';
    document.getElementById('map').parentElement.prepend(tools);
    function search(value){var q=value.trim().toLowerCase(),shown=0;SC.forEach(function(sc){var hit=!q||[sc.key,sc.title,sc.desc,sc.feat,sc.from].join(' ').toLowerCase().indexOf(q)>=0;byKey[sc.key].el.hidden=!hit;if(hit)shown++});tools.querySelector('[data-v18-count]').textContent=shown+' of '+originalCount+' screens'}
    tools.querySelector('input').addEventListener('input',function(e){search(e.target.value)});tools.querySelector('button').addEventListener('click',function(){tools.querySelector('input').value='';search('')});
    document.getElementById('snd').setAttribute('aria-pressed','false');soundOn=false;
    window.__V18_COVERAGE.rendered=document.querySelectorAll('.shot').length;
    if(window.__V18_COVERAGE.missing.length||window.__V18_COVERAGE.rendered!==sourceKeys.length)throw new Error('Full board coverage changed');
  };
})();
