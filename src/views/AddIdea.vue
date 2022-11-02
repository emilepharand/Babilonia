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
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyIdea, getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {getExpressionForAddingFromExpression} from '../../server/model/ideas/expression';
import IdeaForm from '../components/IdeaForm.vue';
import NotEnoughData from '../components/NotEnoughData.vue';
import * as Api from '../ts/api';
import * as Utils from '../ts/utils';

const idea = ref(getEmptyIdeaNoAsync());
const noLanguages = ref(false);
const loaded = ref(false);

// Initialize data
(async () => {
	if ((await Api.getLanguages()).length === 0) {
		noLanguages.value = true;
	}
	idea.value = getEmptyIdea(5, (await Api.getLanguages())[0]);
	loaded.value = true;
})();

async function save() {
	// Remove empty expressions
	const expressions = idea.value.ee.filter(e => e.text.trim() !== '');
	// Not possible to save empty idea
	if (expressions.length === 0) {
		return;
	}
	const expressionsForAdding = expressions.map(e => getExpressionForAddingFromExpression(e));
	const ideaForAdding = {ee: expressionsForAdding};
	await Api.addIdea(ideaForAdding);
	// Reset inputs
	idea.value.ee.forEach(e => {
		e.text = '';
	});
}

async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
}

</script>
