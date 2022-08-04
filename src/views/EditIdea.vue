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

<script lang="ts" setup>
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import IdeaForm from '@/components/IdeaForm.vue';
import Utils from '@/ts/utils';
import Api from '@/ts/api';

const idea = ref(getEmptyIdeaNoAsync());
const loaded = ref(false);
const ideaNotFound = ref(false);

const route = useRoute();
const ideaId = Number.parseInt(Array.from(route.params.id).join(''), 10);

// Initialize idea
(async () => {
	try {
		idea.value = await Api.getIdea(ideaId);
		loaded.value = true;
	} catch {
		ideaNotFound.value = true;
	}
}
)();

async function addRows() {
	const l = await Api.getLanguage(1);
	idea.value = Utils.addEmptyExpressions(idea.value, 5, idea.value.ee.length, l);
}

async function edit() {
	// Remove empty expressions
	idea.value.ee = idea.value.ee.filter(e => e.text.trim() !== '');
	await Api.editIdea(getIdeaForAddingFromIdea(idea.value), idea.value.id);
	// Reorder expressions
	idea.value = await Api.getIdea(idea.value.id);
}

// Router needs to be declared outside function
const router = useRouter();
async function deleteIdea() {
	await Api.deleteIdea(ideaId);
	await router.push('/');
}
</script>