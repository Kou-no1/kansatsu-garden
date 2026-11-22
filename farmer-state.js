(() => {
  'use strict';

  const key = 'kansatsu-garden.farmer.v1';
  const oldPrefix = 'kansatsu-garden.virtual.v1.plant.';
  const starters = [['sunflower', 106], ['morning', 100], ['bean', 62]];
  const catalog = Object.freeze([
    Object.freeze({id:'fertilizer', name:'植物の肥料', price:5, description:'肥料が合う植物に、少しだけ栄養を届けます。'}),
    Object.freeze({id:'habitat-kit', name:'環境ケアセット', price:5, description:'植物に合わせて、湿り気や育つ場所を整えます。'})
  ]);

  let cached;
  let ready;
  let database;
  let store;
  let backend = 'session';
  let channel;

  const species = id => window.GardenData?.species.find(entry => entry.id === id);
  const profile = id => window.GardenCare?.get(id);
  const requirement = id => species(id) ? (profile(id)?.level || 1) : null;
  const capacity = state => state.baseCapacity + state.expansions * 3;
  const expansionCost = state => Math.min(30, 18 + state.expansions * 2);
  const thresholds = [0, 12, 36];
  const level = xp => xp < thresholds[1] ? 1 : xp < thresholds[2] ? 2 : 3 + Math.floor((xp - thresholds[2]) / 36);
  const nextLevelXp = xp => xp < 36 ? thresholds[level(xp)] : 36 * (level(xp) - 1);
  const ok = (message, extra = {}) => ({ok:true, message, ...extra});
  const fail = (reason, message) => ({ok:false, reason, message});
  const copy = value => JSON.parse(JSON.stringify(value));
  const careRank = days => days >= 3 ? 3 : days >= 1 ? 2 : 1;

  function today() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  function initialState() {
    const plants = [];
    try {
      const legacy = window.localStorage;
      for (let i = 0; i < legacy.length; i++) {
        const name = legacy.key(i);
        if (!name?.startsWith(oldPrefix)) continue;
        let p;
        try { p = JSON.parse(legacy.getItem(name)); } catch { continue; }
        if (p && name === oldPrefix + p.id && typeof p.id === 'string' && species(p.species) && Number.isFinite(p.plantedAt)) plants.push(p);
      }
    } catch { /* Private browsing may block the old storage. */ }
    for (const [id, hours] of starters) {
      const plantId = 'starter-' + id;
      if (species(id) && !plants.some(p => p.id === plantId)) {
        plants.push({id:plantId, species:id, starter:true, plantedAt:Date.now() - hours * 3600000, lastWatered:'', waterDays:0});
      }
    }
    return {revision:0, gold:0, xp:0, baseCapacity:Math.max(6, plants.length + 1), expansions:0,
      plants, seeds:{}, unlocked:[], items:{fertilizer:0, 'habitat-kit':0}, trips:{}};
  }

  // Every inventory change and its corresponding reward, cost or plant share one commit.
  function change(record, action) {
    const state = record || initialState();
    const result = action ? action(state) : ok('庭をひらいたよ。');
    const write = !record || Boolean(action && result.ok);
    if (write) state.revision++;
    return {state, result, write};
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(key + '.writer', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('mutex');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function storedChange(action) {
    const raw = store.getItem(key);
    const outcome = change(raw === null ? null : JSON.parse(raw), action);
    if (outcome.write) store.setItem(key, JSON.stringify(outcome.state));
    return outcome;
  }

  // Older/insecure contexts lack Web Locks. A readwrite transaction on the same
  // object store serializes callbacks across tabs; the ledger always stays in the same key.
  function databaseChange(action) {
    return new Promise((resolve, reject) => {
      const tx = database.transaction('mutex', 'readwrite');
      const request = tx.objectStore('mutex').get('writer');
      request.onsuccess = () => {
        try { resolve(storedChange(action)); } catch (error) { reject(error); }
      };
      tx.onabort = () => reject(tx.error);
    });
  }

  async function transact(action) {
    let outcome;
    if (backend === 'locked') {
      outcome = await window.navigator.locks.request(key, () => storedChange(action));
    } else if (backend === 'database') {
      outcome = await databaseChange(action);
    } else if (backend === 'readonly') {
      if (action) return fail('save', '庭を安全に保存できないよ。ブラウザの保存設定を確かめてね。');
      outcome = {state:JSON.parse(store.getItem(key)), result:ok('保存していた庭をひらいたよ。'), write:false};
    } else {
      outcome = change(cached && copy(cached), action);
    }
    const {state, result, write} = outcome;
    if (!cached || state.revision > cached.revision) {
      cached = state;
      window.dispatchEvent?.(new Event('garden-farmer-change'));
    }
    if (write) channel?.postMessage(state.revision);
    if (backend === 'session' && action && result.ok) result.message += ' この画面を開いている間だけ保存します。';
    return result;
  }

  async function setup() {
    let saved;
    try { store = window.localStorage; saved = store.getItem(key); } catch { store = null; }
    if (store && window.navigator?.locks?.request) backend = 'locked';
    else if (store) {
      try { database = await openDatabase(); backend = 'database'; }
      catch { backend = saved !== null ? 'readonly' : 'session'; }
    }
    let result;
    try { result = await transact(); }
    catch (error) {
      // A full store may still contain an existing garden. Never discard it or
      // redirect future purchases into a second durable save.
      const current = store?.getItem(key);
      if (current) {
        backend = 'readonly';
        result = await transact();
      } else if (saved) throw error;
      else {
        backend = 'session';
        result = await transact();
      }
    }
    const sync = () => transact().catch(() => {});
    if (backend !== 'session') {
      window.addEventListener?.('storage', event => { if (event.key === key) sync(); });
      window.addEventListener?.('focus', sync);
      if (window.BroadcastChannel) {
        try {
          channel = new window.BroadcastChannel(key);
          channel.onmessage = event => { if (event.data > cached.revision) sync(); };
        } catch { /* Storage and focus events still refresh the view. */ }
      }
    }
    return result;
  }

  function init() {
    if (!ready) ready = setup().catch(error => { ready = null; throw error; });
    return ready;
  }

  async function mutate(action) {
    try { await init(); return await transact(action); }
    catch { return fail('save', '庭を保存できなかったよ。空き容量やブラウザの設定を確かめて、もう一度ためしてね。'); }
  }

  function snapshot() {
    const s = cached || initialState();
    return {gold:s.gold, xp:s.xp, level:level(s.xp), nextLevelXp:nextLevelXp(s.xp), capacity:capacity(s),
      occupied:s.plants.length, seeds:{...s.seeds}, unlocked:[...s.unlocked], items:{...s.items},
      expansions:s.expansions, expansionCost:expansionCost(s), trips:Object.keys(s.trips), sessionOnly:backend === 'session'};
  }

  function getPlants() {
    return (cached || initialState()).plants.map(p => ({...p, fitCareDays:p.fitCareDays || 0, careRank:careRank(p.fitCareDays || 0)}))
      .sort((a, b) => a.plantedAt - b.plantedAt || a.id.localeCompare(b.id));
  }

  function claimSeed(id) {
    return mutate(s => {
      const entry = species(id);
      if (!entry) return fail('species', 'この植物は図鑑に見つからないよ。');
      const material = entry.starterLabel || '種';
      const first = !s.unlocked.includes(id);
      if (!first && s.seeds[id] > 0) return fail('stock', 'この植物の' + material + 'はもう種ぶくろにあるよ。');
      if (first) { s.unlocked.push(id); s.gold += 6; s.xp += 4; }
      s.seeds[id] = 1;
      return ok(entry.name + 'の' + material + 'を持ち帰ったよ！' + (first ? ' 6ゴールドと4経験値も手に入れたよ。' : ''), {first, gold:first ? 6 : 0, xp:first ? 4 : 0});
    });
  }

  function claimTrip(mapId, regionId) {
    return mutate(s => {
      const map = window.GardenMaps?.maps.find(m => m.id === mapId);
      const region = map?.data.regions.find(r => r.id === regionId);
      if (!region) return fail('region', '旅先を地図でえらんでね。');
      const place = mapId + ':' + regionId;
      const day = today();
      if (s.trips[place] === day) return fail('visited', '今日の冒険のお礼はもう受け取ったよ。');
      const first = !s.trips[place];
      const gold = first ? 12 : 2;
      const xp = first ? 3 : 0;
      s.trips[place] = day; s.gold += gold; s.xp += xp;
      return ok(region.name + 'を旅して' + gold + 'ゴールドを手に入れたよ！', {first, gold, xp});
    });
  }

  function checkPlant(s, id) {
    if (!species(id)) return fail('species', 'この植物は図鑑に見つからないよ。');
    if (!s.seeds[id]) return fail('seed', 'クイズに正解して、育てる材料を持ち帰ろう。');
    if (level(s.xp) < requirement(id)) return fail('level', 'ファーマーレベル' + requirement(id) + 'で育てられるよ。');
    if (s.plants.length >= capacity(s)) return fail('space', '庭がいっぱいだよ。区画を広げよう。');
    return ok('庭で育てられるよ。');
  }

  function plant(id) {
    return mutate(s => {
      const allowed = checkPlant(s, id);
      if (!allowed.ok) return allowed;
      // The revision is allocated inside the transaction, including across tabs.
      let plantId = 'garden-' + (s.revision + 1);
      while (s.plants.some(p => p.id === plantId)) plantId += '-p';
      s.seeds[id]--;
      s.plants.push({id:plantId, species:id, plantedAt:Date.now(), starter:false, lastWatered:'', waterDays:0});
      return ok(species(id).name + 'が庭のなかまになったよ！', {plantId});
    });
  }

  function buy(id) {
    return mutate(s => {
      const item = catalog.find(entry => entry.id === id);
      if (!item) return fail('item', 'ショップで品物をえらんでね。');
      if (s.gold < item.price) return fail('gold', 'ゴールドが足りないよ。地図で冒険しよう。');
      s.gold -= item.price; s.items[id]++;
      return ok(item.name + 'をひとつ買ったよ。');
    });
  }

  function expand() {
    return mutate(s => {
      const price = expansionCost(s);
      if (s.gold < price) return fail('gold', '庭を広げるには' + price + 'ゴールド必要だよ。');
      s.gold -= price; s.expansions++;
      return ok('庭を広げたよ！ あと3株ぶん植えられるようになったよ。');
    });
  }

  function isCared(id, kind) {
    const p = (cached || initialState()).plants.find(entry => entry.id === id);
    if (!p) return false;
    if (kind === 'water') return p.lastWatered === today();
    return kind === profile(p.species)?.feedKind && p.lastFed === today();
  }

  function care(id, kind) {
    return mutate(s => {
      const p = s.plants.find(entry => entry.id === id);
      if (!p) return fail('plant', '育てる植物を庭でえらんでね。');
      const day = today();
      if (kind === 'water') {
        if (p.lastWatered === day) return fail('today', '今日の水のおせわはできたよ。');
        p.lastWatered = day; p.waterDays = (Number(p.waterDays) || 0) + 1; s.xp += 2;
        return ok(species(p.species).name + 'の水のおせわができたよ！ 経験値が2ふえたよ。', {xp:2});
      }
      if (!catalog.some(item => item.id === kind) || kind !== profile(p.species)?.feedKind) return fail('fit', 'この植物に合う用品をえらんでね。');
      if (p.lastFed === day) return fail('today', '今日の用品のおせわはできたよ。');
      if (!s.items[kind]) return fail('item', 'この用品はショップで買えるよ。');
      s.items[kind]--; p.lastFed = day; p.fitCareDays = (p.fitCareDays || 0) + 1; s.xp += 3;
      return ok(species(p.species).name + 'に合うおせわができたよ！ 経験値が3ふえたよ。', {xp:3, careRank:careRank(p.fitCareDays)});
    });
  }

  window.GardenFarmer = {init, snapshot, catalog, claimSeed, claimTrip, buy, expand, plant, care, requirement,
    canPlant:id => checkPlant(cached || initialState(), id), getPlants, isCared};
})();
