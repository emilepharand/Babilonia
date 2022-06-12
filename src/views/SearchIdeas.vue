<template>
  <div>
    <h1>Search Ideas</h1>
    <div class="d-flex" style="width: 900px">
      <div class="row d-inline g-3" style="width: 400px">
        <div class="col-md-12">
          <label for="pattern" class="form-label">Search for this expression:</label>
          <input id="pattern" type="email" class="form-control" v-model="pattern">
        </div>
        <div class="col-12">
          <div class="form-check">
            <input id="strict" class="form-check-input" type="checkbox" v-model="strict">
            <label class="form-check-label" for="strict">
              Exact match
            </label>
          </div>
        </div>
        <div class="col-12">
          <label for="expressionLanguage" class="form-label">In this language:</label>
          <select id="expressionLanguage" class="expression-language form-select" name="language" v-model="expressionLanguage">
            <option v-for="language in languages" :key="language.id" :value="language">
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label for="ideaHas" class="form-label">In an idea that contains one of these languages:</label>
          <select class="form-select" id="ideaHas" size="3" aria-label="size 3 select example" multiple v-model="ideaHas">
            <option v-for="language in languagesWithoutPlaceholder" :key="language.id" :value="language">
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label for="ideaDoesNotHave" class="form-label">In an idea that does not contain this language:</label>
          <select id="ideaDoesNotHave" class="form-select" name="language" v-model="ideaDoesNotHave">
            <option v-for="language in languages" :key="language.id" :value="language">
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="d-flex btn-group">
          <button id="search-button" @click="search()" class="btn btn-outline-secondary flex-grow-1">Search</button>
          <button id="reset-button" class="btn btn-outline-secondary flex-grow-1" @click="reset()">Reset</button>
        </div>
        <span v-if="isShowError" id="error-text" class="pl-2 text-danger">{{ errorText }}</span>
      </div>
      <div class="ps-3 d-flex flex-column" id="search-results" style="width:500px" v-if="!(results.length > 0 && results[0].id === -1)">
        <h2 v-if="noResults">No results.</h2>
        <div class="me-3 mb-2 btn btn-outline-primary" v-for="idea of results" v-bind:key="idea.id">
          <a class="text-reset text-decoration-none" :href="'/ideas/' + idea.id">
          <div v-for="e of idea.ee" v-bind:key="e.id">
            <span class="text-break" v-if="e.matched"><b v-if="e.matched">{{ e.text }}</b></span>
            <span class="text-break" v-else>{{ e.text }}</span>
          </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SearchContext} from '../../server/model/search/searchContext';
import Api from '@/ts/api';
import {getEmptyIdeaArrayNoAsync} from '../../server/model/ideas/idea';
import {getEmptyLanguageNoAsync, getEmptyLanguagesNoAsync} from '../../server/model/languages/language';

export default defineComponent({
	name: 'SearchIdeas',
	data() {
		return {
			pattern: '',
			results: getEmptyIdeaArrayNoAsync(),
			strict: false,
			languages: getEmptyLanguagesNoAsync(),
			languagesWithoutPlaceholder: getEmptyLanguagesNoAsync(),
			ideaHas: getEmptyLanguagesNoAsync(),
			expressionLanguage: getEmptyLanguageNoAsync(),
			ideaDoesNotHave: getEmptyLanguageNoAsync(),
			isShowError: false,
			errorText: '',
			noResults: false,
		};
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.languagesWithoutPlaceholder = [...this.languages];
		this.ideaHas = [];
		const placeholderLanguage = getEmptyLanguageNoAsync();
		this.languages.push(placeholderLanguage);
		this.ideaDoesNotHave = placeholderLanguage;
		this.expressionLanguage = placeholderLanguage;
	},
	methods: {
		reset() {
			this.pattern = '';
			this.strict = false;
			this.expressionLanguage = getEmptyLanguageNoAsync();
			this.ideaDoesNotHave = getEmptyLanguageNoAsync();
			this.ideaHas = [];
		},
		async search() {
			const sc2: SearchContext = {};
			let atLeastOneFilterSet = false;
			if (this.strict) {
				sc2.strict = true;
				atLeastOneFilterSet = true;
			}
			if (this.pattern) {
				sc2.pattern = this.pattern;
				atLeastOneFilterSet = true;
			}
			if (this.ideaDoesNotHave.id !== -1) {
				sc2.ideaDoesNotHave = this.ideaDoesNotHave.id;
				atLeastOneFilterSet = true;
			}
			if (this.ideaHas.length > 0) {
				sc2.ideaHas = this.ideaHas.map(i => i.id);
				atLeastOneFilterSet = true;
			}
			if (this.expressionLanguage.id !== -1) {
				sc2.language = this.expressionLanguage.id;
				atLeastOneFilterSet = true;
			}
			if (atLeastOneFilterSet) {
				this.isShowError = false;
				const matchedIdeas = await Api.searchIdeas(sc2);
				if (matchedIdeas.length === 0) {
					this.results = [];
					this.noResults = true;
				} else {
					this.noResults = false;
					this.results = matchedIdeas;
				}
			} else {
				this.errorText = 'Please select at least one filter.';
				this.isShowError = true;
			}
		},
	},
});
</script>
