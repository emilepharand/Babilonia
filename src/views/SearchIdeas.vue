<template>
  <div>
    <h1>Search Ideas</h1>
    <table id="table" />
  </div>
</template>

<script lang="ts" setup>
import DataTable from 'datatables.net-bs5';
import {type SearchContext} from '../../server/model/search/searchContext';
import * as Api from '../ts/api';

(async () => {
	const searchResults = await Api.searchIdeas(createSearchContext());
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
	const toGive = [] as any;
	Object.values(searchResults).forEach(idea => {
		const ideaId = idea.id;
		for (const e of idea.ee) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			toGive.push({
				ideaId,
				language: e.language.name,
				text: e.text,
				matched: e.matched,
				known: e.known,
			});
		}
	});
	console.log(toGive);

	// eslint-disable-next-line no-new
	new DataTable('#table', {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		data: toGive,
		columns: [
			{data: 'ideaId', title: 'Idea ID'},
			{data: 'language', title: 'Language'},
			{data: 'text', title: 'Text'},
			{data: 'known', title: 'Known'},
		],
	});
})();

function createSearchContext() {
	const sc: SearchContext = {};
	sc.knownExpressions = false;
	return sc;
}
</script>
