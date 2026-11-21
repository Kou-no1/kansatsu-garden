(() => {
  'use strict';

  const missions = new Map([
    ['asia', {
      target:'rice', choices:['papyrus','rice','loofah'],
      clue:'日本の田んぼです。細長い葉の上で、くきの先がたれています。近くで見ると、小さなつぶが枝分かれした穂にたくさん並んでいます。',
      hint:'くきの先を見てみよう。小さなつぶがたくさんついた穂が手がかりだよ。',
      answer:'たれていたのはイネの穂です。一つひとつのもみの中に、お米が育っています。'
    }],
    ['africa', {
      target:'welwitschia', choices:['welwitschia','baobab','saguaro'],
      clue:'ナミブ砂漠で、地面をはう帯のような葉を見つけました。何本もあるように見えるけれど、根もとまで目でたどると、もとは2枚の本葉でした。',
      hint:'地面の近くに広がる、先がさけた帯のような葉をさがそう。',
      answer:'ウェルウィッチアは2枚の本葉を根もとからのばし続けます。先がさけることが、何枚もあるように見えた理由です。'
    }],
    ['europe', {
      target:'edelweiss', choices:['cherry','balsam','edelweiss'],
      clue:'アルプスの山で、白い星のような植物を見つけました。星の白い部分には細かい毛が生え、そのまんなかに、小さな花が集まっています。',
      hint:'白い毛のある部分が、星の先のように広がるすがたを見てね。',
      answer:'エーデルワイスの白い星をつくるのは、毛におおわれた葉のなかまです。その内側に花が集まっています。'
    }],
    ['north-america', {
      target:'saguaro', choices:['saguaro','sequoia','papyrus'],
      clue:'ソノラ砂漠に緑の柱が立っていました。表面にはたて向きの深いひだがあり、雨のあとに水を吸うと、くきがふくらみます。',
      hint:'緑のくきに何本もある、たてのひだに注目してね。',
      answer:'柱の正体はサワロサボテンです。くきのひだがじゃばらのように開き、中に水をたくわえられます。'
    }],
    ['south-america', {
      target:'giant-lily', choices:['cacao','giant-lily','puya'],
      clue:'アマゾン川流域の静かな水辺で、大きなお皿のような丸い葉が水面に浮かんでいました。裏がわには太いすじがあみ目のようにつながっています。',
      hint:'水面に広がる丸い葉をさがしてみよう。',
      answer:'オオオニバスの浮き葉です。大きな葉の裏には、中心から広がるすじと横につなぐすじがあります。'
    }],
    ['oceania', {
      target:'silver-fern', choices:['wollemi','baobab','silver-fern'],
      clue:'ニュージーランドの森で、木のように高く育ったシダを見つけました。育った葉を下から見上げると、葉の裏が銀白色に見えます。',
      hint:'細かく分かれたシダの葉と、葉の裏の色が手がかりだよ。',
      answer:'シルバーファーンは、大きく育った葉の裏が銀白色になるシダです。同じ葉でも見る方向で色がちがいます。'
    }]
  ]);

  const prefix = 'kansatsu-garden.exploration.v1.';
  const remembered = new Set();
  const unsaved = new Set();
  const app = () => window.GardenApp;
  const esc = value => app().escape(value);
  const virtual = () => window.GardenVirtual;
  const getSpecies = id => window.GardenData.get(id);

  function hasMark(kind, id) {
    if (!missions.has(id)) return false;
    const key = prefix + kind + '.' + id;
    if (unsaved.has(key)) return true;
    try {
      const earned = window.localStorage.getItem(key) === '1';
      if (earned) remembered.add(key);
      else remembered.delete(key);
      return earned;
    } catch {
      return remembered.has(key);
    }
  }

  function mark(kind, id) {
    if (!missions.has(id)) return;
    const key = prefix + kind + '.' + id;
    if (!unsaved.has(key) && hasMark(kind, id)) return;
    remembered.add(key);
    try {
      window.localStorage.setItem(key, '1');
      unsaved.delete(key);
    } catch {
      unsaved.add(key);
    }
  }

  const visit = id => mark('visit', id);
  const hasVisited = id => hasMark('visit', id);
  const hasStamp = id => hasMark('stamp', id);
  const isGrown = id => virtual().getPlants().some(plant => plant.species === id);

  function renderPassport(root) {
    const regions = window.GardenRegions.regions;
    const count = regions.filter(region => hasStamp(region.id)).length;
    root.innerHTML = '<section class="ex-passport" aria-label="調査スタンプ帳"><header class="ex-title"><h2>' +
      app().icon('book',21) + ' 調査スタンプ帳</h2><span>' + count + ' / ' + regions.length + ' 地域</span></header>' +
      '<p>地域の植物を手がかりから見つけると、スタンプが集まるよ。</p><div class="ex-stamps">' +
      regions.map(region => {
        const earned = hasStamp(region.id);
        const status = earned ? '調査ずみ' : hasVisited(region.id) ? '訪問ずみ' : '未訪問';
        const picture = earned ? app().art(missions.get(region.id).target,3) : app().icon('globe',34);
        return '<a class="ex-stamp ex-' + esc(region.id) + (earned ? ' ex-earned' : '') +
          '" href="#atlas/' + esc(region.id) + '" data-at-region="' + esc(region.id) + '">' +
          '<span class="ex-imprint" aria-hidden="true">' + picture + '</span><strong>' + esc(region.name) +
          '</strong><small>' + status + '</small></a>';
      }).join('') + '</div>' + (unsaved.size ? '<p class="ex-storage-note">このブラウザーでは、今回の探検の記録は画面を閉じるまで残ります。</p>' : '') + '</section>';
  }

  function renderChallenge(root, regionId) {
    const mission = missions.get(regionId);
    if (!mission) { root.replaceChildren(); return; }
    const region = window.GardenRegions.regions.find(place => place.id === regionId);
    const name = getSpecies(mission.target).name;
    const earned = hasStamp(regionId);
    root.innerHTML = '<section class="ex-challenge"><header class="ex-title"><h2>' +
      app().icon('search',20) + ' ' + esc(region.name) + 'の植物調査</h2>' +
      '<span data-ex-status>' + (earned ? 'スタンプ獲得ずみ' : '調査に挑戦') + '</span></header>' +
      '<div data-ex-content></div></section>';
    const content = root.querySelector('[data-ex-content]');

    function showResult(fresh) {
      const saved = !unsaved.has(prefix + 'stamp.' + regionId);
      content.innerHTML = '<div class="ex-result"><div class="ex-result-picture ex-' + esc(regionId) + '">' +
        app().art(mission.target,3) + '</div><div><h3 tabindex="-1">' +
        (fresh ? '正解！ ' + esc(region.name) + 'の調査スタンプを獲得' : esc(region.name) + 'の調査を達成！') + '</h3>' +
        '<p>' + esc(mission.answer) + '</p>' + (saved ? '' : '<p class="ex-storage-note">このスタンプは画面を閉じるまで残ります。</p>') +
        '<div class="ex-result-actions"><button type="button" data-ex-care>' + app().icon('sprout',16) + ' ' +
        esc(name) + (isGrown(mission.target) ? 'のおせわ' : 'を育てる') +
        '</button><button type="button" data-ex-retry>もう一度とく</button></div></div></div>';
      root.querySelector('[data-ex-status]').textContent = 'スタンプ獲得ずみ';
      content.querySelector('[data-ex-care]').addEventListener('click', () => {
        const plant = virtual().getPlants().find(item => item.species === mission.target);
        if (plant) virtual().openPlant(plant.id);
        else virtual().plant(mission.target);
      });
      content.querySelector('[data-ex-retry]').addEventListener('click', () => showQuestion(true));
      if (fresh) content.querySelector('h3').focus({preventScroll:true});
    }

    function showQuestion(moveFocus) {
      content.innerHTML = '<p class="ex-clue">' + esc(mission.clue) + '</p>' +
        '<fieldset class="ex-options"><legend tabindex="-1">見つけた植物はどれ？</legend>' +
        mission.choices.map(id => '<button type="button" data-ex-choice="' + esc(id) + '">' +
          '<span class="ex-option-art">' + app().art(id,3) + '</span><span>' + esc(getSpecies(id).name) + '</span></button>').join('') +
        '</fieldset><p class="ex-feedback" role="status"></p>';
      const options = content.querySelector('.ex-options');
      if (moveFocus) options.querySelector('legend').focus({preventScroll:true});
      options.addEventListener('click', event => {
        const button = event.target.closest('[data-ex-choice]');
        if (!button || button.getAttribute('aria-disabled') === 'true') return;
        const choice = button.dataset.exChoice;
        if (choice !== mission.target) {
          button.setAttribute('aria-disabled','true');
          content.querySelector('.ex-feedback').textContent = getSpecies(choice).name + 'を選んだね。' + mission.hint;
          return;
        }
        mark('stamp',regionId);
        const passport = root.closest('.at-page')?.querySelector('[data-at-passport]');
        if (passport) renderPassport(passport);
        showResult(true);
      });
    }

    if (earned) showResult(false);
    else showQuestion(false);
  }

  window.GardenExploration = {visit, hasVisited, isGrown, hasStamp, renderChallenge, renderPassport};
})();
