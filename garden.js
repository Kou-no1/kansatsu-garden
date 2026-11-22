(() => {
  'use strict';
  const main = document.getElementById('main');
  const dialog = document.getElementById('garden-dialog');
  const dialogHead = dialog.querySelector('.dialog-head');
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
  let ready = false;
  let farmerUnavailable = false;

  function dateKey(date) {
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  }

  function art(id, stage = 3) {
    const file = window.GardenGrowthArt.file(id,stage);
    return '<img class="plant-art" src="assets/' + file + '.webp" alt="" draggable="false">';
  }

  function modal(title, html) {
    if (!dialog.open) launchFocus = document.activeElement;
    document.getElementById('dialog-title').textContent = title;
    dialogBody.innerHTML = html;
    if (!dialog.open) {
      dialogHead.append(toastBox);
      dialog.showModal();
    }
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
    const body = modal('あそびかた', '<div class="guide">' +
      '<button type="button" class="button primary" data-first-guide>' + icon('globe',18) + 'はじめての庭たび</button>' +
      '<section><span class="guide-icon teal">' + icon('globe',23) + '</span><div><h3>地図で植物に会いに行く</h3><p>日本地図と世界地図から、行きたい地方や地域を選ぼう。植物が育つ場所を見つけて、調査の手がかりをもとに答えると、スタンプが手に入ります。</p></div></section>' +
      '<section><span class="guide-icon amber">' + icon('sprout',23) + '</span><div><h3>旅先の植物を庭で育てる</h3><p>植物のひみつを読んでクイズに答えよう。正解すると、種や苗を庭に持ち帰れます。訪問でもらったゴールドは、ショップで肥料や環境をととのえる道具に使えます。</p></div></section>' +
      '<section><span class="guide-icon lilac">' + icon('sparkle',22) + '</span><div><h3>自分のペースでおせわする</h3><p>おせわすると経験値がたまり、ファーマーレベルが上がると育てられる種類が増えます。おやすみした日も、庭の植物はそのまま育ちます。</p></div></section>' +
      '<section><span class="guide-icon teal">' + icon('pen',22) + '</span><div><h3>実物を観察する</h3><p>草たけと葉の数をはかって、「観察を記録する」に書こう。写真や気づきも残せます。「実物の庭」の草たけと葉が記録に合わせて変わります。</p></div></section>' +
      '<section><span class="guide-icon lilac">' + icon('chart',22) + '</span><div><h3>育ち方をくらべる</h3><p>同じ種類の鉢を2つ用意し、日当たりか肥料のどちらか一つだけを変えてみよう。「かんさつノート」で2つの鉢を選ぶと、成長を同じグラフでくらべられます。</p></div></section>' +
      '<section><span class="guide-icon amber">' + icon('book',22) + '</span><div><h3>植物のひみつを見つける</h3><p>「植物ずかん」で育つ場所や体のつくりを調べよう。クイズに正解すると、図鑑に正解の印がつきます。</p></div></section>' +
      '<button type="button" class="button" data-app-info>ホーム画面に追加・オフラインで遊ぶ</button>' +
      '<p class="storage-note">記録と育成データは、この端末のこのブラウザーに保存されます。</p></div>');
    body.querySelector('[data-first-guide]').onclick = () => window.GardenFirstPlay.open();
    body.querySelector('[data-app-info]').onclick = () => window.GardenFirstPlay.openInstall();
  }

  function virtualCard(plant) {
    const s = species.get(plant.species);
    const level = v.stage(plant);
    const watered = v.isWatered(plant);
    return '<button type="button" class="plant-card theme-' + s.id + '" data-plant="' + escape(plant.id) + '" aria-label="' + s.name + 'のおせわ">' +
      '<span class="card-scene"><span class="stage-tag">' + icon(s.stages[level] === '花が咲く' ? 'flower':'leaf',13) + s.stages[level] + '</span>' +
      '<span class="scene-specks" aria-hidden="true"></span>' + art(s.id, level) + '</span>' +
      '<span class="card-info"><strong>' + s.name + '</strong><span class="card-sub">' + icon(watered?'check':'clock',14) +
      (watered?'今日の水のおせわずみ':'育成 ' + (Math.floor(Math.max(0,Date.now()-plant.plantedAt)/86400000)+1) + '日目') +
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

  function measurementScale(plants) {
    return Math.max(20, Math.ceil(Math.max(0,...plants.map(plant=>plant.height||0))/20)*20);
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
      {key:'care', icon:'water', color:'teal', label:'水のおせわをしよう', sub:'架空の庭の植物をひとつ選ぼう', done:plants.some(p=>v.isWatered(p))},
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
    const stops = window.GardenMaps.maps.flatMap(map => map.data.regions.map(region => ({region, map})));
    const unexplored = stops.filter(({map, region}) => !(map.id==='japan' ? window.GardenJapanJourney : window.GardenExploration).hasVisited(region.id));
    const destinations = unexplored.length ? unexplored : stops;
    const now = day();
    const index = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const {region, map} = destinations[index % destinations.length];
    const plant = species.get(region.plants[index % region.plants.length].id);
    return '<a class="field-guide" href="#' + map.id + '/' + region.id + '"><span class="guide-caption">' + icon('globe',15) + ' 次の探検先</span>' +
      '<strong>' + escape(region.name) + '</strong><span class="rare-place">' + escape(plant.name) + 'に会いに行こう</span><span class="feature-link">地図をひらく ' +
      icon('chevron-right',13) + '</span>' + art(plant.id) + '</a>';
  }

  function renderHome() {
    const now = day();
    const virtual = v.getPlants();
    const actual = obs.getPlants();
    const entries = obs.getEntries();
    const plants = real ? actual : virtual;
    homeSignature = timeSignature(virtual,now);
    const maxHeight = measurementScale(actual);
    const fullDate = now.toLocaleDateString('ja-JP',{month:'long',day:'numeric',weekday:'long'});
    const illustrationDate = fullDate.replace(/日([日月火水木金土])曜日$/, '日　$1曜日');
    const gardenRows = plants.length ? '<div class="garden-grid">' + plants.map(p=>real?realCard(p,maxHeight):virtualCard(p)).join('') + '</div>' :
      '<div class="empty-garden">' + art('bean',1) + '<div><h3>最初の鉢を観察しよう</h3><p>草たけと葉の数を記録すると、ここに植物が育ちます。</p><button type="button" class="text-link" data-action="record">' + icon('pen',16) + '観察を記録する</button></div></div>';
    main.innerHTML = '<section class="hero" aria-labelledby="hero-title"><img class="hero-illustration" src="assets/hero.webp" alt=""><div class="hero-copy"><span class="hero-date">' +
      icon('sun',18) + escape(illustrationDate) + '</span><h1 id="hero-title">わたしの庭</h1><p>' +
      (real ? '育てている植物の、今日の発見を記録しよう。' : '地図で出会った植物を、ここで育てよう。') + '</p>' +
      '<div class="hero-actions">' + (real
        ? '<button class="button primary hero-button" type="button" data-action="record">' + icon('pen',18) + '観察を記録する</button><a class="hero-atlas-link" href="#japan">' + icon('globe',18) + '日本地図へ</a>'
        : '<a class="button primary hero-button" href="#japan">' + icon('globe',18) + '地図で旅に出る</a><button class="hero-atlas-link" type="button" data-action="record">' + icon('pen',18) + '観察を記録する</button>') +
      '</div></div></section>' +
      (real ? '' : window.GardenFirstPlay.homeCard() + window.GardenFarmerUI.homeStatus()) +
      '<div class="dashboard"><section class="grow-section" aria-labelledby="grow-title"><div class="grow-heading"><h2 id="grow-title"><span class="title-icon">' + icon('sprout',25) +
      '</span>育てている植物 <span class="plant-count">' + plants.length + '</span></h2><button class="button add-button" type="button" data-action="add">' +
      icon(real?'plus':'sprout',17) + (real?'鉢をふやす':'たねぶくろ') + '</button></div>' +
      '<div class="garden-tabs" role="group" aria-label="庭のモード"><button type="button" data-mode="virtual" aria-pressed="' + !real + '">' + icon('sparkle',16) +
      '架空の庭</button><button type="button" data-mode="real" aria-pressed="' + real + '">' + icon('pot',16) + '実物の庭</button></div>' + gardenRows +
      (real && actual.length ? '<a href="#notebook" class="notebook-link">' + icon('chart',17) + 'かんさつノートで成長グラフを見る ' + icon('chevron-right',15) + '</a>':'') +
      '</section><aside class="home-aside">' + missions(virtual,entries,now) + featureCard() + '</aside></div>';
  }

  function currentPage() {
    const fragment = location.hash.slice(1).split('/')[0];
    return ['book','notebook','atlas','japan','shop'].includes(fragment) ? fragment : 'garden';
  }

  function renderMap() {
    const [, region, plant] = location.hash.split('/');
    if (!main.querySelector('#map-view')) {
      const links = window.GardenMaps.maps.map(map=>'<a href="#' + map.id + '">' + map.name + '</a>').join('');
      main.innerHTML = '<nav class="map-switch" aria-label="探検する地図">' + links + '</nav><div id="map-view"></div>';
    }
    main.querySelectorAll('.map-switch a').forEach(link => {
      if (link.hash === '#' + page) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    const view = main.querySelector('#map-view');
    if (page==='japan') window.GardenJapanAtlas.render(view,region,plant);
    else window.GardenAtlas.render(view,region);
  }

  function refresh() {
    if (!ready) return;
    page = currentPage();
    real = location.hash === '#garden/real';
    document.querySelectorAll('[data-page]').forEach(link => {
      if (link.dataset.page === (page==='japan' ? 'atlas' : page)) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title = 'かんさつガーデン｜' + ({garden:'マイガーデン',book:'植物ずかん',notebook:'かんさつノート',atlas:'世界の植物地図',japan:'日本の植物地図',shop:'庭のショップ'}[page]);
    if (farmerUnavailable && page !== 'notebook') {
      main.innerHTML = '<section class="empty-garden"><div><h1>庭のセーブデータをひらけませんでした</h1><p>ブラウザーの保存設定と空き容量を確かめてね。実物の観察ノートはここから開けます。</p><button type="button" class="button primary">もう一度ひらく</button> <a class="text-link" href="#notebook">かんさつノートへ</a></div></section>';
      main.querySelector('button').onclick = () => location.reload();
    }
    else if (page==='notebook') obs.render(main);
    else if (page==='shop') window.GardenFarmerUI.renderShop(main);
    else if (page==='book') v.renderBook(main);
    else if (page==='atlas' || page==='japan') renderMap();
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
    const {mode, action, plant, observe, mission} = button.dataset;
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
  }

  function route() {
    closeModal();
    refresh();
    window.scrollTo(0,0);
  }

  window.GardenApp = {icon, escape, art, measuredPlant, measurementScale, modal, closeModal, toast, refresh};
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon,20));
  document.getElementById('close-dialog').addEventListener('click',closeModal);
  dialog.addEventListener('click',event=>{
    if (event.target!==dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) closeModal();
  });
  dialog.addEventListener('close',()=>{
    if (dialog.open) return;
    document.body.append(toastBox);
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
    if (!ready || farmerUnavailable || page!=='garden' || document.hidden || dialog.open || homeSignature===timeSignature(v.getPlants(),day())) return;
    const focusedButton = document.activeElement.closest('#main button');
    const key = focusedButton && Object.keys(focusedButton.dataset)[0];
    const value = key && focusedButton.dataset[key];
    refresh();
    if (key) Array.from(main.querySelectorAll('button')).find(button=>button.dataset[key]===value)?.focus({preventScroll:true});
  },60000);
  window.addEventListener('garden-farmer-change', () => {
    if (page === 'garden' || page === 'shop') refresh();
  });
  window.GardenFarmer.init().then(() => {
    ready = true;
    refresh();
  }, () => {
    ready = true;
    farmerUnavailable = true;
    refresh();
  });
})();
