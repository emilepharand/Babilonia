<template>
  <div class="browse">
    <h1>Dashboard</h1>
    <p>Hi!</p>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
	name: 'AppDashboard',
	data() {
		return {
			stats: getStats(),
		};
	},
	async created() {
		this.stats = await getStats();
	},
});
</script>
