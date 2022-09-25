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
        @keydown.right="$refs.hintButton.focus()"
      >
      <button
        ref="hintButton"
        class="btn btn-outline-dark hint-button"
        :disabled="buttonsDisabled()"
        value="Hint"
        @keydown.right="$refs.showButtom.focus()"
        @keydown.left="$refs.textInput.focus()"
        @click="hint()"
      >
        Hint
      </button>
      <button
        ref="showButtom"
        class="btn btn-outline-dark show-button"
        :disabled="buttonsDisabled()"
        @keydown.left="$refs.hintButton.focus()"
        @click="show()"
      >
        Show
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, onMounted, ref, watch} from 'vue';
import Api from '@/ts/api';

const emit = defineEmits(['fullMatched', 'skipFocus', 'focusNext', 'focusPrevious', 'focusedRow']);
const props = defineProps({
	// TODO: This should be Expression
	expression: {} as any,
	rowOrder: Number,
	isFocused: Boolean,
	startInteractive: Boolean,
	reset: Boolean});

const typed = ref('');
const isFullMatch = ref(false);
const isPartialMatch = ref(false);
const isNoMatch = ref(false);
const nothingTyped = ref(true);
const moreLettersAllowed = ref(true);
const currentMaxLength = ref(1);
// TODO: This should be Settings
const settings = ref({} as any);

const textInput = ref(null);

onMounted(() => {
	if (props.isFocused) {
		if (props.expression.language.isPractice) {
			focusInput();
		} else {
			emit('skipFocus');
		}
	}
});

(async () => {
	settings.value = await Api.getSettings();
})();

watch(props.expression, () => {
	if (props.expression.language.isPractice) {
		typed.value = '';
		isFullMatch.value = false;
	}
});

watch(() => props.isFocused, isFocused => {
	if (props.startInteractive && isFocused) {
		if (isFullMatch.value || !props.expression.language.isPractice) {
			emit('skipFocus');
		} else if (props.expression.language.isPractice) {
			focusInput();
		} else {
			emit('skipFocus');
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

watch(() => props.reset, _ => {
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
}

function focusInput() {
	if (textInput.value && textInput.value) {
		(textInput as any).value.focus();
		// Focus end of word
		const saved = typed.value;
		(textInput.value as any).value = '';
		(textInput.value as any).value = saved;
	}
}

function buttonsDisabled() {
	return !props.expression.language.isPractice || isFullMatch.value;
}

function normalizeChar(c: string) {
	if (settings.value.strictCharacters) {
		return c;
	}
	return c.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
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
