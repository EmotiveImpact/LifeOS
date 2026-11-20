/* Rendered geometry checks, intentionally separate from subjective design approval. */
window.validateV21=function(){
  var a=window.__V21_AUDIT,results=[],failures=[];
  function real(n){return n&&n.getClientRects().length&&getComputedStyle(n).display!=='none'&&!n.closest('[hidden]')}
  document.querySelectorAll('.shot').forEach(function(shot){var scr=shot.querySelector('.screen'),bounds=scr.getBoundingClientRect(),z=bounds.width/393,body=scr.querySelector('.v21-body'),header=scr.querySelector('.v21-header'),footer=scr.querySelector('.v21-footer'),nav=scr.querySelector('.v21-bottom-nav'),key=shot.id.replace(/^s-/,''),mode=scr.dataset.v21Mode;var issues=[];
    function box(n){if(!n)return null;var r=n.getBoundingClientRect();return{top:Math.round((r.top-bounds.top)/z*10)/10,bottom:Math.round((r.bottom-bounds.top)/z*10)/10,width:Math.round(r.width/z*10)/10,height:Math.round(r.height/z*10)/10}}
    var h=box(header),b=box(body),f=box(footer),n=box(nav);
    if(mode!=='preserve'){
      if(!h||!b)issues.push('Missing header or bounded content viewport');
      if(h&&b&&b.top<h.bottom-1)issues.push('Content overlaps header');
      if(f&&b&&b.bottom>f.top+1)issues.push('Content overlaps action footer');
      if(n&&b&&b.bottom>n.top+1)issues.push('Content overlaps bottom navigation');
      if(b&&b.height<160)issues.push('Content viewport too short');
      if(body&&body.scrollWidth>body.clientWidth+2)issues.push('Horizontal page overflow');
      if(body&&body.querySelector('.tb,.tb-root,.pinned,.status'))issues.push('Duplicate legacy chrome inside content');
      if(body&&Array.from(body.querySelectorAll(':scope > .v21-content > *')).some(e=>getComputedStyle(e).position==='absolute'&&e.querySelector('button,input,textarea')))issues.push('Absolute page controls inside scroll content');
      if(header&&header.querySelectorAll('.v21-topbar').length!== (key==='welcome'?0:1))issues.push('Wrong number of top bars');
      if(footer&&footer.scrollHeight>footer.clientHeight+2)issues.push('Footer needs its own scroll');
      // Only top-level footer controls: nested sliders/charts/figures have their own rules.
      if(footer)Array.from(footer.querySelectorAll('button.btn')).filter(real).forEach(function(button){var r=box(button);if(r.top<f.top-1||r.bottom>f.bottom+1)issues.push('Footer button outside footer')});
    }
    var loaded=Array.from(scr.querySelectorAll('img')).filter(i=>i.complete&&!i.naturalWidth);if(loaded.length)issues.push('Broken image');
    var row={key:key,mode:mode,header:h,body:b,footer:f,nav:n,issues:issues};results.push(row);if(issues.length)failures.push(row);
  });
  a.layoutResults=results;a.layoutFailures=failures;a.designStatus=failures.length?'Layout corrections remaining':'Geometry checks passed; representative visual review recorded separately';
  return{screens:results.length,normalised:results.filter(r=>r.mode!=='preserve').length,customGeometry:results.filter(r=>r.mode==='preserve').length,failures:failures,missingReview:a.rows.filter(r=>!r.review||String(r.review).startsWith('Awaiting')).map(r=>r.key),preservationErrors:a.errors};
};
// Font loading may change wrapping, never the header/content layout contract.
window.validateV21();
if(document.fonts)document.fonts.ready.then(function(){window.validateV21()});
