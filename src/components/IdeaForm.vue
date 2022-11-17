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
          @keydown.right.prevent="focusRight"
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
          @keydown.down="focusNext"
          @keydown.left="focusLeft"
          @keydown.right="focusRight"
          @keydown.up="focusPrevious"
        >
        <div
          style="cursor: pointer"
          class="expression-known p-2 d-flex align-items-center"
          @click="e.known = !e.known"
        >
          <span
            tabindex="0"
            style="cursor: pointer"
            class="form-check-label expression-known-toggle"
            @keydown.enter="e.known = !e.known"
            @keydown.left="focusLeft"
            @keydown.down="focusNext"
            @keydown.up="focusPrevious"
          >
            {{ e.known ? '✅':'❌' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import * as Api from '../ts/api';
import type {Idea} from '../../server/model/ideas/idea';

defineProps<{
	title: string;
	idea: Idea;
}>();

defineEmits(['addRows', 'delete']);

const languages = ref(getEmptyLanguagesNoAsync());
const loaded = ref(false);

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
})();

function focusNext(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	const selector = getSelectorFromElement(element as HTMLElement);
	const els = document?.querySelectorAll<HTMLInputElement>(selector) || [];
	if (i !== null) {
		const indexToUse = i + 1 === els.length ? 0 : i + 1;
		els[indexToUse].focus();
	}
}

function focusPrevious(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	const selector = getSelectorFromElement(element as HTMLElement);
	const els = document?.querySelectorAll<HTMLInputElement>(selector) || [];
	if (i !== null) {
		const indexToUse = i - 1 < 0 ? els.length - 1 : i - 1;
		els[indexToUse].focus();
	}
}

function focusLeft(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	if (i !== null) {
		const currentSelector = getSelectorFromElement(element as HTMLElement);
		if (currentSelector === '.expression-text') {
			const cursorPosition = (element as HTMLInputElement).selectionStart ?? 1;
			if (cursorPosition > 0) {
				return;
			}
		}
		let selectorToFocus;
		if (currentSelector === '.expression-known-toggle') {
			selectorToFocus = '.expression-text';
		} else {
			selectorToFocus = '.expression-language';
		}
		const els = document?.querySelectorAll<HTMLSelectElement>(selectorToFocus) || [];
		els[i].focus();
	}
}

function focusRight(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	if (i !== null) {
		const currentSelector = getSelectorFromElement(e.target as HTMLElement);
		if (currentSelector === '.expression-text') {
			const cursorPosition = (element as HTMLInputElement).selectionStart ?? 1;
			const {length} = (element as HTMLInputElement).value;
			if (cursorPosition < length) {
				return;
			}
		}
		let selectorToFocus;
		if (currentSelector === '.expression-language') {
			selectorToFocus = '.expression-text';
		} else {
			selectorToFocus = '.expression-known-toggle';
		}
		const els = document?.querySelectorAll<HTMLSelectElement>(selectorToFocus) || [];
		els[i].focus();
	}
}

function getCurrentRowNumber(element: HTMLElement) {
	const selector = getSelectorFromElement(element);
	const els = document?.querySelectorAll<HTMLElement>(selector) || [];
	for (let i = 0; i < els.length; i++) {
		if (els[i] === element) {
			return i;
		}
	}
	return null;
}

function getSelectorFromElement(element: HTMLElement) {
	let selector;
	if (element.classList.contains('expression-language')) {
		selector = '.expression-language';
	} else if (element.classList.contains('expression-text')) {
		selector = '.expression-text';
	} else {
		selector = '.expression-known-toggle';
	}
	return selector;
}

</script>
