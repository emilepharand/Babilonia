<template>
  <div>
    <h1>Search Ideas</h1>
    <input type="text" @keydown.enter="search()" v-model="pattern"/>
    <input type="button" @click="search()" value="Search">
    <div id="search-results" v-if="results.length > 0 && results[0].id !== -1">
      <div v-for="idea of results" v-bind:key="idea.id">
        <div v-for="e of idea.ee" v-bind:key="e.id">
          <span v-if="e.matched"><b v-if="e.matched">{{ e.text }}</b></span>
          <span v-else>{{ e.text }}</span>
        </div>
        <br>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SearchContext} from '../../server/model/search/searchContext';
import Api from '@/ts/api';
import {getEmptyIdeaArrayNoAsync} from '../../server/model/ideas/idea';

export default defineComponent({
	name: 'SearchIdeas',
	data() {
		return {
			pattern: '',
			results: getEmptyIdeaArrayNoAsync(),
		};
	},
	async created() {
	},
	methods: {
		async search() {
			const sc2: SearchContext = {
				pattern: this.pattern,
			};
			this.results = await Api.searchIdeas(sc2);
		},
	},
});
</script>
