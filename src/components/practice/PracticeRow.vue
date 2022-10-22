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
        id="textInput"
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
        :disabled="buttonsDisabled($props, els)"
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
        :disabled="buttonsDisabled($props, els)"
        @keydown.left="$refs.hintButton.focus()"
        @click="show()"
      >
        Show
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue';
import {getEmptySettingsNoAsync} from '../../../server/model/settings/settings';
import {
	buttonsDisabled,
	doTheFocusInput,
	doTheHint,
	doTheMount,
	doTheResetRow,
	doTheShow,
	doTheWatchExpression,
	doTheWatchReset,
	doTheWatchTyped,
	focusedChanged,
} from '@/components/practice/PracticeRow';
import Api from '@/ts/api';

const emit = defineEmits(['fullMatched', 'skipFocus', 'focusNext', 'focusPrevious', 'focusedRow']);
const props = defineProps({
	expression: {} as any,
	rowOrder: {type: Number, default: 0},
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
const settings = ref(getEmptySettingsNoAsync());
const textInput = ref(null);

const els = {
	typed, isFullMatch, isPartialMatch, isNoMatch, nothingTyped, moreLettersAllowed, currentMaxLength, settings,
};

(async () => {
	settings.value = await Api.getSettings();
})();

onMounted(() => {
	doTheMount(props, focusInput, emit);
});

watch(props.expression, () => {
	doTheWatchExpression(props, typed, isFullMatch);
});

watch(() => props.isFocused, isFocused => {
	focusedChanged(props, isFocused, emit, focusInput, isFullMatch);
});

watch(typed, () => {
	doTheWatchTyped(props, emit, els);
});

watch(() => props.reset, _ => {
	doTheWatchReset(props, resetRow);
});

function resetRow() {
	doTheResetRow(els);
}

function focusInput() {
	doTheFocusInput(els, textInput);
}

function hint() {
	doTheHint(props, els, textInput);
}

function show() {
	doTheShow(props, els);
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
