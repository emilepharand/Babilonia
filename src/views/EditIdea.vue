<template>
  <div class="view">
    <h1>Edit Idea</h1>
    <div v-if="ideaNotFound">
      <p>Idea was not found.</p>
    </div>
    <div v-else-if="loaded">
      <IdeaForm :idea="idea" title="Edit Idea"/>
      <button @click="addRows()" id="add-rows" class="btn btn-outline-secondary w-100 mt-2 mb-2">More Rows</button>
      <div class="d-flex btn-group">
        <button id="edit-button" @click="edit()" class="btn btn-outline-primary flex-grow-1">Edit</button>
        <button id="delete-button" class="btn btn-outline-danger flex-grow-1"
                data-bs-toggle="modal" data-bs-target="#confirm-delete-modal">Delete</button>
      </div>
    </div>
    <div class="modal fade" id="confirm-delete-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Confirm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Do you really want to delete this idea?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="modal-delete-button" type="button" @click="deleteIdea()" class="btn btn-danger" data-bs-dismiss="modal">Delete</button>
          </div>
        </div>
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
			// TODO: This needs to be a redirect through router
			// Also, redirect to previous page the user was on
			// when we can handle navigation history properly
			window.location.href = '/';
		},
		async addRows() {
			const l = await Api.getLanguage(1);
			this.idea = Utils.addEmptyExpressions(this.idea, 5, this.idea.ee.length, l);
		},
	},
});
</script>
