// sw.js - Service Worker لفجر
const CACHE_NAME = 'fajr-v1';
const urlsToCache = [
    'Dawn_v.1.6.8.2.html',
    'manifest.json'
];

// تثبيت الـ Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ فجر: تم فتح الكاش');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('❌ فجر: فشل التخزين المؤقت', err))
    );
});

// تفعيل الـ Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 فجر: حذف الكاش القديم', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // لو في الكاش، رجعه
                if (response) {
                    return response;
                }
                // لو مش في الكاش، روح للشبكة
                return fetch(event.request).then(
                    response => {
                        // لو الشبكة ردت، خزنها في الكاش
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
