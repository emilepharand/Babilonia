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
        title="The path to the database file. It should be a SQLite file located inside the application folder. The database will be created if it does not exist. You can specify `:memory:` to use an in-memory database."
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
    <div
      v-if="successMessages.length > 0 && !errorMessage"
      id="successMessage"
    >
      <p
        v-for="successMessage in successMessages"
        :key="successMessage"
        class="text-success"
      >
        {{ successMessage }}
      </p>
    </div>
    <p
      v-if="errorMessage"
      id="settingsErrorText"
      class="text-danger"
    >
      {{ errorMessage }}
    </p>
    <div
      id="confirm-migrate-modal"
      ref="confirmMigrateModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="confirm-migrate-modal-label"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              id="confirm-migrate-modal-label"
              class="modal-title"
            >
              Confirm
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div class="modal-body">
            The database version does not match the application version.<br><br>
            Do you want to migrate the database?<br><br>
            <span class="alert-danger">WARNING: This may cause data loss. It is <b>highly</b> recommended to make a backup of the database before proceeding.</span>
          </div>
          <div class="modal-footer">
            <button
              id="modal-cancel-button"
              ref="modalCancelButton"
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              id="modal-migrate-button"
              ref="modalMigrateButton"
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="migrate()"
            >
              Migrate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as bootstrap from 'bootstrap';
import {nextTick, ref} from 'vue';
import {databaseVersionErrorCode} from '../../server/const';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';
import * as Api from '../ts/api';

const confirmMigrateModal = ref(document.createElement('div'));
const settings = ref(getEmptySettingsNoAsync());
const databasePath = ref('');
const errorMessage = ref('');
const successMessages = ref(['']);
let previousDatabasePath = '';

(async () => {
	const fetchedSettings = await Api.getSettings();
	const fetchedDatabasePath = await Api.getDatabasePath();
	settings.value = fetchedSettings;
	databasePath.value = fetchedDatabasePath;
	previousDatabasePath = databasePath.value;
})();

async function save() {
	successMessages.value = [];
	const success = await changeDatabase();
	if (success) {
		await Api.setSettings(settings.value);
		successMessages.value.push('Settings saved.');
	}
}

async function migrate() {
	const migrateResponse = await Api.migrateDatabase(databasePath.value);
	if (migrateResponse.status === 200) {
		errorMessage.value = '';
		successMessages.value.push('Migration successful.');
	} else {
		errorMessage.value = 'An error occurred during migration. Please check the server logs for more information.';
	}
}

async function changeDatabase() {
	if (databasePath.value !== previousDatabasePath || errorMessage.value) {
		const res = await Api.changeDatabase(databasePath.value);
		if (res.status === 200) {
			errorMessage.value = '';
			previousDatabasePath = databasePath.value;
		} else if (((await res.json()).error) === databaseVersionErrorCode) {
			successMessages.value = [];
			new bootstrap.Modal(confirmMigrateModal.value).show();
			await new Promise(resolve => {
				confirmMigrateModal.value.addEventListener('hidden.bs.modal', resolve);
			});
		} else {
			errorMessage.value = 'Invalid database path.';
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
