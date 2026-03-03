const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        name: 'home',
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
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

