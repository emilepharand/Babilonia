<template>
  <div class="view">
    <h1>Dashboard</h1>
    <div v-if="noIdeas">
      <NotEnoughData no-idea />
    </div>
    <div v-else>
      <div
        v-for="(ideaPerLanguage) in ideasPerLanguage"
        :key="ideaPerLanguage.language.id"
      >
        <p class="dashboard-row">
          You can express
          <strong>{{ ideaPerLanguage.count }}</strong>
          ideas in
          <strong>{{ ideaPerLanguage.language.name }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import * as Api from '../ts/api';
import {getEmptyNumberIdeasInLanguage} from '../../server/stats/statsCounter';
import NotEnoughData from '../components/NotEnoughData.vue';

const ideasPerLanguage = ref(getEmptyNumberIdeasInLanguage());
const noIdeas = ref(false);

(async () => {
	ideasPerLanguage.value = await Api.getStats();
	noIdeas.value = ideasPerLanguage.value.length === 0;
})();

</script>
