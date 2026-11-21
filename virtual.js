(() => {
  'use strict';

  const prefix = 'kansatsu-garden.virtual.v1.';
  const memory = new Map();
  const hour = 60 * 60 * 1000;
  const thresholds = [0, 24, 54, 96].map(hours => hours * hour);
  const careBonus = 4 * hour;
  const starters = [['sunflower', 106], ['morning', 100], ['bean', 62]];
  let sessionOnly = false;
  let warned = false;
  let startersReady = false;
  let bookFilter = 'all';

  const app = () => window.GardenApp;
  const data = () => window.GardenData.species;
  const speciesById = id => data().find(species => species.id === id);
  const esc = value => app().escape(String(value ?? ''));
  const icon = (name, size = 18) => app().icon(name, size);
  const art = (id, level) => app().art(id, level);

  function readValue(key) {
    if (!sessionOnly) {
      try {
        const raw = localStorage.getItem(prefix + key);
        if (raw === null) return null;
        const value = JSON.parse(raw);
        memory.set(key, value);
        return value;
      } catch (error) {
        if (error instanceof SyntaxError) return null;
        sessionOnly = true;
      }
    }
    return memory.get(key) ?? null;
  }

  function storeValue(key, value) {
    memory.set(key, value);
    if (!sessionOnly) {
      try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        sessionOnly = true;
      }
    }
  }

  function plantKeys() {
    const keyPrefix = prefix + 'plant.';
    if (!sessionOnly) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(keyPrefix)) keys.push(key.slice(prefix.length));
        }
        return keys;
      } catch {
        sessionOnly = true;
      }
    }
    return [...memory.keys()].filter(key => key.startsWith('plant.'));
  }

  function ensureStarters() {
    if (startersReady) return;
    // Cache existing plants first so an unavailable/full store can fall back to this session.
    plantKeys().forEach(readValue);
    const now = Date.now();
    for (const [species, ageHours] of starters) {
      const id = 'starter-' + species;
      if (!speciesById(species) || readValue('plant.' + id)) continue;
      storeValue('plant.' + id, {
        id, species, plantedAt: now - ageHours * hour, starter: true, lastWatered: '', waterDays: 0
      });
    }
    startersReady = true;
  }

  function getPlants() {
    ensureStarters();
    return plantKeys().map(readValue)
      .filter(p => p && typeof p.id === 'string' && speciesById(p.species) && Number.isFinite(p.plantedAt))
      .sort((a, b) => a.plantedAt - b.plantedAt || a.id.localeCompare(b.id))
      .map(p => ({ ...p }));
  }

  function localDay(time = new Date()) {
    return [time.getFullYear(), String(time.getMonth() + 1).padStart(2, '0'), String(time.getDate()).padStart(2, '0')].join('-');
  }

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

  function isWatered(id) {
    const p = typeof id === 'object' ? id : readValue('plant.' + id);
    return p?.lastWatered === localDay();
  }

  function progress(p) {
    const level = stage(p);
    if (level === thresholds.length - 1) return { percent: 100, next: '' };
    const percent = Math.round(100 * (growthTime(p) - thresholds[level]) / (thresholds[level + 1] - thresholds[level]));
    return { percent: Math.min(99, Math.max(0, percent)), next: speciesById(p.species)?.stages[level + 1] || '' };
  }

  function notify(message) {
    if (sessionOnly && !warned) {
      warned = true;
      message += '　保存できるのは、この画面を開いている間だけです。';
    }
    app().toast(message);
  }

  function plant(speciesId) {
    const species = speciesById(speciesId);
    if (!species) return null;
    ensureStarters();
    const id = window.crypto?.randomUUID?.() || 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    const p = { id, species: speciesId, plantedAt: Date.now(), starter: false, lastWatered: '', waterDays: 0 };
    storeValue('plant.' + id, p);
    app().refresh();
    openPlant(id);
    notify(species.name + 'の種を植えたよ！');
    return p;
  }

  function water(id) {
    const key = 'plant.' + id;
    const p = readValue(key);
    if (!p || !speciesById(p.species)) return false;
    if (isWatered(p)) {
      notify('今日の水やりはできたよ。また明日ね。');
      return false;
    }
    const before = stage(p);
    storeValue(key, { ...p, waterDays: (Number(p.waterDays) || 0) + 1, lastWatered: localDay() });
    app().refresh();
    const species = speciesById(p.species);
    const after = stage(readValue(key));
    notify(after > before ? species.name + 'が「' + species.stages[after] + '」に育ったよ！' : species.name + 'に水をあげたよ！');
    return true;
  }

  function artBox(speciesId, level, extra = '') {
    return '<div aria-hidden="true" class="gv-art gv-art-' + esc(speciesId) + ' ' + extra + '">' + art(speciesId, level) + '</div>';
  }

  function category(species) {
    return species.group === 'wild' ? '世界の植物' : '学校の植物';
  }

  function stageTimeText(remaining) {
    const min = Math.max(1, Math.ceil(remaining / 60000));
    if (min < 60) return 'あと約' + min + '分';
    return 'あと約' + Math.ceil(min / 60) + '時間';
  }

  function openPlant(id) {
    const p = readValue('plant.' + id);
    if (!p) return;
    const species = speciesById(p.species);
    if (!species) return;
    const level = stage(p);
    const wet = isWatered(p);
    const final = level === thresholds.length - 1;
    const { next, percent } = progress(p);
    const timeText = final ? 'りっぱに育ったよ！' : '「' + esc(next) + '」まで ' + stageTimeText(thresholds[level + 1] - growthTime(p));
    const root = app().modal(species.name + 'のおせわ', `
      <div class="gv-detail">
        <div class="gv-profile">
          ${artBox(species.id, level, 'gv-portrait')}
          <div class="gv-profile-text">
            <p class="gv-kicker">${icon('sprout', 15)} 架空の庭</p>
            <h3>${esc(species.name)}</h3>
            <p>${esc(species.habitat)}</p>
            ${p.starter ? '<small>はじめから庭にいるなかま</small>' : '<small>' + esc(new Date(p.plantedAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })) + 'に植えたよ</small>'}
          </div>
        </div>
        <section class="gv-stage-block" aria-label="成長のようす">
          <div class="gv-line"><strong>${esc(species.stages[level])}</strong><span>成長 ${level + 1} / 4</span></div>
          <div class="gv-stage-track" aria-hidden="true"><span style="width:${percent}%"></span></div>
          <p class="gv-timing">${icon('clock', 15)} ${timeText}</p>
        </section>
        <p class="gv-care-hint">${final ? '育ったすがたを図鑑と見くらべてみよう。' : '画面を閉じても育つよ。1日1回、水をあげると成長が4時間分進むよ。'}</p>
        <div class="gv-actions">
          <button type="button" class="gv-btn gv-btn-primary" data-gv-water ${wet ? 'disabled' : ''}>${icon(wet ? 'check' : 'droplet')} ${wet ? '今日の水やり完了' : '水をあげる'}</button>
          <button type="button" class="gv-btn" data-gv-species>${icon('book')} 図鑑を見る</button>
        </div>
      </div>`);
    root.querySelector('[data-gv-water]').addEventListener('click', () => {
      if (water(id)) openPlant(id);
    });
    root.querySelector('[data-gv-species]').addEventListener('click', () => openSpecies(species.id));
  }

  function filters(selected, label) {
    const options = [['all', 'すべて'], ['school', '学校の植物'], ['wild', '世界の植物']];
    return '<div class="gv-filters" role="group" aria-label="' + label + '">' + options.map(([id, name]) =>
      '<button type="button" data-gv-filter="' + id + '" aria-pressed="' + (id === selected) + '">' + name + '</button>').join('') + '</div>';
  }

  function filterItems(filter) {
    return filter === 'all' ? data() : data().filter(species => species.group === filter);
  }

  function openSeeds(filter = 'all') {
    if (!['all', 'school', 'wild'].includes(filter)) filter = 'all';
    const root = app().modal('新しい種を植える', '<div class="gv-seeds">' + filters(filter, '種の種類') +
      '<div class="gv-seed-list">' + filterItems(filter).map(species => `
        <article class="gv-seed-row">
          ${artBox(species.id, 3, 'gv-thumb')}
          <div><h3>${esc(species.name)}</h3><p>${esc(species.habitat)}</p></div>
          <button type="button" data-gv-plant="${esc(species.id)}" class="gv-btn gv-plant-btn" aria-label="${esc(species.name)}の種を植える">${icon('plus', 15)} 植える</button>
        </article>`).join('') + '</div></div>');
    root.querySelectorAll('[data-gv-filter]').forEach(button => button.addEventListener('click', () => {
      openSeeds(button.dataset.gvFilter);
      document.querySelector('.gv-seeds [aria-pressed="true"]')?.focus();
    }));
    root.querySelectorAll('[data-gv-plant]').forEach(button => button.addEventListener('click', () => {
      button.disabled = true;
      plant(button.dataset.gvPlant);
    }));
  }

  function learned(id) {
    return readValue('learned.' + id) === true;
  }

  function quizDoneToday() {
    return readValue('quiz-day') === localDay();
  }

  function renderBook(root) {
    const count = data().filter(species => learned(species.id)).length;
    root.innerHTML = `<div class="gv-book">
      <div class="gv-book-heading"><div><h1>植物ずかん</h1><p>植物のすがたや、育つ場所を見てみよう。</p></div>
        <span class="gv-learned-count">${icon('check', 16)} クイズ正解 ${count} / ${data().length}</span></div>
      ${filters(bookFilter, '図鑑の種類')}
      <div class="gv-book-grid">${filterItems(bookFilter).map(species => `
        <button type="button" class="gv-book-card" data-gv-open="${esc(species.id)}">
          ${artBox(species.id, 3, 'gv-book-art')}
          <span class="gv-book-copy"><small>${esc(category(species))}</small><strong>${esc(species.name)}</strong>
            <span class="gv-book-sub">${esc(species.habitat)}</span>
            ${learned(species.id) ? '<span class="gv-passed">' + icon('check', 14) + ' クイズ正解</span>' : ''}
          </span>
        </button>`).join('')}</div></div>`;
    root.querySelectorAll('[data-gv-filter]').forEach(button => button.addEventListener('click', () => {
      bookFilter = button.dataset.gvFilter;
      renderBook(root);
      root.querySelector('[aria-pressed="true"]')?.focus();
    }));
    root.querySelectorAll('[data-gv-open]').forEach(button => button.addEventListener('click', () => openSpecies(button.dataset.gvOpen)));
  }

  function openSpecies(id) {
    const species = speciesById(id);
    if (!species) return;
    const known = learned(id);
    const source = typeof species.source === 'string' && /^https?:\/\//i.test(species.source)
      ? '<p class="gv-source">資料　<a href="' + esc(species.source) + '" target="_blank" rel="noopener noreferrer">' + esc(species.sourceName || '植物の資料') + '</a></p>' : '';
    const root = app().modal(species.name + 'の図鑑', `
      <div class="gv-detail">
        <div class="gv-profile">${artBox(id, 3, 'gv-portrait')}
          <div class="gv-profile-text"><p class="gv-kicker">${icon('book', 15)} ${esc(category(species))}</p>
            <h3>${esc(species.name)}</h3><p>${esc(species.habitat)}</p>
            <small>${esc([species.family, species.latin].filter(Boolean).join(' · '))}</small></div></div>
        <section class="gv-learn-block"><h4>植物のひみつ</h4><p>${esc(species.fact)}</p></section>
        <section class="gv-look-block"><h4>${icon('search', 16)} 観察のヒント</h4><p>${esc(species.look)}</p></section>
        <section class="gv-quiz" aria-label="植物クイズ">
          <h4>${known ? icon('check', 17) + ' クイズ正解！' : '植物クイズ'}</h4>
          <p>${esc(species.question)}</p>
          <div class="gv-answers"></div>
          <p class="gv-feedback" aria-live="polite"></p>
        </section>${source}</div>`);
    const answers = root.querySelector('.gv-answers');
    const feedback = root.querySelector('.gv-feedback');
    const title = root.querySelector('.gv-quiz h4');
    const showQuestions = () => {
      title.textContent = '植物クイズ';
      feedback.textContent = '';
      answers.innerHTML = species.answers.map((answer, index) => '<button type="button" class="gv-answer" data-answer="' + index + '">' + esc(answer) + '</button>').join('');
      answers.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
        if (Number(button.dataset.answer) !== Number(species.correct)) {
          button.disabled = true;
          feedback.textContent = 'もう一度、植物のひみつを読んでみよう。';
          return;
        }
        storeValue('learned.' + id, true);
        storeValue('quiz-day', localDay());
        answers.querySelectorAll('button').forEach(option => { option.disabled = true; });
        button.classList.add('gv-correct');
        title.innerHTML = icon('check', 17) + ' クイズ正解！';
        feedback.textContent = 'せいかい！　' + species.fact;
        app().refresh();
        if (sessionOnly) notify('クイズに正解したよ！');
      }));
    };
    if (known) {
      answers.innerHTML = '<button type="button" class="gv-btn">もう一度とく</button>';
      answers.querySelector('button').addEventListener('click', showQuestions);
    } else {
      showQuestions();
    }
  }

  window.GardenVirtual = { getPlants, stage, progress, plant, openPlant, openSeeds, renderBook, openSpecies, water, isWatered, learned, quizDoneToday };
})();
