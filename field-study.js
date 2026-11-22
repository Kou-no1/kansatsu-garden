(() => {
  'use strict';

  const prefix = 'kansatsu-garden.virtual.v1.';
  const memory = new Map();
  const unsaved = new Set();
  const app = () => window.GardenApp;
  const farmer = () => window.GardenFarmer;
  const esc = value => app().escape(value);
  const icon = (name, size = 17) => app().icon(name, size);

  function read(key) {
    if (!unsaved.has(key)) {
      try {
        const raw = window.localStorage.getItem(prefix + key);
        const value = raw === null ? null : JSON.parse(raw);
        memory.set(key, value);
        return value;
      } catch { /* The current session still remembers this result. */ }
    }
    return memory.get(key);
  }

  function save(key, value) {
    memory.set(key, value);
    try {
      if (value === null) window.localStorage.removeItem(prefix + key);
      else window.localStorage.setItem(prefix + key, JSON.stringify(value));
      unsaved.delete(key);
    } catch { unsaved.add(key); }
  }

  function today() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function currentPlace(id, context) {
    const [mapId, regionId] = location.hash.slice(1).split('/');
    if (context && (context.mapId !== mapId || context.regionId !== regionId)) return null;
    return window.GardenMaps.placesFor(id).find(({map, region}) => map.id === mapId && region.id === regionId);
  }

  const passKey = (id, place) => 'field-pass.' + place.map.id + '.' + place.region.id + '.' + id;
  const learned = id => read('learned.' + id) === true;
  const quizDoneToday = () => read('quiz-day') === today();

  function noteRegionalAnswer(id, context) {
    const place = currentPlace(id, context);
    if (!place) return;
    save('learned.' + id, true);
    save('quiz-day', today());
    if (!farmer().snapshot().seeds[id]) save(passKey(id, place), true);
  }

  function mapLinks(id) {
    return window.GardenMaps.placesFor(id).map(({map, region, plant, href}) =>
      '<a class="gv-atlas-link" data-gv-atlas href="' + esc(href) + '">' + icon('globe') +
      '<span>' + esc(map.name) + 'で見る<small>' + esc(region.name) + ' ・ ' + esc(plant.place) + '</small></span></a>'
    ).join('');
  }

  function open(id, context) {
    const species = window.GardenData.get(id);
    if (!species) return;
    const place = currentPlace(id, context);
    const material = species.starterLabel || '種';
    const name = esc(species.name);
    const label = esc(material);
    const title = name + 'の' + label;
    const site = place ? place.plant.place : species.habitat;
    const root = app().modal(species.name + (place ? 'のフィールド学習' : 'の図鑑'),
      '<div class="gv-detail fs-study" data-study="' + esc(id) + '"><div class="gv-profile">' +
      '<div aria-hidden="true" class="gv-art gv-portrait gv-art-' + esc(id) + '">' + app().art(id, 3) + '</div>' +
      '<div class="gv-profile-text"><p class="gv-kicker">' + icon(place ? 'globe' : 'book', 15) + ' ' +
      (place ? esc(place.region.name) + 'で調査中' : '植物ずかん') + '</p><h3>' + name + '</h3><p>' + esc(site) +
      '</p><small>' + esc([species.family, species.latin].filter(Boolean).join(' · ')) + '</small></div></div>' +
      '<section class="gv-learn-block"><h4>植物のひみつ</h4><p>' + esc(species.fact) + '</p></section>' +
      '<section class="gv-look-block"><h4>' + icon('search') + ' 観察のヒント</h4><p>' + esc(species.look) + '</p></section>' +
      '<section class="gv-quiz" aria-label="植物クイズ" data-study-task></section>' +
      (!place ? '<div class="fs-stops"><h4>この植物に会える場所</h4>' + mapLinks(id) + '</div>' : '') +
      '<p class="gv-source">資料　<a href="' + esc(species.source) + '" target="_blank" rel="noopener noreferrer">' +
      esc(species.sourceName || '植物の資料') + ' ' + icon('external-link', 13) + '</a></p></div>');
    const study = root.querySelector('[data-study]');
    const task = study.querySelector('[data-study-task]');
    const stocked = () => farmer().snapshot().seeds[id] > 0;
    const connected = () => study.isConnected && root.closest('dialog')?.open;

    function focusHeading() {
      task.querySelector('h4').focus({preventScroll:true});
    }

    function bagAction() {
      const allowed = farmer().canPlant(id);
      task.innerHTML = '<h4 tabindex="-1">' + icon('sprout') + ' ' + title + 'が たねぶくろにあるよ</h4>' +
        '<p>' + (allowed.ok ? '自分の庭に植えて、おせわを始めよう。' : esc(allowed.message)) + '</p>' +
        '<div class="fs-actions">' + (allowed.ok ? '<button type="button" class="gv-btn gv-btn-primary" data-study-plant>庭に植える</button>' : '') +
        '<button type="button" class="gv-btn" data-study-bag>たねぶくろを見る</button></div>';
      task.querySelector('[data-study-plant]')?.addEventListener('click', event => {
        event.currentTarget.disabled = true;
        window.GardenVirtual.plant(id);
      });
      task.querySelector('[data-study-bag]').onclick = () => window.GardenVirtual.openSeeds();
    }

    function result() {
      if (place && stocked()) { bagAction(); return; }
      task.innerHTML = '<h4 tabindex="-1">' + icon('check') + ' クイズ正解！</h4><p>' +
        (place ? title + 'を、架空の庭に持ち帰れるよ。' : '地図でこの植物に会いに行こう。旅先のクイズに正解すると、' + label + 'がもらえるよ。') +
        '</p>' + (place ? '<button type="button" class="gv-btn gv-btn-primary" data-study-collect>' + icon('sprout') + ' ' + label + 'を持ち帰る</button>' : '');
      const collect = task.querySelector('[data-study-collect]');
      if (collect) collect.addEventListener('click', async () => {
        if (currentPlace(id, context)?.href !== place.href || !read(passKey(id, place))) return;
        collect.disabled = true;
        const outcome = await farmer().claimSeed(id);
        if (outcome.ok || outcome.reason === 'stock') {
          save(passKey(id, place), null);
          if (connected()) { bagAction(); focusHeading(); }
        } else if (connected()) collect.disabled = false;
        app().toast(outcome.message);
      });
    }

    function ask() {
      task.innerHTML = '<h4 tabindex="-1">' + esc(species.question) + '</h4><div class="gv-answers">' +
        species.answers.map((answer, index) => '<button type="button" class="gv-answer" data-study-answer="' + index + '" data-answer="' +
          index + '">' + esc(answer) + '</button>').join('') + '</div><p class="gv-feedback" role="status"></p>';
      focusHeading();
      task.querySelector('.gv-answers').addEventListener('click', event => {
        const choice = event.target.closest('[data-study-answer]');
        if (!choice || choice.disabled) return;
        if (Number(choice.dataset.studyAnswer) !== Number(species.correct)) {
          choice.disabled = true;
          task.querySelector('.gv-feedback').textContent = 'もう一度、植物のひみつを読んでみよう。好きなだけ考えていいよ。';
          return;
        }
        save('learned.' + id, true);
        save('quiz-day', today());
        if (place && !stocked()) save(passKey(id, place), true);
        result();
        focusHeading();
        app().refresh();
      });
    }

    if (place && read(passKey(id, place))) result();
    else {
      task.innerHTML = '<h4>' + (learned(id) ? icon('check') + ' クイズ正解ずみ' : '植物クイズ') + '</h4><p>' +
        (place ? '植物のひみつを読んだら、クイズに答えてみよう。' :
          '図鑑で練習できるよ。' + label + 'は、この植物のいる旅先でもらえるよ。') +
        '</p><div class="fs-actions"><button class="gv-btn gv-btn-primary" type="button" data-study-quiz>' +
        (learned(id) ? 'もう一度とく' : 'クイズに答える') + '</button>' +
        (place && stocked() ? '<button type="button" class="gv-btn" data-study-bag>たねぶくろを見る</button>' : '') + '</div>';
      task.querySelector('[data-study-quiz]').onclick = ask;
      const bag = task.querySelector('[data-study-bag]');
      if (bag) bag.onclick = () => window.GardenVirtual.openSeeds();
    }
    study.querySelectorAll('[data-gv-atlas]').forEach(link => link.addEventListener('click', event => {
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) app().closeModal();
    }));
  }

  window.GardenStudy = {open, learned, quizDoneToday, noteRegionalAnswer};
})();
