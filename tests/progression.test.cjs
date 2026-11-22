const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function openGarden() {
  let now = new Date(2026, 3, 14, 12).getTime();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({window:{}, Date:Clock});
  const scripts = ['species', 'world-species', 'japan-species', 'regions', 'japan-regions',
    'maps', 'care-profiles', 'farmer-state', 'virtual'];
  for (const name of scripts) {
    const file = path.join(__dirname, '..', name + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename:file});
  }
  await context.window.GardenFarmer.init();
  return {...context.window, skipDays(days) { now += days * 86400000; }};
}

test('ordinary visits and quiz rewards fund a garden for the entire real catalog', async () => {
  const {GardenData, GardenMaps, GardenFarmer:farmer, GardenCare, skipDays} = await openGarden();
  const rare = GardenData.species.find(plant => farmer.requirement(plant.id) === 3);
  const firstStop = GardenMaps.placesFor(rare.id)[0];
  await farmer.claimTrip(firstStop.map.id, firstStop.region.id);
  await farmer.claimSeed(rare.id);
  assert.equal((await farmer.plant(rare.id)).reason, 'level');
  assert.equal(farmer.snapshot().seeds[rare.id], 1);

  const stops = GardenMaps.maps.flatMap(map => map.data.regions.map(region => ({map, region})));
  for (const {map, region} of stops) {
    await farmer.claimTrip(map.id, region.id);
    for (const site of region.plants) {
      if (!farmer.snapshot().seeds[site.id]) assert((await farmer.claimSeed(site.id)).ok, site.id);
    }
  }
  assert.equal(farmer.snapshot().unlocked.length, GardenData.species.length);
  for (const {id} of GardenData.species) {
    if (!farmer.canPlant(id).ok) {
      assert.equal((await farmer.plant(id)).reason, 'space', id);
      assert.equal(farmer.snapshot().seeds[id], 1, id);
      assert((await farmer.expand()).ok, id);
    }
    assert((await farmer.plant(id)).ok, id);
  }
  const bySpecies = new Map(farmer.getPlants().map(plant => [plant.species, plant]));
  assert.equal(bySpecies.size, GardenData.species.length);

  // Pay for one appropriate item per species even after buying all the plots.
  for (const [speciesId, plant] of bySpecies) {
    const kind = GardenCare.get(speciesId).feedKind;
    const item = farmer.catalog.find(product => product.id === kind);
    if (farmer.snapshot().gold < item.price) {
      skipDays(9);
      for (const {map, region} of stops) assert((await farmer.claimTrip(map.id, region.id)).ok);
    }
    assert((await farmer.buy(kind)).ok, speciesId);
    assert((await farmer.care(plant.id, 'water')).ok, speciesId);
    assert((await farmer.care(plant.id, kind)).ok, speciesId);
  }
  assert.equal(farmer.getPlants().filter(plant => plant.careRank > 1).length, bySpecies.size);
});

test('weeks away preserve independent care ranks and let newly planted rice keep growing', async () => {
  const {GardenMaps, GardenFarmer:farmer, GardenVirtual, GardenCare, skipDays} = await openGarden();
  const stop = GardenMaps.placesFor('rice')[0];
  await farmer.claimTrip(stop.map.id, stop.region.id);
  await farmer.claimSeed('rice');
  const {plantId} = await farmer.plant('rice');
  await farmer.claimSeed('rice');
  const twin = await farmer.plant('rice');
  const plant = id => farmer.getPlants().find(p => p.id === id);
  const kind = GardenCare.get('rice').feedKind;
  assert.equal(GardenVirtual.stage(plant(plantId)), 0);
  for (const expectedRank of [2, 2, 3]) {
    assert((await farmer.buy(kind)).ok);
    assert((await farmer.care(plantId, kind)).ok);
    const wallet = farmer.snapshot();
    skipDays(14);
    assert.equal(plant(plantId).careRank, expectedRank);
    assert.equal(plant(twin.plantId).careRank, 1);
    assert.equal(farmer.snapshot().xp, wallet.xp);
    assert.equal(farmer.snapshot().gold, wallet.gold);
    assert.equal(GardenVirtual.stage(plant(twin.plantId)), 3);
  }
});
