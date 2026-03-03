
import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: ['axios', 'pinia'],
    css: ['app.scss'],
    extras: [

      'roboto-font',
      'material-icons',
    ],
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      distDir: '../server/public',

      vueRouterMode: 'hash',

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },
    devServer: {
      open: true,
      port: 9000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    framework: {
      config: {
        brand: {
          primary: '#26A69A',
          secondary: '#00796B',
          accent: '#1976D2',
          dark: '#1D1D1D',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
        notify: {},
      },
      plugins: ['Notify'],
      lang: 'de',
    },
    animations: [],
    ssr: {
      prodPort: 3000,

      middlewares: [
        'render',
      ],

      pwa: false,
    },
    pwa: {
      workboxMode: 'InjectManifest',
      registerType: 'autoUpdate',
      manifest: {
        id: '/',
        name: 'EcoTrack PWA',
        short_name: 'EcoTrack',
        description: 'Umwelt- und Gesundheitsmonitor als installierbare Progressive Web App',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#26A69A',
        lang: 'de',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/dashboard-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'EcoTrack Desktop Dashboard',
          },
          {
            src: 'screenshots/dashboard-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            label: 'EcoTrack Mobile Ansicht',
          },
        ],
      },
      workboxOptions: {
        swSrc: 'src-pwa/custom-service-worker.js',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    },
    cordova: {
    },
    capacitor: {
      hideSplashscreen: true,
    },
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,

      bundler: 'packager',

      packager: {
      },

      builder: {

        appId: 'client',
      },
    },
    bex: {


      extraScripts: [],
    },
  }
})
