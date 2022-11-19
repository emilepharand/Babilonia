<template>
  <div class="view">
    <h1>Languages</h1>
    <div
      v-if="loaded && languages.length !== 0"
      class="edit-languages-block"
    >
      <h2>Edit</h2>
      <table class="languages-table table table-sm table-hover">
        <thead>
          <tr>
            <th scope="col">
              Name
            </th>
            <th scope="col">
              Order
            </th>
            <th scope="col">
              Practice
            </th>
            <th scope="col">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lang in languages"
            :key="lang.id"
            class="language-row"
          >
            <td>
              <input
                v-model="lang.name"
                class="language-name"
                type="text"
              >
            </td>
            <td>
              <input
                v-model="lang.ordering"
                class="language-ordering"
                type="number"
                @keypress="allowOnlyNumbers"
              >
            </td>
            <td>
              <input
                v-model="lang.isPractice"
                class="language-is-practice"
                type="checkbox"
              >
            </td>
            <td>
              <button
                class="btn btn-danger btn-sm delete-language-button"
                data-bs-toggle="modal"
                data-bs-target="#confirm-delete-modal"
                @click="languageIdToDelete = lang.id"
              >
                X
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex align-items-center">
        <button
          id="save-languages-button"
          class="btn btn-primary btn-sm"
          @click="saveLanguages()"
        >
          Save
        </button>
        <span
          id="languages-saved-text"
          class="pl-2 text-success d-none"
        >
          Languages saved.
        </span>
        <span
          v-if="isShowSaveError"
          id="error-save-text"
          class="pl-2 text-danger"
        >{{ saveErrorText }}</span>
      </div>
    </div>
    <div class="add-language-block">
      <h2>Add</h2>
      <div>
        <input
          id="new-language-name"
          ref="newLanguageNameInput"
          v-model="newLanguageName"
          type="text"
          @keyup.enter="addLanguage()"
        >
        <div class="d-flex align-items-center">
          <button
            id="add-language-button"
            class="btn btn-primary btn-sm"
            @click="addLanguage()"
          >
            Add
          </button>
          <span
            v-if="isShowAddError"
            id="error-add-language-text"
            class="pl-2 text-danger"
          >{{ addErrorText }}</span>
        </div>
      </div>
    </div>
    <div
      id="confirm-delete-modal"
      ref="confirmDeleteModal"
      class="modal fade confirm-delete-modal"
      tabindex="-1"
      aria-labelledby="confirm-delete-modal-label"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              id="confirm-delete-modal-label"
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
            Do you really want to delete this language?<br><br>
            <b>WARNING:</b> All expressions in that language will be deleted.<br><br>
            This action is irreversible. If in doubt, backup the database first.
          </div>
          <div class="modal-footer">
            <button
              id="modal-cancel-button"
              ref="modalCancelButton"
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @keydown.right="modalDeleteButton.focus()"
            >
              Cancel
            </button>
            <button
              id="modal-delete-button"
              ref="modalDeleteButton"
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="deleteLanguage()"
              @keydown.left="modalCancelButton.focus()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import * as Api from '../ts/api';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import InputValidator from '../../server/model/inputValidator';

const languages = ref(getEmptyLanguagesNoAsync());
const newLanguageName = ref('');
const loaded = ref(false);
const isShowSaveError = ref(false);
const saveErrorText = ref('');
const isShowAddError = ref(false);
const addErrorText = ref('');
const languageIdToDelete = ref(-1);
const newLanguageNameInput = ref(document.createElement('input'));

// Delete language modal
const confirmDeleteModal = ref(document.createElement('div'));
const modalCancelButton = ref(document.createElement('button'));
const modalDeleteButton = ref(document.createElement('button'));

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
	if (languages.value.length === 0) {
		newLanguageNameInput.value.focus();
	}
})();

function allowOnlyNumbers(e: KeyboardEvent) {
	// Prevent typing characters that are not numbers in order field
	if (e.keyCode < 48 || e.keyCode > 57) {
		e.preventDefault();
	}
}

async function saveLanguages() {
	if (languages.value.filter(l => l.name.trim() === '').length > 0) {
		showSaveError('Languages cannot have a blank name.');
	} else if (!InputValidator.isValidOrdering(languages.value.map(l => l.ordering))) {
		showSaveError('Invalid ordering.');
	} else if (duplicateLanguageNames()) {
		showSaveError('There are duplicate language names.');
	} else {
		removeAllErrors();
		await Api.editLanguages(languages.value);
		languages.value = await Api.getLanguages();
		showSaveSuccessMessage();
	}
}

async function addLanguage() {
	if (newLanguageName.value.trim() === '') {
		showAddError('Please enter a valid language name.');
	} else if (languages.value.some(l => l.name === newLanguageName.value)) {
		showAddError('This language already exists.');
	} else {
		removeAllErrors();
		await Api.addLanguage(newLanguageName.value);
		newLanguageName.value = '';
		languages.value = await Api.getLanguages();
	}
}

function removeAllErrors() {
	isShowAddError.value = false;
	isShowSaveError.value = false;
}

function showSaveError(text: string) {
	removeSuccessMessage();
	removeAllErrors();
	isShowSaveError.value = true;
	saveErrorText.value = text;
}

function getLanguagesSavedTextElement() {
	return document.querySelector('#languages-saved-text');
}

function showSaveSuccessMessage() {
	const languageSavedText = getLanguagesSavedTextElement();
	(languageSavedText as HTMLElement).classList.remove('d-none');
}

function removeSuccessMessage() {
	const languageSavedText = getLanguagesSavedTextElement();
	(languageSavedText as HTMLElement).classList.add('d-none');
}

function showAddError(text: string) {
	removeAllErrors();
	isShowAddError.value = true;
	addErrorText.value = text;
}

function duplicateLanguageNames() {
	const names = new Set(Array.from(languages.value.values(), l => l.name));
	return names.size !== languages.value.length;
}

async function deleteLanguage() {
	await Api.deleteLanguage(languageIdToDelete.value);
	languages.value = await Api.getLanguages();
}

setTimeout(() => {
	confirmDeleteModal.value.addEventListener('shown.bs.modal', () => {
		modalCancelButton.value.focus();
	});
}, 0);
</script>
