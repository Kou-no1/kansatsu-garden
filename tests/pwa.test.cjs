const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const scope = 'https://example.org/school/garden/';

test('the manifest launches in the same garden and its icons have the declared dimensions', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  for (const key of ['id', 'scope', 'start_url']) assert.equal(new URL(manifest[key], scope).href, scope);
  assert.equal(manifest.display, 'standalone');
  for (const icon of [...manifest.icons, { src: 'assets/apple-touch-icon.png', sizes: '180x180' }]) {
    const data = fs.readFileSync(path.join(root, icon.src));
    assert.equal(data.readUInt32BE(0), 0x89504e47);
    assert.equal(data.readUInt32BE(16) + 'x' + data.readUInt32BE(20), icon.sizes);
  }
  assert(manifest.icons.some(icon => icon.purpose === 'maskable'));
});

function loadWorker() {
  const handlers = {};
  const cached = new Set();
  const cache = {
    addAll: async requests => {
      for (const request of requests) {
        assert(request.url.startsWith(scope));
        assert.equal(request.cache, 'reload');
        assert.equal(request.redirect, 'error');
        const name = request.url.slice(scope.length);
        assert(fs.statSync(path.join(root, name)).isFile(), name);
        cached.add(name);
      }
    },
    put: async request => cached.add(request.slice(scope.length)),
    match: async url => cached.has(new URL(url).pathname.slice(new URL(scope).pathname.length))
      ? new Response('cached') : undefined
  };
  vm.runInNewContext(worker, {
    URL, Request, Response, caches: { open: async () => cache },
    self: { registration: { scope }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    fetch: async request => {
      if (request.url === scope + 'index.html') return new Response(html + '<script src="https://elsewhere.invalid/example.js"></script>');
      return new Response('missing', { status: 404 });
    }
  });
  return { handlers, cached, cache };
}

test('first install saves the shell, maps and every picture, including unopened plants', async () => {
  const { handlers, cached } = loadWorker();
  let installed;
  handlers.install({ waitUntil: pending => { installed = pending; } });
  await installed;
  for (const file of fs.readdirSync(path.join(root, 'assets'))) assert(cached.has('assets/' + file), file);
  for (const [, file] of html.matchAll(/<(?:script|link)\b[^>]*?\s(?:src|href)="([^"]+)"/g)) {
    assert(cached.has(file), file);
  }
  assert(cached.has('manifest.webmanifest'));
  let reply;
  const respondWith = pending => { reply = pending; };
  handlers.fetch({ request: new Request(scope + '?from=home'), respondWith });
  assert.equal(await (await reply).text(), 'cached');
  handlers.fetch({ request: new Request(scope + 'missing.webp'), respondWith });
  assert.equal((await reply).status, 404);
  for (const url of ['https://outside.invalid/source', 'https://example.org/other-project/example.js']) {
    handlers.fetch({ request: new Request(url), respondWith: () => assert.fail('Intercepted ' + url) });
  }
});

test('a missing offline resource rejects the new install before it can activate', async () => {
  const { handlers, cache, cached } = loadWorker();
  cache.addAll = async () => { throw new TypeError('Resource returned 404'); };
  let pending;
  handlers.install({ waitUntil: job => { pending = job; } });
  await assert.rejects(pending, /404/);
  assert.equal(cached.size, 0);
});

test('install hints distinguish direct files, iOS, available prompts and a launched app', async () => {
  const pwa = fs.readFileSync(path.join(root, 'pwa.js'), 'utf8');
  const open = (script, options = {}) => {
    const window = new EventTarget();
    Object.assign(window, {
      isSecureContext: options.secure ?? true,
      matchMedia: () => ({ matches: !!options.installed })
    });
    vm.runInNewContext(pwa, {
      URL, CustomEvent, window, document: { currentScript: { src: script } },
      navigator: { platform: '', userAgent: options.userAgent || '' }
    });
    return window;
  };
  const direct = open('file:///garden/pwa.js');
  assert.equal(direct.GardenPWA.status().offline, 'unavailable');
  assert.equal(await direct.GardenPWA.install(), 'unavailable');
  assert.equal(open(scope + 'pwa.js', { userAgent: 'iPhone' }).GardenPWA.status().installMode, 'manual-ios');
  assert.equal(open(scope + 'pwa.js', { installed: true }).GardenPWA.status().installed, true);
  const page = open(scope + 'pwa.js');
  const before = new Event('beforeinstallprompt', { cancelable: true });
  let prompts = 0;
  Object.assign(before, { prompt: async () => { prompts++; }, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
  page.dispatchEvent(before);
  assert.equal(before.defaultPrevented, true);
  assert.equal(page.GardenPWA.status().canInstall, true);
  assert.equal(await page.GardenPWA.install(), 'dismissed');
  assert.equal(page.GardenPWA.status().canInstall, false);
  assert.equal(prompts, 1);
  page.dispatchEvent(new Event('appinstalled'));
  assert.equal(page.GardenPWA.status().installMode, 'installed');
});
