<template>
  <div class="view">
    <h1>Edit Idea</h1>
    <div v-if="ideaNotFound">
      <p>Idea was not found.</p>
    </div>
    <div v-else-if="loaded">
      <IdeaForm :idea="idea" title="Edit Idea"/>
      <button @click="addRows()"  class="btn btn-outline-secondary w-100 mt-2 mb-2">More Rows</button>
      <div class="d-flex btn-group">
        <button @click="edit()" class="btn btn-outline-primary flex-grow-1">Edit</button>
        <button @click="deleteIdea()" class="btn btn-outline-danger flex-grow-1">Delete</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import Utils from '@/ts/utils';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';

export default defineComponent({
	name: 'EditIdeas',
	components: {
		IdeaForm,
	},
	data() {
		return {
			idea: getEmptyIdeaNoAsync(),
			loaded: false,
			ideaNotFound: false,
		};
	},
	async created() {
		const ideaId = Number.parseInt(Array.from(this.$route.params.id).join(''), 10);
		try {
			this.idea = await Api.getIdea(ideaId);
			this.loaded = true;
		} catch {
			this.ideaNotFound = true;
		}
	},
	expose: ['addRows'],
	methods: {
		async edit() {
			this.idea.ee = this.idea.ee.filter(e => e.text.trim() !== '');
			await Api.editIdea(getIdeaForAddingFromIdea(this.idea), this.idea.id);
			// Reorder expressions
			this.idea = await Api.getIdea(this.idea.id);
		},
		async deleteIdea() {
			await Api.deleteIdea(this.idea.id);
		},
		async addRows() {
			const l = await Api.getLanguage(1);
			this.idea = Utils.addEmptyExpressions(this.idea, 5, this.idea.ee.length, l);
		},
	},
});
</script>
