// life · V26 — picture-forward samples: the ideas we first left out, remade in life's own colours and photographs.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, dock, bars, line, orb, chip } = K;

  // From Kiwifruit (14): a list where every item is a photograph.
  K.screen('x-pic-ideas', { title: 'Picture-forward · Ideas', from: '14, 15', note: 'What we left: lists made of photographs. Learn’s ideas as picture cards, the first one tall.', build: () => `${status()}${pushBar('', round('search', { label: 'Search ideas' }))}
    <div class="scroll"><div class="rise">
      <div class="between"><span class="t30">Learn</span><span class="callout">7 applied</span></div>
      <button class="pcard press mt16" style="${img('bench')};height:300px"><span class="topline"><span class="chip onphoto">Today’s idea · 60 sec</span><span class="round" style="background:var(--photo-fill);color:var(--on-photo)">${ic('book', 's18')}</span></span><span class="copy"><b>The barbell</b><span>Keep most of your money boringly safe so you can afford a few small, bold bets.</span></span></button>
      <div class="pgrid mt12">
        <button class="pcard press" style="${img('aimwrite')};height:190px"><span class="topline"><span class="chip onphoto">Applied</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Remove before you add</b><span>You cancelled Netflix</span></span></button>
        <button class="pcard press" style="${img('sunday')};height:190px"><span class="topline"><span class="chip onphoto">New</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Room for error</b><span>Your buffer</span></span></button>
        <button class="pcard press" style="${img('freedom')};height:150px"><span class="topline"><span class="chip onphoto">60 sec</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Invert the problem</b></span></button>
        <button class="pcard press" style="${img('friends')};height:150px"><span class="topline"><span class="chip onphoto">2 min</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Ask a better question</b></span></button>
      </div>
    </div></div>` });

  // From Kiwifruit (14): the day's food as photographs.
  K.screen('x-pic-fuel', { title: 'Picture-forward · Today’s food', from: '14, 12', note: 'What we left: every meal as its own photograph. The day’s food as picture cards with the numbers on them.', build: () => `${status()}${pushBar('', round('add', { label: 'Log a meal' }))}
    <div class="scroll"><div class="rise">
      <div class="between" style="align-items:flex-end"><div><span class="eyebrow">Fuel · Monday</span><div class="xl" style="margin-top:6px">880<small>kcal left</small></div></div><span class="chip done" style="margin-bottom:10px">On track</span></div>
      <button class="pcard press mt20" style="${img('food')};height:230px;background-position:38% 45%"><span class="topline"><span class="chip onphoto">Lunch · 12:40</span><span class="chip onphoto">Fits today · 8.4</span></span><span class="copy"><b>Salmon rice bowl</b><span>705 kcal · 49g protein</span></span></button>
      <div class="pgrid mt12">
        <button class="pcard press" style="${img('breakfast')};height:180px"><span class="topline"><span class="chip onphoto">08:10</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Yoghurt, berries, oats</b><span>420 kcal</span></span></button>
        <button class="pcard press" style="${img('snack')};height:180px"><span class="topline"><span class="chip onphoto">16:00</span></span><span class="copy"><b style="font-size:16px;line-height:21px;letter-spacing:-.22px">Apple and peanut butter</b><span>285 kcal</span></span></button>
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span class="thumb" style="${img('cook')}"></span><span style="flex:1"><span class="title" style="display:block">Dinner from what you have</span><span class="callout">3 ideas that finish your protein</span></span><span class="chev">${ic('chev', 's16')}</span></button>
    </div></div>` });

  // From ALONE (10): the photograph edge to edge. No panel at all: the owner tried the shade and the solid
  // panel and wanted it like the approved Welcome, so this is that same treatment as the second page.
  K.screen('x-pic-welcome', { title: 'Picture-forward · Welcome, second page', from: '10', note: 'The same treatment as Welcome: one photograph edge to edge, words low and left, one round arrow. No panel over the picture.', build: () => `<div class="full-photo fade" style="${img('movein')};background-position:62% center"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><div class="bar-id" style="color:var(--on-photo)"><span class="orb22" data-orb="ring" style="color:var(--on-photo)"></span><b style="color:var(--on-photo);font-size:20px;letter-spacing:-.4px">life</b></div><button class="txt" style="color:var(--on-photo)">Skip</button></header>
    <div style="flex:1"></div>
    <div class="on-photo" style="position:relative;z-index:2;padding:0 20px 34px">
      <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600"><b>A place of your own.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:12px">life keeps <b>the deposit</b>, <b>the dates</b> and <b>the paperwork</b> moving.</p>
      <div class="between mt32"><span class="dash"><i></i><i class="on"></i><i></i></span><button class="round press" style="width:56px;height:56px;background:var(--on-photo);color:#0D0E10" aria-label="Next">${ic('arrow')}</button></div>
    </div>` });

  // From Zero (9) and Pocket (8): the abstract image, made from life's own dots.
  K.screen('x-pic-orb', { title: 'Picture-forward · life, thinking', from: '9, 8', note: 'What we left: abstract imagery. Ours is the orb itself, large, as the picture.', build: () => `${status()}
    <header class="bar"><span></span><button class="txt">Skip</button></header>
    <div class="scroll" style="display:flex;flex-direction:column">
      <div style="flex:1;display:grid;place-items:center;min-height:330px">${orb('thinking', 260)}</div>
      <span class="eyebrow">So they built me.</span>
      <p class="display"><b>I adapt to you,</b> not the other way round.</p>
    </div>
    <div class="foot"><div class="pager"><button class="back press" aria-label="Back">${ic('back', 's18')}</button><button class="btn press">Next ${ic('arrow', 's18')}</button></div></div>` });
})();
