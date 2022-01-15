import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/ideas/browse',
    name: 'Browse',
    component: () => import(/* webpackChunkName: "browse" */ '../views/Browse.vue'),
  },
  {
    path: '/manage/ideas/add',
    name: 'Add',
    component: () => import(/* webpackChunkName: "add" */ '../views/Add.vue'),
  },
  {
    path: '/manage/ideas',
    name: 'Ideas',
    component: () => import(/* webpackChunkName: "ideas" */ '../views/Ideas.vue'),
  },
  {
    path: '/manage/languages',
    name: 'Languages',
    component: () => import(/* webpackChunkName: "languages" */ '../views/Languages.vue'),
  },
  {
    path: '/idea/edit/:id',
    name: 'Edit',
    component: () => import(/* webpackChunkName: "edit" */ '../views/Edit.vue'),
  },
  {
    path: '/ideas/practice',
    name: 'Practice',
    component: () => import(/* webpackChunkName: "practice" */ '../views/Practice.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  linkActiveClass: 'active',
  routes,
});

export default router;
