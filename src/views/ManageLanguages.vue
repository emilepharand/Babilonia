<template>
  <div class="view">
    <h1>Languages</h1>
    <div class="edit-languages-block" v-if="loaded && languages.length !== 0">
      <h2>Edit</h2>
      <table class="languages-table">
        <tr>
        <th>Name</th>
        <th>Order</th>
        <th>Practice</th>
        </tr>
        <tr class="language-row" v-for="lang in languages" :key="lang.id">
          <td><input class="language-name" type="text" v-model="lang.name"/></td>
          <td><input class="language-ordering" type="number" v-model="lang.ordering"></td>
          <td><input class="language-is-practice" type="checkbox" v-model="lang.isPractice"></td>
        </tr>
      </table>
      <div class="d-flex align-items-center">
        <button id="save-languages-button" class="btn btn-primary btn-sm" @click="save()">
          Save
        </button>
        <span id="languages-saved-text" class="pl-2 text-success animate__animated animate__faster d-none">
          Languages saved.
        </span>
      </div>
    </div>
    <div class="add-language-block">
      <h2>Add</h2>
      <div>
        <input @keyup.enter="add()" id="new-language-name" type="text" v-model="newLanguageName"/>
        <div class="d-flex align-items-center">
          <button id="add-language-button" class="btn btn-primary btn-sm" @click="add()">Add</button>
          <span id="error-add-language-text" class="pl-2 text-danger d-none"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';

export default defineComponent({
	name: 'ManageLanguages',
	data() {
		return {
			languages: getEmptyLanguagesNoAsync(),
			newLanguageName: '',
			loaded: false,
			lastSaved: Date.now(),
		};
	},
	methods: {
		async save() {
			this.lastSaved = Date.now();
			const {lastSaved} = this;
			await Api.editLanguages(this.languages);
			this.animateLanguageSavedText(lastSaved);
			this.languages = await Api.getLanguages();
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
		async add() {
			const errorAddLanguageText = this.$el.querySelector('#error-add-language-text');
			if (this.newLanguageName.trim() === '') {
				errorAddLanguageText.classList.remove('d-none');
				errorAddLanguageText.innerText = 'Please enter a valid language name.';
			} else {
				errorAddLanguageText.classList.add('d-none');
				await Api.addLanguage(this.newLanguageName);
				this.newLanguageName = '';
				this.languages = await Api.getLanguages();
			}
		},
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.loaded = true;
	},
});
</script>
