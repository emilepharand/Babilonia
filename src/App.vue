<template>
  <div>
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <router-link to="/" class="navbar-brand">
            <img height="110" src="/img/logo.png" alt="Babilonia Logo">
          </router-link>
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link id="dashboard-link" to="/" class="nav-link">Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link id="practice-link" to="/practice" class="nav-link">Practice</router-link>
            </li>
            <li class="nav-item">
              <router-link id="add-ideas-link" to="/ideas/add" class="nav-link">Add Ideas</router-link>
            </li>
            <li class="nav-item">
              <router-link id="search-ideas-link" to="/ideas/search" class="nav-link">Search Ideas</router-link>
            </li>
            <li class="nav-item">
              <router-link id="languages-link" to="/languages" class="nav-link">Languages</router-link>
            </li>
            <li class="nav-item">
              <router-link id="settings-link" to="/settings" class="nav-link">Settings</router-link>
            </li>
            <li class="nav-item">
              <router-link id="help-link" to="/help" class="nav-link">Help</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <main class="container">
      <router-view/>
    </main>
  </div>
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
