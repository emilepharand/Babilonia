<template>
  <div>
    <h1>Search Ideas</h1>
    <input
      id="searchLanguages"
      type="text"
      placeholder="Search languages"
      @input="searchLanguages"
    >
    <table
      id="table"
    >
      <thead />
    </table>
  </div>
</template>

<script lang="ts" setup>
import DataTable, {type Api as DataTablesApi} from 'datatables.net-bs5';
import 'jquery';
import * as Api from '../ts/api';

let dt: DataTablesApi;

(async () => {
	const searchResults = await Api.getExpressions();
	console.log(searchResults);

	dt = new DataTable('#table', {
		data: searchResults,
		columns: [
			{data: 'ideaId', title: 'Idea&nbsp;ID'},
			{data: 'languageName', title: 'Language'},
			{data: 'text', title: 'Text'},
			{data: 'known', title: 'Known'},
		],
	});
})();

const searchLanguages = () => {
	const search = document.getElementById('searchLanguages') as HTMLInputElement;
	dt.column(1).search(search.value).draw();
};
</script>

<style>
table.dataTable td.dt-type-numeric, table.dataTable th.dt-type-numeric {
	text-align: left;
}
</style>
