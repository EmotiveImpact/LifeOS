/* One deterministic phone-shell system. No delayed scroll offsets or layered v20 overrides. */
(function defineV21Layout(){
  var preserveKeys=new Set(['snap','barcode','labelscan','workout','levelup','nudge','teachplay','orb','orbnext','topbars','widgets','sharecard','watch','lockpush','androidwidget','siri']);
  var immersiveKeys=new Set(['welcome','glimpse','levelup','yourbirthday','gotit']);
  var rootKeys=new Set(['today','plan','you','emptytoday','loadingtoday','emptyplan']);
  var bodyOnlyKeys=new Set(['talk']);
  var titles={money:'Money',taxcheck:'Tax & NI',understood:'What life understood',confirm:'Lunch · 12:40',bite:'Tax codes',predict:'Tax codes',puzzle:'Tax codes',bitedrawn:'Tax codes',tellback:'Your turn',chat:'life',ask:'Ask life',why:'Why today is lighter',attach:'Attach',pulse:'How are you arriving?',signin:'Keep your plan safe',newgoal:'A new goal',aimnew:'Your Chief Aim',blood:'Bloodwork',foodsearch:'Find food',mealresult:'Your meal',fuel:'Fuel',fuelhome:'Fuel',ondevice:'Private mode',aimodels:'On this phone',settings:'Settings',calendar:'Your day'};
  function direct(parent,selector){return Array.from(parent.children).filter(function(n){return n.matches(selector)})}
  function newNode(tag,cls){var n=document.createElement(tag);n.className=cls;return n}
  function oldNav(host){return host.querySelector(':scope > .tb,:scope > .tb-root')||host.querySelector(':scope > .pinned > .tb,:scope > .pinned > .tb-root')||host.querySelector(':scope > .scroll > .tb,:scope > .scroll > .tb-root')||direct(host,'.pad.row.sb').find(function(n){return n.querySelector(':scope > .sq')})||host.querySelector('.scroll > .pad.row.sb:has(> .sq)')}
  function isActionNode(n){return n.matches('button.btn,button.bigmic,.talk-foot')||n.matches('.row,.col,.pad')&&!!n.querySelector('.btn,.bigmic,.sqb')&&!n.querySelector('.t-statement,.t-title1,input,textarea,.card')}
  function parentKey(sc){return ['body','fuel','habits'].includes(sc.ch)?'body':['learn','teach'].includes(sc.ch)?'library':['you','self','people','settings'].includes(sc.ch)?'you':'plan'}
  function buttonize(n,label,fallback){if(!n){n=newNode('button','sq press');n.innerHTML=label==='Back'?IC.back:IC.close}n.classList.add('v21-icon-action');n.setAttribute('aria-label',n.getAttribute('aria-label')||label);if(n.tagName!=='BUTTON'){n.setAttribute('role','button');n.tabIndex=0;n.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();n.click()}})}if(!n.dataset.jump&&fallback)n.dataset.jump=fallback;return n}
  function headerFor(sc,scr,host,bar,sheet){
    var header=newNode('header','v21-header');
    var status=host.querySelector('.status')||scr.querySelector('.status');
    if(!sheet){if(!status){var temp=document.createElement('div');temp.innerHTML=STATUS;status=temp.firstElementChild}status.classList.remove('on-img');header.appendChild(status)}
    if(sc.key==='welcome')return header;
    var sourceBar=bar&&bar.classList.contains('sheet')?bar.querySelector(':scope > .row')||bar:bar;
    var top=newNode('div','v21-topbar');var root=rootKeys.has(sc.key);if(root)top.classList.add('v21-topbar--root');
    var left=newNode('div','v21-left'),center=newNode('div','v21-center'),right=newNode('div','v21-right');
    var existingTitle=sourceBar&&sourceBar.querySelector(':scope > .tb-t,:scope > .t-title3,:scope > .t-callout');
    var titleText=titles[sc.key]||(existingTitle&&existingTitle.textContent.trim())||sc.title;
    if(root){var rootTitle=bar&&bar.querySelector('.t-title1');center.innerHTML='<span class="v21-eyebrow">'+(sc.key==='today'?'Monday, 16 Nov':sc.key==='plan'?'Your next moves':'Your life, connected')+'</span>';var name=newNode('span','v21-page-title');name.textContent=rootTitle?rootTitle.textContent:sc.key==='plan'?'Plan':sc.key==='you'?'You':'Today';center.appendChild(name);if(bar){var actions=bar.lastElementChild;if(actions&&actions!==rootTitle&&actions.matches('.row'))while(actions.firstChild)right.appendChild(actions.firstChild)}left.hidden=true;}
    else{
      var first=sourceBar&&sourceBar.firstElementChild,last=sourceBar&&sourceBar.lastElementChild;
      var close=sc.type==='Sheet'||sc.type==='Full screen'||sc.type==='Overlay';
      var oldClose=sourceBar&&sourceBar.querySelector('[aria-label="Close"]');
      if(!['welcome'].includes(sc.key))left.appendChild(buttonize(oldClose||(first&&first.matches('.sq,button,[role=button]')?first:null),close?'Close':'Back',close?'today':parentKey(sc)));
      var title=newNode('span','v21-title');title.textContent=titleText;title.setAttribute('title',titleText);center.appendChild(title);
      if(bar&&last&&last.parentNode===sourceBar&&last!==first&&last!==existingTitle&&(last.matches('button,.sq,.tb-txt,.t-mono')||last.querySelector('button'))){right.appendChild(last);if(last.matches('.sq'))buttonize(last,last.getAttribute('aria-label')||'More')}
      if(sheet){var actualClose=host.querySelector(':scope > [aria-label="Close"]');if(actualClose){left.replaceChildren(actualClose);buttonize(actualClose,'Close','today')}}
    }
    top.append(left,center,right);header.appendChild(top);
    if(sheet){header.classList.add('v21-header--sheet');var grab=newNode('i','v21-grab');header.prepend(grab)}
    if(bar){if(!root)Array.from((sourceBar||bar).children).forEach(function(n){if(n===existingTitle||n.matches('.tb-sp,.tb-grab,.grab')||!n.textContent.trim()&&!n.querySelector('input,button'))return;var extra=newNode('div','v21-header-extra');extra.appendChild(n);header.appendChild(extra)});bar.remove()}
    return header;
  }
  function cleanContainer(n){['position','top','bottom','left','right','inset','height','max-height','width','overflow','overflow-y','padding-top','padding-bottom','flex'].forEach(function(p){n.style.removeProperty(p)});n.classList.add('v21-content-group');}
  function normalize(sc,scr){
    scr.dataset.v21Key=sc.key;scr.classList.add('v21-screen');
    if(preserveKeys.has(sc.key)||sc.ch==='outside'||sc.ch==='system'){
      scr.dataset.v21Mode='preserve';scr.querySelectorAll('.status').forEach(function(n){n.classList.add('v21-status-preserved')});return {mode:'preserve',reason:'Purpose-built camera/live/system/platform geometry retained',body:null};
    }
    var sheet=Array.from(scr.querySelectorAll(':scope > .sheet')).find(function(n){return !n.classList.contains('tb')});
    var talk=sc.key==='talk'?scr.querySelector(':scope > .talk'):null;
    var host=sheet||talk||scr;
    var nav=oldNav(host)||(!sheet?oldNav(scr):null);
    var previousPinned=Array.from(scr.querySelectorAll(':scope > .pinned'));
    var footers=direct(host,'div,.talk-foot').filter(function(n){return n!==nav&&((n.style.position==='absolute'&&n.style.bottom&&!n.style.top&&(n.querySelector('button,input,textarea,.mic')||n.textContent.trim()))||n.matches('.talk-foot'))});
    var originalScroll=host.querySelector(':scope > .scroll');
    var body=newNode('main','scroll v21-body');body.tabIndex=0;body.setAttribute('aria-label',sc.title+' content');
    var content=newNode('div','v21-content');
    var footer=newNode('footer','v21-footer');
    var header=headerFor(sc,scr,host,nav,!!sheet);
    // Detach true action footers before gathering content; they remain outside scrolling.
    footers.forEach(function(n){cleanContainer(n);if(n.querySelector('.card,input,textarea')&&!n.matches('.talk-foot')){var actions=direct(n,'button.btn,.row:has(>button.btn)');actions.forEach(function(a){footer.appendChild(a)});}else{n.classList.add('v21-footer-group');footer.appendChild(n)}});
    if(sheet){var grab=host.querySelector(':scope > .grab');if(grab)grab.remove();var heading=direct(host,'.t-title1,.t-title2,.t-title3').find(function(n){return n.textContent.trim()===header.querySelector('.v21-title').textContent.trim()});if(heading)heading.remove();}
    var backgrounds=direct(host,'.glow,.t-cover,.t-band,.dimmer,.notch,.v18-nav,.v19-receipt');
    var chromeNodes=new Set([header,footer,body,content].concat(backgrounds).concat(previousPinned));
    if(originalScroll){Array.from(originalScroll.childNodes).forEach(function(n){if(n.nodeType===1&&n.matches('.status,.tb,.tb-root'))return;content.appendChild(n)});originalScroll.remove()}
    Array.from(host.children).forEach(function(n){
      if(chromeNodes.has(n)||n.matches('.status,.pinned,.tb-grab,.v18-nav')||footer.contains(n)||n===sheet)return;
      if(n.matches('.glow,.t-cover,.t-band,.notch'))return;
      if(n.matches('.isl')){n.classList.add('v21-processing');content.prepend(n);return}
      if(n.matches('.transcript')){n.classList.add('v21-transcript');content.appendChild(n);return}
      if(n.matches('.wave,.tray')){n.style.position='relative';n.style.inset='auto';n.style.height=n.matches('.wave')?'36px':'auto';footer.prepend(n);return}
      content.appendChild(n);
    });
    // Clear absolute page positioning, never the geometry inside illustrations.
    Array.from(content.children).forEach(function(n){if(n.matches('.pad,.col,.row,.talk,.sheet')&&!n.matches('.t-cover,.t-band')){var onImage=n.classList.contains('on-img');var top=parseFloat(n.style.paddingTop)||0;cleanContainer(n);if(onImage&&top>60)n.style.paddingTop=Math.max(24,top-56)+'px';else if(!onImage&&top>=30&&scr.querySelector(':scope > .t-band')){n.classList.add('v21-image-follow');n.style.setProperty('--v21-image-gap',Math.min(top,56)+'px')}if(sc.key==='welcome'&&n.classList.contains('on-img'))n.style.paddingTop='32px'}if(n.matches('.glow,.t-cover,.t-band')){host.insertBefore(n,host.firstChild)}});
    // Move final standalone confirm/next controls into the footer for a predictable finish.
    if(!footer.children.length){var columns=Array.from(content.querySelectorAll(':scope > .pad.col,:scope > .col'));var tail=columns[columns.length-1]||content;var actions=[];var nodes=Array.from(tail.children);for(var i=nodes.length-1;i>=0;i--){var n=nodes[i];if(n.matches('button.btn,.row:has(>button.btn)'))actions.unshift(n);else if(!actions.length&&n.matches('.t-callout.c2'))continue;else break}if(actions.length&&actions.length<=3)actions.forEach(function(n){footer.appendChild(n)})}
    if(!content.children.length&&content.textContent.trim()==='')body.classList.add('v21-body--empty');body.appendChild(content);
    previousPinned.forEach(function(n){if(n.parentNode)n.remove()});
    if(sheet){scr.dataset.v21Mode='sheet';sheet.classList.add('v21-sheet-frame');Array.from(scr.children).forEach(function(n){if(n!==sheet&&!n.matches('.notch,.status,.glow,.dimmer')){n.classList.add('v21-underlay');n.setAttribute('aria-hidden','true');n.style.pointerEvents='none'}});sheet.append(header,body);if(footer.children.length)sheet.appendChild(footer);}
    else{scr.dataset.v21Mode=immersiveKeys.has(sc.key)?'immersive':'standard';if(talk){Array.from(talk.children).forEach(function(n){if(n.matches('.status'))n.remove()});talk.replaceWith(header,body);if(footer.children.length)scr.insertBefore(footer,scr.querySelector('.v18-nav'));}
      else{var bottom=scr.querySelector(':scope > .v18-nav');scr.insertBefore(header,bottom);scr.insertBefore(body,bottom);if(footer.children.length)scr.insertBefore(footer,bottom)}
    }
    // Root nav remains in flow below content. Content cannot sit behind it.
    scr.querySelectorAll(':scope > .v18-nav').forEach(function(n){n.classList.add('v21-bottom-nav')});
    return {mode:scr.dataset.v21Mode,body:body,header:header,footer:footer.children.length?footer:null};
  }
  window.__V21Normalize=normalize;
})();
