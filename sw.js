const CACHE = 'dorak-v4-docs';
const CORE  = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png',
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('dorak-') && k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
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
