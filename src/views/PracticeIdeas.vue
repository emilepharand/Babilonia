<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData no-practiceable-idea />
    </div>
    <div v-else>
      <div id="practice-table">
        <div
          v-for="(e, i) in idea.ee"
          :key="e.id"
          class="pb-2"
        >
          <PracticeRow
            :start-interactive="startInteractive"
            :is-focused="isFocusedRow(i)"
            :row-order="i"
            :reset="resetAll"
            :expression="e"
            :settings="settings"
            @focus-previous="focusPreviousRow"
            @focus-next="focusNextRow"
            @skip-focus="skipFocus"
            @focused-row="focusRow"
            @full-matched="rowFullyMatched"
            @toggle-known="toggleKnown"
          />
        </div>
      </div>
      <hr>
      <div class="d-flex btn-group">
        <button
          ref="resetButton"
          class="btn btn-outline-secondary flex-grow-1 reset-button"
          @click="resetRows()"
          @keydown.right="nextIdeaButton.focus()"
          @keydown.down="editIdeaButton.focus()"
          @keydown.up="focusLastRow()"
        >
          Reset
        </button>
        <button
          ref="nextIdeaButton"
          :class="nextButtonClass"
          @click="nextIdea()"
          @keydown.left="resetButton.focus()"
          @keydown.down="editIdeaButton.focus()"
          @keydown.up="focusLastRow()"
        >
          Next
        </button>
      </div>
      <div class="d-flex btn-group mt-2">
        <a
          id="edit-idea-link"
          ref="editIdeaButton"
          class="btn btn-outline-secondary flex-grow-1"
          :href="'/ideas/' + idea.id"
          target="_blank"
          @keydown.up="nextIdeaButton.focus()"
          @keydown.down="focusFirstRow()"
        >
          Edit Idea
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, ref} from 'vue';
import type {Expression} from '../../server/model/ideas/expression';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';
import NotEnoughData from '../components/NotEnoughData.vue';
import PracticeRow from '../components/practice/PracticeRow.vue';
import * as Api from '../ts/api';

const idea = ref(getEmptyIdeaNoAsync());
const noIdeas = ref(false);
const currentlyFocusedRow = ref(0);
const startInteractive = ref(false);
const focusDirectionDown = ref(true);
const nbrFullyMatchedRows = ref(0);
const nbrRowsToMatch = ref(0);
const resetAll = ref(false);
const settings = ref(getEmptySettingsNoAsync());

const nextIdeaButton = ref(document.createElement('button'));
const resetButton = ref(document.createElement('button'));
const editIdeaButton = ref(document.createElement('button'));

(async () => {
	try {
		await displayNextIdea();
	} catch {
		noIdeas.value = true;
	}
})();

const nextButtonClass = computed(() => {
	if (startInteractive.value && nbrFullyMatchedRows.value === nbrRowsToMatch.value) {
		return 'btn btn-success flex-grow-1 next-button';
	}
	return 'btn btn-outline-secondary flex-grow-1 next-button';
},
);

async function displayNextIdea() {
	resetRows();
	const nextIdea = await Api.getNextIdea();
	settings.value = await Api.getSettings();
	nextIdea.ee = reorderExpressions(nextIdea.ee);
	idea.value = nextIdea;
	nbrFullyMatchedRows.value = 0;
	focusDirectionDown.value = true;
	currentlyFocusedRow.value = 0;
	nbrRowsToMatch.value = idea.value.ee.filter(e => e.language.isPractice).length;
	startInteractive.value = true;
}

// Put visible expressions first
function reorderExpressions(ee: Expression[]): Expression[] {
	return ee.sort((e1, e2) => {
		if (e1.language.isPractice && !e2.language.isPractice) {
			return 1;
		}
		if (e1.language.isPractice && e2.language.isPractice) {
			return 0;
		}
		return -1;
	});
}

function focusRow(rowNumber: number) {
	currentlyFocusedRow.value = rowNumber;
}

function focusPreviousRow(currentRow: number) {
	focusDirectionDown.value = false;
	if (currentlyFocusedRow.value === 0) {
		if (startInteractive.value) {
			editIdeaButton.value.focus();
		} else {
			// Focus loops until first practiceable expression is loaded
			currentlyFocusedRow.value = idea.value.ee.length - 1;
		}
	} else {
		currentlyFocusedRow.value = currentRow - 1;
	}
}

function focusFirstRow() {
	focusDirectionDown.value = true;
	// Trigger change
	currentlyFocusedRow.value = -1;
	void nextTick(() => {
		currentlyFocusedRow.value = 0;
	});
}

function focusLastRow() {
	focusDirectionDown.value = false;
	// Trigger change
	currentlyFocusedRow.value = -1;
	void nextTick(() => {
		currentlyFocusedRow.value = idea.value.ee.length - 1;
	});
}

function focusNextRow(rowNumber: number) {
	focusDirectionDown.value = true;
	if (currentlyFocusedRow.value === idea.value.ee.length - 1) {
		if (startInteractive.value) {
			nextIdeaButton.value.focus();
		} else {
			// Focus loops until first practiceable expression is loaded
			currentlyFocusedRow.value = 0;
		}
	} else {
		currentlyFocusedRow.value = rowNumber + 1;
	}
}

function skipFocus() {
	if (focusDirectionDown.value) {
		focusNextRow(currentlyFocusedRow.value);
	} else {
		focusPreviousRow(currentlyFocusedRow.value);
	}
}

function isFocusedRow(rowNumber: number) {
	return rowNumber === currentlyFocusedRow.value;
}

function rowFullyMatched(rowNumber: number, newMatch: boolean) {
	if (newMatch) {
		nbrFullyMatchedRows.value++;
	}
	if (nbrFullyMatchedRows.value === nbrRowsToMatch.value) {
		currentlyFocusedRow.value = -1;
		nextIdeaButton.value.focus();
	} else if (currentlyFocusedRow.value === rowNumber) {
		focusNextRow(rowNumber);
	} else {
		const temp = currentlyFocusedRow.value;
		currentlyFocusedRow.value = -1;
		void nextTick(() => {
			// Trigger focus (because value did not change so Vue will not react)
			currentlyFocusedRow.value = temp;
		});
	}
}

async function toggleKnown(rowNbr: number) {
	idea.value.ee[rowNbr].known = !idea.value.ee[rowNbr].known;
	await Api.editIdea(getIdeaForAddingFromIdea(idea.value), idea.value.id);
}

async function nextIdea() {
	await displayNextIdea();
}

function resetRows() {
	nbrFullyMatchedRows.value = 0;
	resetAll.value = true;
	void nextTick(() => {
		resetAll.value = false;
	});
	currentlyFocusedRow.value = 0;
}
</script>

<style scoped>
table {
  display: inline-block;
  text-align: left;
}
</style>
