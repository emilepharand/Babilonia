<template>
  <div>
    <h1>Search Ideas</h1>
    <div
      class="d-flex"
      style="width: 900px"
    >
      <div
        class="row d-inline g-3"
        style="width: 400px"
      >
        <div class="col-md-12">
          <label
            for="pattern"
            class="form-label"
          >Search for this expression:</label>
          <input
            id="pattern"
            v-model="pattern"
            type="email"
            class="form-control"
            @keydown.enter="search()"
          >
        </div>
        <div class="col-12">
          <div class="form-check">
            <input
              id="strict"
              v-model="strict"
              class="form-check-input"
              type="checkbox"
            >
            <label
              class="form-check-label"
              style="cursor:pointer;"
              for="strict"
            >
              Exact match
            </label>
          </div>
        </div>
        <div class="col-12 d-flex gap-3">
          <div class="form-check">
            <input
              id="knownExpressions"
              v-model="knownExpressions"
              class="form-check-input"
              type="checkbox"
              @change="unknownExpressions = false"
            >
            <label
              class="form-check-label"
              for="knownExpressions"
              style="cursor:pointer;"
            >
              Known
            </label>
          </div>
          <div
            class="form-check"
          >
            <input
              id="unknownExpressions"
              v-model="unknownExpressions"
              class="form-check-input"
              type="checkbox"
              @change="knownExpressions = false"
            >
            <label
              class="form-check-label"
              style="cursor:pointer;"
              for="unknownExpressions"
            >
              Unknown
            </label>
          </div>
        </div>
        <div class="col-12">
          <label
            for="expressionLanguage"
            class="form-label"
          >In this language:</label>
          <select
            id="expressionLanguage"
            v-model="expressionLanguage"
            class="expression-language form-select"
            name="language"
          >
            <option
              v-for="language in languagesWithPlaceholder"
              :key="language.id"
              :value="language"
            >
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label
            for="ideaHas"
            class="form-label"
          >In an idea that contains all of these languages:</label>
          <select
            id="ideaHas"
            v-model="ideaHas"
            class="form-select"
            size="3"
            aria-label="size 3 select example"
            multiple
          >
            <option
              v-for="language in languages"
              :key="language.id"
              :value="language"
            >
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label
            for="ideaDoesNotHave"
            class="form-label"
          >In an idea that does not contain this language:</label>
          <select
            id="ideaDoesNotHave"
            v-model="ideaDoesNotHave"
            class="form-select"
            name="language"
          >
            <option
              v-for="language in languagesWithPlaceholder"
              :key="language.id"
              :value="language"
            >
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="d-flex btn-group">
          <button
            id="search-button"
            class="btn btn-outline-secondary flex-grow-1"
            @click="search()"
          >
            Search
          </button>
          <button
            id="reset-button"
            class="btn btn-outline-secondary flex-grow-1"
            @click="reset()"
          >
            Reset
          </button>
        </div>
        <span
          v-if="isShowError"
          id="error-text"
          class="pl-2 text-danger"
        >{{ errorText }}</span>
      </div>
      <div
        v-if="!(results.length > 0 && results[0].id === -1)"
        id="search-results"
        class="ps-3 d-flex flex-column"
        style="width:500px"
      >
        <h2 v-if="thereAreNoResults()">
          No results.
        </h2>
        <div
          v-for="idea of results"
          :key="idea.id"
          class="search-result me-3 mb-2 btn btn-outline-primary"
        >
          <a
            class="text-reset text-decoration-none"
            :href="'/ideas/' + idea.id"
          >
            <div
              v-for="e of idea.ee"
              :key="e.id"
            >
              <span
                v-if="e.matched"
                class="text-break"
              ><b v-if="e.matched">{{ e.text }}</b></span>
              <span
                v-else
                class="text-break"
              >{{ e.text }}</span>
            </div>
          </a>
        </div>
        <div
          v-if="searchWasDone()"
          class="d-flex pe-3 mt-3"
        >
          <div
            class="w-100 pe-1"
          >
            <button
              id="previous-page-button"
              :disabled="getCurrentPage() === 1"
              class="btn btn-primary w-100"
              @click="previousPage()"
            >
              Previous page
            </button>
          </div>
          <div class="w-100 ps-1">
            <button
              id="next-page-button"
              :disabled="!thereAreMoreResults()"
              class="btn btn-primary w-100"
              @click="nextPage()"
            >
              Next page
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import type {Idea} from '../../server/model/ideas/idea';
import {getEmptyIdeaArrayNoAsync} from '../../server/model/ideas/idea';
import type {Language} from '../../server/model/languages/language';
import {getEmptyLanguageNoAsync, getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import type {SearchContext} from '../../server/model/search/searchContext';
import * as Api from '../ts/api';

// Search context
const pattern = ref('');
const results = ref(getEmptyIdeaArrayNoAsync());
const strict = ref(false);
const ideaHas = ref(getEmptyLanguagesNoAsync());
const expressionLanguage = ref(getEmptyLanguageNoAsync());
const ideaDoesNotHave = ref(getEmptyLanguageNoAsync());
const knownExpressions = ref(false);
const unknownExpressions = ref(false);
let currentPage = 1;
const pageSize = 10;
let searchResults: Idea[];

// Component data
const languagesWithPlaceholder = ref(getEmptyLanguagesNoAsync());
const languages = ref(getEmptyLanguagesNoAsync());
const isShowError = ref(false);
const errorText = ref('');
const languagePlaceholderId = -1;

(async () => {
	const allLanguages = await Api.getLanguages();
	// Placeholder language represents "any" language
	const placeholderLanguage = getEmptyLanguageNoAsync();
	languagesWithPlaceholder.value = [...allLanguages];
	languagesWithPlaceholder.value.push(placeholderLanguage);
	ideaDoesNotHave.value = placeholderLanguage;
	expressionLanguage.value = placeholderLanguage;
	languages.value = [...allLanguages];
	ideaHas.value = [];
})();

function reset() {
	pattern.value = '';
	strict.value = false;
	expressionLanguage.value = getEmptyLanguageNoAsync();
	ideaDoesNotHave.value = getEmptyLanguageNoAsync();
	ideaHas.value = [];
	isShowError.value = false;
	knownExpressions.value = false;
	unknownExpressions.value = false;
}

async function search() {
	isShowError.value = false;
	if (!atLeastOneFilterSet()) {
		errorText.value = 'Please select at least one filter.';
		isShowError.value = true;
		return;
	}
	currentPage = 1;
	searchResults = await Api.searchIdeas(createSearchContext());
	results.value = getSearchResultsForPage(currentPage);
}

function atLeastOneFilterSet() {
	return strict.value || pattern.value || ideaDoesNotHave.value.id !== languagePlaceholderId
      || knownExpressions.value || unknownExpressions.value
      || ideaHas.value.length > 0 || expressionLanguage.value.id !== languagePlaceholderId;
}

function createSearchContext() {
	const sc: SearchContext = {};
	sc.strict = strict.value;
	sc.pattern = pattern.value;
	if (ideaDoesNotHave.value.id !== languagePlaceholderId) {
		sc.ideaDoesNotHave = ideaDoesNotHave.value.id;
	}
	if (ideaHas.value.length > 0) {
		sc.ideaHas = ideaHas.value.map((l: Language) => l.id);
	}
	if (expressionLanguage.value.id !== languagePlaceholderId) {
		sc.language = expressionLanguage.value.id;
	}
	if (knownExpressions.value || unknownExpressions.value) {
		sc.knownExpressions = knownExpressions.value;
	}
	return sc;
}

async function nextPage() {
	currentPage++;
	results.value = getSearchResultsForPage(currentPage);
}

async function previousPage() {
	currentPage--;
	results.value = getSearchResultsForPage(currentPage);
}

function thereAreNoResults() {
	return getSearchResultsForPage(currentPage).length === 0;
}

function thereAreMoreResults() {
	return getSearchResultsForPage(currentPage + 1).length > 0;
}

function getSearchResultsForPage(pageNumber: number) {
	const indexStart = (pageNumber - 1) * pageSize;
	const indexEnd = indexStart + pageSize;
	return searchResults.slice(indexStart, indexEnd);
}

function searchWasDone() {
	return searchResults !== undefined;
}

function getCurrentPage() {
	return currentPage;
}
</script>
