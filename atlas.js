(() => {
  'use strict';

  const app = () => window.GardenApp;
  const exploration = () => window.GardenExploration;
  const esc = value => app().escape(value);
  const icon = (name, size) => app().icon(name, size);
  let pendingRegionFocus = '';
  let shownSite = '';

  // Equal Earth projection, using the same center and scale as world-land.svg.
  function project(lon, lat) {
    const rad = Math.PI / 180;
    const theta = Math.asin(Math.sqrt(3) / 2 * Math.sin(lat * rad));
    const sq = theta * theta;
    const sixth = sq ** 3;
    const a1 = 1.340264, a2 = -0.081106, a3 = 0.000893, a4 = 0.003796;
    const x = 2 * Math.sqrt(3) * lon * rad * Math.cos(theta) /
      (3 * (a1 + 3 * a2 * sq + sixth * (7 * a3 + 9 * a4 * sq)));
    const y = theta * (a1 + a2 * sq + sixth * (a3 + a4 * sq));
    return {x: (500 + 180 * x) / 10, y: (240 - 170 * y) / 4.8};
  }

  function position(item) {
    const point = project(item.lon, item.lat);
    return 'left:' + point.x.toFixed(3) + '%;top:' + point.y.toFixed(3) + '%';
  }

  const formatRegionLink = region => '#atlas/' + encodeURIComponent(region.id);
  const plantInfo = site => window.GardenData.get(site.id);
  const validCoords = site => Number.isFinite(site.lat) && Number.isFinite(site.lon);

  function regionPin(region, selected) {
    const visited = exploration().hasVisited(region.id);
    const active = selected?.id === region.id;
    const sampleIds = {asia:'rice', africa:'baobab', europe:'edelweiss', 'north-america':'saguaro', 'south-america':'giant-lily', oceania:'silver-fern'};
    const sample = region.plants.find(site => site.id === sampleIds[region.id]) || region.plants[0];
    return '<a class="at-pin' + (active ? ' at-pin-active' : '') + '" href="' + formatRegionLink(region) +
      '" data-at-region="' + esc(region.id) + '" style="' + position(sample && validCoords(sample) ? sample : region) + '" aria-label="' +
      esc(region.name) + 'の植物を見る' + (sample ? '、' + esc(plantInfo(sample).name) : '') + (visited ? '（訪問ずみ）' : '') + '"' +
      (active ? ' aria-current="location"' : '') + '><span class="at-pin-dot">' +
      icon(visited ? 'check' : 'sprout', 15) + '</span>' +
      (sample ? '<span class="at-pin-specimen">' + app().art(sample.id, 3) + '</span>' : '') +
      '<span class="at-pin-name">' + esc(region.name) + '</span></a>';
  }

  function regionLink(region, selected) {
    const plantCount = region.plants.length;
    const visited = exploration().hasVisited(region.id);
    const active = selected?.id === region.id;
    return '<a class="at-region-link" data-at-region="' + esc(region.id) + '" href="' +
      formatRegionLink(region) + '"' + (active ? ' aria-current="location"' : '') +
      '><span class="at-visit-mark' + (visited ? ' at-visited' : '') + '" aria-label="' +
      (visited ? '訪問ずみ' : '未訪問') + '">' + icon(visited ? 'check' : 'globe', 15) +
      '</span><strong>' + esc(region.name) + '</strong><small>' + plantCount + '種</small></a>';
  }

  function plantCard(site) {
    const plant = plantInfo(site);
    if (!plant) return '';
    const grown = exploration().isGrown(site.id);
    const learned = window.GardenVirtual.learned(site.id);
    const state = (grown ? '<span>' + icon('pot', 13) + ' 庭で育成</span>' : '') +
      (learned ? '<span>' + icon('check', 13) + ' クイズ正解</span>' : '');
    const source = site.source || site.sourceUrl;
    const sourceLink = typeof source === 'string' && /^https?:\/\//.test(source)
      ? '<a class="at-source" href="' + esc(source) + '" target="_blank" rel="noopener noreferrer">' +
          esc(site.sourceName || 'この場所の資料') + ' ' + icon('external-link', 12) + '</a>' : '';
    const place = validCoords(site)
      ? '<button type="button" class="at-place" data-at-locate="' + esc(site.id) + '" aria-label="' +
          esc(plant.name + 'の場所「' + site.place + '」を地図で見る') + '">' + icon('globe', 14) +
          esc(site.place) + '</button>'
      : '<span class="at-place">' + icon('globe', 14) + esc(site.place) + '</span>';
    return '<article class="at-specimen"><div class="at-portrait">' + app().art(site.id, 3) + '</div>' +
      '<div class="at-copy"><div class="at-species-heading"><h3>' + esc(plant.name) + '</h3>' +
      '<div class="at-states">' + state + '</div></div>' + place + '<p>' + esc(site.note) + '</p>' +
      sourceLink + '<div class="at-actions"><button type="button" class="at-action-main" data-at-study="' +
      esc(site.id) + '">' + icon('book', 16) + ' 調べてクイズに挑戦</button></div></div></article>';
  }

  function drawSite(view, region) {
    const layer = view.querySelector('.at-site-layer');
    const site = region?.plants.find(item => item.id === shownSite);
    layer.innerHTML = '';
    if (!site || !validCoords(site)) return;
    const point = project(site.lon, site.lat);
    layer.innerHTML = '<span class="at-location' + (point.x > 60 ? ' at-label-left' : '') +
      '" style="' + position(site) + '"><i></i><strong>' + esc(plantInfo(site).name) +
      '<small>' + esc(site.place) + '</small></strong></span>';
  }

  function focusRegion(view) {
    const heading = view.querySelector('#at-region-heading');
    if (!heading) return;
    heading.focus({preventScroll: true});
    heading.scrollIntoView({block:'start'});
  }

  function render(root, regionId) {
    const regions = window.GardenRegions.regions;
    const [, hashRegion, hashSite] = location.hash.split('/');
    const selected = regions.find(region => region.id === (regionId || hashRegion));
    const id = selected?.id || '';
    shownSite = hashRegion === id && selected?.plants.some(site => site.id === hashSite) ? hashSite : '';
    if (selected) exploration().visit(id);
    const visited = regions.filter(region => exploration().hasVisited(region.id)).length;
    const count = new Set(regions.flatMap(region => region.plants.map(site => site.id))).size;

    root.innerHTML = '<div class="at-page" data-journey-root><header class="at-header"><div><h1>世界の植物地図</h1>' +
      '<p>ピンを選んで、植物が野生で育つ場所や、人が育てている場所を訪ねよう。</p></div>' +
      '<span class="at-trip-count">' + icon('globe', 17) + ' 訪れた地域 <b>' + visited + ' / ' +
      regions.length + '</b></span></header>' +
      '<section class="at-map-panel" aria-label="世界の植物を探す"><div class="at-map-column">' +
      '<div class="at-map" role="group" tabindex="-1" aria-label="世界地図の地域ピン">' +
      '<img class="at-map-land" src="assets/world-land.svg" width="1000" height="480" alt="">' +
      regions.map(region => regionPin(region, selected)).join('') +
      '<div class="at-site-layer" aria-live="polite"></div></div>' +
      '<div class="at-credit">地図データ <a href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/" target="_blank" rel="noopener noreferrer">Natural Earth</a></div></div>' +
      '<nav class="at-regions" aria-label="探検する地域"><div class="at-nav-heading"><h2>探検する地域</h2><span>全' + count + '種</span></div>' +
      '<div class="at-region-list">' + regions.map(region => regionLink(region, selected)).join('') +
      '</div></nav></section>' +
      (selected ? '<section class="at-detail" aria-labelledby="at-region-heading"><div class="at-detail-head"><div>' +
        '<h2 id="at-region-heading" tabindex="-1">' + esc(selected.name) + 'の植物</h2><p>' +
        esc(selected.description) + '</p>' + (id === 'asia' ? '<a class="at-japan-link" href="#japan">' + icon('globe',15) + ' 日本の8地方をくわしく見る</a>' : '') + '</div><div class="at-region-tools"><span class="at-climate">' + icon('sun', 15) + ' ' +
        esc(selected.climate) + '</span><button class="at-jump" type="button" data-at-investigate>' + icon('search',15) + ' ' +
        (exploration().hasStamp(id) ? '調査の結果を見る' : '地域の調査に挑戦') + '</button></div></div><div class="at-specimens">' + selected.plants.map(plantCard).join('') +
        '</div></section><div data-at-challenge></div>' : '') + '<div data-at-passport data-journey-passport></div></div>';

    const view = root.querySelector('.at-page');
    drawSite(view, selected);
    if (selected) exploration().renderChallenge(view.querySelector('[data-at-challenge]'), selected.id);
    exploration().renderPassport(view.querySelector('[data-at-passport]'));
    if (id && pendingRegionFocus === id) {
      pendingRegionFocus = '';
      requestAnimationFrame(() => { if (view.isConnected) focusRegion(view); });
    }

    view.addEventListener('click', event => {
      const link = event.target.closest('[data-at-region]');
      if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        if (id === link.dataset.atRegion) {
          event.preventDefault();
          focusRegion(view);
        } else {
          pendingRegionFocus = link.dataset.atRegion;
        }
        return;
      }
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-at-investigate')) {
        const challenge = view.querySelector('[data-at-challenge] h2');
        challenge.tabIndex = -1;
        challenge.focus({preventScroll:true});
        challenge.scrollIntoView({block:'start'});
      } else if (button.dataset.atStudy) {
        window.GardenStudy.open(button.dataset.atStudy, {mapId:'atlas', regionId:id});
      } else if (button.dataset.atLocate) {
        shownSite = button.dataset.atLocate;
        const target = formatRegionLink(selected) + '/' + encodeURIComponent(shownSite);
        if (location.hash !== target) history.pushState(null,'',target);
        drawSite(view, selected);
        const map = view.querySelector('.at-map');
        map.focus({preventScroll:true});
        map.scrollIntoView({block:'center'});
      }
    });
  }

  window.GardenAtlas = {render};
})();
