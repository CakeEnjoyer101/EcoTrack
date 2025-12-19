const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/MoodTrackerPage.vue'),
        name: 'dashboard',
      },
      {
        path: '/mood-tracker',
        component: () => import('pages/MoodTrackerPage.vue'),
        name: 'mood-tracker',
      },
      {
        path: '/sensors',
        component: () => import('pages/SensorsPage.vue'),
        name: 'sensors',
      },
      {
        path: '/analytics',
        component: () => import('pages/AnalyticsPage.vue'),
        name: 'analytics',
      },
      {
        path: '/settings',
        component: () => import('pages/SettingsPage.vue'),
        name: 'settings',
      },
      {
        path: '/impressum',
        name: 'Impressum',
        component: () => import('pages/ImpressumPage.vue'),
      },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
