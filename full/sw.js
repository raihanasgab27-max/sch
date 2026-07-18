const CACHE = 'roster-v1';

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then((c) =>
            c.addAll([
                'index.html',
                'teachers.html',
                'home.css',
                'home.js',
                'teachers.css',
                'teachers.js',
                'icon.svg',
                'manifest.json',
            ])
        )
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return;

    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const clone = res.clone();
                caches.open(CACHE).then((c) => c.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
