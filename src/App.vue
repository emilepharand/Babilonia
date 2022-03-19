<template>
  <main class="container">
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <router-link to="/" class="navbar-brand">
            <img height="110" src="/img/logo.png" alt="Babilonia Logo">
          </router-link>
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/ideas/dashboard" class="nav-link">Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/ideas/practice" class="nav-link">Practice</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/ideas/browse" class="nav-link">Browse</router-link>
            </li>
            <li class="nav-item dropdown" :class="{ active: isManageLink }">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                Manage
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                <li>
                  <router-link class="dropdown-item" to="/manage/ideas">Ideas</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/manage/languages">Languages</router-link>
                </li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link to="/settings" class="nav-link">Settings</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/help" class="nav-link">Help</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <router-view/>
  </main>
</template>

<style scoped>
main {
  margin-top:1rem;
  display:flex;
  justify-content: center;
}
</style>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
	name: 'App',
	data() {
		return {
		};
	},
	computed: {
		isManageLink() {
			return this.$route.path.startsWith('/manage');
		},
	},
});
</script>
