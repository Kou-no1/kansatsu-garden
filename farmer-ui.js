(() => {
  'use strict';

  const app = () => window.GardenApp;
  const farmer = () => window.GardenFarmer;
  const esc = value => app().escape(value);
  const icon = (name, size) => app().icon(name, size);
  let pending = false;

  function progress(state) {
    const remaining = state.nextLevelXp - state.xp;
    return '<div class="fu-progress"><progress max="' + state.nextLevelXp + '" value="' + state.xp +
      '" aria-label="ファーマーレベルの経験値"></progress><span>次のレベルまで あと' + remaining + '経験値</span></div>';
  }

  function homeStatus() {
    const state = farmer().snapshot();
    return '<section class="fu-status" aria-label="ファーマーのきろく"><div class="fu-level">' +
      '<span class="fu-emblem">' + icon('sprout',22) + '</span><div><strong>ファーマー Lv.' + state.level + '</strong>' +
      progress(state) + '</div></div><div class="fu-stat"><span>' + icon('coin',16) + 'ゴールド</span><strong>' + state.gold + ' G</strong></div>' +
      '<div class="fu-stat"><span>' + icon('fence',16) + '庭の空き</span><strong>' + (state.capacity - state.occupied) + ' 区画</strong></div>' +
      '<a class="fu-shop-link" href="#shop">' + icon('shop',17) + 'ショップへ' + icon('chevron-right',15) + '</a></section>';
  }

  function orderButton(action, price, label, state) {
    const shortage = Math.max(0, price - state.gold);
    return '<button class="button primary fu-order" type="button" data-fu-order="' + esc(action) + '"' +
      (pending || shortage ? ' disabled' : '') + '>' + icon('coin',16) + price + ' Gで' + esc(label) + '</button>' +
      (shortage ? '<small class="fu-shortage">あと ' + shortage + ' G</small>' : '');
  }

  function product(item, state) {
    const example = window.GardenData.get(item.id === 'fertilizer' ? 'rice' : 'bean');
    return '<article class="fu-product"><figure class="fu-example">' + app().art(example.id) +
      '<figcaption>' + esc(example.name) + 'に使えるよ</figcaption></figure><div class="fu-product-copy">' +
      '<h3>' + esc(item.name) + '</h3><p>' + esc(item.description) + '</p><small>持っている数　' +
      (state.items[item.id] || 0) + ' 個</small><div class="fu-order-row">' +
      orderButton(item.id, item.price, '1個買う', state) + '</div></div></article>';
  }

  function unlocks(state) {
    const catalog = window.GardenData.species;
    const next = catalog.filter(plant => farmer().requirement(plant.id) === state.level + 1);
    let preview = '<p>全' + catalog.length + '種を育てられるレベルになったよ。旅で種や苗を集めよう。</p>';
    if (next.length) {
      preview = '<p>Lv.' + (state.level + 1) + ' から育てられる植物は' + next.length + '種類。先に旅で会えるよ。</p>' +
        '<div class="fu-preview">' + next.slice(0,3).map(plant => {
          const place = window.GardenMaps.placesFor(plant.id)[0];
          return '<a href="' + esc(place.href) + '">' + app().art(plant.id) + esc(plant.name) + icon('chevron-right',13) + '</a>';
        }).join('') + '</div>';
    }
    return '<section class="fu-unlocks"><div><h2>' + icon('sprout',21) + ' ファーマー Lv.' + state.level + '</h2>' +
      '<small>これまでの経験値　' + state.xp + '</small>' + progress(state) + '</div><div>' + preview + '</div></section>';
  }

  function renderShop(root) {
    const state = farmer().snapshot();
    const feedback = root.querySelector('[data-fu-feedback]')?.textContent || '';
    root.innerHTML = '<div class="fu-shop" data-farmer-shop><header class="fu-heading"><div><h1>庭のショップ</h1>' +
      '<p>冒険で集めたゴールドで、植物に合う道具をそろえよう。</p></div>' +
      '<div class="fu-wallet">' + icon('coin',26) + '<div><small>持っているゴールド</small><strong>' + state.gold + ' G</strong></div></div></header>' +
      '<section class="fu-shelf"><h2>おせわ用品</h2><div class="fu-products">' +
      farmer().catalog.map(item => product(item, state)).join('') + '</div></section>' +
      '<section class="fu-expansion"><span class="fu-emblem">' + icon('fence',28) + '</span><div><h2>庭を3区画ひろげる</h2>' +
      '<p>いま ' + state.capacity + ' 区画のうち ' + state.occupied + ' 区画で育成中。ひろげると ' +
      (state.capacity + 3) + ' 株まで育てられるよ。</p></div><div class="fu-order-row">' +
      orderButton('expand', state.expansionCost, 'ひろげる', state) + '</div></section>' +
      '<p class="fu-feedback" tabindex="-1" data-fu-feedback>' + esc(feedback) + '</p>' +
      '<section class="fu-travel"><div><h2>' + icon('globe',20) + ' 旅に出てゴールドを集めよう</h2>' +
      '<p>初めての地方や地域で12 G。別の日にまた訪れると2 Gもらえるよ。</p></div>' +
      '<div><a href="#japan">日本地図へ</a><a href="#atlas">世界地図へ</a></div></section>' +
      unlocks(state) + '</div>';

    root.querySelector('[data-farmer-shop]').addEventListener('click', async event => {
      const button = event.target.closest('[data-fu-order]');
      if (!button || button.disabled || pending || event.detail > 1) return;
      const action = button.dataset.fuOrder;
      const restoreFocus = document.activeElement === button;
      pending = true;
      root.querySelectorAll('[data-fu-order]').forEach(control => { control.disabled = true; });
      let message;
      try {
        const result = action === 'expand' ? await farmer().expand() : await farmer().buy(action);
        message = result.message;
      } catch {
        message = '買い物を保存できなかったよ。もう一度ためしてね。';
      } finally {
        pending = false;
      }
      if (root.querySelector('[data-farmer-shop]')) {
        renderShop(root);
        const note = root.querySelector('[data-fu-feedback]');
        note.textContent = message;
        const next = [...root.querySelectorAll('[data-fu-order]')].find(control => control.dataset.fuOrder === action);
        if (restoreFocus && (document.activeElement === document.body || document.activeElement === button)) {
          (next && !next.disabled ? next : note).focus({preventScroll:true});
        }
      }
      app().toast(message);
    });
  }

  window.GardenFarmerUI = {homeStatus, renderShop};
})();
