<template>
  <div class="view">
    <h1>Add Idea</h1>
    <div v-if="noLanguages">
      <NotEnoughData noLanguage />
    </div>
    <div v-else>
      <IdeaForm @addRows="addRows" :idea="idea" title="Add Idea"/>
      <button @click="add()">Add</button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import {getEmptyIdea, getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {getExpressionForAddingFromExpression} from '../../server/model/ideas/expression';
import Utils from '@/ts/utils';
import NotEnoughData from '@/components/NotEnoughData.vue';

export default defineComponent({
	name: 'AddIdea',
	components: {
		NotEnoughData,
		IdeaForm,
	},
	data() {
		return {
			idea: getEmptyIdeaNoAsync(),
			noLanguages: false,
			loaded: false,
		};
	},
	async created() {
		await this.checkIfLanguages();
		this.idea = getEmptyIdea(5, (await Api.getLanguages())[0]);
		this.loaded = true;
	},
	methods: {
		async checkIfLanguages() {
			const languages = await Api.getLanguages();
			if (languages.length === 0) {
				this.noLanguages = true;
			}
		},
		async add() {
			console.log(JSON.stringify(this.idea));
			const ee = this.idea.ee.filter(e => e.text.trim() !== '');
			const ee2 = ee.map(e => getExpressionForAddingFromExpression(e));
			const ideaForAdding: IdeaForAdding = {ee: ee2};
			await Api.addIdea(ideaForAdding);
		},
		async addRows(howMany: number, currentSize: number) {
			const l = await Api.getLanguage(0);
			this.idea = Utils.addEmptyExpressions(this.idea, howMany, currentSize, l);
		},
	},
});
</script>
