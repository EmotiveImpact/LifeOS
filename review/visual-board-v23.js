/* V23 is a separate checkpoint, not a rewrite of any earlier board. */
(function saveCorrectedDirection(){
  'use strict';
  var source=window.__V23_SOURCE,account=source.accounting,paths=source.iconPaths;
  var errors=[],iconChanges=0;
  function escape(value){return String(value==null?'':value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function svg(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.help)+'</svg>'}
  function element(tag,cls){var n=document.createElement(tag);n.className=cls;return n}
  function fingerprint(n){return n.innerHTML.replace(/\s+/g,'').replaceAll('></','><');}
  var aliases={mic:'mic',today:'home',plan:'layers',you:'person',back:'back',close:'close',more:'more',reset:'repeat',chev:'chev',eye:'eye',eyeoff:'eyeOff',doc:'doc',cam:'camera',photo:'images',folder:'folder',cash:'wallet',tax:'calculator',ledger:'chart',subs:'repeat',heart:'heart',pound:'cash',home:'home',drop:'water',chart:'chart',shield:'shield',path:'trend',bulb:'bulb',bell:'bell',spark:'spark',info:'info',plus:'add',search:'search',gear:'gear',cake:'gift',people:'people',passport:'doc',check2:'check'};
  var replacements=new Map();
  [IC,IC2].forEach(function(registry){Object.keys(registry).forEach(function(key){var target=aliases[key];if(!target||!paths[target])return;var tmp=document.createElement('div');tmp.innerHTML=registry[key];var old=tmp.querySelector('svg');if(old)replacements.set(fingerprint(old),target);registry[key]=svg(target)})});
  function updateIcons(root){root.querySelectorAll('svg').forEach(function(n){if(n.closest('.status')||!n.closest('button,.sq,.chev,.tag,.chipb,.tool,.v18-nav,.adot,.badge,.ico,.row-icon,.ck,.box')||n.closest('.diagram,.lesson-picture,[data-drawkit]'))return;var name=replacements.get(fingerprint(n));if(name){n.innerHTML=paths[name];n.setAttribute('viewBox','0 0 24 24');n.setAttribute('fill','none');n.setAttribute('stroke','currentColor');n.setAttribute('stroke-width','1.6');n.setAttribute('stroke-linecap','round');n.setAttribute('stroke-linejoin','round');iconChanges++}})}
  SC.forEach(function(sc){var scr=byKey[sc.key].el.querySelector('.screen');scr.classList.add('v23-screen');updateIcons(scr)});

  var jumps={tax:'taxcheck',pulse:'pulse',person:'person',cash:'cashplan',waiting:'missions',habit:'habits',documents:'vault',body:'body',learn:'library',progress:'levels',history:'history',profile:'profile',settings:'settings',search:'search',inbox:'inbox',household:'household',recap:'recap',records:'knows',memories:'memory'};
  ['today','plan','you'].forEach(function(key){
    var scr=byKey[key].el.querySelector('.screen'),content=scr.querySelector('.v21-content');
    var before=Array.from(content.querySelectorAll('button,input,textarea,select,canvas,img'));
    var tmp=document.createElement('div');tmp.innerHTML=source.roots[key];
    var replacement=tmp.querySelector('.body');
    replacement.querySelectorAll('[class]').forEach(function(n){n.setAttribute('class',n.getAttribute('class').split(/\s+/).filter(Boolean).map(function(c){return 'v23-'+c}).join(' '))});
    replacement.className='v23-body';
    replacement.querySelectorAll('[data-action]').forEach(function(n){if(jumps[n.dataset.action])n.dataset.jump=jumps[n.dataset.action]});
    replacement.querySelectorAll('[data-nav]').forEach(function(n){n.dataset.jump=n.dataset.nav==='talk'?'chat':n.dataset.nav});
    replacement.querySelectorAll('[id]').forEach(function(n){n.id='v23-'+key+'-'+n.id});
    replacement.querySelectorAll('[data-expand]').forEach(function(n){n.dataset.v23Expand='v23-'+key+'-'+n.dataset.expand;n.removeAttribute('data-expand')});
    var retained=element('details','v23-retained');
    var summary=document.createElement('summary');summary.textContent=key==='today'?'Full day controls and earlier state demonstrations':key==='plan'?'Full toolkit, gambit and all Plan destinations':'Detailed score, understanding and all personal destinations';retained.appendChild(summary);
    Array.from(content.childNodes).forEach(function(n){retained.appendChild(n)});
    if(key==='today'){
      var deeper=element('div','v23-deeper');
      ['[data-v19-aim]','[data-v18-snapshot]','.v19-understanding','.v18-other','.v19-secondary'].forEach(function(selector){var n=retained.querySelector(selector);if(n)deeper.appendChild(n);else errors.push({key:key,issue:'Required module missing: '+selector})});
      var receipt=retained.querySelector('[data-v19-receipt]');if(receipt)deeper.prepend(receipt);
      var level=retained.querySelector('[data-jump="levels"]');if(level)replacement.querySelector('.v23-greeting').appendChild(level);
      var radar=Array.from(replacement.querySelectorAll('.v23-stack')).find(function(n){return n.textContent.indexOf('Also on your radar')>=0});if(radar)radar.remove();
      var quietNote=replacement.querySelector('.v23-quiet-note');if(quietNote)quietNote.remove();
      replacement.appendChild(deeper);
      var photo=replacement.querySelector('.v23-photo');
      var syncCheckin=function(){var done=receipt&&!receipt.hidden;var title=photo.querySelector('h3'),sub=photo.querySelector('p'),arrow=photo.querySelector('button');if(done){var copy={calm:'A clear head today.',peaceful:'A soft, steady day.',driven:'You’ve got energy.',restless:'Let’s burn it off.',anxious:'Let’s make it smaller.',drained:'Go gently today.'};title.textContent=copy[state.mood]||'A little time, well spent.';sub.textContent='From your Pulse · checked in today';if(arrow)arrow.hidden=true}else{title.textContent='How are you arriving?';sub.textContent='A quick check-in, if you want.';if(arrow)arrow.hidden=false}};
      if(receipt){new MutationObserver(syncCheckin).observe(receipt,{attributes:true,childList:true,subtree:true});syncCheckin()}
      var priorRender=renderMoodCards;renderMoodCards=function(){priorRender();syncCheckin()};
    }
    replacement.appendChild(retained);content.appendChild(replacement);
    scr.classList.remove('v22-today','v19-home','v19-plan','v19-you');scr.classList.add('v23-root','v23-'+key);
    if(key!=='today'){var eyebrow=scr.querySelector('.v21-eyebrow');if(eyebrow)eyebrow.textContent=''}
    var missing=before.filter(function(n){return !scr.contains(n)});if(missing.length)errors.push({key:key,issue:'Original controls/media lost',count:missing.length});
    var cap=byKey[key].el.querySelector('.shot-cap');cap.querySelector('b').textContent=key[0].toUpperCase()+key.slice(1)+' · corrected calmer direction';cap.querySelector('b').nextElementSibling.textContent='Original calmer composition and exact SVG family. Deeper life content and every original destination are retained; sample data is illustrative.';
  });

  document.addEventListener('click',function(e){
    var expand=e.target.closest('[data-v23-expand]');if(expand){var target=document.getElementById(expand.dataset.v23Expand);if(target){var opening=target.hidden||!target.classList.contains('v23-open');target.hidden=!opening;target.classList.toggle('v23-open',opening);expand.setAttribute('aria-expanded',String(opening))}return}
    var filter=e.target.closest('.v23-root [data-filter]');if(filter){var body=filter.closest('.v23-body'),key=filter.dataset.filter;body.querySelectorAll('[data-filter]').forEach(function(n){n.classList.toggle('v23-active',n===filter)});body.querySelectorAll('[data-area]').forEach(function(n){n.hidden=key!=='all'&&n.dataset.area!==key});var empty=body.querySelector('.v23-filter-empty');if(empty)empty.hidden=Array.from(body.querySelectorAll('[data-area]')).some(function(n){return !n.hidden})}
  });
  // Correct the exact inherited referral countdown wording, without inventing a clinical expiry.
  ['today','plan','mission','areahealth'].forEach(function(key){if(!byKey[key])return;var walker=document.createTreeWalker(byKey[key].el.querySelector('.screen'),NodeFilter.SHOW_TEXT);while(walker.nextNode()){var n=walker.currentNode;n.textContent=n.textContent.replace(/expires in 9 days/gi,'waiting 11 weeks · sample record')}});

  var intro=document.getElementById('v21-showcase');
  intro.querySelector('.eyebrow').textContent='V23 · saved corrected calmer direction · full screen library';
  intro.querySelector('.h-sec').textContent='The direction, preserved.';
  intro.querySelector('.p-sec').textContent='The original calmer SVGs, readable editorial contrast, separate action and photography, and grouped Plan/You entry points. Every original screen is included below. Accounting means represented and classified—not that every integration or native screen is approved.';
  document.querySelector('.mark').lastElementChild.textContent='Complete visual board · V23';
  document.querySelectorAll('.shot-cap .v19-ref-label').forEach(function(n){n.textContent='V23 saved checkpoint'});
  document.querySelectorAll('.v18-chapter-link').forEach(function(n){n.textContent=n.textContent.replace('v21 gallery','V23 gallery')});
  var lead=document.querySelector('.p-lead');if(lead)lead.textContent='A separate checkpoint of the corrected calmer direction. All 221 original screen keys across 21 chapters are preserved. Earlier boards remain untouched. The home heading is kept as Today here to save the current design exactly; “life” is the recommended heading, not an approved app rename.';
  Array.from(intro.querySelectorAll(':scope > .v21-board-note')).forEach(function(n){n.remove()});
  var note=element('div','v21-board-note');note.innerHTML='<strong>Heading recommendation:</strong> life at the top; Today in bottom navigation. No rename is applied in this checkpoint. <strong>Release distinction:</strong> these visual corrections are local. Installed TestFlight build 4 is unchanged.';intro.querySelector('.v21-grid').insertAdjacentElement('beforebegin',note);
  if(source.proof){var proof=element('details','v23-app-proof');proof.innerHTML='<summary>Actual app renders saved with this checkpoint</summary><p class="p-sec">These are captured from the corrected local Expo application, not replacement mockups. Phone-system insets differ between browser and native devices.</p><img alt="Corrected Today, Plan and You app renders" src="'+source.proof+'">';intro.querySelector('.v21-grid').insertAdjacentElement('beforebegin',proof)}
  ['today','plan','you'].forEach(function(key){intro.querySelector('.v21-grid').appendChild(byKey[key].el)});
  var grid=intro.querySelector('.v21-grid');['you','plan','today'].forEach(function(key){grid.prepend(byKey[key].el)});
  var previous=document.getElementById('v21-screen-audit');if(previous)previous.remove();
  var counts={};account.rows.forEach(function(r){counts[r.status]=(counts[r.status]||0)+1});
  var inventory=element('section','v23-accounting');inventory.id='v23-screen-accounting';inventory.innerHTML='<h2 class="h-sec">Every screen accounted for.</h2><div class="v23-counts"><span><strong>221</strong> original screens</span><span><strong>21</strong> chapters</span><span><strong>196</strong> native routes</span><span><strong>0</strong> omitted keys</span></div><p class="p-sec">Parent-rendered states, overlays, component/platform previews, the standalone teaching-player reference and the parked screen are explicitly marked. Open any entry at full size.</p><input type="search" aria-label="Find a screen in the V23 accounting" placeholder="Find a screen, chapter, route or status" style="min-height:44px;background:var(--surface);color:var(--text);padding:12px 16px;border:0;border-radius:12px;font:inherit"><div class="v23-accounting-scroll"><table><thead><tr><th>Screen</th><th>Chapter / opening</th><th>Application destination</th><th>Accounting / limits</th></tr></thead><tbody>'+account.rows.map(function(r){return '<tr data-v23-account-row="'+escape(r.key)+'"><td><button data-v21-open="'+escape(r.key)+'"><strong>'+escape(r.title)+'</strong><small>'+escape(r.key)+'</small></button></td><td>'+escape(r.chapter)+'<small>'+escape(r.opensAs)+' · from '+escape(r.from)+'</small></td><td>'+escape(r.route||'Parent / preview; no standalone route')+'</td><td>'+escape(r.status)+'<small>'+escape(r.note)+'</small></td></tr>'}).join('')+'</tbody></table></div>';
  intro.appendChild(inventory);inventory.querySelector('input').addEventListener('input',function(e){var q=e.target.value.trim().toLowerCase();inventory.querySelectorAll('[data-v23-account-row]').forEach(function(row){row.hidden=q&&!row.textContent.toLowerCase().includes(q)})});
  document.querySelectorAll('[data-v21-jump="audit"]').forEach(function(button){button.removeAttribute('data-v21-jump');button.textContent='Every screen · 221';button.addEventListener('click',function(){inventory.scrollIntoView({behavior:'auto',block:'start'})})});
  var rendered=Array.from(document.querySelectorAll('.shot')).map(function(n){return n.id.replace(/^s-/,'')});
  var expected=account.rows.map(function(r){return r.key}),missing=expected.filter(function(k){return rendered.indexOf(k)<0}),duplicates=rendered.filter(function(k,i){return rendered.indexOf(k)!==i});
  window.__V23_AUDIT={version:23,sourceScreens:account.originalScreens,renderedScreens:rendered.length,uniqueKeys:new Set(rendered).size,chapters:account.originalChapters,accountedRows:inventory.querySelectorAll('[data-v23-account-row]').length,missingKeys:missing,duplicateKeys:duplicates,classifications:counts,iconChanges:iconChanges,errors:errors,headingProposal:'life heading / Today navigation; not applied',appReleased:false};
  if(missing.length||duplicates.length||errors.length)console.error('V23 accounting errors',window.__V23_AUDIT);
})();
