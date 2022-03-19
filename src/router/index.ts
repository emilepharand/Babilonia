import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'AppDashboard',
		component: () => import(/* webpackChunkName: "AppDashboard" */ '../views/AppDashboard.vue'),
	},
	{
		path: '/ideas/browse',
		name: 'Browse',
		component: () => import(/* webpackChunkName: "BrowseIdeas" */ '../views/BrowseIdeas.vue'),
	},
	{
		path: '/manage/ideas/add',
		name: 'AddIdea',
		component: () => import(/* webpackChunkName: "AddIdea" */ '../views/AddIdea.vue'),
	},
	{
		path: '/manage/ideas',
		name: 'Ideas',
		component: () => import(/* webpackChunkName: "IdeasDunno" */ '../views/IdeasDunno.vue'),
	},
	{
		path: '/manage/languages',
		name: 'Languages',
		component: () =>
			import(/* webpackChunkName: "ManageLanguages" */ '../views/ManageLanguages.vue'),
	},
	{
		path: '/idea/edit/:id',
		name: 'Edit',
		component: () => import(/* webpackChunkName: "EditIdeas" */ '../views/EditIdeas.vue'),
	},
	{
		path: '/ideas/practice',
		name: 'Practice',
		component: () => import(/* webpackChunkName: "PracticeIdeas" */ '../views/PracticeIdeas.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	linkActiveClass: 'active',
	routes,
});

export default router;
