<template>
  <div class="view">
    <h1>Add Idea</h1>
    <div v-if="noLanguages">
      <NotEnoughData noLanguage />
    </div>
    <div v-else>
      <IdeaForm :idea="idea" title="Add Idea"/>
      <div class="d-flex btn-group mt-2">
        <button @click="addRows()" id="add-rows" class="btn btn-outline-secondary flex-grow-1">More Rows</button>
        <button id="save-idea" @click="save()" class="btn btn-outline-secondary flex-grow-1">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyIdea, getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {getExpressionForAddingFromExpression} from '../../server/model/ideas/expression';
import IdeaForm from '@/components/IdeaForm.vue';
import NotEnoughData from '@/components/NotEnoughData.vue';
import Api from '@/ts/api';
import Utils from '@/ts/utils';

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
	const l = await Api.getLanguage(1);
	idea.value = Utils.addEmptyExpressions(idea.value, 5, idea.value.ee.length, l);
}

</script>
