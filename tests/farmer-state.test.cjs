const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'farmer-state.js'), 'utf8');
const key = 'kansatsu-garden.farmer.v1';

function browser() {
  const rows = new Map();
  let pending = Promise.resolve();
  const locks = {request(name, action) {
    assert.equal(name, key);
    const result = pending.then(action);
    pending = result.catch(() => {});
    return result;
  }};
  const localStorage = {
    get length() { return rows.size; }, key:i => [...rows.keys()][i],
    getItem:id => rows.get(id) ?? null, setItem:(id, value) => rows.set(id, value)
  };
  let now = new Date(2026, 4, 9, 12).getTime();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  function tab(overrides = {}) {
    const events = new EventTarget();
    const window = {navigator:{locks}, localStorage, dispatchEvent:e => events.dispatchEvent(e),
      addEventListener:(...args) => events.addEventListener(...args),
      GardenData:{species:['sunflower', 'morning', 'bean', 'fern', 'rice', 'moss'].map(id => ({id, name:id}))},
      GardenMaps:{maps:[{id:'atlas', data:{regions:[{id:'asia', name:'アジア'}]}}]},
      GardenCare:{get:id => ({level:id === 'fern' ? 2 : id === 'moss' ? 3 : 1,
        feedKind:id === 'fern' ? 'habitat-kit' : 'fertilizer'})}, ...overrides};
    vm.runInNewContext(code, {window, Date:Clock, Event});
    return {f:window.GardenFarmer, events};
  }
  return {tab, rows, localStorage, nextDay() { now += 86400000; }};
}

test('imports all old plants, original growth clocks and watering dates once', async () => {
  const b = browser();
  const p = {id:'starter-sunflower', species:'sunflower', plantedAt:100, starter:true, waterDays:4, lastWatered:'2026-05-09'};
  b.rows.set('kansatsu-garden.virtual.v1.plant.' + p.id, JSON.stringify(p));
  b.rows.set('kansatsu-garden.virtual.v1.learned.sunflower', 'true');
  for (let i = 0; i < 9; i++) b.rows.set('kansatsu-garden.virtual.v1.plant.p' + i, JSON.stringify({...p, id:'p' + i, starter:false}));
  const {f} = b.tab();
  await f.init();
  assert.equal(f.snapshot().occupied, 12);
  assert.equal(f.snapshot().capacity, 13);
  assert.equal(f.getPlants().find(entry => entry.id === p.id).plantedAt, 100);
  assert.equal(f.isCared(p.id, 'water'), true);
  assert.equal((await f.care(p.id, 'water')).reason, 'today');
  assert.equal(f.snapshot().xp, 0);
  assert.equal((await f.claimSeed('sunflower')).first, true);
  assert.equal((await f.claimSeed('sunflower')).reason, 'stock');
  const reopened = b.tab().f;
  await reopened.init();
  assert.equal(reopened.snapshot().gold, 6);
  assert.equal(reopened.getPlants().length, 12);
  assert.equal(reopened.getPlants().find(entry => entry.id === p.id).waterDays, 4);
});

