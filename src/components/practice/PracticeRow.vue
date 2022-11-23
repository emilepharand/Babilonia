<template>
  <div class="practice-row d-flex justify-content-end align-items-center">
    <div class="text-left me-2 language-name">
      {{ expression.language.name }}
    </div>
    <div
      class="input-group input-group-md"
      style="width: 400px"
    >
      <input
        v-if="!isRowPracticeable()"
        class="form-control expression-input"
        type="text"
        :value="expression.text"
        disabled
      >
      <input
        v-else
        ref="textInput"
        v-model="typed"
        class="expression-input form-control"
        type="text"
        :maxlength="currentMaxLength"
        :disabled="isFullMatch"
        :class="{'partial-match': isPartialMatch,
                 'full-match': isFullMatch,
                 'no-match': isNoMatch,
                 'neutral': nothingTyped,
        }"
        @keydown.up.prevent="$emit('focusPrevious', rowOrder)"
        @keydown.down="$emit('focusNext', rowOrder)"
        @focus="$emit('focusedRow', rowOrder)"
        @keydown.right="hintButton.focus()"
      >
      <button
        ref="hintButton"
        class="btn btn-outline-dark hint-button"
        :disabled="buttonsDisabled()"
        value="Hint"
        @keydown.right="showButton.focus()"
        @keydown.left="focusInput()"
        @click="hint()"
      >
        Hint
      </button>
      <button
        ref="showButton"
        class="btn btn-outline-dark show-button"
        :disabled="buttonsDisabled()"
        @keydown.right="knownButton.focus()"
        @keydown.left="hintButton.focus()"
        @click="show()"
      >
        Show
      </button>
      <div
        style="cursor: pointer"
        class="p-2 d-flex align-items-center expression-known-wrapper"
        title="Known expression"
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        @click="$emit('toggleKnown', rowOrder)"
        @keydown.enter="$emit('toggleKnown', rowOrder)"
        @keydown.left="showButton.focus()"
      >
        <input
          ref="knownButton"
          type="checkbox"
          style="cursor: pointer"
          class="expression-known-checkbox form-check-label"
          :checked="expression.known"
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as bootstrap from 'bootstrap';
import {nextTick, onMounted, ref, watch} from 'vue';
import type {Expression} from '../../../server/model/ideas/expression';
import type {Settings} from '../../../server/model/settings/settings';
import {focusEndOfInput} from '../../ts/domHelper';

const emit = defineEmits(['fullMatched', 'skipFocus', 'focusNext', 'focusPrevious', 'focusedRow', 'toggleKnown']);

const props = defineProps<{
	expression: Expression;
	rowOrder: number;
	isFocused: boolean;
	reset: boolean;
	settings: Settings;
}>();

const typed = ref('');
const isFullMatch = ref(false);
const isPartialMatch = ref(false);
const isNoMatch = ref(false);
const nothingTyped = ref(true);
const moreLettersAllowed = ref(true);
const currentMaxLength = ref(1);

const textInput = ref(document.createElement('input'));
const hintButton = ref(document.createElement('button'));
const showButton = ref(document.createElement('button'));
const knownButton = ref(document.createElement('input'));

onMounted(() => {
	if (props.isFocused && !props.settings.passiveMode) {
		emit('skipFocus');
	}
	if (props.expression.text.startsWith('(')) {
		showContext();
	}
});

watch(() => props.isFocused, isFocused => {
	if (isFocused) {
		if (isFullMatch.value || !isRowPracticeable()) {
			emit('skipFocus');
		} else if (isRowPracticeable()) {
			focusInput();
		}
	}
});

watch(typed, () => {
	checkMatch();
});

watch(() => props.reset, () => {
	typed.value = '';
	nothingTyped.value = true;
	if (props.expression.text.startsWith('(')) {
		showContext();
	}
});

function focusInput() {
	if (textInput.value && textInput.value) {
		focusEndOfInput(textInput.value);
	}
}

function isRowPracticeable() {
	return props.expression.language.isPractice
      && !(props.settings.practiceOnlyNotKnown && props.expression.known)
  && !(props.settings.passiveMode);
}

function buttonsDisabled() {
	return !isRowPracticeable() || isFullMatch.value;
}

function normalizeChar(c: string) {
	if (props.settings.strictCharacters) {
		return c;
	}
	// Remove accents and make lowercase
	// À -> a, é -> e, etc.
	return c.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function showContext() {
	const fullText = props.expression.text;
	let toType = fullText.substring(0, fullText.indexOf(')', typed.value.length) + 1);
	if (fullText.charAt(toType.length)) {
		toType += ' ';
	}
	typed.value = toType;
}

enum Match {
	NEUTRAL, NONE, PARTIAL, FULL,
}

function setMatch(match: Match) {
	isNoMatch.value = false;
	isPartialMatch.value = false;
	isFullMatch.value = false;
	if (match === Match.FULL) {
		isFullMatch.value = true;
	} else if (match === Match.PARTIAL) {
		isPartialMatch.value = true;
	} else if (match === Match.NONE) {
		isNoMatch.value = true;
	}
}

function checkMatch() {
	const typedExpression = typed.value;
	const fullExpression = props.expression.text;
	if (typedExpression.length === 0) {
		nothingTyped.value = true;
		setMatch(Match.NEUTRAL);
		currentMaxLength.value = 1;
		return;
	}
	nothingTyped.value = false;
	const firstLettersMatch = checkIfFirstLettersMatch(fullExpression, typedExpression);
	if (firstLettersMatch) {
		const nonNormalizedSpelling = fullExpression.substring(0, typed.value.length);
		if (typed.value !== nonNormalizedSpelling) {
			typed.value = nonNormalizedSpelling;
			return;
		}
		if (typedExpression.length === fullExpression.length) {
			setMatch(Match.FULL);
			emit('fullMatched', props.rowOrder, true);
		} else {
			const nextTwoChars = fullExpression.substring(typed.value.length, typed.value.length + 2);
			if (nextTwoChars.includes('(')) {
				showContext();
			} else {
				setMatch(Match.PARTIAL);
				currentMaxLength.value = typed.value.length + 1;
			}
		}
	} else {
		setMatch(Match.NONE);
		moreLettersAllowed.value = false;
	}
}

function checkIfFirstLettersMatch(textToMatch: string, typedWord: string) {
	let i = 0;
	while (i < typedWord.length) {
		if (normalizeChar(textToMatch.charAt(i)) === normalizeChar(typedWord.charAt(i))) {
			i += 1;
		} else {
			return false;
		}
	}
	return true;
}

function hint() {
	const fullText = props.expression.text;
	let j = 0;
	while (j < typed.value.length && fullText.charAt(j) === typed.value.charAt(j)) {
		j += 1;
	}
	if (j > 0) {
		// Don't hint only space but next letter too
		if (fullText[j] === ' ') {
			typed.value = fullText.substring(0, j + 2);
		} else {
			typed.value = fullText.substring(0, j + 1);
		}
	} else {
		typed.value = fullText.substring(0, 1);
	}
	focusInput();
}

function show() {
	typed.value = props.expression.text;
}

void nextTick(() => {
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
</script>

<style scoped>

.partial-match {
  color: #198754;
}

.partial-match:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(0,200,81,.25);
}

.full-match {
  background: #198754;
  color: #fff;
  font-weight: bold;
}

.no-match {
  color: #dc3545;
}

.no-match:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(255,68,68,.25);
}

input {
  font-size: 1.1rem;
}
</style>
