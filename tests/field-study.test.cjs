const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('a regional quiz records learning and only grants a collection pass for an empty bag', () => {
  const saved = new Map();
  const seeds = {};
  const window = {
    localStorage: {
      getItem: key => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value)
    },
    GardenFarmer: {snapshot: () => ({seeds})}
  };
  const location = {hash:'#japan/shikoku'};
  const sandbox = vm.createContext({window, location});
  for (const file of ['regions.js', 'japan-regions.js', 'maps.js', 'field-study.js']) {
    const script = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(script, sandbox, {filename:file});
  }
  const study = window.GardenStudy;
  const site = {mapId:'japan', regionId:'shikoku'};
  const pass = 'kansatsu-garden.virtual.v1.field-pass.japan.shikoku.sudachi';
  study.noteRegionalAnswer('sudachi', {mapId:'atlas', regionId:'asia'});
  assert.equal(study.learned('sudachi'), false);
  assert.equal(study.quizDoneToday(), false);
  seeds.sudachi = 1;
  study.noteRegionalAnswer('sudachi', site);
  assert.equal(study.learned('sudachi'), true);
  assert.equal(study.quizDoneToday(), true);
  assert.equal(saved.has(pass), false);
  seeds.sudachi = 0;
  study.noteRegionalAnswer('sudachi', site);
  assert.equal(saved.get(pass), 'true');
});
