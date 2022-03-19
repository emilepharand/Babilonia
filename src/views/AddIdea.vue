<template>
  <div>
    <h1>Add Idea</h1>
    <IdeaForm @addRows="addRows" :idea="idea" title="Add Idea"/>
    <button @click="add()">Add</button>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import {getEmptyIdea} from '../../server/model/ideas/idea';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {getExpressionForAddingFromExpression} from '../../server/model/ideas/expression';
import Utils from '@/ts/utils';

export default defineComponent({
	name: 'AddIdea',
	components: {
		IdeaForm,
	},
	data() {
		return {
			idea: getEmptyIdea(),
		};
	},
	async created() {
		this.idea = await getEmptyIdea();
	},
	methods: {
		async add() {
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
