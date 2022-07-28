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

<script setup>
import {ref} from 'vue';
import Api from '@/ts/api';
import {getEmptyNumberIdeasInLanguage} from '../../server/stats/stats';
import NotEnoughData from '@/components/NotEnoughData.vue';

const ideasPerLanguage = ref(getEmptyNumberIdeasInLanguage());
const error = ref('');
const noIdeas = ref(false);

(async () => {
	try {
		ideasPerLanguage.value = await Api.getStats();
		noIdeas.value = ideasPerLanguage.value.length === 0;
	} catch (e) {
		error.value = e;
	}
})();

</script>
