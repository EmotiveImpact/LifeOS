/* v20 shell pass: clarify setup, Talk, Settings, states and detail screens without changing their content. */
(function registerV20ShellPass(){
  'use strict';

  var CHAPTER_KEYS={
    start:['welcome','question','tell','building','where','signin','healthprimer','notifprimer','micprimer','camprimer','calprimer','devicesetup','firstmove','measuresetup'],
    talk:['talk','understood','ask','attach','scan','chat','chathistory','editfiled'],
    today:['nudge','pulse','checkin','customise','routines','why','calendar','morningbrief','evening','inbox','search','focus'],
    you:['household','mood','children','knows','levels','experiment','memory','shared','profile'],
    settings:['plus','settings','notifs','ondevice','yourai','appearance','services','privacy','deleteacct','subscription','plussuccess','help','legal','aimodels'],
    states:['emptytoday','offline','loadingtoday','emptyplan','emptybody','permdenied','syncissue','aidown','forceupdate','signedout','connectfail','support'],
    outside:['widgets','sharecard','watch','lockpush','androidwidget','siri'],
    system:['orb','topbars','orbnext']
  };
  var KEYS=Object.keys(CHAPTER_KEYS).reduce(function(all,chapter){return all.concat(CHAPTER_KEYS[chapter])},[]);
  var KEY_SET=new Set(KEYS);
  var STRUCTURAL_CHAPTERS=new Set(['start','talk','today','you','settings','states']);
  var STYLE_ONLY_KEYS=new Set([
    'welcome','firstmove','talk','attach','scan','pulse','focus','nudge',
    'widgets','sharecard','watch','lockpush','androidwidget','siri',
    'orb','topbars','orbnext','camprimer'
  ]);

  function slug(value){
    return String(value||'screen').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }
  function chapterFor(key){
    var chapters=Object.keys(CHAPTER_KEYS);
    for(var i=0;i<chapters.length;i++)if(CHAPTER_KEYS[chapters[i]].indexOf(key)>=0)return chapters[i];
    return 'shell';
  }
  function addClass(node,name){
    if(!node||node.classList.contains(name))return false;
    node.classList.add(name);return true;
  }
  function directChildren(parent){return parent?Array.prototype.slice.call(parent.children):[]}
  function sameParent(nodes){
    return nodes.length&&nodes.every(function(node){return node.parentElement===nodes[0].parentElement});
  }
  function contiguous(nodes){
    if(!sameParent(nodes))return false;
    var all=directChildren(nodes[0].parentElement),start=all.indexOf(nodes[0]);
    return start>=0&&nodes.every(function(node,index){return all[start+index]===node});
  }
  function containsProtectedGeometry(node){
    return !!(node&&node.querySelector&&node.querySelector('canvas,[data-orb],[data-pf],[data-fo],[data-wv],[data-mic],[data-lock],.wave,.pfield'));
  }
  function wrapExisting(nodes,className,label,result){
    nodes=nodes.filter(Boolean);
    if(!nodes.length||!contiguous(nodes)||nodes.some(containsProtectedGeometry))return null;
    var parent=nodes[0].parentElement,wrapper=document.createElement('div');
    wrapper.className=className;
    parent.insertBefore(wrapper,nodes[0]);
    nodes.forEach(function(node){wrapper.appendChild(node)});
    result.structural=true;result.changes.push(label);
    return wrapper;
  }
  function contentBodies(scr){
    var nodes=Array.prototype.slice.call(scr.querySelectorAll('.scroll > .pad.col, .scroll > .pad.col.rel, .screen > .pad.col, :scope > .pad.col, :scope > .pad.col.rel'));
    return nodes.filter(function(node,index){
      return nodes.indexOf(node)===index&&!node.closest('.pinned')&&!node.matches('[style*="bottom:"]');
    });
  }
  function fixedActions(scr){
    return Array.prototype.slice.call(scr.querySelectorAll(':scope > .pad[style*="bottom:"], :scope > .pad.col[style*="bottom:"], .scroll + .pad[style*="bottom:"]'));
  }
  function tagContent(scr,chapter,result){
    var bodies=contentBodies(scr),fixed=fixedActions(scr),tagged=false;
    bodies.forEach(function(body){
      tagged=addClass(body,'v20-shell-body')||tagged;
      if(body.querySelector(':scope > .t-title1, :scope > .t-statement, :scope > .t-title2'))tagged=addClass(body,'v20-shell-has-lead')||tagged;
      directChildren(body).forEach(function(node){
        if(node.matches('.t-title1,.t-title2,.t-statement'))tagged=addClass(node,'v20-shell-lead')||tagged;
        if(node.matches('.t-body.c2,.t-callout.c2,.t-callout.cq'))tagged=addClass(node,'v20-shell-help')||tagged;
        if(node.matches('.card'))tagged=addClass(node,'v20-shell-section')||tagged;
        if(node.matches('button.btn'))tagged=addClass(node,'v20-shell-action')||tagged;
      });
    });
    fixed.forEach(function(node){tagged=addClass(node,'v20-shell-fixed-actions')||tagged});
    if(tagged)result.changes.push('tagged existing lead, help, section and action nodes');
    return bodies;
  }
  function wrapIntro(body,result){
    if(!body||body.querySelector(':scope > .v20-shell-intro'))return;
    var children=directChildren(body),stop=children.findIndex(function(node){
      return node.matches('.card,.segm,button.btn,[data-ticks],.ticks,.v20-shell-section-stack,.v20-shell-settings-group');
    });
    if(stop<2)return;
    wrapExisting(children.slice(0,stop),'v20-shell-intro','grouped existing title and explanation in reading order',result);
  }
  function wrapTrailingActions(body,result){
    if(!body||body.querySelector(':scope > .v20-shell-actions'))return;
    var children=directChildren(body),end=children.length-1;
    while(end>=0&&children[end].matches('.t-callout.c2,.t-callout.cq,.v20-shell-help'))end--;
    var start=end;
    while(start>=0&&children[start].matches('button.btn'))start--;
    var actions=children.slice(start+1,end+1);
    if(actions.length)wrapExisting(actions,'v20-shell-actions','grouped existing primary and secondary actions',result);
  }
  function cardRuns(body){
    var children=directChildren(body),runs=[],run=[];
    children.forEach(function(node){
      if(node.matches('.card'))run.push(node);
      else{if(run.length)runs.push(run);run=[]}
    });
    if(run.length)runs.push(run);return runs;
  }
  function wrapSectionRuns(body,result,min){
    if(!body)return;
    cardRuns(body).forEach(function(run){
      if(run.length>=(min||2))wrapExisting(run,'v20-shell-section-stack','grouped adjacent existing sections',result);
    });
  }
  function organiseSettingsHome(body,result){
    if(!body||body.querySelector(':scope > .v20-shell-settings-group'))return;
    var cards=directChildren(body).filter(function(node){return node.matches('.card')});
    if(cards.length<3)return;
    var partitions=cards.length>=5?[[0,2],[2,4],[4,cards.length]]:[[0,2],[2,cards.length]];
    partitions.forEach(function(range){
      var slice=cards.slice(range[0],range[1]);
      if(slice.length)wrapExisting(slice,'v20-shell-settings-group','grouped existing Settings rows into concise sections',result);
    });
  }
  function organiseChat(scr,result){
    var thread=scr.querySelector('[data-th]'),composer=scr.querySelector('[data-sg]');
    var changed=false;
    if(thread)changed=addClass(thread,'v20-shell-chat-thread')||changed;
    if(composer&&composer.parentElement)changed=addClass(composer.parentElement,'v20-shell-chat-composer')||changed;
    if(changed)result.changes.push('tagged the existing chat thread and composer regions');
  }
  function organiseState(body,result){
    if(!body)return;
    wrapIntro(body,result);wrapTrailingActions(body,result);
    var recovery=directChildren(body).filter(function(node){return node.matches('.card')});
    recovery.forEach(function(node){addClass(node,'v20-shell-recovery')});
    if(recovery.length)result.changes.push('identified existing recovery and retained-data sections');
  }
  function organiseStructural(sc,scr,chapter,bodies,result){
    if(!STRUCTURAL_CHAPTERS.has(chapter)||STYLE_ONLY_KEYS.has(sc.key))return;
    if(sc.key==='settings'){
      organiseSettingsHome(bodies[0],result);return;
    }
    if(sc.key==='chat'){
      organiseChat(scr,result);return;
    }
    bodies.forEach(function(body){
      wrapIntro(body,result);
      wrapTrailingActions(body,result);
      if(chapter==='settings')wrapSectionRuns(body,result,2);
      if(chapter==='today'||chapter==='you'||chapter==='talk')wrapSectionRuns(body,result,2);
      if(chapter==='states')organiseState(body,result);
    });
  }
  function tagRowsAndHeaders(scr,result){
    var changed=false;
    Array.prototype.slice.call(scr.querySelectorAll('.card > .li, .card.col > .li')).forEach(function(row){changed=addClass(row,'v20-shell-row')||changed});
    Array.prototype.slice.call(scr.querySelectorAll('.card > .row.sb:first-child, .card.col > .row.sb:first-child')).forEach(function(head){
      if(head.querySelector('.t-title3,.t-callout'))changed=addClass(head,'v20-shell-section-head')||changed;
    });
    if(changed)result.changes.push('tagged existing list rows and section headings');
  }
  function tagPreservedSurface(sc,scr,result){
    if(!STYLE_ONLY_KEYS.has(sc.key)&&sc.ch!=='outside'&&sc.ch!=='system')return;
    addClass(scr,'v20-shell-preserved-geometry');
    result.changes.push('preserved interactive or native geometry; styling scope only');
  }

  window.__V20Passes=window.__V20Passes||[];
  window.__V20Passes.push({
    id:'shell',
    keys:KEYS.slice(),
    apply:function(sc,scr){
      var result={structural:false,changes:[]};
      if(!sc||!scr||!KEY_SET.has(sc.key))return result;
      if(scr.dataset.v20ShellApplied==='true')return result;

      var chapter=chapterFor(sc.key),type=slug(sc.type||'screen');
      scr.dataset.v20ShellApplied='true';
      scr.dataset.v20ShellKey=sc.key;
      addClass(scr,'v20-shell');
      addClass(scr,'v20-shell--'+chapter);
      addClass(scr,'v20-shell--'+type);
      addClass(scr,'v20-shell--key-'+slug(sc.key));
      result.changes.push('applied '+chapter+' / '+(sc.type||'screen')+' shell scope');

      var bodies=tagContent(scr,chapter,result);
      tagRowsAndHeaders(scr,result);
      tagPreservedSurface(sc,scr,result);
      organiseStructural(sc,scr,chapter,bodies,result);
      return result;
    }
  });
})();
