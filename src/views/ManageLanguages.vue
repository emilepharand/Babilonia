<template>
  <div class="view">
    <h1>Languages</h1>
    <div v-if="languages.length !== 0">
      <table>
        <tr>
        <th>Name</th>
        <th>Order</th>
        <th>Practice</th>
        </tr>
        <tr v-for="lang in languages" :key="lang.id">
          <td><input type="text" v-model="lang.name"/></td>
          <td><input type="number" v-model="lang.ordering"></td>
          <td><input type="checkbox" v-model="lang.isPractice" false-value="0" true-value="1"></td>
        </tr>
      </table>
      <a href="#" @click="edit()">Edit</a>
    </div>
    <h2>Add</h2>
    <div>
      <input type="text" v-model="newLanguage.name"/>
      <input type="number" v-model="newLanguage.ordering">
      <input type="checkbox" v-model="newLanguage.isPractice">
      <div>
        <button @click="addNewLanguage()">Add</button>
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
			newLanguage: {
				id: -1,
				name: '',
				ordering: 5,
				isPractice: true,
			},
		};
	},
	methods: {
		change() {
		},
		async addNewLanguage() {
			await Api.addLanguage(this.newLanguage);
		},
	},
	async created() {
		this.languages = await Api.getLanguages();
	},
});
</script>
