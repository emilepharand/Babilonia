import type {RouteRecordRaw} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'AppDashboard',
		component: async () =>
			import(
				/* webpackChunkName: "AppDashboard" */ '../views/AppDashboard.vue'
			),
	},
	{
		path: '/practice',
		name: 'Practice',
		component: async () =>
			import(
				/* webpackChunkName: "PracticeIdeas" */ '../views/PracticeIdeas.vue'
			),
	},
	{
		path: '/ideas/add',
		name: 'AddIdea',
		component: async () =>
			import(/* webpackChunkName: "AddIdea" */ '../views/AddIdea.vue'),
	},
	{
		path: '/ideas/:id',
		name: 'EditIdea',
		component: async () =>
			import(/* webpackChunkName: "AddIdea" */ '../views/EditIdea.vue'),
	},
	{
		path: '/ideas/search',
		name: 'SearchIdeas',
		component: async () =>
			import(/* webpackChunkName: "SearchIdeas" */ '../views/SearchIdeas.vue'),
	},
	{
		path: '/languages',
		name: 'ManageLanguages',
		component: async () =>
			import(
				/* webpackChunkName: "ManageLanguages" */ '../views/ManageLanguages.vue'
			),
	},
	{
		path: '/settings',
		name: 'AppSettings',
		component: async () =>
			import(/* webpackChunkName: "AppSettings" */ '../views/AppSettings.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(),
	linkActiveClass: 'active',
	routes,
});

export default router;
