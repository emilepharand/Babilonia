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
      <div class="d-flex">
        <button id="save-languages-button" class="btn btn-primary" @click="save()">Save</button>
        <div>
        <p id="language-saved-text" class="text-success d-none animate__animated">Language saved.</p>
        </div>
      </div>
    </div>
    <div class="add-language-block">
      <h2>Add</h2>
      <div>
        <input @keyup.enter="add()" id="new-language-name" type="text" v-model="newLanguageName"/>
        <div>
          <button id="add-language-button" @click="add()">Add</button>
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
		};
	},
	methods: {
		async save() {
			await Api.editLanguages(this.languages);
			const languageSavedText = this.$el.querySelector('#language-saved-text');
			languageSavedText.classList.remove('d-none');
			languageSavedText.classList.add('animate__fadeIn');
			setTimeout(() => languageSavedText.classList.add('animate__fadeOut'), 3000);
		},
		async add() {
			await Api.addLanguage(this.newLanguageName);
			this.newLanguageName = '';
		},
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.loaded = true;
	},
});
</script>
