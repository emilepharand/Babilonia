<template>
  <div class="view">
    <h1>Dashboard</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
      <div v-for="(ideaPerLanguage) in ideasPerLanguage" :key="ideaPerLanguage.language.id">
        <p>
          You can express
          <strong>{{ ideaPerLanguage.count }}</strong>
          ideas in
          <strong>{{ ideaPerLanguage.language.name }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {getEmptyNumberIdeasInLanguage} from '../../server/stats/stats';
import Api from '@/ts/api';
import NotEnoughData from '@/components/NotEnoughData.vue';

export default defineComponent({
	name: 'AppDashboard',
	components: {NotEnoughData},
	data() {
		return {
			ideasPerLanguage: getEmptyNumberIdeasInLanguage(),
			noIdeas: false,
		};
	},
	async created() {
		this.ideasPerLanguage = await Api.getStats();
		this.noIdeas = this.ideasPerLanguage.length === 0;
	},
});
</script>
