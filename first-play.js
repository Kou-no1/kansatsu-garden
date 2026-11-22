(() => {
  'use strict';

  const key = 'kansatsu-garden.first-play.v1';
  const destination = '#atlas/asia/rice';
  const app = () => window.GardenApp;
  const farmer = () => window.GardenFarmer;
  const icon = (name, size = 17) => app().icon(name, size);
  const esc = value => app().escape(value);
  const chapters = ['田んぼへ旅する', '調べて種もみを持ち帰る', '庭に植える', '水のおせわをする'];
  const calls = ['田んぼへ出発', 'イネを調べる', 'たねぶくろを開く', 'イネのおせわへ'];
  const hints = [
    '世界地図をひらいて、日本の新潟平野にある田んぼをたずねるよ。',
    'お米はどこに実るかな？　イネのひみつを読んでクイズをとこう。正解したら種もみを持ち帰れるよ。',
    '持ち帰った種もみが待っているよ。たねぶくろでイネをえらんで植えよう。',
    'イネが育つ田んぼの水位を見てみよう。おせわをすると経験値がふえるよ。'
  ];
  let finishedHere = false;
  let mode = initialMode();
  let installPending = false;

  function initialMode() {
    try {
      const saved = localStorage.getItem(key);
      if (['offered', 'active', 'hidden', 'done'].includes(saved)) return saved;
      // Older gardens keep their usual home screen. Help always opens the tour.
      const returning = Object.keys(localStorage).some(name => name.startsWith('kansatsu-garden.'));
      const initial = returning ? 'hidden' : 'offered';
      localStorage.setItem(key, initial);
      return initial;
    } catch { return 'offered'; }
  }

  function setMode(next) {
    mode = next;
    try { localStorage.setItem(key, next); } catch { /* The tour also works for this session. */ }
  }

  function progress() {
    const state = farmer().snapshot();
    const plants = farmer().getPlants().filter(p => p.species === 'rice');
    const cared = plants.find(p => p.waterDays > 0);
    if (cared) return {step:4, plant:cared};
    if (plants.length) return {step:3, plant:plants[0]};
    if (state.seeds.rice > 0) return {step:2};
    return {step:state.trips.includes('atlas:asia') ? 1 : 0};
  }

  function button(action, text, style = 'fp-link') {
    return '<button type="button" class="' + style + '" data-fp="' + action + '">' + text + '</button>';
  }

  function homeCard() {
    if (mode === 'hidden' || (mode === 'done' && !finishedHere)) return '';
    const {step} = progress();
    const done = step === chapters.length;
    return '<section class="fp-card" aria-label="はじめての庭たび">' +
      '<div class="fp-portrait">' + app().art('rice', done ? 1 : 3) + '</div><div class="fp-intro"><h2>' +
      (done ? 'はじめてのイネ、おせわできたね！' : 'はじめての庭たび') + '</h2><p>' +
      (done ? 'イネは画面を閉じている間も育つよ。' : mode === 'active' ? 'つづきから　' + chapters[step] : '新潟の田んぼで、イネの種もみを見つけよう。') +
      '</p></div><div class="fp-card-actions">' +
      (done ? '' : button('open', (mode === 'active' ? '旅のつづきへ' : '旅をはじめる') + icon('arrow-right'), 'button primary')) +
      button('install', 'ホーム画面に追加') + button('hide', '案内をしまう') + '</div></section>';
  }

  function open() {
    const {step} = progress();
    const done = step === chapters.length;
    const list = chapters.map((name, i) =>
      '<li' + (i === step ? ' aria-current="step"' : '') + '><span class="fp-dot">' +
      (i < step ? icon('check',13) : i + 1) + '</span>' + name + '</li>').join('');
    app().modal('はじめての庭たび', '<section class="fp-tour"><div class="fp-trip-intro">' + app().art('rice', done ? 1 : 3) +
      '<div><small>日本・新潟平野</small><h3>' + (done ? 'イネのおせわ、できたね！' : 'イネに会いにいこう') +
      '</h3></div></div><ol class="fp-chapters">' + list + '</ol><p>' +
      (done ? '種もみから育てたイネは、どんなすがたになるかな？　また庭で会いに来てね。' : hints[step]) +
      '</p><div class="fp-actions">' + (done ? button('garden', 'わたしの庭へ', 'button primary') :
        button('go', calls[step] + icon('arrow-right'), 'button primary')) +
      button('install', 'ホーム画面に追加') + '</div>' + button('hide', '案内をしまう') + '</section>');
  }

  function paintInstall(panel) {
    const status = window.GardenPWA.status();
    panel.querySelector('[data-fp-install-heading]').textContent = status.installed ? 'ホーム画面から庭へ' : '庭のアイコンを追加しよう';
    panel.querySelector('[data-fp-install-hint]').textContent = status.installHint;
    panel.querySelector('[data-fp-offline]').textContent = status.offlineHint;
    const native = panel.querySelector('[data-fp="prompt"]');
    native.hidden = !status.canInstall || installPending;
  }

  function openInstall() {
    const root = app().modal('ホーム画面に追加', '<section class="fp-install"><div class="fp-app-heading">' +
      '<img src="assets/apple-touch-icon.png" width="60" height="60" alt=""><h3 data-fp-install-heading></h3></div>' +
      '<p data-fp-install-hint></p>' + button('prompt', 'ホーム画面に追加する', 'button primary') +
      '<div class="fp-offline"><h4>' + icon('globe') + ' オフラインの準備</h4><p data-fp-offline role="status"></p></div>' +
      '<p data-fp-install-result role="status"></p>' + button('back', '庭たびの案内へ') + '</section>');
    paintInstall(root.querySelector('.fp-install'));
  }

  function go() {
    const {step, plant} = progress();
    if (mode !== 'active') setMode('active');
    if (step < 2) {
      if (location.hash !== destination) {
        app().closeModal();
        location.hash = destination;
      } else {
        window.GardenStudy.open('rice', {mapId:'atlas', regionId:'asia'});
      }
    } else if (step === 2) window.GardenVirtual.openSeeds();
    else if (step === 3) window.GardenVirtual.openPlant(plant.id);
    else open();
  }

  function updateMapGuide() {
    const old = document.querySelector('[data-fp-map]');
    if (location.hash !== destination || (mode !== 'active' && !finishedHere)) { old?.remove(); return; }
    const anchor = document.querySelector('#map-view');
    if (!anchor) return;
    const {step} = progress();
    if (old?.dataset.fpMap === String(step)) return;
    old?.remove();
    anchor.insertAdjacentHTML('beforebegin', '<section class="fp-map" data-fp-map="' + step + '" aria-label="はじめての庭たび">' +
      '<span>' + icon('globe') + ' はじめての庭たび</span><strong>' +
      (step === 4 ? 'イネのおせわ、できたね！' : step <= 1 ? '新潟の田んぼについたよ！' : chapters[step]) + '</strong>' +
      (step === 4 ? button('garden', 'わたしの庭へ', 'button primary') + button('install', 'ホーム画面に追加') :
        button('go', (step < 2 ? 'イネを調べる' : calls[step]) + icon('arrow-right',15), 'button primary')) + '</section>');
  }

  document.addEventListener('click', async event => {
    const control = event.target.closest('[data-fp]');
    if (!control) return;
    const action = control.dataset.fp;
    if (action === 'open' || action === 'back') open();
    else if (action === 'go') go();
    else if (action === 'install') openInstall();
    else if (action === 'hide' || action === 'garden') {
      finishedHere = false;
      if (action === 'hide' && mode !== 'done') setMode('hidden');
      app().closeModal();
      if (action === 'garden') location.hash = '#garden';
      app().refresh();
      updateMapGuide();
    } else if (action === 'prompt' && !installPending) {
      const panel = control.closest('.fp-install');
      installPending = true;
      control.disabled = true;
      try {
        const result = await window.GardenPWA.install();
        if (panel.isConnected) panel.querySelector('[data-fp-install-result]').textContent = result === 'accepted' ?
          '追加を受け付けたよ。' : result === 'dismissed' ? 'あとからでも追加できるよ。' : 'ブラウザーの案内を確かめてね。';
      } finally {
        installPending = false;
        if (panel.isConnected) { control.disabled = false; paintInstall(panel); }
      }
    }
  });

  window.addEventListener('garden-pwa-change', () => {
    const panel = document.querySelector('dialog[open] .fp-install');
    if (panel) paintInstall(panel);
  });
  window.addEventListener('garden-farmer-change', () => {
    if (mode !== 'active') return;
    if (progress().step === chapters.length) {
      setMode('done');
      finishedHere = true;
    }
    requestAnimationFrame(updateMapGuide);
  });
  window.addEventListener('hashchange', () => requestAnimationFrame(updateMapGuide));
  window.addEventListener('storage', event => {
    if (event.key === key && event.newValue) {
      mode = event.newValue;
      finishedHere = false;
      requestAnimationFrame(updateMapGuide);
    }
  });
  window.GardenFirstPlay = {homeCard, open, openInstall};
})();
