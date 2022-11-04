<template>
  <div class="view">
    <h1>Add Idea</h1>
    <div v-if="noLanguages">
      <NotEnoughData no-language />
    </div>
    <div v-else>
      <IdeaForm
        :idea="idea"
        title="Add Idea"
      />
      <div class="d-flex btn-group mt-2">
        <button
          id="add-rows"
          class="btn btn-outline-secondary flex-grow-1"
          @click="addRows()"
        >
          More Rows
        </button>
        <button
          id="save-idea"
          class="btn btn-outline-secondary flex-grow-1"
          @click="save()"
        >
          Save
        </button>
      </div>
      <div>
        <span
          v-if="isShowError"
          id="error-add-language-text"
          class="pl-2 text-danger"
        >{{ errorText }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyIdea, getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import IdeaForm from '../components/IdeaForm.vue';
import NotEnoughData from '../components/NotEnoughData.vue';
import * as Api from '../ts/api';
import * as Utils from '../ts/utils';
import {validateIdeaForm} from '../ts/utils';

const idea = ref(getEmptyIdeaNoAsync());
const noLanguages = ref(false);
const loaded = ref(false);
const errorText = ref('');
const isShowError = ref(false);

// Initialize data
(async () => {
	if ((await Api.getLanguages()).length === 0) {
		noLanguages.value = true;
	}
	idea.value = getEmptyIdea(5, (await Api.getLanguages())[0]);
	loaded.value = true;
})();

async function save() {
	const ideaForAdding = validateIdeaForm(idea, errorText);
	if (errorText.value !== '') {
		isShowError.value = true;
	}
	if (ideaForAdding) {
		await Api.addIdea(ideaForAdding);
		// Reset inputs
		idea.value.ee.forEach(e => {
			e.text = '';
		});
	}
}

async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
}

</script>
