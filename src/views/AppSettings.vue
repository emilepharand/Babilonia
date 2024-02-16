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
    <div class="form-check mb-2">
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
    <div>
      <label
        class="form-label"
        for="databasePath"
      >
        Path to database
      </label>
      <i
        title="The path to the database file. It should be a SQLite file located inside the application folder. The version must match the current application version. The database will be created if it does not exist."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
      <input
        id="databasePath"
        v-model="databasePath"
        class="form-control"
        type="text"
      >
    </div>
    <button
      id="saveButton"
      class="btn btn-primary w-100 mt-2"
      @click="save()"
    >
      Save
    </button>
    <p
      v-if="submitted && !errorMessage"
      id="settingsSavedText"
      class="text-success"
    >
      Settings saved.
    </p>
    <p
      v-if="errorMessage"
      id="settingsErrorText"
      class="text-danger"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import * as bootstrap from 'bootstrap';
import {nextTick, ref} from 'vue';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';
import * as Api from '../ts/api';

const settings = ref(getEmptySettingsNoAsync());
const databasePath = ref('');
const errorMessage = ref('');
const submitted = ref(false);
let previousDatabasePath = '';

(async () => {
	const fetchedSettings = await Api.getSettings();
	const fetchedDatabasePath = await Api.getDatabasePath();
	settings.value = fetchedSettings;
	databasePath.value = fetchedDatabasePath;
	previousDatabasePath = databasePath.value;
})();

async function save() {
	const success = await changeDatabase();
	if (success) {
		await Api.setSettings(settings.value);
	}
	submitted.value = true;
}

async function changeDatabase() {
	if (databasePath.value !== previousDatabasePath || errorMessage.value) {
		previousDatabasePath = databasePath.value;
		const res = await Api.changeDatabase(databasePath.value);
		if (res.status === 200) {
			errorMessage.value = '';
		} else if (((await res.json()).error) === 'UNSUPPORTED_DATABASE_VERSION') {
			errorMessage.value = 'The version of the database is not supported.';
		} else {
			errorMessage.value = 'Database path could not be changed. Please check the path and try again.';
		}
	}
	return errorMessage.value === '';
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
