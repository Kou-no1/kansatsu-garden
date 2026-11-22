(() => {
  'use strict';

  const maps = [
    {id:'japan', name:'日本地図', data:window.GardenJapan},
    {id:'atlas', name:'世界地図', data:window.GardenRegions}
  ];

  function placesFor(speciesId) {
    return maps.flatMap(map => {
      const place = map.data.forSpecies(speciesId);
      if (!place) return [];
      const href = '#' + map.id + '/' + place.region.id + '/' + encodeURIComponent(speciesId);
      return [{...place, map, href}];
    });
  }

  window.GardenMaps = {maps, placesFor};
})();
