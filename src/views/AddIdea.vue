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
        @move-focus-down="moveFocusDown"
        @move-focus-up="moveFocusUp"
        @save="save()"
      />
      <div class="d-flex btn-group mt-2">
        <button
          id="add-rows"
          ref="addRowsButton"
          class="btn btn-outline-secondary flex-grow-1"
          @keydown.right="saveIdeaButton.focus()"
          @keydown.up="focusLastTextInput"
          @keydown.down="focusFirstTextInput"
          @click="addRows()"
        >
          More Rows
        </button>
        <button
          id="save-idea"
          ref="saveIdeaButton"
          class="btn btn-outline-secondary flex-grow-1"
          @keydown.left="addRowsButton.focus()"
          @keydown.up="focusLastTextInput"
          @keydown.down="focusFirstTextInput"
          @click="save()"
        >
          Save
        </button>
      </div>
      <div>
        <span
          v-if="isShowError"
          id="error-text"
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
import {defaultNbrRows, initElements, textInputs} from '../ts/ideaForm/rowArrowsNavigation';
import * as Utils from '../ts/ideaForm/utils';
import {validateIdeaForm} from '../ts/ideaForm/validation';

const idea = ref(getEmptyIdeaNoAsync());
const noLanguages = ref(false);
const loaded = ref(false);
const errorText = ref('');
const isShowError = ref(false);
const addRowsButton = ref(document.createElement('button'));
const saveIdeaButton = ref(document.createElement('button'));
let lastFocusedButton = document.createElement('button');

(async () => {
	if ((await Api.getLanguages()).length === 0) {
		noLanguages.value = true;
	} else {
		idea.value = getEmptyIdea(5, (await Api.getLanguages())[0]);
		initElements(5);
	}
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
			e.known = false;
		});
		initElements(defaultNbrRows);
	}
}

async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
	initElements(textInputs.length + defaultNbrRows);
}

function moveFocusUp() {
	if (lastFocusedButton === saveIdeaButton.value) {
		saveIdeaButton.value.focus();
	} else {
		addRowsButton.value.focus();
	}
}

function moveFocusDown() {
	if (lastFocusedButton === saveIdeaButton.value) {
		saveIdeaButton.value.focus();
	} else {
		addRowsButton.value.focus();
	}
}

function focusFirstTextInput(e: Event) {
	lastFocusedButton = e.target as HTMLButtonElement;
	textInputs[0].focus();
}

function focusLastTextInput(e: Event) {
	textInputs[0].focus();
	lastFocusedButton = e.target as HTMLButtonElement;
	textInputs[textInputs.length - 1].focus();
}

</script>
