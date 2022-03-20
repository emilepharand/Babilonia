<template>
  <div class="view">
    <h1>Edit Idea</h1>
    <IdeaForm @addRows="addRows" :idea="idea" title="Edit Idea"/>
    <button @click="edit()">Edit</button>
    <button @click="deleteIdea()">Delete</button>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import Utils from '@/ts/utils';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';

export default defineComponent({
	name: 'EditIdeas',
	components: {
		IdeaForm,
	},
	data() {
		return {
			idea: getEmptyIdeaNoAsync(),
		};
	},
	async created() {
		const ideaId = Number.parseInt(Array.from(this.$route.params.id)
			.join(''), 10);
		this.idea = await Api.getIdea(ideaId);
	},
	expose: ['addRows'],
	methods: {
		async edit() {
			await Api.editIdea(this.idea);
		},
		async deleteIdea() {
			await Api.deleteIdea(this.idea.id);
		},
		async addRows(howMany: number, currentSize: number) {
			const l = await Api.getLanguage(0);
			this.idea = Utils.addEmptyExpressions(this.idea, howMany, currentSize, l);
		},
	},
});
</script>
