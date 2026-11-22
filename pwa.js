(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript.src);
  const webPage = ['https:', 'http:'].includes(scriptBase.protocol) && window.isSecureContext;
  const supportsWorker = webPage && 'serviceWorker' in navigator;
  const standalone = window.matchMedia('(display-mode: standalone)');
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let wasInstalled = false;
  let promptEvent = null;
  let offline = supportsWorker ? 'preparing' : 'unavailable';
  const offlineHints = {
    preparing: 'オフライン用に地図や植物の絵を保存中だよ。このページを開いて少し待ってね。',
    ready: '準備できたよ。インターネットがなくても、この端末で庭と地図を開けるよ。',
    error: 'オフライン用の保存が終わらなかったよ。ネットにつないでもう一度開いてね。',
    unavailable: 'この開き方では、オフライン用に保存できないよ。'
  };

  function status() {
    const installed = wasInstalled || standalone.matches || navigator.standalone === true;
    let installMode = 'browser';
    let installHint = 'ブラウザーのメニューに「アプリをインストール」や「ホーム画面に追加」があれば、そこから追加できるよ。';
    if (installed) {
      installMode = 'installed';
      installHint = 'ホーム画面やアプリ一覧から、庭を開けるよ。';
    } else if (!webPage) {
      installMode = 'unavailable';
      installHint = '公開ページをブラウザーで開くと、ホーム画面に追加できる端末があるよ。';
    } else if (promptEvent) {
      installMode = 'prompt';
      installHint = 'ホーム画面に庭のアイコンを追加できるよ。';
    } else if (ios) {
      installMode = 'manual-ios';
      installHint = 'Safariでこのページを開き、共有ボタンから「ホーム画面に追加」をえらんでね。';
    }
    return { installed, installMode, canInstall: installMode === 'prompt', installHint, offline, offlineHint: offlineHints[offline] };
  }

  function notify() {
    window.dispatchEvent(new CustomEvent('garden-pwa-change', { detail: status() }));
  }

  function setOffline(next) {
    if (next === offline) return;
    offline = next;
    notify();
  }

  async function install() {
    const event = promptEvent;
    if (!event) return status().installMode;
    promptEvent = null;
    try {
      // prompt() needs to run inside the original click, before any asynchronous work.
      await event.prompt();
      return (await event.userChoice).outcome;
    } catch {
      return 'unavailable';
    } finally {
      notify();
    }
  }

  window.GardenPWA = { install, status };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    wasInstalled = true;
    promptEvent = null;
    notify();
  });
  if (standalone.addEventListener) standalone.addEventListener('change', notify);

  async function prepareOffline() {
    if (!supportsWorker) return;
    try {
      const registration = await navigator.serviceWorker.register(new URL('sw.js', scriptBase), {
        scope: scriptBase.href, updateViaCache: 'none'
      });
      function watchInstall() {
        const installing = registration.installing;
        function update() {
          if (registration.active?.state === 'activated' || installing?.state === 'activated') {
            setOffline('ready');
          } else if (installing?.state === 'redundant' && !registration.active) {
            setOffline('error');
          }
        }
        if (installing) installing.addEventListener('statechange', update);
        update();
      }
      registration.addEventListener('updatefound', watchInstall);
      watchInstall();
      const ready = await navigator.serviceWorker.ready;
      if (ready.scope === registration.scope) setOffline('ready');
    } catch {
      setOffline('error');
    }
  }
  prepareOffline();
  window.addEventListener('online', () => {
    if (offline === 'error') {
      setOffline('preparing');
      prepareOffline();
    }
  });
})();
