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

                'IX_MAROKO/index.html',
                'IX_MAROKO/style.css',
                'IX_MAROKO/script.js',
                'IX_TURKI/index.html',
                'IX_TURKI/style.css',
                'IX_TURKI/script.js',
                'IX_UNI_EMIRATE_ARAB/index.html',
                'IX_UNI_EMIRATE_ARAB/style.css',
                'IX_UNI_EMIRATE_ARAB/script.js',
                'VII_BRUNEI_DARUSSALAM/index.html',
                'VII_BRUNEI_DARUSSALAM/style.css',
                'VII_BRUNEI_DARUSSALAM/script.js',
                'VII_MALAYSIA/index.html',
                'VII_MALAYSIA/style.css',
                'VII_MALAYSIA/script.js',
                'VII_TUNISIA/index.html',
                'VII_TUNISIA/style.css',
                'VII_TUNISIA/script.js',
                'VII_YORDANIA/index.html',
                'VII_YORDANIA/style.css',
                'VII_YORDANIA/script.js',
                'VIII_EGYPT/index.html',
                'VIII_EGYPT/style.css',
                'VIII_EGYPT/script.js',
                'VIII_INDONESIA/index.html',
                'VIII_INDONESIA/style.css',
                'VIII_INDONESIA/script.js',
                'VIII_PALESTINA/index.html',
                'VIII_PALESTINA/style.css',
                'VIII_PALESTINA/script.js',
                'VIII_QATAR/index.html',
                'VIII_QATAR/style.css',
                'VIII_QATAR/script.js',
                'XI MAROKO/index.html',
                'XI MAROKO/style.css',
                'XI MAROKO/script.js',
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
