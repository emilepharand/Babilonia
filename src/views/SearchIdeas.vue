<template>
  <div>
    <h1>Search Ideas</h1>
    <input type="text" @keydown.enter="search()" v-model="pattern"/>
    <input type="button" @click="search()" value="Search">
    <div id="search-results">
      {{ results }}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SearchContext} from '../../server/model/search/searchContext';
import Api from '@/ts/api';
import {Idea} from '../../server/model/ideas/idea';

export default defineComponent({
	name: 'SearchIdeas',
	data() {
		return {
			pattern: '',
			results: '',
		};
	},
	async created() {
	},
	methods: {
		async search() {
			const sc2: SearchContext = {
				pattern: this.pattern,
			};
			const ideas: Idea[] = await Api.searchIdeas(sc2);
			this.results = JSON.stringify(ideas);
		},
	},
});
</script>
