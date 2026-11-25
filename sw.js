/* دُرَك service worker — v5 (2026-11-24)
   Update strategy:
   - skipWaiting + clients.claim: new version takes over immediately
   - network-first for the app shell (HTML/manifest): installed PWAs see updates on next open
   - cache-first only for static assets (logos/icons) with background refresh
   - notifies open pages (SW_UPDATED) so they reload onto the new version
*/
const VERSION = 'v6.0-2026-11-25';
const CACHE = 'dorak-' + VERSION;
const CORE  = ['/', '/index.html', '/manifest.json', '/supabase.min.js', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png',
  '/logos/aaib.png','/logos/abc.png','/logos/abe.png','/logos/abk.png','/logos/adcb.png',
  '/logos/adib.png','/logos/aib.png','/logos/alex.png','/logos/arab.png','/logos/awb.png',
  '/logos/baraka.png','/logos/ca.png','/logos/cairo.png','/logos/cib.png','/logos/citi.png',
  '/logos/ealb.png','/logos/ebe.png','/logos/egb.png','/logos/enbd.png','/logos/fab.png',
  '/logos/faisal.png','/logos/hdb.png','/logos/hsbc.png','/logos/idb.png','/logos/kfh.png',
  '/logos/mashreq.png','/logos/mid.png','/logos/misr.png','/logos/nbe.png','/logos/nbk.png',
  '/logos/nsb.png','/logos/nxt.png','/logos/qnb.png','/logos/saib.png','/logos/sc.png',
  '/logos/scb.png','/logos/ub.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // delete every old cache, whatever its name, so stale shells can never be served again
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const wins = await self.clients.matchAll({ type: 'window' });
    for (const w of wins) {
      try { w.postMessage({ type: 'SW_UPDATED', version: VERSION }); } catch (_) {}
    }
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Google Fonts: cache first so installed PWAs keep their typography offline
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // App shell: network first, cache only as offline fallback
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/manifest.json') {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() =>
        caches.match(e.request).then(c => c || caches.match('/index.html'))
      )
    );
    return;
  }

  // Static assets: cache first, refresh in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
