<template>
  <div>
    <h1>Search Ideas</h1>
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
		initComplete() {
			const thead = document.querySelector('#table thead');
			const tr = document.createElement('tr');
			thead!.appendChild(tr);

			const tds = [];
			for (let i = 0; i < 4; i++) {
				tds.push(document.createElement('td'));
				tr.appendChild(tds[i]);
			}

			function createSearchInput(id: string, placeholder: string, columnIndex: number) {
				const input = document.createElement('input');
				input.classList.add('form-control');
				input.classList.add('form-control-sm');
				input.id = id;
				input.type = 'text';
				input.placeholder = placeholder;
				input.oninput = () => dt.column(columnIndex).search(input.value).draw();
				return input;
			}

			function createSearchSelect(id: string, placeholder: string, columnIndex: number, options: string[]) {
				const select = document.createElement('select');
				select.classList.add('form-select');
				select.classList.add('form-select-sm');
				select.id = id;
				select.innerHTML = `<option value="">${placeholder}</option>`;
				options.forEach(option => {
					const optionElement = document.createElement('option');
					optionElement.value = option;
					optionElement.textContent = option;
					select.appendChild(optionElement);
				});
				select.onchange = () => dt.column(columnIndex).search(select.value, {exact: true}).draw();
				return select;
			}

			tds[1].appendChild(createSearchInput('searchLanguages', 'Search languages', 1));
			tds[2].appendChild(createSearchInput('searchText', 'Search texts', 2));
			tds[3].appendChild(createSearchSelect('searchKnown', 'Search known', 3, ['0', '1']));
		},
	});
})();
</script>

<style>
table.dataTable td.dt-type-numeric, table.dataTable th.dt-type-numeric {
	text-align: left;
}
table {
	width: 100%!important;
}
</style>
