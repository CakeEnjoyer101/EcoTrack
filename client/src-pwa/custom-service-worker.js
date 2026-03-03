
import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  getCacheKeyForURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

const CACHE_NAMES = {
  staticAssets: 'ecotrack-static-assets-v2',
  pages: 'ecotrack-pages-v2',
  api: 'ecotrack-api-v2',
}

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

registerRoute(
  ({ request, url }) => {
    if (request.method !== 'GET') {
      return false
    }

    if (url.origin !== self.location.origin) {
      return false
    }

    return ['style', 'script', 'worker', 'font', 'image'].includes(request.destination)
  },
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.staticAssets,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)

registerRoute(
  ({ request, url }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
)

if (process.env.MODE !== 'ssr' || process.env.PROD) {
  const fallbackCandidates = [
    process.env.PWA_FALLBACK_HTML,
    'index.html',
    '/index.html',
    '/',
  ]
  const fallbackUrl = fallbackCandidates.find(
    (candidate) => typeof candidate === 'string' && !!getCacheKeyForURL(candidate),
  )
  const hasFallbackInPrecache = typeof fallbackUrl === 'string' && !!getCacheKeyForURL(fallbackUrl)

  if (hasFallbackInPrecache && fallbackUrl) {
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAMES.pages).then(async (cache) => {
          const existing = await cache.match(fallbackUrl)
          if (!existing) {
            await cache.add(fallbackUrl)
          }
        }).catch(() => undefined),
      )
    })

    registerRoute(
      new NavigationRoute(
        createHandlerBoundToURL(fallbackUrl),
        { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
      )
    )
  } else {
    registerRoute(
      ({ request, url }) => request.mode === 'navigate' && request.method === 'GET' && url.origin === self.location.origin,
      new NetworkFirst({
        cacheName: CACHE_NAMES.pages,
        networkTimeoutSeconds: 3,
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    )
  }
}

