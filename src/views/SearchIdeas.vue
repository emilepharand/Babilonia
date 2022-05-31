<template>
  <div>
    <h1>Search Ideas</h1>
    <div class="d-flex">
      <div class="row col-md-4 g-3">
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
            <option v-for="language in languages" :key="language.id" :value="language">
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <label for="ideaDoesNotHave" class="form-label">In an idea that does not contain this language:</label>
          <select id="ideaDoesNotHave" class="expression-language form-select" name="language" v-model="ideaDoesNotHave">
            <option v-for="language in languages" :key="language.id" :value="language">
              {{ language.name }}
            </option>
          </select>
        </div>
        <div class="col-12">
          <input type="button" class="btn btn-primary" @click="search()" value="Search">
        </div>
      </div>
      <div class="col-md-8 ps-3 d-flex" id="search-results" v-if="results.length > 0 && results[0].id !== -1">
        <div class="me-3" v-for="idea of results" v-bind:key="idea.id">
          <h2><a :href="'/ideas/' + idea.id">Edit</a></h2>
          <div v-for="e of idea.ee" v-bind:key="e.id">
            <span v-if="e.matched"><b v-if="e.matched">{{ e.text }}</b></span>
            <span v-else>{{ e.text }}</span>
          </div>
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
			ideaHas: getEmptyLanguagesNoAsync(),
			expressionLanguage: getEmptyLanguageNoAsync(),
			ideaDoesNotHave: getEmptyLanguageNoAsync(),
		};
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.ideaHas = [];
		this.ideaDoesNotHave = this.languages[0];
		this.expressionLanguage = this.languages[0];
	},
	methods: {
		async search() {
			const sc2: SearchContext = {
				pattern: this.pattern,
			};
			if (this.strict) {
				sc2.strict = true;
			}
			this.results = await Api.searchIdeas(sc2);
		},
	},
});
</script>
