(() => {
  'use strict';
  const app = () => window.GardenApp;
  const journey = () => window.GardenJapanJourney;
  const esc = value => app().escape(value);
  const icon = (name, size = 16) => app().icon(name, size);
  const art = id => app().art(id, 3);
  const plantById = id => window.GardenData.get(id);
  const pathFor = (regionId, species) => '#japan/' + encodeURIComponent(regionId) + (species ? '/' + encodeURIComponent(species) : '');
  let pendingFocus = null;

  // Label positions are in the SVG's 720 x 480 units. Connecting lines end on each region.
  const labels = {
    hokkaido: {point:[142.75,43.55], label:[612,59], sample:'haskap', color:'#a5c9ad'},
    tohoku: {point:[140.75,39.45], label:[548,194], sample:'beech', color:'#bfca83'},
    kanto: {point:[139.60,36.18], label:[535,306], sample:'morning-lotus', color:'#e7bd87'},
    chubu: {point:[137.75,36.04], label:[381,217], sample:'wasabi', color:'#e0ce88'},
    kinki: {point:[135.73,34.87], label:[383,355], sample:'tea', color:'#c4abc8'},
    chugoku: {point:[133.02,34.89], label:[202,247], sample:'camellia', color:'#adc6cf'},
    shikoku: {point:[133.65,33.78], label:[236,392], sample:'sudachi', color:'#dba694'},
    kyushu: {point:[130.92,32.55], label:[89,399], sample:'mangrove', color:'#acc48d'}
  };

  // Keep both projections aligned with assets/japan-land.svg, including the island inset.
  const angle = 17 * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  function project(lon, lat) {
    if (lat < 29.7 && lon < 132) return [32+(lon-122.7)*24, 42+(29.7-lat)*24];
    const dx = (lon-138)*29;
    const dy = (37.6-lat)*36;
    return [397+cos*dx-sin*dy, 260+sin*dx+cos*dy];
  }
  function position([x,y]) {
    return 'left:' + (x/7.2).toFixed(3) + '%;top:' + (y/4.8).toFixed(3) + '%';
  }

  function moveFocus(view, section) {
    const el = view.querySelector(section === 'map' ? '[data-japan-map]' : section === 'challenge' ? '[data-jp-challenge] h2' : '#jp-region-title');
    if (!el) return;
    el.tabIndex = -1;
    el.focus({preventScroll:true});
    el.scrollIntoView({block:section === 'map' ? 'center' : 'start'});
  }

  function regionList(regions, selected) {
    return regions.map(region => {
      const {color,sample} = labels[region.id];
      const specimen = region.plants.find(site=>site.id===sample) || region.plants[0];
      const visited = journey().hasVisited(region.id);
      return '<a class="jp-region-row" href="' + pathFor(region.id) + '" data-jp-region="' + esc(region.id) + '"' +
        (selected?.id===region.id ? ' aria-current="location"' : '') + '><span class="jp-sample" style="--jp-color:' + color + '">' +
        art(specimen.id) + '</span><strong>' + esc(region.name) + '</strong><small>' + region.plants.length + '種</small>' +
        (visited ? '<span class="jp-visit" aria-label="訪問ずみ">' + icon('check',13) + '</span>' : '') + '</a>';
    }).join('');
  }

  function regionPins(regions, selected) {
    const lines = [];
    const pins = [];
    for (const region of regions) {
      const {point,label,color} = labels[region.id];
      const [x,y] = project(...point);
      const active = selected?.id===region.id;
      lines.push('<line x1="' + x + '" y1="' + y + '" x2="' + label[0] + '" y2="' + label[1] + '"/><circle cx="' + x +
        '" cy="' + y + '" r="' + (active?4:3) + '" fill="' + (active?'#3e6244':'#fffbea') + '"/>');
      pins.push('<a href="' + pathFor(region.id) + '" data-jp-region="' + esc(region.id) + '" class="jp-label" style="' +
        position(label) + ';--jp-color:' + color + '"' + (active?' aria-current="location"':'') +
        ' aria-label="' + esc(region.name) + 'の植物を探す"><i></i>' + esc(region.name) + '</a>');
    }
    return '<svg class="jp-lines" viewBox="0 0 720 480" aria-hidden="true" focusable="false"><g fill="none" stroke="#637e6c" stroke-width="1.35">' +
      lines.join('') + '</g></svg>' + pins.join('');
  }

  function sitePin(site) {
    if (!site) return '';
    const p = project(site.lon, site.lat);
    const name = plantById(site.id).name;
    return '<div class="jp-site-dot" style="' + position(p) + '" role="img" aria-label="' +
      esc(name + '・' + site.place) + '"><i></i><strong class="' + (p[0]>490 ? 'jp-site-left' : '') +
      (p[1]<65 ? ' jp-site-below' : '') + '">' + esc(name) + '</strong></div>';
  }

  function detailCard(site, region, sown) {
    const plant = plantById(site.id);
    const selected = location.hash === pathFor(region.id,site.id);
    const state = sown.has(site.id) ? '<span>' + icon('pot',13) + ' 庭で育成</span>' : '';
    return '<article class="at-specimen jp-card' + (selected?' jp-located':'') + '"><div class="at-portrait jp-portrait">' + art(site.id) +
      '</div><div class="at-copy"><div class="at-species-heading"><h3>' + esc(plant.name) + '</h3><div class="at-states">' + state +
      (window.GardenVirtual.learned(site.id) ? '<span>' + icon('check',13) + ' クイズ正解</span>' : '') + '</div></div>' +
      '<div class="jp-place-row">' + (site.setting ? '<small class="jp-setting">' + esc(site.setting) + '</small>' : '') +
      '<a class="at-place jp-place" href="' + pathFor(region.id,site.id) + '" data-jp-site="' + esc(site.id) +
      '" aria-label="' + esc(plant.name + 'の場所「' + site.place + '」を日本地図で見る') + '">' + icon('globe',14) + esc(site.place) + '</a></div>' +
      '<p>' + esc(site.note) + '</p><a class="at-source" href="' + esc(site.source) + '" target="_blank" rel="noopener noreferrer">' +
      esc(site.sourceName) + ' ' + icon('external-link',12) + '</a><div class="at-actions"><button type="button" class="at-action-main" data-jp-study="' +
      esc(site.id) + '">' + icon('book') + ' 調べてクイズに挑戦</button></div></div></article>';
  }

  function regionDetail(region) {
    const sown = new Set(window.GardenVirtual.getPlants().map(plant=>plant.species));
    return '<section class="at-detail" aria-labelledby="jp-region-title"><header class="at-detail-head"><div><h2 id="jp-region-title" tabindex="-1">' +
      esc(region.name) + 'の植物</h2><p>' + esc(region.description) + '</p></div><div class="at-region-tools"><span class="at-climate">' +
      icon('sun',15) + esc(region.climate) + '</span><button type="button" class="at-jump" data-jp-investigate>' + icon('search',15) +
      (journey().hasStamp(region.id) ? '調査の結果を見る' : '地方の調査に挑戦') + '</button></div></header><div class="at-specimens">' +
      region.plants.map(site=>detailCard(site,region,sown)).join('') + '</div></section><div data-jp-challenge></div>';
  }

  function render(root, regionId, plantId) {
    const [,hashRegion,hashPlant] = location.hash.split('/');
    const regions = window.GardenJapan.regions;
    const selected = regions.find(region=>region.id===(regionId || hashRegion));
    const site = selected?.plants.find(item=>item.id===(plantId || (hashRegion===selected.id && hashPlant)));
    if (selected) journey().visit(selected.id);
    const visited = regions.filter(region=>journey().hasVisited(region.id)).length;
    const total = regions.reduce((count,region)=>count+region.plants.length,0);
    root.innerHTML = '<div class="at-page jp-page" data-journey-root><header class="at-header"><div><h1>日本の植物地図</h1>' +
      '<p>地方を選んで、山や森、水辺、畑に育つ植物を訪ねよう。</p></div><span class="at-trip-count">' +
      icon('globe',17) + ' 訪れた地方 <b>' + visited + ' / ' + regions.length + '</b></span></header>' +
      '<section class="jp-board" aria-label="日本の地方を探す"><div class="jp-sheet"><div class="jp-map" data-japan-map tabindex="-1" role="group" aria-label="八地方と南西諸島の日本地図">' +
      '<object class="jp-land" type="image/svg+xml" data="assets/japan-land.svg" tabindex="-1" aria-hidden="true"><img src="assets/japan-land.svg" alt=""></object>' +
      regionPins(regions, selected) + sitePin(site) + '</div><div class="jp-map-foot"><span>' + (site ? esc(plantById(site.id).name + '　' + site.place) : '色は八つの地方、線は都道府県の境界') +
      '</span><a href="https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/" target="_blank" rel="noopener noreferrer">地図データ　Natural Earth</a></div></div>' +
      '<nav class="jp-side" aria-label="探検する地方"><div class="jp-side-head"><h2>探検する地方</h2><span>' + total + '種</span></div>' +
      '<div class="jp-region-list">' + regionList(regions,selected) + '</div></nav></section>' +
      (selected ? regionDetail(selected) : '') + '<div data-journey-passport></div></div>';

    const view = root.querySelector('.jp-page');
    if (selected) journey().renderChallenge(view.querySelector('[data-jp-challenge]'),selected.id);
    journey().renderPassport(view.querySelector('[data-journey-passport]'));
    if (pendingFocus?.hash === location.hash) {
      const {section} = pendingFocus;
      pendingFocus = null;
      requestAnimationFrame(()=>{ if (view.isConnected) moveFocus(view,section); });
    }

    function follow(event, hash, section) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash === hash) moveFocus(view,section);
      else {
        pendingFocus = {hash,section};
        location.hash = hash;
      }
    }

    // Same-origin embeds use the normal in-page route. Direct-file browsers can follow
    // the SVG's own links or the eight keyboard-accessible labels above the artwork.
    const svgObject = view.querySelector('.jp-land');
    svgObject.addEventListener('load',()=>{
      const svg = svgObject.contentDocument;
      if (!svg) return;
      svg.addEventListener('click',event=>{
        const area = event.target.closest('[data-region]');
        if (area) follow(event,pathFor(area.dataset.region),'region');
      });
    });
    view.addEventListener('click',event=>{
      const link = event.target.closest('a');
      if (link?.hash.startsWith('#japan/')) {
        follow(event,link.hash,link.hasAttribute('data-jp-site')?'map':'region');
        return;
      }
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-jp-investigate')) moveFocus(view,'challenge');
      else if (button.hasAttribute('data-jp-study')) window.GardenStudy.open(button.dataset.jpStudy, {mapId:'japan', regionId:selected.id});
    });
  }

  window.GardenJapanAtlas = {render};
})();
