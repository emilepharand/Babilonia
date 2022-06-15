import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'AppDashboard',
		component: () =>
			import(
				/* webpackChunkName: "AppDashboard" */ '../views/AppDashboard.vue'
			),
	},
	{
		path: '/practice',
		name: 'Practice',
		component: () =>
			import(
				/* webpackChunkName: "PracticeIdeas" */ '../views/PracticeIdeas.vue'
			),
	},
	{
		path: '/ideas/add',
		name: 'AddIdea',
		component: () =>
			import(/* webpackChunkName: "AddIdea" */ '../views/AddIdea.vue'),
	},
	{
		path: '/ideas/:id',
		name: 'EditIdea',
		component: () =>
			import(/* webpackChunkName: "AddIdea" */ '../views/EditIdea.vue'),
	},
	{
		path: '/ideas/search',
		name: 'SearchIdeas',
		component: () =>
			import(/* webpackChunkName: "SearchIdeas" */ '../views/SearchIdeas.vue'),
	},
	{
		path: '/languages',
		name: 'ManageLanguages',
		component: () =>
			import(
				/* webpackChunkName: "ManageLanguages" */ '../views/ManageLanguages.vue'
			),
	},
	{
		path: '/help',
		name: 'Help',
		component: () =>
			import(/* webpackChunkName: "AppHelp" */ '../views/AppHelp.vue'),
	},
	{
		path: '/settings',
		name: 'AppSettings',
		component: () =>
			import(/* webpackChunkName: "AppSettings" */ '../views/AppSettings.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	linkActiveClass: 'active',
	routes,
});

export default router;
