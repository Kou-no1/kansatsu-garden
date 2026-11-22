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
    puya: ['seed', 'grass-shoot', 'puya-rosette'],
    mizubasho: ['seed', 'grass-shoot', 'jp-mizubasho-young'],
    ezomatsu: ['seed', 'conifer-sprout', 'conifer-young'],
    haskap: ['seed', 'sprout', 'leafy'],
    komakusa: ['seed', 'jp-komakusa-cotyledon', 'jp-komakusa-young'],
    katakuri: ['seed', 'grass-shoot', 'jp-katakuri-leaf'],
    beech: ['seed', 'sprout', 'jp-kerria-young'],
    ginkgo: ['seed', 'cherry-sapling', 'jp-ginkgo-young'],
    'morning-lotus': ['seed', 'waterlily-sprout', 'waterlily-young'],
    yamabuki: ['seed', 'sprout', 'jp-kerria-young'],
    wasabi: ['seed', 'sprout', 'jp-wasabi-young'],
    fujibakama: ['seed', 'sprout', 'leafy'],
    kakitsubata: ['seed', 'grass-shoot', 'jp-iris-young'],
    wisteria: ['seed', 'sprout', 'jp-wisteria-young'],
    ume: ['seed', 'sprout', 'jp-kerria-young'],
    tea: ['seed', 'sprout', 'cacao-young'],
    sugi: ['seed', 'conifer-sprout', 'conifer-young'],
    sudachi: ['seed', 'sprout', 'leafy'],
    camellia: ['seed', 'sprout', 'cacao-young'],
    deigo: ['seed', 'sprout', 'cherry-branches'],
    mangrove: ['jp-mangrove-propagule', 'jp-mangrove-rooted', 'jp-mangrove-young']
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
