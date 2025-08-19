const CACHE_NAME = 'nizar-jewellery-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Skip caching for these patterns
const skipCachePatterns = [
  '/uploads/',
  '/api/',
  'localhost:3002',
  'chrome-extension://',
  'data:',
  'blob:'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Cache addAll failed:', error);
          // Continue installation even if cache fails
          return Promise.resolve();
        });
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip caching for specific patterns
  const shouldSkipCache = skipCachePatterns.some(pattern => 
    event.request.url.includes(pattern)
  );
  
  if (shouldSkipCache) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(error => {
          console.log('Fetch failed:', error);
          // Return a fallback response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network error', { status: 503 });
        });
      })
      .catch(error => {
        console.log('Cache match failed:', error);
        // Try to fetch from network as fallback
        return fetch(event.request).catch(fetchError => {
          console.log('Network fetch also failed:', fetchError);
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Service unavailable', { status: 503 });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients to ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Message event for cache clearing
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});
