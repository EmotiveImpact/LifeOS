/* App-wide integration and honest change accounting; no new prototype features. */
(function applyAppWideVisualPass(){
  var records=[],errors=[],roots=['today','plan','you'];
  function words(text){var m=new Map();(text.toLowerCase().match(/[\p{L}\p{N}£€$%]+/gu)||[]).forEach(function(w){m.set(w,(m.get(w)||0)+1)});return m}
  SC.forEach(function(sc){
    var scr=byKey[sc.key].el.querySelector('.screen');
    if(roots.indexOf(sc.key)>=0){records.push({key:sc.key,title:sc.title,chapter:sc.ch,domain:'entry',status:'v19 retained',structural:false,controlLoss:0,textLoss:0});return}
    var owners=window.__V20Passes.filter(function(p){return p.keys.indexOf(sc.key)>=0});
    if(owners.length!==1){errors.push({key:sc.key,error:owners.length?'Multiple domain owners':'No domain owner'});return}
    var pass=owners[0],elements=Array.from(scr.querySelectorAll('*')),parents=elements.map(function(e){return e.parentNode}),important=Array.from(scr.querySelectorAll('button,input,textarea,select,canvas,img,[data-jump],[role="switch"]')),beforeText=words(scr.textContent),beforeCount=elements.length;
    try{
      var result=pass.apply(sc,scr)||{};
      var lost=important.filter(function(e){return !scr.contains(e)}),afterText=words(scr.textContent),missing=[];
      beforeText.forEach(function(n,w){if((afterText.get(w)||0)<n)missing.push(w)});
      var moved=elements.filter(function(e,i){return scr.contains(e)&&e.parentNode!==parents[i]}).length,added=scr.querySelectorAll('*').length-beforeCount;
      var structural=moved>0||(result.structural===true&&added>0);
      var record={key:sc.key,title:sc.title,chapter:sc.ch,domain:pass.id,status:structural?'layout reorganised':'visual styling',structural:structural,movedElements:moved,addedElements:added,controlLoss:lost.length,textLoss:missing.length,changes:result.changes||[]};records.push(record);
      if(lost.length||missing.length)errors.push({key:sc.key,error:'Original content/control loss',controls:lost.length,missingWords:missing.slice(0,15)});
    }catch(e){errors.push({key:sc.key,error:e.message})}
  });
  var counts={};records.forEach(function(r){if(!counts[r.domain])counts[r.domain]={screens:0,structural:0,styling:0};counts[r.domain].screens++;if(r.structural)counts[r.domain].structural++;else counts[r.domain].styling++});
  window.__V20_AUDIT={originalScreens:SC.length,renderedOriginalScreens:document.querySelectorAll('.shot').length,records:records,domains:counts,errors:errors,structurallyReorganised:records.filter(function(r){return r.structural}).length,styledDetailScreens:records.filter(function(r){return r.domain!=='entry'}).length,entryScreensRetained:3};
  var sec=document.createElement('section');sec.id='v20-app-wide';sec.className='chap';sec.innerHTML='<div class="sec-head"><span class="eyebrow">v20 · actual detail screens, not more homepage concepts</span><h2 class="h-sec">Across the app.</h2><p class="p-sec">Money/admin, Body/Fuel/Habits, learning/personal and flows/settings/states now have dedicated visual passes. The numbers below separate structural reorganisation from styling. Immersive canvases and native previews are preserved rather than forcibly rearranged.</p></div><div class="v20-counts">'+Object.keys(counts).filter(function(k){return k!=='entry'}).map(function(k){return '<div><strong>'+counts[k].screens+'</strong><span>'+k+'</span><small>'+counts[k].structural+' reorganised · '+counts[k].styling+' styled</small></div>'}).join('')+'</div><div class="v20-actions"><button data-v20-view="sample">Changed-screen sample</button><button data-v20-view="all">Full library</button><button data-v20-view="audit">Exact change list</button></div><div class="v20-samples"></div><details id="v20-audit"><summary>Exact per-screen change list · '+records.length+' entries</summary><div class="cov-wrap"><table class="cov"><thead><tr><th>Screen</th><th>Domain</th><th>Actual pass</th><th>Applied changes</th></tr></thead><tbody>'+records.map(function(r){return '<tr><td><button class="go" data-jump="'+r.key+'">'+r.title+'</button><br><small>'+r.key+'</small></td><td>'+r.domain+'</td><td>'+r.status+'</td><td>'+(r.changes||[]).join(' · ')+'</td></tr>'}).join('')+'</tbody></table></div></details>';
  var first=document.querySelector('.wrap>section');first.insertAdjacentElement('afterend',sec);
  var examples=['money','readiness','fuel','habits','bite','settings'];
  examples.forEach(function(key){if(!byKey[key])return;var shot=byKey[key].el,oldRail=shot.parentElement;sec.querySelector('.v20-samples').appendChild(shot);shot.classList.add('v20-sample');shot.style.setProperty('--z','.75');if(!oldRail.querySelector('.shot')){var b=document.createElement('button');b.className='v18-chapter-link';b.dataset.jump=key;b.textContent='Open updated '+SC.find(function(s){return s.key===key}).title+' above';oldRail.appendChild(b)}});
  sec.addEventListener('click',function(e){var b=e.target.closest('[data-v20-view]');if(!b)return;if(b.dataset.v20View==='audit'){sec.querySelector('details').open=true;sec.querySelector('details').scrollIntoView({behavior:'auto',block:'start'})}else if(b.dataset.v20View==='all')document.getElementById('chapters').scrollIntoView({behavior:'auto',block:'start'});else sec.querySelector('.v20-samples').scrollIntoView({behavior:'auto',block:'start'})});
  document.querySelector('.mark').lastElementChild.textContent='Complete app · v20 · app-wide pass';
  if(errors.length)console.error('V20 preservation checks:',errors);
})();
