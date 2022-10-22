import Api from '@/ts/api';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import {Expression} from '../../server/model/ideas/expression';
import {computed, nextTick, ref} from 'vue';

export const nextIdeaButton = ref(null);
export const idea = ref(getEmptyIdeaNoAsync());
export const noIdeas = ref(false);
export const currentlyFocusedRow = ref(0);
export const startInteractive = ref(false);
export const focusDirectionDown = ref(true);
export const nbrFullyMatchedRows = ref(0);
export const nbrRowsToMatch = ref(0);
export const resetAll = ref(false);

(async () => {
	try {
		await displayNextIdea();
	} catch {
		noIdeas.value = true;
	}
})();

export const nextButtonClass = computed(() => {
	if (startInteractive.value && nbrFullyMatchedRows.value === nbrRowsToMatch.value) {
		return 'btn btn-success flex-grow-1 next-button';
	}
	return 'btn btn-outline-secondary flex-grow-1 next-button';
},
);

async function displayNextIdea() {
	const nextIdea = await Api.getNextIdea();
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

export function focusRow(rowNumber: number) {
	currentlyFocusedRow.value = rowNumber;
}

export function focusPreviousRow(currentRow: number) {
	focusDirectionDown.value = false;
	if (currentlyFocusedRow.value === 0) {
		// Loop around
		currentlyFocusedRow.value = idea.value.ee.length - 1;
	} else {
		currentlyFocusedRow.value = currentRow - 1;
	}
}

export function focusNextRow(rowNumber: number) {
	focusDirectionDown.value = true;
	if (currentlyFocusedRow.value === idea.value.ee.length - 1) {
		currentlyFocusedRow.value = 0;
	} else {
		currentlyFocusedRow.value = rowNumber + 1;
	}
}

export function skipFocus() {
	if (focusDirectionDown.value) {
		focusNextRow(currentlyFocusedRow.value);
	} else {
		focusPreviousRow(currentlyFocusedRow.value);
	}
}

export function isFocusedRow(rowNumber: number) {
	return rowNumber === currentlyFocusedRow.value;
}

export function rowFullyMatched(rowNumber: number, newMatch: boolean) {
	if (newMatch) {
		nbrFullyMatchedRows.value++;
	}
	if (nbrFullyMatchedRows.value === nbrRowsToMatch.value) {
		currentlyFocusedRow.value = -1;
		const nextIdeaButtonEl = document.querySelector('#nextIdeaButton') as HTMLElement | null;
		if (nextIdeaButtonEl !== null) {
			nextIdeaButtonEl.focus();
		}
	} else if (currentlyFocusedRow.value === rowNumber) {
		focusNextRow(rowNumber);
	} else {
		const temp = currentlyFocusedRow.value;
		currentlyFocusedRow.value = -1;
		nextTick(() => {
			// Trigger focus (because value did not change so Vue will not react)
			currentlyFocusedRow.value = temp;
		});
	}
}

export async function nextIdea() {
	await displayNextIdea();
}

export function resetRows() {
	nbrFullyMatchedRows.value = 0;
	resetAll.value = true;
	nextTick(() => {
		resetAll.value = false;
	});
	currentlyFocusedRow.value = 0;
}
