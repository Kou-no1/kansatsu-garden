const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const context = vm.createContext({window: {}});
for (const file of ['species.js', 'world-species.js', 'japan-species.js', 'care-profiles.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, {filename: file});
}
const {GardenData, GardenCare} = context.window;

test('each plant has a sourced, playable care profile', () => {
  const levels = new Set();
  let common = 0;
  for (const plant of GardenData.species) {
    const profile = GardenCare.get(plant.id);
    assert.ok(profile, plant.id);
    assert.equal(new URL(profile.source).protocol, 'https:', plant.id);
    for (const key of ['sourceName', 'environment', 'waterLabel', 'waterHint', 'feedLabel', 'feedHint']) {
      assert.ok(profile[key].trim(), plant.id + '.' + key);
    }
    assert.ok(['fertilizer', 'habitat-kit'].includes(profile.feedKind), plant.id);
    assert.ok([1, 2, 3].includes(profile.level), plant.id);
    assert.ok([1, 2, 3].includes(profile.rarity), plant.id);
    levels.add(profile.level);
    if (profile.rarity === 1) common++;
  }
  assert.equal(levels.size, 3);
  assert.ok(common > GardenData.species.length / 2);
  assert.equal(GardenCare.get('missing'), null);
});

test('all starters open immediately and specialist habitats use suitable care', () => {
  for (const id of ['sunflower', 'morning', 'bean']) assert.equal(GardenCare.get(id).level, 1);
  for (const id of ['saguaro', 'welwitschia', 'giant-lily', 'mangrove', 'komakusa', 'wasabi']) {
    assert.equal(GardenCare.get(id).feedKind, 'habitat-kit', id);
    assert.doesNotMatch(GardenCare.get(id).waterLabel, /水やり/, id);
  }
  assert.match(GardenCare.get('mangrove').waterLabel, /潮/);
  assert.match(GardenCare.get('rice').waterLabel, /水位/);
});
