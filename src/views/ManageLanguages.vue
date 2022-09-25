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
                @click="deleteLanguage(lang.id)"
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
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import Api from '@/ts/api';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import InputValidator from '../../server/model/inputValidator';

const languages = ref(getEmptyLanguagesNoAsync());
const newLanguageName = ref('');
const loaded = ref(false);
const isShowSaveError = ref(false);
const saveErrorText = ref('');
const isShowAddError = ref(false);
const addErrorText = ref('');

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
})();

function allowOnlyNumbers(e: any) {
	// Prevent typing characters that are not numbers in order field
	const keyCode = (e.keyCode ? e.keyCode : e.which);
	if (keyCode < 48 || keyCode > 57) {
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
		try {
			removeAllErrors();
			await Api.editLanguages(languages.value);
			languages.value = await Api.getLanguages();
			showSaveSuccessMessage();
		} catch {
			showSaveError('An unexpected error has occurred.');
		}
	}
}

async function addLanguage() {
	if (newLanguageName.value.trim() === '') {
		showAddError('Please enter a valid language name.');
	} else if (languages.value.some(l => l.name === newLanguageName.value)) {
		showAddError('This language already exists.');
	} else {
		try {
			removeAllErrors();
			await Api.addLanguage(newLanguageName.value);
			newLanguageName.value = '';
			languages.value = await Api.getLanguages();
		} catch {
			showAddError('An unexpected error has occurred.');
		}
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
	(languageSavedText as any).classList.remove('d-none');
}

function removeSuccessMessage() {
	const languageSavedText = getLanguagesSavedTextElement();
	(languageSavedText as any).classList.add('d-none');
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

async function deleteLanguage(id: number) {
	await Api.deleteLanguage(id);
	languages.value = await Api.getLanguages();
}

</script>
