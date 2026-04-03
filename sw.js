const CACHE_NAME = 'sjm-moto-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'longride.webp',
  'ax7_1l.webp',
  'ax7_0.8l.webp',
  'withgearoil.webp',
  'cityscooter.webp'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});