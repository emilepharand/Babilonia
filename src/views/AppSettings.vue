<template>
  <div class="view">
    <h1>Settings</h1>
    <h2>Practicing</h2>
    <div class="form-check">
      <input v-model="settings.randomPractice" class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
      <label class="form-check-label" for="flexCheckDefault">
        Loop ideas randomly
      </label>
      <i title="Draw ideas randomly instead of sequentially."
         data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="right"
         class="fa-solid fa-circle-question"></i>
    </div>
    <div class="form-check">
      <input v-model="settings.strictCharacters" class="form-check-input" type="checkbox" value="" id="flexCheckDefault2">
      <label class="form-check-label" for="flexCheckDefault2">
        Disable relaxed character mode
      </label>
      <i title="Do not accept <i>e</i> for <i>é</i>, <i>u</i> for <i>ü</i>, and so on."
         data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="right"
         class="fa-solid fa-circle-question"></i>
    </div>
    <button @click="save()" class="btn btn-primary w-100">Save</button>
    <p v-if="showSettingsSavedMessage" class="text-success">Settings saved.</p>
  </div>
</template>

<style scoped>
input[type="checkbox"], label {
  cursor: pointer;
}
i {
  margin-left: 5px;
}
</style>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';

const bootstrap = require('bootstrap');

export default defineComponent({
	name: 'AppSettings',
	data() {
		return {
			settings: getEmptySettingsNoAsync(),
			showSettingsSavedMessage: false,
		};
	},
	async created() {
		this.settings = await Api.getSettings();
	},
	methods: {
		async save() {
			await Api.setSettings(this.settings);
			this.showSettingsSavedMessage = true;
		},
	},
	mounted() {
		this.$nextTick(() => {
			const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
			tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
		});
	},
});
</script>
