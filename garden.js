(() => {
  'use strict';
  const main = document.getElementById('main');
  const dialog = document.getElementById('garden-dialog');
  const dialogBody = document.getElementById('dialog-body');
  const toastBox = document.getElementById('toast');
  const icon = window.gardenIcon;
  const v = window.GardenVirtual;
  const obs = window.GardenObservations;
  const species = window.GardenData;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day = () => new Date();
  let toastTimer;
  let page = '';
  let real = false;
  let launchFocus;
  let homeSignature = '';

  function dateKey(date) {
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  }

  function art(id, stage = 3) {
    const known = species.get(id);
    const young = ['baobab','welwitschia','morning'].includes(id) ? id + '-young' : 'leafy';
    const file = stage === 0 ? 'seed' : stage === 1 ? 'sprout' : stage === 2 || !known ? young : id;
    return '<img class="plant-art" src="assets/' + file + '.webp" alt="" draggable="false">';
  }

  function modal(title, html) {
    if (!dialog.open) launchFocus = document.activeElement;
    document.getElementById('dialog-title').textContent = title;
    dialogBody.innerHTML = html;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('showing-dialog');
    dialog.scrollTop = 0;
    document.getElementById('close-dialog').focus({preventScroll:true});
    return dialogBody;
  }

  function closeModal() {
    if (dialog.open) dialog.close();
  }

  function toast(msg) {
    clearTimeout(toastTimer);
    toastBox.textContent = msg;
    toastBox.classList.add('shown');
    toastTimer = setTimeout(() => toastBox.classList.remove('shown'), 3900);
  }

  function openGuide() {
    modal('あそびかた', '<div class="guide">' +
      '<section><span class="guide-icon amber">' + icon('sprout',23) + '</span><div><h3>キャラを育てる</h3><p>「種を植える」から植物を選んでみよう。画面を閉じている間も時間が進みます。1日1回の水やりで、キャラの成長が4時間分進みます。</p></div></section>' +
      '<section><span class="guide-icon teal">' + icon('pen',22) + '</span><div><h3>実物を観察する</h3><p>草たけと葉の数をはかって、「観察を記録する」に書こう。写真や気づきも残せます。「実物の庭」の草たけと葉が記録に合わせて変わります。</p></div></section>' +
      '<section><span class="guide-icon lilac">' + icon('chart',22) + '</span><div><h3>育ち方をくらべる</h3><p>同じ種類の鉢を2つ用意し、日当たりか肥料のどちらか一つだけを変えてみよう。「かんさつノート」で2つの鉢を選ぶと、成長を同じグラフでくらべられます。</p></div></section>' +
      '<section><span class="guide-icon amber">' + icon('book',22) + '</span><div><h3>植物のひみつを見つける</h3><p>「植物ずかん」で育つ場所や体のつくりを調べよう。クイズに正解すると、図鑑に正解の印がつきます。</p></div></section>' +
      '<p class="storage-note">記録と育成データは、この端末のこのブラウザーに保存されます。</p></div>');
  }

  function virtualCard(plant) {
    const s = species.get(plant.species);
    const level = v.stage(plant);
    const watered = v.isWatered(plant);
    return '<button type="button" class="plant-card theme-' + s.id + '" data-plant="' + escape(plant.id) + '" aria-label="' + s.name + 'のおせわ">' +
      '<span class="card-scene"><span class="stage-tag">' + icon(level === 3 && s.group === 'school' && s.id !== 'bean' ? 'flower':'leaf',13) + s.stages[level] + '</span>' +
      '<span class="scene-specks" aria-hidden="true"></span>' + art(s.id, level) + '</span>' +
      '<span class="card-info"><strong>' + s.name + '</strong><span class="card-sub">' + icon(watered?'check':'clock',14) +
      (watered?'水やりずみ':'育成 ' + (Math.floor(Math.max(0,Date.now()-plant.plantedAt)/86400000)+1) + '日目') +
      '</span><span aria-hidden="true" class="card-open">' + icon('chevron-right',17) + '</span></span></button>';
  }

  function measuredPlant(plant, maxHeight) {
    if (!plant.count) return '<div class="unmeasured">' + icon('pot',43) + '<small>これから観察</small></div>';
    const height = Math.min(100, 100*(plant.height||0)/maxHeight);
    const leaves = Math.max(0, Number(plant.leaves)||0);
    const leavesPerMark = Math.max(1, Math.ceil(leaves/64));
    const leafMarks = Math.ceil(leaves/leavesPerMark);
    let marks = '';
    for (let i=0; i<leafMarks; i++) {
      const position = 12 + (Math.floor(i/2)+0.4)*82/Math.max(1,Math.ceil(leafMarks/2));
      const fraction = Math.min(1, (leaves - i*leavesPerMark)/leavesPerMark);
      marks += '<i class="measured-leaf ' + (i%2 ? 'right':'left') + '" style="bottom:' + position.toFixed(2) + '%;scale:' + fraction.toFixed(3) + ' 1"></i>';
    }
    return '<span class="measure-garden" role="img" aria-label="草たけ' + plant.height + 'センチ、葉' + leaves + '枚">' +
      '<span class="ruler-label">' + maxHeight + ' cm</span>' + (leavesPerMark>1 ? '<span class="leaf-key">葉の印1つで' + leavesPerMark + '枚</span>':'') + '<span class="measure-ruler"></span><span class="measure-earth"></span>' +
      '<span class="measure-stem" style="height:' + height.toFixed(3) + '%">' + marks + '</span></span>';
  }

  function realCard(plant, maxHeight) {
    const details = plant.count ? escape(plant.height) + ' cm ・ 葉 ' + escape(plant.leaves) + ' 枚' : '最初の観察をしよう';
    return '<button type="button" class="plant-card theme-bean" data-observe="' + escape(plant.id) + '" aria-label="' + escape(plant.name) + 'を記録する">' +
      '<span class="card-scene"><span class="stage-tag">' + icon('sun',13) + escape(plant.light) + '・肥料' + escape(plant.fertilizer) + '</span>' +
      measuredPlant(plant, maxHeight) + '</span><span class="card-info"><strong>' + escape(plant.name) + '</strong><span class="card-sub">' + icon('ruler',14) + details +
      '</span><span aria-hidden="true" class="card-open">' + icon('pen',15) + '</span></span></button>';
  }

  function dailySpecies(date) {
    const index = Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
    return species.species[index % species.species.length];
  }

  function timeSignature(plants, now) {
    return dateKey(now) + '|' + plants.map(p=>[p.id,v.stage(p),v.isWatered(p),Math.floor((now-p.plantedAt)/86400000)].join(':')).join('|');
  }

  function missions(plants, entries, date) {
    const items = [
      {key:'care', icon:'water', color:'teal', label:'植物に水をあげよう', sub:'架空の庭で水やり', done:plants.some(p=>v.isWatered(p))},
      {key:'record', icon:'pen', color:'amber', label:'観察を記録しよう', sub:'実物の植物を観察', done:entries.some(e=>e.date===dateKey(date))},
      {key:'quiz', icon:'book', color:'lilac', label:'植物クイズに挑戦', sub:'ずかんでひとつ学ぼう', done:v.quizDoneToday()}
    ];
    const done = items.filter(i=>i.done).length;
    return '<section class="missions"><div class="side-heading"><span class="side-heading-icon">' + icon('clipboard',20) +
      '</span><h2>今日のミッション</h2><span class="mission-count">' + done + ' / 3</span></div>' +
      '<div class="mission-progress" role="progressbar" aria-label="今日のミッション" aria-valuemin="0" aria-valuemax="3" aria-valuenow="' + done + '"><i style="width:' + (done/3*100) + '%"></i></div>' +
      items.map(i=>'<button class="mission-row" type="button" data-mission="' + i.key + '"><span class="mission-icon ' + i.color + '">' + icon(i.icon,21) +
        '</span><span><strong>' + i.label + '</strong><small>' + i.sub + '</small></span><span class="mission-status ' + (i.done?'done':'') + '" aria-label="' + (i.done?'達成':'未達成') + '">' +
        (i.done?icon('check',13):'') + '</span></button>').join('') + '</section>';
  }

  function featureCard() {
    const rare = species.get('baobab');
    return '<button class="field-guide" type="button" data-feature="baobab"><span class="guide-caption">' + icon('globe',15) + ' 世界の植物を発見</span>' +
      '<strong>' + rare.name + '</strong><span class="rare-place">' + rare.habitat + '</span><span class="feature-link">ずかんを見る ' +
      icon('chevron-right',13) + '</span>' + art('baobab') + '</button>';
  }

  function renderHome() {
    const now = day();
    const virtual = v.getPlants();
    const actual = obs.getPlants();
    const entries = obs.getEntries();
    const plants = real ? actual : virtual;
    homeSignature = timeSignature(virtual,now);
    const maxHeight = Math.max(20, Math.ceil(Math.max(0,...actual.map(p=>p.height||0))/20)*20);
    const fullDate = now.toLocaleDateString('ja-JP',{month:'long',day:'numeric',weekday:'long'});
    const illustrationDate = fullDate.replace(/日([日月火水木金土])曜日$/, '日　$1曜日');
    const gardenRows = plants.length ? '<div class="garden-grid">' + plants.map(p=>real?realCard(p,maxHeight):virtualCard(p)).join('') + '</div>' :
      '<div class="empty-garden">' + art('bean',1) + '<div><h3>最初の鉢を観察しよう</h3><p>草たけと葉の数を記録すると、ここに植物が育ちます。</p><button type="button" class="text-link" data-action="record">' + icon('pen',16) + '観察を記録する</button></div></div>';
    main.innerHTML = '<section class="hero" aria-labelledby="hero-title"><img class="hero-illustration" src="assets/hero.webp" alt=""><div class="hero-copy"><span class="hero-date">' +
      icon('sun',18) + escape(illustrationDate) + '</span><h1 id="hero-title">わたしの庭</h1><p>植物を育てて、今日の発見を記録しよう。</p>' +
      '<button class="button primary hero-button" type="button" data-action="record">' + icon('pen',18) + '観察を記録する</button></div></section>' +
      '<div class="dashboard"><section class="grow-section" aria-labelledby="grow-title"><div class="grow-heading"><h2 id="grow-title"><span class="title-icon">' + icon('sprout',25) +
      '</span>育てている植物 <span class="plant-count">' + plants.length + '</span></h2><button class="button add-button" type="button" data-action="add">' +
      icon('plus',17) + (real?'鉢をふやす':'種を植える') + '</button></div>' +
      '<div class="garden-tabs" role="group" aria-label="庭のモード"><button type="button" data-mode="virtual" aria-pressed="' + !real + '">' + icon('sparkle',16) +
      '架空の庭</button><button type="button" data-mode="real" aria-pressed="' + real + '">' + icon('pot',16) + '実物の庭</button></div>' + gardenRows +
      (real && actual.length ? '<a href="#notebook" class="notebook-link">' + icon('chart',17) + 'かんさつノートで成長グラフを見る ' + icon('chevron-right',15) + '</a>':'') +
      '</section><aside class="home-aside">' + missions(virtual,entries,now) + featureCard() + '</aside></div>';
  }

  function currentPage() {
    const fragment = location.hash.slice(1).split('/')[0];
    return ['book','notebook'].includes(fragment) ? fragment : 'garden';
  }

  function refresh() {
    page = currentPage();
    real = location.hash === '#garden/real';
    document.querySelectorAll('[data-page]').forEach(link => {
      if (link.dataset.page === page) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title = 'かんさつガーデン｜' + ({garden:'マイガーデン',book:'植物ずかん',notebook:'かんさつノート'}[page]);
    if (page==='notebook') obs.render(main);
    else if (page==='book') v.renderBook(main);
    else renderHome();
  }

  function homeMode(toReal) {
    history.pushState(null,'',toReal ? '#garden/real' : '#garden');
    refresh();
  }

  function record() {
    if (page==='garden' && !real) homeMode(true);
    obs.openRecord();
  }

  function onHomeClick(event) {
    const button = event.target.closest('button');
    if (!button || page!=='garden') return;
    const {mode, action, plant, observe, mission, feature} = button.dataset;
    if (mode) {
      if ((mode==='real') !== real) homeMode(mode==='real');
      main.querySelector('[data-mode="' + mode + '"]').focus({preventScroll:true});
    } else if (action==='record' || mission==='record') record();
    else if (action==='add') real ? obs.openNewPlant() : v.openSeeds();
    else if (plant) v.openPlant(plant);
    else if (observe) obs.openRecord(observe);
    else if (mission==='care') {
      const plants = v.getPlants();
      const candidate = plants.find(p=>!v.isWatered(p)) || plants[0];
      if (candidate) v.openPlant(candidate.id);
      else v.openSeeds();
    } else if (mission==='quiz') v.openSpecies(dailySpecies(day()).id);
    else if (feature) v.openSpecies(feature);
  }

  function route() {
    closeModal();
    refresh();
    window.scrollTo(0,0);
  }

  window.GardenApp = {icon, escape, art, modal, closeModal, toast, refresh};
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon,20));
  document.getElementById('close-dialog').addEventListener('click',closeModal);
  dialog.addEventListener('click',event=>{
    if (event.target!==dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) closeModal();
  });
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('showing-dialog');
    if (launchFocus?.isConnected) launchFocus.focus({preventScroll:true});
    else document.querySelector('[aria-current="page"]')?.focus({preventScroll:true});
  });
  document.getElementById('help').addEventListener('click',openGuide);
  document.querySelector('.skip').addEventListener('click',event=>{
    event.preventDefault();
    main.focus();
  });
  main.addEventListener('click',onHomeClick);
  window.addEventListener('hashchange', route);
  window.addEventListener('storage',event=>{ if (!event.key || event.key.startsWith('kansatsu-garden.')) refresh(); });
  document.addEventListener('visibilitychange',()=>{ if (!document.hidden) refresh(); });
  setInterval(()=>{
    if (page!=='garden' || document.hidden || dialog.open || homeSignature===timeSignature(v.getPlants(),day())) return;
    const focusedButton = document.activeElement.closest('#main button');
    const key = focusedButton && Object.keys(focusedButton.dataset)[0];
    const value = key && focusedButton.dataset[key];
    refresh();
    if (key) Array.from(main.querySelectorAll('button')).find(button=>button.dataset[key]===value)?.focus({preventScroll:true});
  },60000);
  refresh();
})();
