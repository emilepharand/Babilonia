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
    <h2>Database</h2>
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
      <div class="input-group mb-3">
        <input
          id="databasePath"
          v-model="databasePath"
          type="text"
          class="form-control"
          @keyup.enter="changeDatabase()"
        >
        <div class="input-group-append">
          <button
            id="changeDatabaseButton"
            class="btn btn-secondary"
            type="button"
            @click="changeDatabase()"
          >
            Change
          </button>
        </div>
      </div>
    </div>
    <button
      id="saveButton"
      class="btn btn-primary w-100"
      @click="save()"
    >
      Save
    </button>
    <div
      v-if="successMessages.length > 0"
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
      id="errorMessage"
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              id="confirm-migrate-modal-label"
              class="modal-title"
            >
              Update Required
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div class="modal-body">
            The database version does not match the current version of the application. The database needs to be updated to be compatible with the current version.<br><br>
            Do you want to update the database?<br><br>
            <span class="alert-danger">WARNING: This may cause data loss. It is <b>highly</b> recommended to make a backup of the database before proceeding.</span>
            <br><br>
            <h5>What will happen to your data</h5>
            If you did not add or modify any languages, ideas, or expressions, the migration process will be seamless, and everything will be updated as expected.
            <br><br>
            If you did, the migration process will attempt to merge your changes with the updated vocabulary in the newer version. In many cases, conflicts are resolved gracefully, and your content is preserved. However, not all conflicts can be resolved, which may lead to data loss or inconsistencies. That's why it is important to make a backup of the database before proceeding.
            <br><br>
            If you wish, you can also choose the option "Do not import or update content". If you select this option, the database will only be updated for compatibility with the current version, while keeping all of the existing content unchanged. However, you will not benefit from the updated vocabulary.
            <br><br>
            <div class="form-check">
              <input
                id="noContentUpdate"
                v-model="noContentUpdate"
                class="form-check-input"
                type="checkbox"
              >
              <label
                class="form-check-label"
                for="noContentUpdate"
              />
              Do not import or update content
            </div>
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
              Update database
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
const successMessages = ref([] as string[]);
const noContentUpdate = ref(false);
let previousDatabasePath = '';

(async () => {
	await load();
})();

async function load() {
	const fetchedSettings = await Api.getSettings();
	const fetchedDatabasePath = await Api.getDatabasePath();
	settings.value = fetchedSettings;
	databasePath.value = fetchedDatabasePath;
	previousDatabasePath = databasePath.value;
}

async function save() {
	successMessages.value = [];
	await Api.setSettings(settings.value);
	successMessages.value.push('Settings saved.');
}

async function migrate() {
	const migrateResponse = await Api.migrateDatabase(databasePath.value, noContentUpdate.value);
	if (migrateResponse.status === 200) {
		errorMessage.value = '';
		successMessages.value.push('Migration successful.');
		await load();
	} else {
		errorMessage.value = 'Error migrating database. Please check server logs.';
	}
}

async function changeDatabase() {
	if (databasePath.value !== previousDatabasePath || errorMessage.value) {
		const res = await Api.changeDatabase(databasePath.value);
		if (res.status === 200) {
			errorMessage.value = '';
			previousDatabasePath = databasePath.value;
			successMessages.value = ['Database path changed.'];
			await load();
		} else if (((await res.json()).error) === databaseVersionErrorCode) {
			successMessages.value = [];
			new bootstrap.Modal(confirmMigrateModal.value).show();
			confirmMigrateModal.value.addEventListener('shown.bs.modal', async () => {
				confirmMigrateModal.value.setAttribute('loaded', 'true');
			});
			await new Promise(resolve => {
				confirmMigrateModal.value.addEventListener('hidden.bs.modal', resolve);
				confirmMigrateModal.value.removeAttribute('loaded');
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