test('concurrent windows claim each trip and quiz reward once and never spend a seed twice', async () => {
  const b = browser();
  const a = b.tab();
  const other = b.tab();
  await Promise.all([a.f.init(), other.f.init()]);
  const trips = await Promise.all([a.f.claimTrip('atlas', 'asia'), other.f.claimTrip('atlas', 'asia')]);
  assert.equal(trips.filter(r => r.ok).length, 1);
  const claims = await Promise.all([other.f.claimSeed('rice'), a.f.claimSeed('rice')]);
  assert.equal(claims.filter(r => r.ok).length, 1);
  const plants = await Promise.all([a.f.plant('rice'), other.f.plant('rice')]);
  assert.equal(plants.filter(r => r.ok).length, 1);
  assert.equal(other.f.snapshot().occupied, 4);
  assert.equal(other.f.snapshot().seeds.rice, 0);
  assert.equal((await other.f.claimSeed('rice')).first, false);
  assert.equal(other.f.snapshot().gold, 18);
  assert.equal(other.f.snapshot().xp, 7);
  b.nextDay();
  assert.equal((await other.f.claimTrip('atlas', 'asia')).gold, 2);
  assert.equal((await other.f.claimTrip('atlas', 'asia')).reason, 'visited');
  a.events.dispatchEvent(new Event('focus'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(a.f.snapshot().gold, 20);
  assert.equal(a.f.snapshot().xp, 7);
});

test('level and capacity gates preserve seeds, expansions spend the shown price and open space', async () => {
  const f = browser().tab().f;
  await f.init();
  assert.equal((await f.expand()).reason, 'gold');
  assert.equal((await f.claimTrip('atlas', 'missing')).reason, 'region');
  assert.equal((await f.claimSeed('missing')).reason, 'species');
  assert.equal((await f.plant('bean')).reason, 'seed');
  await f.claimSeed('fern');
  assert.equal(f.requirement('fern'), 2);
  assert.equal((await f.plant('fern')).reason, 'level');
  assert.equal(f.snapshot().seeds.fern, 1);
  await f.claimSeed('morning');
  await f.claimSeed('bean');
  assert.equal(f.snapshot().level, 2);
  for (const id of ['fern', 'morning', 'bean']) assert.equal((await f.plant(id)).ok, true);
  await f.claimSeed('rice');
  assert.equal((await f.plant('rice')).reason, 'space');
  assert.equal(f.snapshot().seeds.rice, 1);
  const before = f.snapshot();
  await f.expand();
  assert.equal(f.snapshot().gold, before.gold - before.expansionCost);
  assert.equal(f.snapshot().capacity, before.capacity + 3);
  assert.equal((await f.plant('rice')).ok, true);
});

test('daily care, species-specific supplies and individual ranks survive reopening', async () => {
  const b = browser();
  const f = b.tab().f;
  await f.init();
  const id = 'starter-sunflower';
  await f.claimTrip('atlas', 'asia');
  assert.equal((await f.care(id, 'fertilizer')).reason, 'item');
  await f.buy('habitat-kit');
  assert.equal((await f.care(id, 'habitat-kit')).reason, 'fit');
  assert.equal(f.snapshot().items['habitat-kit'], 1);
  await f.buy('fertilizer');
  assert.equal((await f.buy('fertilizer')).reason, 'gold');
  const start = f.snapshot();
  await f.care(id, 'water');
  await f.care(id, 'fertilizer');
  assert.equal(f.isCared(id, 'fertilizer'), true);
  assert.equal((await f.care(id, 'fertilizer')).reason, 'today');
  assert.equal((await f.care(id, 'water')).reason, 'today');
  assert.equal(f.snapshot().xp, start.xp + 5);
  assert.equal(f.snapshot().items.fertilizer, 0);
  assert.equal(f.getPlants().find(p => p.id === id).careRank, 2);
  b.nextDay();
  const reopened = b.tab().f;
  await reopened.init();
  assert.equal(reopened.isCared(id, 'water'), false);
  assert.equal(reopened.getPlants().find(p => p.id === id).fitCareDays, 1);
  await reopened.care(id, 'water');
  assert.equal(reopened.getPlants().find(p => p.id === id).waterDays, 2);
});

test('a failed commit leaves coins, seeds, and plants at their last saved values', async () => {
  const b = browser();
  const f = b.tab().f;
  await f.init();
  await f.claimSeed('bean');
  const previous = JSON.stringify(f.snapshot());
  const write = b.localStorage.setItem;
  b.localStorage.setItem = () => { throw new Error('quota exceeded'); };
  assert.equal((await f.plant('bean')).reason, 'save');
  assert.equal((await f.buy('fertilizer')).reason, 'save');
  assert.equal(JSON.stringify(f.snapshot()), previous);
  b.localStorage.setItem = write;
  assert.equal((await f.plant('bean')).ok, true);
  assert.equal((await f.plant('bean')).reason, 'seed');
});

test('restricted storage still opens the game; a readable existing garden stays intact', async () => {
  const b = browser();
  const denied = {getItem() { throw new Error('storage disabled'); }};
  const indexedDB = {open() { throw new Error('database disabled'); }};
  const limited = b.tab({localStorage:denied, navigator:{}, indexedDB}).f;
  await limited.init();
  assert.equal(limited.snapshot().sessionOnly, true);
  assert.equal((await limited.claimSeed('rice')).ok, true);
  assert.equal(limited.snapshot().gold, 6);
  const saved = b.tab().f;
  await saved.init();
  await saved.claimTrip('atlas', 'asia');
  const raw = b.rows.get(key);
  const reader = b.tab({navigator:{}, indexedDB}).f;
  await reader.init();
  assert.equal(reader.snapshot().gold, 12);
  assert.equal((await reader.claimSeed('rice')).reason, 'save');
  assert.equal(b.rows.get(key), raw);
});
