<template>
  <div class="view">
    <h1>Settings</h1>
    <h2>Practicing</h2>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
      <label class="form-check-label" for="flexCheckDefault">
        Loop ideas randomly
      </label>
      <i title="Draw ideas randomly instead of sequentially."
         data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="right"
         class="fa-solid fa-circle-question"></i>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault2">
      <label class="form-check-label" for="flexCheckDefault2">
        Disable relaxed character mode
      </label>
      <i title="Do not accept <i>e</i> for <i>é</i>, <i>u</i> for <i>ü</i>, and so on."
         data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="right"
         class="fa-solid fa-circle-question"></i>
    </div>
    <button class="btn btn-primary">Save</button>
  </div>
</template>

<style scoped>
i {
  margin-left: 5px;
}
</style>

<script lang="ts">
import {defineComponent} from 'vue';

const bootstrap = require('bootstrap');

export default defineComponent({
	name: 'AppSettings',
	async created() {
	},
	methods: {
	},
	mounted() {
		this.$nextTick(() => {
			const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
			tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
		});
	},
});
</script>
