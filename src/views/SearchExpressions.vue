<template>
  <div>
    <h1>Search Ideas</h1>
    <table id="table" />
  </div>
</template>

<script lang="ts" setup>
import DataTable from 'datatables.net-bs5';
import * as Api from '../ts/api';

(async () => {
	const searchResults = await Api.getExpressions();
	console.log(searchResults);

	// eslint-disable-next-line no-new
	new DataTable('#table', {

		data: searchResults,
		columns: [
			{data: 'ideaId', title: 'Idea ID'},
			{data: 'languageName', title: 'Language'},
			{data: 'text', title: 'Text'},
			{data: 'known', title: 'Known'},
		],
	});
})();
</script>
