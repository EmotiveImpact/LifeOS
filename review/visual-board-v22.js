/* V22 builds on the original nodes: hierarchy changes without dropping their listeners. */
(function integrateV22(){
  var decisions=[];
  SC.forEach(function(sc){var scr=byKey[sc.key].el.querySelector('.screen');scr.classList.add('v22-screen');
    var photograph=scr.querySelector(':scope > .t-band img,:scope > .t-cover img');
    if(photograph&&scr.querySelector(':scope > .v21-header')){scr.classList.add('v22-photo-header');decisions.push({key:sc.key,change:'Header continues the photograph; readable paper controls, no opaque white cap.'})}
  });
  var home=byKey.today.el.querySelector('.screen');home.classList.add('v22-today');
  var action=home.querySelector('.v18-continue');if(action){var row=action.parentElement;row.classList.add('v22-next-action');var identity=row.querySelector(':scope > .col'),photoBody=home.querySelector('[data-v19-move-photo] .body');if(identity&&photoBody){identity.classList.add('v22-next-identity');photoBody.appendChild(identity)}action.firstChild&&action.firstChild.nodeType===Node.TEXT_NODE&&(action.firstChild.textContent='Continue');}
  var label=home.querySelector('.v18-next-label');if(label)label.textContent='One useful next move';
  var photo=home.querySelector('[data-v19-move-photo] .pchip');if(photo)photo.textContent='A little time, well spent.';
  var cap=byKey.today.el.querySelector('.shot-cap');cap.querySelector('b').textContent='Today · V22';cap.querySelector('b').nextElementSibling.textContent='Calmer reference weight, life’s editorial identity. Check-in recedes after completion. Aim, five body signals, questions and dates remain; the next action has room to breathe.';
  document.querySelector('.mark').lastElementChild.textContent='life · V22 · local implementation';
  var intro=document.querySelector('#v21-showcase');intro.querySelector('.eyebrow').textContent='V22 · one shared language, seven implementation passes';intro.querySelector('.h-sec').textContent='One life. One considered language.';intro.querySelector('.p-sec').textContent='The calmer reference’s weight, with life’s original depth. The complete screen library remains. The language and screen-family refinements are now implemented in the local Expo application; this HTML is the design reference, not a signed native build.';
  var summary=document.querySelector('.p-lead');if(summary)summary.textContent='V22: one shared design language, refined through seven bounded passes. Preserve life’s depth; make the useful next thing clear; let completion give space back. All 221 original screens remain. The local Expo app is updated; live integrations and native-device acceptance are separate, documented work.';
  window.__V22_AUDIT={pass:7,totalPasses:7,designPassesComplete:true,productionReady:false,screens:SC.length,decisions:decisions,appApplied:true,implementation:window.__V22_IMPLEMENTATION};
  var receipt=document.createElement('div');receipt.className='v21-board-note';receipt.innerHTML='<strong>Implemented locally, not just mocked.</strong> Shared chrome, controls, photography and screen-family compositions are in the Expo app. Check-in uses the local day; completion gives space back; sample/provider boundaries are explicit. Mobile typecheck and iOS/Android JS exports pass. This does not prove signed native compilation, live integrations or perfection on every device. Defects and remaining work: bugsandfixes.md.';intro.querySelector('.v21-grid').insertAdjacentElement('beforebegin',receipt);
})();
