<template>
  <div class="view">
    <h1>Settings</h1>
    <h2>Practicing</h2>
    <div class="form-check">
      <input
        id="randomPractice"
        v-model="settings.randomPractice"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="randomPractice"
      >
        Loop ideas randomly
      </label>
      <i
        title="Draw ideas randomly instead of sequentially."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <div class="form-check">
      <input
        id="strictCharacters"
        v-model="settings.strictCharacters"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="strictCharacters"
      >
        Disable relaxed character mode
      </label>
      <i
        title="Do not accept <i>e</i> for <i>é</i>, <i>u</i> for <i>ü</i>, and so on."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <div class="form-check">
      <input
        id="practiceOnlyNotKnown"
        v-model="settings.practiceOnlyNotKnown"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="practiceOnlyNotKnown"
      >
        Practice only not known expressions
      </label>
      <i
        title="Do not practice expressions that you have marked as known."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <div class="form-check">
      <input
        id="passiveMode"
        v-model="settings.passiveMode"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="passiveMode"
      >
        Enable passive mode
      </label>
      <i
        title="All expressions are shown."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <button
      id="saveButton"
      class="btn btn-primary w-100"
      @click="save()"
    >
      Save
    </button>
    <p
      v-if="showSettingsSavedMessage"
      id="settingsSavedText"
      class="text-success"
    >
      Settings saved.
    </p>
  </div>
</template>

<script lang="ts" setup>
import {nextTick, ref} from 'vue';
import * as Api from '../ts/api';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';
import * as bootstrap from 'bootstrap';

const settings = ref(getEmptySettingsNoAsync());
const showSettingsSavedMessage = ref(false);

(async () => {
	settings.value = await Api.getSettings();
})();

async function save() {
	await Api.setSettings(settings.value);
	showSettingsSavedMessage.value = true;
}

void nextTick(() => {
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
</script>

<style scoped>
input[type="checkbox"], label {
  cursor: pointer;
}

i {
  margin-left: 5px;
}
</style>
