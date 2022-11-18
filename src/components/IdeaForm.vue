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
          @keydown.down="focusDown"
          @keydown.left="focusLeft"
          @keydown.right="focusRight"
          @keydown.up="focusUp"
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
            @keydown.down="focusDown"
            @keydown.up="focusUp"
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

function focusDown(e: Event) {
	const {i, els} = findElementListAndPositionInList(e);
	if (i !== null) {
		const indexToUse = i + 1 === els.length ? 0 : i + 1;
		focusEndOfInput(els[indexToUse] as HTMLInputElement);
	}
}

function focusUp(e: Event) {
	const {i, els} = findElementListAndPositionInList(e);
	if (i !== null) {
		const indexToUse = i - 1 < 0 ? els.length - 1 : i - 1;
		focusEndOfInput(els[indexToUse] as HTMLInputElement);
	}
}

function findElementListAndPositionInList(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	const className = getClassNameFromElement(element as HTMLElement);
	const els = findAllElementsWithClassName(className);
	return {i, els};
}

function focusEndOfInput(element: HTMLInputElement) {
	setTimeout(() => {
		const saved = element.value;
		element.value = '';
		element.value = saved;
	}, 0);
	setTimeout(() => {
		element.focus();
	}, 1);
}

const expressionLanguageClassName = 'expression-language';
const expressionTextClassName = 'expression-text';
const expressionKnownClassName = 'expression-known-toggle';

function focusLeft(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	if (i !== null) {
		const currentClassName = getClassNameFromElement(element as HTMLElement);
		if (currentClassName === expressionTextClassName) {
			const cursorPosition = (element as HTMLInputElement).selectionStart ?? 1;
			if (cursorPosition > 0) {
				// Don't move left if not at beginning of input
				return;
			}
		}
		let elementWithClassNameToFocus;
		if (currentClassName === expressionKnownClassName) {
			elementWithClassNameToFocus = expressionTextClassName;
		} else {
			elementWithClassNameToFocus = expressionLanguageClassName;
		}
		const els = findAllElementsWithClassName(elementWithClassNameToFocus);
		focusEndOfInput(els[i] as HTMLInputElement);
	}
}

function focusRight(e: Event) {
	const element = e.target;
	const i = getCurrentRowNumber(element as HTMLElement);
	if (i !== null) {
		const currentSelector = getClassNameFromElement(e.target as HTMLElement);
		if (currentSelector === expressionTextClassName) {
			const cursorPosition = (element as HTMLInputElement).selectionStart ?? 1;
			const {length} = (element as HTMLInputElement).value;
			if (cursorPosition < length) {
				// Don't move right if not at beginning of input
				return;
			}
		}
		let selectorToFocus;
		if (currentSelector === expressionLanguageClassName) {
			selectorToFocus = expressionTextClassName;
		} else {
			selectorToFocus = expressionKnownClassName;
		}
		const els = findAllElementsWithClassName(selectorToFocus);
		els[i].focus();
	}
}

function getCurrentRowNumber(element: HTMLElement) {
	const selector = getClassNameFromElement(element);
	const els = findAllElementsWithClassName(selector);
	for (let i = 0; i < els.length; i++) {
		if (els[i] === element) {
			return i;
		}
	}
	return null;
}

function getClassNameFromElement(element: HTMLElement) {
	let selector;
	if (element.classList.contains(expressionLanguageClassName)) {
		selector = expressionLanguageClassName;
	} else if (element.classList.contains(expressionTextClassName)) {
		selector = expressionTextClassName;
	} else {
		selector = expressionKnownClassName;
	}
	return selector;
}

function findAllElementsWithClassName(className: string) {
	return document?.querySelectorAll<HTMLElement>(`.${className}`) || [];
}
</script>
