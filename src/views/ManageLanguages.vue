<template>
  <div class="view">
    <h1>Languages</h1>
    <div class="edit-languages-block" v-if="loaded && languages.length !== 0">
      <h2>Edit</h2>
      <table class="languages-table table table-sm table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Order</th>
            <th scope="col">Practice</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr class="language-row" v-for="lang in languages" :key="lang.id">
            <td><input class="language-name" type="text" v-model="lang.name"/></td>
            <td><input class="language-ordering" @keypress="allowOnlyNumbers" type="number" v-model="lang.ordering"></td>
            <td><input class="language-is-practice" type="checkbox" v-model="lang.isPractice"></td>
            <td><button @click="this.delete(lang.id)" class="btn btn-danger btn-sm delete-language-button">X</button></td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex align-items-center">
        <button id="save-languages-button" class="btn btn-primary btn-sm" @click="save()">
          Save
        </button>
        <span id="languages-saved-text" class="pl-2 text-success animate__animated animate__faster d-none">
          Languages saved.
        </span>
        <span v-if="isShowSaveError" id="error-save-text" class="pl-2 text-danger">{{ saveErrorText }}</span>
      </div>
    </div>
    <div class="add-language-block">
      <h2>Add</h2>
      <div>
        <input @keyup.enter="add()" id="new-language-name" type="text" v-model="newLanguageName"/>
        <div class="d-flex align-items-center">
          <button id="add-language-button" class="btn btn-primary btn-sm" @click="add()">Add</button>
          <span v-if="isShowAddError" id="error-add-language-text" class="pl-2 text-danger">{{ addErrorText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import InputValidator from '../../server/model/inputValidator';

export default defineComponent({
	name: 'ManageLanguages',
	data() {
		return {
			languages: getEmptyLanguagesNoAsync(),
			newLanguageName: '',
			loaded: false,
			lastSaved: Date.now(),
			isShowSaveError: false,
			saveErrorText: '',
			isShowAddError: false,
			addErrorText: '',
		};
	},
	methods: {
		allowOnlyNumbers(e: any) {
			const keyCode = (e.keyCode ? e.keyCode : e.which);
			if (keyCode < 48 || keyCode > 57) {
				e.preventDefault();
			}
		},
		async save() {
			if (this.languages.filter(l => l.name.trim() === '').length > 0) {
				this.showSaveError('Languages cannot have a blank name.');
			} else if (!InputValidator.isValidOrdering(this.languages.map(l => l.ordering))) {
				this.showSaveError('Invalid ordering.');
			} else if (this.duplicateLanguageNames()) {
				this.showSaveError('There are duplicate language names.');
			} else {
				try {
					this.removeAllErrors();
					this.lastSaved = Date.now();
					const {lastSaved} = this;
					await Api.editLanguages(this.languages);
					this.animateLanguageSavedText(lastSaved);
					this.languages = await Api.getLanguages();
				} catch {
					this.showSaveError('An unexpected error has occurred.');
				}
			}
		},
		async add() {
			if (this.newLanguageName.trim() === '') {
				this.showAddError('Please enter a valid language name.');
			} else if (this.languages.some(l => l.name === this.newLanguageName)) {
				this.showAddError('This language already exists.');
			} else {
				try {
					this.removeAllErrors();
					await Api.addLanguage(this.newLanguageName);
					this.newLanguageName = '';
					this.languages = await Api.getLanguages();
				} catch {
					this.showAddError('An unexpected error has occurred.');
				}
			}
		},
		removeAllErrors() {
			this.isShowAddError = false;
			this.isShowSaveError = false;
		},
		showSaveError(text: string) {
			this.removeSuccessMessage();
			this.removeAllErrors();
			this.isShowSaveError = true;
			this.saveErrorText = text;
		},
		removeSuccessMessage() {
			const languageSavedText = this.$el.querySelector('#languages-saved-text');
			languageSavedText.classList.add('d-none');
		},
		showAddError(text: string) {
			this.removeAllErrors();
			this.isShowAddError = true;
			this.addErrorText = text;
		},
		duplicateLanguageNames() {
			const names = new Set(Array.from(this.languages.values(), l => l.name));
			return names.size !== this.languages.length;
		},
		animateLanguageSavedText(lastSaved: number) {
			const languageSavedText = this.$el.querySelector('#languages-saved-text');
			languageSavedText.classList.remove('animate__fadeOut');
			languageSavedText.classList.remove('d-none');
			setTimeout(() => {
				if (lastSaved === this.lastSaved) {
					languageSavedText.classList.add('animate__fadeOut');
					setTimeout(() => {
						if (lastSaved === this.lastSaved) {
							languageSavedText.classList.add('d-none');
						}
					}, 500);
				}
			}, 2000);
		},
		async delete(id: number) {
			await Api.deleteLanguage(id);
			this.languages = await Api.getLanguages();
		},
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.loaded = true;
	},
});
</script>
