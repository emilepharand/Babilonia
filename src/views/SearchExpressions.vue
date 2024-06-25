<template>
  <div>
    <h1>Search Ideas</h1>
    <table
      id="table"
      class="responsive"
    />
  </div>
</template>

<script lang="ts" setup>
import DataTable from 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import 'jquery';
import * as Api from '../ts/api';

(async () => {
	const searchResults = await Api.getExpressions();
	console.log(searchResults);

	// eslint-disable-next-line no-new
	new DataTable('#table', {

		data: searchResults,
		columns: [
			{data: 'ideaId', title: 'Idea&nbsp;ID'},
			{data: 'languageName', title: 'Language'},
			{data: 'text', title: 'Text'},
			{data: 'known', title: 'Known'},
		],
	});
})();
</script>

<style>
table.dataTable td.dt-type-numeric {
	text-align: left;
}
</style>
