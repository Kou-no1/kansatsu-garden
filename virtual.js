(() => {
  'use strict';

  const hour = 60 * 60 * 1000;
  const thresholds = [0, 24, 54, 96].map(hours => hours * hour);
  const careBonus = 4 * hour;
  const bookSelection = {group: 'all', region: '', query: ''};

  const app = () => window.GardenApp;
  const data = () => window.GardenData.species;
  const speciesById = id => data().find(species => species.id === id);
  const esc = value => app().escape(String(value ?? ''));
  const icon = (name, size = 18) => app().icon(name, size);
  const art = (id, level) => app().art(id, level);

  const farmer = () => window.GardenFarmer;
  const getPlants = () => farmer().getPlants();
  const getPlant = id => getPlants().find(plant => plant.id === id);
  const learned = id => window.GardenStudy.learned(id);
  const quizDoneToday = () => window.GardenStudy.quizDoneToday();
  const openSpecies = (id, context) => window.GardenStudy.open(id, context);
  const rankNames = ['ふつう', 'きらめき', 'とくべつ'];

  function growthTime(p) {
    return Math.max(0, Date.now() - p.plantedAt) + Math.max(0, Number(p.waterDays) || 0) * careBonus;
  }

  function stage(p) {
    if (!p) return 0;
    const elapsed = growthTime(p);
    for (let i = thresholds.length - 1; i > 0; i--) {
      if (elapsed >= thresholds[i]) return i;
    }
    return 0;
  }

  function isWatered(plant) {
    return farmer().isCared(typeof plant === 'object' ? plant.id : plant, 'water');
  }

  function progress(p) {
    const level = stage(p);
    if (level === thresholds.length - 1) return { percent: 100, next: '' };
    const percent = Math.round(100 * (growthTime(p) - thresholds[level]) / (thresholds[level + 1] - thresholds[level]));
    return { percent: Math.min(99, Math.max(0, percent)), next: speciesById(p.species)?.stages[level + 1] || '' };
  }

  async function plant(speciesId) {
    const result = await farmer().plant(speciesId);
    if (result.ok) openPlant(result.plantId);
    app().toast(result.message);
    return result;
  }

  async function water(id) {
    const result = await farmer().care(id, 'water');
    app().toast(result.message);
    return result.ok;
  }

  function artBox(speciesId, level, extra = '') {
    return '<div aria-hidden="true" class="gv-art gv-art-' + esc(speciesId) + ' ' + extra + '">' + art(speciesId, level) + '</div>';
  }

  function category(species) {
    if (species.group === 'school') return '学校の植物';
    return window.GardenJapan.forSpecies(species.id) ? '日本の植物' : '世界の植物';
  }

  function stageTimeText(remaining) {
    const min = Math.max(1, Math.ceil(remaining / 60000));
    if (min < 60) return 'あと約' + min + '分';
    return 'あと約' + Math.ceil(min / 60) + '時間';
  }

  function openPlant(id, feedback = '') {
    const p = getPlant(id);
    if (!p) return;
    const species = speciesById(p.species);
    const profile = window.GardenCare.get(p.species);
    const item = farmer().catalog.find(entry => entry.id === profile.feedKind);
    const state = farmer().snapshot();
    const stock = state.items[item.id] || 0;
    const level = stage(p);
    const wet = isWatered(p);
    const fed = farmer().isCared(id, item.id);
    const {next, percent} = progress(p);
    const timeText = next ? '「' + esc(next) + '」まで ' + stageTimeText(thresholds[level + 1] - growthTime(p)) : 'りっぱに育ったよ！';
    const goal = p.careRank === 1 ? 1 : 3;
    const rankText = p.careRank < 3 ? '合う用品であと' + (goal - p.fitCareDays) + '日おせわすると「' + rankNames[p.careRank] + '」になるよ。' : 'この株のおせわランクがいちばん高くなったよ。';
    const root = app().modal(species.name + 'のおせわ', `
      <div class="gv-detail gv-plant-detail" data-gv-detail="${esc(id)}">
        <div class="gv-profile">${artBox(species.id, level, 'gv-portrait gv-rank-' + p.careRank)}
          <div class="gv-profile-text"><p class="gv-kicker">${icon('sprout', 15)} 架空の庭</p>
            <h3>${esc(species.name)}</h3><p>${esc(profile.environment)}</p>
            <small>${p.starter ? 'はじめから庭にいるなかま' : esc(new Date(p.plantedAt).toLocaleDateString('ja-JP', {month:'long', day:'numeric'})) + 'から育成中'}</small>
          </div></div>
        <section class="gv-stage-block" aria-label="成長のようす">
          <div class="gv-line"><strong>${esc(species.stages[level])}</strong><span>成長 ${level + 1} / 4</span></div>
          <div class="gv-stage-track" aria-hidden="true"><span style="width:${percent}%"></span></div>
          <p class="gv-timing">${icon('clock', 15)} ${timeText}</p></section>
        <p class="gv-care-result" role="status" tabindex="-1">${esc(feedback)}</p>
        <div class="gv-care-options">
          <section><h4>${icon('droplet', 16)} 水のおせわ</h4><p>${esc(profile.waterHint)}</p>
            <button type="button" class="gv-btn gv-btn-primary" data-gv-water ${wet ? 'disabled' : ''}>${icon(wet ? 'check' : 'water', 17)} ${wet ? '今日の水のおせわ完了' : esc(profile.waterLabel)}</button></section>
          <section><h4>${icon('leaf', 16)} ${esc(item.name)} <small>持ちもの ${stock}</small></h4><p>${esc(profile.feedHint)}</p>
            <button type="button" class="gv-btn" data-gv-feed ${fed || stock === 0 ? 'disabled' : ''}>${icon(fed ? 'check' : 'sprout', 17)} ${fed ? '今日の用品のおせわ完了' : esc(profile.feedLabel)}</button>
            ${stock === 0 && !fed ? '<a class="gv-inline-link" href="#shop" data-gv-exit>ショップへ</a>' : ''}</section>
        </div>
        <section class="gv-rank-block"><h4>${icon('sparkle', 17)} おせわランク <strong>${rankNames[p.careRank - 1]}</strong></h4><p>${rankText}</p></section>
        <p class="gv-care-hint">ゲームの植物は画面を閉じても育つよ。水のおせわは無料で、1日1回、成長が4時間分進むよ。</p>
        <div class="gv-actions"><button type="button" class="gv-btn" data-gv-species>${icon('book')} 図鑑を見る</button></div>
        ${atlasLink(species.id)}
        <p class="gv-source">育つ環境の資料　<a href="${esc(profile.source)}" target="_blank" rel="noopener noreferrer">${esc(profile.sourceName)}</a></p>
      </div>`);
    const detail = root.querySelector('.gv-plant-detail');
    if (feedback) root.querySelector('.gv-care-result').focus({preventScroll:true});
    detail.addEventListener('click', async event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-gv-species')) {
        openSpecies(p.species);
        return;
      }
      const kind = button.hasAttribute('data-gv-water') ? 'water' : item.id;
      button.disabled = true;
      const result = await farmer().care(id, kind);
      let text = result.message;
      const after = getPlant(id);
      if (result.ok && after) {
        if (after.careRank > p.careRank) text += ' おせわランクが「' + rankNames[after.careRank - 1] + '」になったよ！';
        if (stage(after) > level) text += ' 「' + species.stages[stage(after)] + '」に育ったよ！';
        const newLevel = farmer().snapshot().level;
        if (newLevel > state.level) text += ' ファーマーレベル' + newLevel + 'になったよ！';
      }
      if (detail.isConnected && detail.closest('dialog')?.open) openPlant(id, text);
      else app().toast(text);
    });
    root.querySelector('[data-gv-exit]')?.addEventListener('click', app().closeModal);
    bindAtlasLink(root);
  }

  function atlasLink(id) {
    return window.GardenMaps.placesFor(id).map(({map, region, plant, href}) =>
      '<a class="gv-atlas-link" data-gv-atlas href="' + esc(href) + '">' + icon('globe', 16) +
      '<span>' + map.name + 'で見る<small>' + esc(region.name) + ' ・ ' + esc(plant.place) + '</small></span></a>'
    ).join('');
  }

  function bindAtlasLink(root) {
    root.querySelectorAll('[data-gv-atlas]').forEach(link => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      app().closeModal();
      if (location.hash === event.currentTarget.hash) {
        event.preventDefault();
        app().refresh();
        requestAnimationFrame(() => {
          const map = document.querySelector('[data-japan-map], .at-map');
          map?.focus({preventScroll:true});
          map?.scrollIntoView({block:'center'});
        });
      }
    }));
  }

  function normalizedQuery(value) {
    return value.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 96)).replace(/[\s・-]/g, '');
  }

  const otherNames = {
    sunflower:'向日葵', morning:'朝顔', bean:'隠元豆 いんげん', balsam:'鳳仙花', rice:'稲 お米 こめ',
    cherry:'桜 さくら 染井吉野', loofah:'糸瓜', cacao:'カカオノキ', 'silver-fern':'シダ',
    mizubasho:'水芭蕉', ezomatsu:'蝦夷松', haskap:'クロミノウグイスカグラ', komakusa:'駒草', katakuri:'片栗',
    beech:'橅', ginkgo:'銀杏 公孫樹', 'morning-lotus':'蓮 れんこん', yamabuki:'山吹', wasabi:'山葵',
    fujibakama:'藤袴', kakitsubata:'杜若 燕子花', wisteria:'藤', ume:'梅', tea:'茶 お茶 茶の木',
    sugi:'杉', sudachi:'酢橘', camellia:'椿 ヤブツバキ', deigo:'梯梧', mangrove:'雄蛭木 マングローブ'
  };

  function catalogControls(selection) {
    const groups = [['all', 'すべて'], ['school', '学校の植物'], ['japan', '日本地図の植物'], ['wild', '世界地図の植物']];
    return '<div class="gv-catalog-controls"><div class="gv-find"><label class="gv-find-name">' + icon('search', 17) +
      '<input data-gv-search type="search" aria-label="植物の名前で検索" placeholder="植物の名前でさがす" value="' + esc(selection.query) + '"></label>' +
      '<label class="gv-find-region">' + icon('globe', 16) + '<select data-gv-region aria-label="地域でしぼりこむ"><option value="">すべての地域</option>' +
      window.GardenMaps.maps.map(map=>'<optgroup label="' + map.name + '">' + map.data.regions.map(region=>'<option value="' + esc(region.id) + '"' + (region.id === selection.region ? ' selected' : '') + '>' + esc(region.name) + '</option>').join('') + '</optgroup>').join('') +
      '</select></label></div><div class="gv-filter-line"><div class="gv-filters" role="group" aria-label="植物の種類">' + groups.map(([id,label]) =>
        '<button type="button" data-gv-filter="' + id + '" aria-pressed="' + (id === selection.group) + '">' + label + '</button>').join('') +
      '</div><span class="gv-result-count" role="status" aria-live="polite"></span></div></div>';
  }

  function bindCatalog(root, selection, resultClass, card, onChoose) {
    const search = root.querySelector('[data-gv-search]');
    const regions = root.querySelector('[data-gv-region]');
    const grid = root.querySelector(resultClass);
    const count = root.querySelector('.gv-result-count');
    const buttons = root.querySelectorAll('[data-gv-filter]');

    function updateResults() {
      const query = normalizedQuery(selection.query);
      const items = data().filter(species => {
        if (selection.group === 'school' && species.group !== 'school') return false;
        if (selection.group === 'japan' && !window.GardenJapan.forSpecies(species.id)) return false;
        if (selection.group === 'wild' && !window.GardenRegions.forSpecies(species.id)) return false;
        if (selection.region && !window.GardenMaps.maps.some(map=>map.data.forSpecies(species.id)?.region.id === selection.region)) return false;
        const names = [species.name, species.latin, otherNames[species.id] || ''];
        return !query || names.some(name => normalizedQuery(name).includes(query));
      });
      buttons.forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.gvFilter === selection.group)));
      count.textContent = items.length + ' 種';
      grid.innerHTML = items.length ? items.map(card).join('') :
        '<div class="gv-no-matches"><p>この条件にあう植物はまだありません。</p><button class="gv-btn" type="button" data-gv-reset>条件をリセット</button></div>';
    }

    search.addEventListener('input', () => { selection.query = search.value; updateResults(); });
    regions.addEventListener('change', () => { selection.region = regions.value; updateResults(); });
    buttons.forEach(button=>button.addEventListener('click', () => { selection.group = button.dataset.gvFilter; updateResults(); }));
    grid.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-gv-reset')) {
        selection.group = 'all';
        selection.region = regions.value = '';
        selection.query = search.value = '';
        updateResults();
        search.focus();
      } else {
        onChoose(button);
      }
    });
    updateResults();
  }

  function openSeeds() {
    const state = farmer().snapshot();
    const owned = data().filter(species => state.seeds[species.id] > 0);
    const rows = owned.map(species => {
      const allowed = farmer().canPlant(species.id);
      const gate = allowed.ok ? '' : '<p class="gv-seed-gate">' + esc(allowed.message) +
        (allowed.reason === 'space' ? ' <a href="#shop" data-gv-exit>ショップで庭を広げる</a>' : '') + '</p>';
      return `<article class="gv-seed-row">
        ${artBox(species.id, 0, 'gv-thumb')}
        <div><h3>${esc(species.name)}</h3><p>${esc(species.starterLabel || '種')} × ${state.seeds[species.id]} ・ レベル ${farmer().requirement(species.id)} から</p></div>
        <button type="button" data-gv-plant="${esc(species.id)}" class="gv-btn gv-plant-btn" aria-label="${esc(species.name)}を庭で育てる" ${allowed.ok ? '' : 'disabled'}>${icon('sprout', 15)} 庭で育てる</button>
        ${gate}</article>`;
    }).join('');
    const root = app().modal('たねぶくろ', `<div class="gv-seeds">
      <div class="gv-bag-stats"><span>${icon('sprout', 17)} 持っている植物 ${owned.length}種</span><span>庭の空き ${state.capacity - state.occupied}区画</span></div>
      ${rows ? '<div class="gv-seed-list">' + rows + '</div>' : '<div class="gv-empty-bag">' + artBox('rice', 0, 'gv-thumb') + '<div><h3>' + (state.unlocked.length ? '次の種を見つけよう' : '最初の種を見つけよう') + '</h3><p>旅先で植物を調べてクイズに答えると、ここに種や苗を持ち帰れるよ。</p></div></div>'}
      <div class="gv-actions"><a class="gv-btn" href="#japan" data-gv-exit>${icon('globe', 17)} 日本地図へ</a><a class="gv-btn" href="#atlas" data-gv-exit>${icon('globe', 17)} 世界地図へ</a></div>
    </div>`);
    root.querySelectorAll('[data-gv-exit]').forEach(link => link.addEventListener('click', app().closeModal));
    root.querySelector('.gv-seed-list')?.addEventListener('click', async event => {
      const button = event.target.closest('[data-gv-plant]');
      if (!button) return;
      button.disabled = true;
      const result = await plant(button.dataset.gvPlant);
      if (!result.ok && button.isConnected) openSeeds();
    });
  }

  function renderBook(root) {
    const count = data().filter(species => learned(species.id)).length;
    root.innerHTML = `<div class="gv-book">
      <div class="gv-book-heading"><div><h1>植物ずかん</h1><p>植物のすがたや、育つ場所を見てみよう。星の数はゲームの中のレア度だよ。</p></div>
        <span class="gv-learned-count">${icon('check', 16)} クイズ正解 ${count} / ${data().length}</span></div>
      ${catalogControls(bookSelection)}<div class="gv-book-grid"></div></div>`;
    bindCatalog(root, bookSelection, '.gv-book-grid', species => `
        <button type="button" class="gv-book-card" data-gv-open="${esc(species.id)}">
          ${artBox(species.id, 3, 'gv-book-art')}
          <span class="gv-book-copy"><small>${esc(category(species))}</small><strong>${esc(species.name)}</strong>
            <span class="gv-book-sub">${esc(species.habitat)}</span>
            <span class="gv-book-rarity"><span aria-label="ゲームのレア度 ${window.GardenCare.get(species.id).rarity}">${'★'.repeat(window.GardenCare.get(species.id).rarity)}</span> レベル ${farmer().requirement(species.id)} から</span>
            ${learned(species.id) ? '<span class="gv-passed">' + icon('check', 14) + ' クイズ正解</span>' : ''}
          </span>
        </button>`, button => openSpecies(button.dataset.gvOpen));
  }

  window.GardenVirtual = { getPlants, stage, progress, plant, openPlant, openSeeds, renderBook, openSpecies, water, isWatered, learned, quizDoneToday };
})();
