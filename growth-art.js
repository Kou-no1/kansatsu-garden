(() => {
  'use strict';

  const earlyStages = {
    morning: ['seed', 'sprout', 'morning-young'],
    baobab: ['seed', 'sprout', 'baobab-young'],
    welwitschia: ['seed', 'sprout', 'welwitschia-young'],
    rice: ['rice-grain', 'grass-shoot', 'grass-tuft'],
    papyrus: ['seed', 'grass-shoot', 'grass-tuft'],
    loofah: ['seed', 'sprout', 'loofah-young'],
    cherry: ['cherry-sapling', 'cherry-branches', 'cherry-buds'],
    cacao: ['seed', 'sprout', 'cacao-young'],
    'giant-lily': ['seed', 'waterlily-sprout', 'waterlily-young'],
    saguaro: ['seed', 'cactus-sprout', 'cactus-young'],
    sequoia: ['seed', 'conifer-sprout', 'conifer-young'],
    wollemi: ['seed', 'sprout', 'conifer-young'],
    'silver-fern': ['fern-spore', 'fern-gametophyte', 'fern-young'],
    puya: ['seed', 'grass-shoot', 'puya-rosette']
  };
  const seedlingStages = ['seed', 'sprout', 'leafy'];

  function file(id, stage = 3) {
    const plant = window.GardenData.get(id);
    if (!plant) return 'leafy';
    if (stage === 3) return plant.id;
    return (earlyStages[plant.id] || seedlingStages)[stage] || plant.id;
  }

  window.GardenGrowthArt = {file};
})();
