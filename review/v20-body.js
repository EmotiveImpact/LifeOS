/* v20 Body / Fuel / Habits: preserve every existing fact and control while clarifying the reading. */
(function registerV20BodyPass(){
  'use strict';

  var keys=[
    'body','devices','readiness','sleep','load','snap','confirm','fuel','habits','habitnew',
    'trends','hrv','signals','stress','breathe','journal','insights','workout','detected',
    'sleepplan','math','coach','mealresult','cook','mealplan','sayit','forecast','cycle',
    'fitnessage','sources','cgm','strength','basics','sleepnight','workoutdetail','weight',
    'foodday','barcode','foodsearch','bmi','strain','zones','illness','breathlib',
    'provenance','regularity','loadtrend','healthdigest','fuelhome','fuelgoal','savedmeals',
    'fuelprogress','exerciseadd','fuelplan','weighin','labelscan','menuscan','fixwords',
    'nutrients','describeexercise','weekbudget','mealtiming','foodquality','alcohol',
    'quicklog','importfood'
  ];
  var keySet=new Set(keys);
  var geometryKeys=new Set(['snap','barcode','labelscan','workout','breathe']);
  var fuelKeys=new Set([
    'snap','confirm','fuel','mealresult','cook','mealplan','sayit','foodday','barcode',
    'foodsearch','fuelhome','fuelgoal','savedmeals','fuelprogress','exerciseadd','fuelplan',
    'weighin','labelscan','menuscan','fixwords','nutrients','describeexercise','weekbudget',
    'mealtiming','foodquality','alcohol','quicklog','importfood'
  ]);
  var habitKeys=new Set(['habits','habitnew','strength']);
  var leadingCount={
    body:2,devices:3,readiness:2,sleep:1,load:1,confirm:2,fuel:1,habits:2,habitnew:2,
    trends:1,hrv:2,signals:1,stress:1,journal:2,insights:1,detected:1,sleepplan:3,
    math:1,coach:3,mealresult:3,cook:3,mealplan:1,sayit:3,forecast:1,cycle:1,
    fitnessage:1,sources:1,cgm:1,strength:1,basics:1,sleepnight:1,workoutdetail:1,
    weight:1,foodday:1,foodsearch:2,bmi:1,strain:1,zones:1,illness:2,breathlib:1,
    provenance:1,regularity:1,loadtrend:1,healthdigest:1,fuelhome:2,fuelgoal:2,
    savedmeals:1,fuelprogress:1,exerciseadd:1,fuelplan:3,weighin:1,menuscan:1,
    fixwords:3,nutrients:1,describeexercise:2,weekbudget:1,mealtiming:1,foodquality:1,
    alcohol:1,quicklog:1,importfood:1
  };

  function keyOf(sc){return typeof sc==='string'?sc:(sc&&sc.key)||''}
  function chapterOf(sc,key){return (sc&&typeof sc==='object'&&sc.ch)||(fuelKeys.has(key)?'fuel':habitKeys.has(key)?'habits':'body')}
  function contentRoot(scr){
    var roots=Array.from(scr.querySelectorAll('.scroll > .pad.col'));
    if(!roots.length)roots=Array.from(scr.querySelectorAll('.scroll .pad.col'));
    return roots.sort(function(a,b){return b.children.length-a.children.length})[0]||null;
  }
  function makeSection(cls){var node=document.createElement('section');node.className=cls;return node}
  function wrapLeading(root,count,key){
    if(!root||!count||root.querySelector(':scope > .v20-leading'))return null;
    var nodes=Array.from(root.children).slice(0,count);if(!nodes.length)return null;
    var section=makeSection('v20-leading v20-leading--'+key);
    if(nodes.some(function(n){return n.querySelector&&n.querySelector('.ph-img')}))section.classList.add('v20-leading--media');
    root.insertBefore(section,nodes[0]);nodes.forEach(function(n){section.appendChild(n)});return section;
  }
  function wrapCardRuns(root){
    if(!root)return 0;var made=0,nodes=Array.from(root.children),i=0;
    while(i<nodes.length){
      if(!nodes[i].classList.contains('card')){i++;continue}
      var run=[],j=i;while(j<nodes.length&&nodes[j].classList.contains('card')){run.push(nodes[j]);j++}
      if(run.length>1){
        var section=makeSection('v20-detail-group');var words=run.map(function(n){return n.textContent}).join(' ');
        if(/why|baseline|source|signal|pattern|what moves|zone|week/i.test(words))section.classList.add('v20-driver-group');
        root.insertBefore(section,run[0]);run.forEach(function(n){section.appendChild(n)});made++;
      }
      i=j;
    }
    return made;
  }
  function markEvidence(scr){
    var count=0,re=/estimate|estimated|source|baseline|calibrat|not medical|not a medical|not a diagnosis|wellness|guidance|NHS|private|contraception|reference intake|patterns, not proof|badge:/i;
    scr.querySelectorAll('span,p,small').forEach(function(node){if(re.test(node.textContent||'')){node.classList.add('v20-evidence');count++}});return count;
  }
  function markControls(scr){
    var count=0;
    scr.querySelectorAll('button').forEach(function(button){
      var label=(button.textContent||'').replace(/\s+/g,' ').trim();
      if(button.matches('[data-fl],.btn:not(.s)')||/^(save|log meal|looks right|add it|start this habit|remind me|plan tonight)/i.test(label))button.classList.add('v20-confirm');
      else if(/edit|adjust|fix|change|skip|undo|not today|not now|choose file|none|half|all/i.test(label))button.classList.add('v20-correction');
      else if(button.matches('.chipb,.sq,.btn.s,.segm button,[data-rescue]'))button.classList.add('v20-control');
      if(button.classList.contains('v20-confirm')||button.classList.contains('v20-correction')||button.classList.contains('v20-control'))count++;
    });
    scr.querySelectorAll('.segm').forEach(function(group){group.classList.add('v20-control-group')});
    return count;
  }
  function markRows(scr,key){
    var count=0;
    scr.querySelectorAll('.li').forEach(function(row){row.classList.add('v20-readable-row');count++});
    if(fuelKeys.has(key)){
      scr.querySelectorAll('.card.row.sb,.card.row,[data-fi] .li').forEach(function(row){
        var text=(row.textContent||'');
        if(/breakfast|lunch|dinner|snack|meal|kcal|protein|restaurant|Apple Health|MyFitnessPal|Lose It/i.test(text)){row.classList.add('v20-meal-row');count++}
      });
    }
    if(habitKeys.has(key))scr.querySelectorAll('.card.col').forEach(function(card){card.classList.add('v20-habit-card');count++});
    return count;
  }
  function markMedia(scr){
    var count=0;scr.querySelectorAll('.ph-img').forEach(function(image){var frame=image.parentElement;if(frame){frame.classList.add('v20-result-media');count++}});return count;
  }

  window.__V20Passes=window.__V20Passes||[];
  window.__V20Passes.push({
    id:'body',
    keys:keys,
    apply:function(sc,scr){
      var key=keyOf(sc);if(!scr||!keySet.has(key))return {structural:false,changes:[]};
      var chapter=chapterOf(sc,key),changes=[],structural=false;
      scr.classList.add('v20-body','v20-body--'+chapter,'v20-body--'+key);
      scr.dataset.v20Body=key;
      var controls=markControls(scr),evidence=markEvidence(scr),rows=markRows(scr,key),media=markMedia(scr);
      if(geometryKeys.has(key)){
        scr.classList.add('v20-body--geometry');
        changes.push('scoped type and control hierarchy; original camera/live/breathe geometry retained');
        if(evidence)changes.push('source, estimate and safety copy kept visible');
        return {structural:false,changes:changes};
      }
      var root=contentRoot(scr);if(root){
        root.classList.add('v20-body-content');
        if(wrapLeading(root,leadingCount[key]||0,key)){structural=true;changes.push('existing leading reading/result grouped without replacing content')}
        var groups=wrapCardRuns(root);if(groups){structural=true;changes.push('existing detail cards gathered into coherent driver groups')}
      }
      if(rows)changes.push((fuelKeys.has(key)?'meal/detail rows made easier to scan':'detail rows made easier to scan'));
      if(habitKeys.has(key)&&rows)changes.push('habit cards given a consistent reading rhythm');
      if(controls)changes.push('confirm, correction and supporting controls given consistent hierarchy');
      if(evidence)changes.push('source, estimate, calibration and safety copy kept full-width and visible');
      if(media)changes.push('existing result imagery retained as the visual lead');
      if(!changes.length)changes.push('scoped Body/Fuel/Habits spacing and type refinement');
      return {structural:structural,changes:changes};
    }
  });
})();
