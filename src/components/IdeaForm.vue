<template>
  <div
    v-if="loaded"
    id="ideas"
  >
    <div
      v-for="e in idea.ee"
      :key="e.id"
      class="expression"
      style="width: 800px;"
    >
      <div class="input-group">
        <select
          v-model="e.language"
          class="expression-language form-select"
          name="language"
          @keydown.right.prevent="moveRight"
        >
          <option
            v-for="language in languages"
            :key="language.id"
            :value="language"
          >
            {{ language.name }}
          </option>
        </select>
        <input
          v-model="e.text"
          class="expression-text form-control"
          style="flex-grow:2"
          type="text"
          @keydown.enter="emit('save')"
          @keydown.left="moveLeft"
          @keydown.right="moveRight"
          @keydown.up.prevent="moveUp"
          @keydown.down.prevent="moveDown"
        >
        <div
          style="cursor: pointer"
          class="p-2 d-flex align-items-center expression-known-wrapper"
          title="Known expression"
          data-bs-html="true"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          @click="e.known = !e.known"
        >
          <input
            ref="knownButton"
            v-model="e.known"
            type="checkbox"
            style="cursor: pointer"
            class="expression-known-checkbox form-check-label"
            @keydown.enter="e.known = !e.known"
            @keydown.left="moveLeft"
            @keydown.down="moveDown"
            @keydown.up="moveUp"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import type {Idea} from '../../server/model/ideas/idea';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import * as Api from '../ts/api';
import {focusEndOfInput} from '../ts/domHelper';
import {knownToggles, languageSelects, textInputs} from '../ts/ideaForm/rowArrowsNavigation';

defineProps<{
	title: string;
	idea: Idea;
}>();

const emit = defineEmits(['moveFocusUp', 'moveFocusDown', 'save']);

const languages = ref(getEmptyLanguagesNoAsync());
const loaded = ref(false);

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
})();

function moveLeft(e: Event) {
	const element = e.target as HTMLElement;
	if (knownToggles.includes(element)) {
		focusEndOfInput(textInputs[knownToggles.indexOf(element)] as HTMLInputElement);
	} else if (textInputs.includes(element)) {
		const cursorPosition = (element as HTMLInputElement).selectionStart;
		if (cursorPosition === 0) {
			// Only move left if at beginning of input
			languageSelects[textInputs.indexOf(element)].focus();
		}
	}
}

function moveRight(e: Event) {
	const element = e.target as HTMLElement;
	if (languageSelects.includes(element)) {
		focusEndOfInput(textInputs[languageSelects.indexOf(element)] as HTMLInputElement);
	} else if (textInputs.includes(element)) {
		const cursorPosition = (element as HTMLInputElement).selectionStart;
		if (cursorPosition === (element as HTMLInputElement).value.length) {
			// Only move right if at end of input
			knownToggles[textInputs.indexOf(element)].focus();
		}
	}
}

function moveDown(e: Event) {
	const element = e.target as HTMLElement;
	if (textInputs.includes(element)) {
		const i = textInputs.indexOf(element);
		if (i + 1 === textInputs.length) {
			emit('moveFocusDown');
		} else {
			focusEndOfInput(textInputs[i + 1] as HTMLInputElement);
		}
	} else if (knownToggles.includes(element)) {
		const i = knownToggles.indexOf(element);
		const indexToUse = i + 1 === knownToggles.length ? 0 : i + 1;
		knownToggles[indexToUse].focus();
	}
}

function moveUp(e: Event) {
	const element = e.target as HTMLElement;
	if (textInputs.includes(element)) {
		const i = textInputs.indexOf(element);
		if (i - 1 < 0) {
			emit('moveFocusUp');
		} else {
			focusEndOfInput(textInputs[i - 1] as HTMLInputElement);
		}
	} else if (knownToggles.includes(element)) {
		const i = knownToggles.indexOf(element);
		const indexToUse = i - 1 < 0 ? knownToggles.length - 1 : i - 1;
		focusEndOfInput(knownToggles[indexToUse] as HTMLInputElement);
	}
}
</script>
