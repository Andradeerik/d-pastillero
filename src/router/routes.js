const routes = [
  {
    path: '/',
    component: () => import('layouts/LandingLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'medications',
        name: 'medications',
        component: () => import('pages/MedicationsPage.vue')
      },
      {
        path: 'doctors',
        name: 'doctors',
        component: () => import('pages/DoctorsPage.vue')
      },
      {
        path: 'pharmacies',
        name: 'pharmacies',
        component: () => import('pages/PharmaciesPage.vue')
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
