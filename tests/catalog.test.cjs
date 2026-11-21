const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const context = vm.createContext({window: {}});
const catalogScripts = new Set(['species.js', 'world-species.js', 'regions.js', 'growth-art.js']);
for (const [, file] of page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
  if (catalogScripts.has(file)) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
  }
}
const {GardenData, GardenRegions, GardenGrowthArt} = context.window;

test('every catalog entry has a unique plant ID, four growth stages and a usable quiz', () => {
  const ids = new Set();
  for (const plant of GardenData.species) {
    assert(!ids.has(plant.id), 'Duplicate plant: ' + plant.id);
    ids.add(plant.id);
    assert.equal(GardenData.get(plant.id), plant);
    assert.equal(plant.stages.length, 4, plant.id);
    assert(plant.stages.every(label => typeof label === 'string' && label.trim()), plant.id);
    assert.equal(plant.answers.length, 3, plant.id);
    assert.equal(new Set(plant.answers).size, plant.answers.length, plant.id);
    assert(Number.isInteger(plant.correct) && plant.answers[plant.correct], plant.id);
    assert.equal(new URL(plant.source).protocol, 'https:', plant.id);
  }
  assert(ids.size >= 18);
});

test('each plant opens one place in the six-region atlas', () => {
  const plotted = new Set();
  assert.equal(GardenRegions.regions.length, 6);
  assert.equal(new Set(GardenRegions.regions.map(region => region.id)).size, GardenRegions.regions.length);
  function coordinates(point) {
    assert(Number.isFinite(point.lat) && Math.abs(point.lat) <= 90, point.id);
    assert(Number.isFinite(point.lon) && Math.abs(point.lon) <= 180, point.id);
  }
  for (const region of GardenRegions.regions) {
    coordinates(region);
    assert(region.plants.length > 0, region.id);
    for (const site of region.plants) {
      coordinates(site);
      assert(GardenData.get(site.id), site.id);
      assert(!plotted.has(site.id), site.id);
      plotted.add(site.id);
      assert.equal(GardenRegions.forSpecies(site.id).region, region);
      assert.equal(GardenRegions.forSpecies(site.id).plant, site);
      assert(site.place && site.note && site.sourceName, site.id);
      assert.equal(new URL(site.source).protocol, 'https:', site.id);
    }
  }
  assert.deepEqual(plotted, new Set(GardenData.species.map(plant => plant.id)));
});

test('the catalog references real local WebP illustrations', () => {
  function checkWebp(basename) {
    const bytes = fs.readFileSync(path.join(root, 'assets', basename + '.webp'));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', basename);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', basename);
  }
  for (const plant of GardenData.species) {
    checkWebp(plant.id);
    for (let stage = 0; stage < plant.stages.length; stage++) {
      checkWebp(GardenGrowthArt.file(plant.id, stage));
    }
  }
});
