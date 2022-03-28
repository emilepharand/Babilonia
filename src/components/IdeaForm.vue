<template>
  <div v-if="loaded">
    <div v-for="e in idea.ee" :key="e.id" order>
      <select id="language" name="language" v-model="e.language">
        <option v-for="language in languages" :key="language.id" :value="language">
          {{ language.name }}
        </option>
      </select>
      <input type="text" v-model="e.text"/>
    </div>
    <input type="button" @click="$emit('addRows', 5, this.idea.ee.length)" value="More rows">
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';

export default defineComponent({
	name: 'IdeaForm',
	props: {
		title: String,
		// TODO: This needs to be strictly Idea but right now it doesn't work
		// Maybe when we use the Composition API which has first-class TS support
		idea: Object,
	},
	data() {
		return {
			languages: getEmptyLanguagesNoAsync(),
			noLanguages: false,
			loaded: false,
		};
	},
	async created() {
		this.languages = await Api.getLanguages();
		this.loaded = true;
	},
	emits: ['addRows'],
});
</script>
