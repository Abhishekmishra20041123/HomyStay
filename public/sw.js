const CACHE_NAME = 'wanderlust-v3';
const OLD_CACHES = ['wanderlust-v1', 'wanderlust-v2'];

const urlsToCache = [
  '/',
  '/css/style.css',
  '/css/rating.css',
  '/js/script.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css'
];

// Install event - cache resources and delete old caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete old caches
      ...OLD_CACHES.map(cacheName => 
        caches.delete(cacheName).catch(() => {})
      ),
      // Create new cache
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache:', CACHE_NAME);
          // Try to cache each URL individually to prevent total failure
          const cachePromises = urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.log(`Failed to cache ${url}:`, error);
              return Promise.resolve(); // Continue despite error
            });
          });
          return Promise.all(cachePromises);
        })
    ])
  );
  // Force activation immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      ...OLD_CACHES.map(cacheName => 
        caches.delete(cacheName).catch(() => {})
      ),
      // Delete any other caches that don't match current name
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache when offline, but prefer network for CSS/JS
self.addEventListener('fetch', (event) => {
  // For CSS and JS files, always try network first, then cache
  if (event.request.url.includes('/css/') || event.request.url.includes('/js/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network succeeds, update cache and return response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other resources, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request).catch(error => {
            console.log('Fetch error:', error);
            // For icon failures, return a fallback or empty response
            if (event.request.url.includes('/icons/')) {
              console.log('Icon fetch failed, returning empty response');
              return new Response('', { status: 200, headers: {'Content-Type': 'image/png'} });
            }
            throw error;
          });
        })
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Wanderlust!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Wanderlust', options)
  );
});
