// Change the release when the app is published so existing gardens get a fresh offline copy.
const scope = new URL(self.registration.scope);
const cachePrefix = 'kansatsu-garden:' + encodeURIComponent(scope.pathname) + ':';
const cacheName = cachePrefix + '2026-11-22.2';
const indexURL = new URL('index.html', scope).href;

const plantPictures = [
  'balsam baobab baobab-young bean beech cacao cacao-young cactus-sprout cactus-young camellia',
  'cherry cherry-branches cherry-buds cherry-sapling conifer-sprout conifer-young deigo edelweiss ezomatsu',
  'fern-gametophyte fern-spore fern-young fujibakama giant-lily ginkgo grass-shoot grass-tuft haskap hero',
  'jp-ginkgo-young jp-iris-young jp-katakuri-leaf jp-kerria-young jp-komakusa-cotyledon jp-komakusa-young',
  'jp-mangrove-propagule jp-mangrove-rooted jp-mangrove-young jp-mizubasho-young jp-wasabi-young jp-wisteria-young',
  'kakitsubata katakuri komakusa leafy loofah loofah-young mangrove mizubasho morning morning-lotus morning-young',
  'papyrus puya puya-rosette rice rice-grain saguaro seed sequoia silver-fern sprout sudachi sugi sunflower tea',
  'ume wasabi waterlily-sprout waterlily-young welwitschia welwitschia-young wisteria wollemi yamabuki'
].join(' ').split(' ');

const artwork = [
  ...plantPictures.map(name => name + '.webp'),
  'japan-land.svg', 'world-land.svg', 'garden-mark.svg',
  'app-icon-192.png', 'app-icon-512.png', 'app-icon-maskable-512.png', 'apple-touch-icon.png'
];

function insideGarden(url) {
  return url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
}

async function prepareOffline() {
  const fresh = url => new Request(url, { cache: 'reload', redirect: 'error' });
  const document = await fetch(fresh(indexURL));
  if (!document.ok) throw new Error('The garden page could not be downloaded.');
  const html = await document.clone().text();
  const urls = new Set(['manifest.webmanifest', ...artwork.map(name => 'assets/' + name)]
    .map(file => new URL(file, scope).href));

  // Include the scripts and styles actually shipped with this edition of the game.
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*?\s(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const url = new URL(match[1], indexURL);
    if (insideGarden(url)) urls.add(url.href);
  }
  const cache = await caches.open(cacheName);
  await cache.addAll(Array.from(urls, fresh));
  await cache.put(indexURL, document);
}

self.addEventListener('install', event => {
  event.waitUntil(prepareOffline());
});

// Let open tabs finish using their current release before switching all its files together.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(cachePrefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !insideGarden(url) || request.headers.has('range')) return;

  const home = url.pathname === scope.pathname || url.pathname === new URL(indexURL).pathname;
  if (request.mode === 'navigate' && !home) return;
  const key = home ? indexURL : url.href;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key, { ignoreSearch: true }) || fetch(request);
  })());
});
