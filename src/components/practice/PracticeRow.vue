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
        v-if="!expression.language.isPractice"
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
        @keydown.left="textInput.focus()"
        @click="hint()"
      >
        Hint
      </button>
      <button
        ref="showButton"
        class="btn btn-outline-dark show-button"
        :disabled="buttonsDisabled()"
        @keydown.left="hintButton.focus()"
        @click="show()"
      >
        Show
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue';
import type {Expression} from '../../../server/model/ideas/expression';
import type {Settings} from '../../../server/model/settings/settings';

const emit = defineEmits(['fullMatched', 'skipFocus', 'focusNext', 'focusPrevious', 'focusedRow']);

const props = defineProps<{
	expression: Expression;
	rowOrder: number;
	isFocused: boolean;
	startInteractive: boolean;
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

onMounted(() => {
	if (props.isFocused) {
		emit('skipFocus');
	}
	showContext();
});

watch(() => props.isFocused, isFocused => {
	if (props.startInteractive && isFocused) {
		if (isFullMatch.value || !props.expression.language.isPractice) {
			emit('skipFocus');
		} else if (props.expression.language.isPractice) {
			focusInput();
		}
	}
});

watch(typed, () => {
	if (props.startInteractive) {
		if (isFullMatch.value) {
			emit('skipFocus');
		} else {
			checkMatch();
		}
	}
});

watch(() => props.reset, () => {
	if (props.startInteractive) {
		resetRow();
	}
});

function resetRow() {
	typed.value = '';
	isFullMatch.value = false;
	isPartialMatch.value = false;
	isNoMatch.value = false;
	nothingTyped.value = true;
	showContext();
}

function focusInput() {
	if (textInput.value && textInput.value) {
		textInput.value.focus();
		// Focus end of word
		const saved = typed.value;
		textInput.value.value = '';
		textInput.value.value = saved;
	}
}

function buttonsDisabled() {
	return !props.expression.language.isPractice || isFullMatch.value;
}

function normalizeChar(c: string) {
	if (props.settings.strictCharacters) {
		return c;
	}
	return c.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function showContext() {
	if (props.expression.text.startsWith('(')) {
		let toType = props.expression.text.substring(0, props.expression.text.indexOf(')', typed.value.length) + 1);
		if (props.expression.text.charAt(toType.length)) {
			toType += ' ';
		}
		typed.value = toType;
	}
}

function checkMatch() {
	const typedWord = typed.value;
	if (typedWord.length === 0) {
		nothingTyped.value = true;
		isNoMatch.value = false;
		isPartialMatch.value = false;
		isFullMatch.value = false;
		currentMaxLength.value = 1;
		return;
	}
	nothingTyped.value = false;
	const firstLettersMatch = checkFirstLettersMatch(props.expression.text, typedWord);
	if (firstLettersMatch) {
		// Show non-normalized spelling
		typed.value = props.expression.text.substring(0, typed.value.length);
		const nextTwoChars = props.expression.text.substring(typed.value.length, typed.value.length + 2);
		if (nextTwoChars.includes('(')) {
			let toType = props.expression.text.substring(0, props.expression.text.indexOf(')', typed.value.length) + 1);
			if (props.expression.text.charAt(toType.length)) {
				toType += ' ';
			}
			typed.value = toType;
		}
		if (typedWord.length > 0 && typedWord.length === props.expression.text.length) {
			isNoMatch.value = false;
			isPartialMatch.value = false;
			isFullMatch.value = true;
			emit('fullMatched', props.rowOrder, true);
		} else {
			isNoMatch.value = false;
			isPartialMatch.value = true;
			isFullMatch.value = false;
			currentMaxLength.value = typed.value.length + 1;
		}
	} else {
		isNoMatch.value = true;
		isPartialMatch.value = false;
		isFullMatch.value = false;
		moreLettersAllowed.value = false;
	}
}

function checkFirstLettersMatch(textToMatch: string, typedWord: string) {
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
	let j = 0;
	while (j < typed.value.length && props.expression.text.charAt(j) === typed.value.charAt(j)) {
		j += 1;
	}
	if (j > 0) {
		// Don't hint only space but next letter too
		if (props.expression.text[j] === ' ') {
			typed.value = props.expression.text.substring(0, j + 2);
		} else {
			typed.value = props.expression.text.substring(0, j + 1);
		}
	} else {
		typed.value = props.expression.text.substring(0, 1);
	}
	focusInput();
}

function show() {
	typed.value = props.expression.text;
}
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
