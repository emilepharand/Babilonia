<template>
  <div class="browse">
    <h1>Idea</h1>
    <button @click="nextIdea()">Next</button>
    <router-link :to="'/idea/edit/' + idea.id">Edit</router-link>
    <button @click="deleteIdea()">Delete</button>
    <div v-for="e in idea.ee" v-bind:key="e.id">
      <b>{{ e.language.name }}</b>: {{ e.texts[0] }}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptyIdea} from '../../server/model/ideas/idea';

export default defineComponent({
	name: 'BrowseIdeas',
	data() {
		return {
			idea: getEmptyIdea(),
		};
	},
	methods: {
		async nextIdea() {
			this.idea = await Api.getNextIdea();
		},
		async deleteIdea() {
			await Api.deleteIdea(this.idea.id);
		},
	},
	async created() {
		this.idea = await Api.getNextIdea();
	},
});
</script>
