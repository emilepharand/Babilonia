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
          <td><input class="language-is-practice" type="checkbox" v-model="lang.isPractice" false-value="0" true-value="1"></td>
        </tr>
      </table>
      <button href="#" @click="save()">Save</button>
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
		},
		async add() {
			await Api.addLanguage(this.newLanguageName);
			this.newLanguageName = '';
			this.languages = await Api.getLanguages();
		},
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.loaded = true;
	},
});
</script>
