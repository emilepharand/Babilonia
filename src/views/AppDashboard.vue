<template>
  <div class="view">
    <h1>Dashboard</h1>
    <div v-if="noIdeas">
      <NotEnoughData no-idea />
    </div>
    <div v-else>
      <h2 class="pb-2">
        Your progress
      </h2>
      <div class="d-flex gap-3 mb-4">
        <div class="card border-dark">
          <div class="card-body">
            <h3 class="card-title">
              You can express
            </h3>
            <p
              v-for="(languageStats) in allStats.allLanguageStats"
              :key="languageStats.language.id"
              class="card-text dashboard-row"
            >
              <strong>{{ languageStats.knownIdeasCount }}</strong>/{{ languageStats.totalIdeasCount }}
              ideas in <strong>{{ languageStats.language.name }}</strong>
              (<strong>{{ getPercentage(languageStats.knownIdeasCount, languageStats.totalIdeasCount) }}</strong>%)
            </p>
            <p>
              Total: <strong>{{ allStats.globalStats.totalKnownIdeas }}</strong>/{{ allStats.globalStats.totalIdeasCount }}
              ideas (<strong>{{ getPercentage(allStats.globalStats.totalKnownIdeas, allStats.globalStats.totalIdeasCount) }}</strong>%)
            </p>
          </div>
        </div>
        <div class="card border-dark">
          <div class="card-body">
            <h3 class="card-title">
              You know
            </h3>
            <p
              v-for="(languageStats) in allStats.allLanguageStats"
              :key="languageStats.language.id"
              class="card-text"
            >
              <strong>{{ languageStats.knownExpressionsCount }}</strong>/{{ languageStats.totalExpressionsCount }}
              expressions in <strong>{{ languageStats.language.name }}</strong>
              (<strong>{{ getPercentage(languageStats.knownExpressionsCount, languageStats.totalExpressionsCount) }}</strong>%)
            </p>
            <p>
              Total: <strong>{{ allStats.globalStats.totalKnownExpressions }}</strong>/{{ allStats.globalStats.totalExpressionsCount }}
              expressions (<strong>{{ getPercentage(allStats.globalStats.totalKnownExpressions, allStats.globalStats.totalExpressionsCount) }}</strong>%)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import * as Api from '../ts/api';
import {getEmptyAllStats} from '../../server/stats/statsCounter';
import NotEnoughData from '../components/NotEnoughData.vue';

const allStats = ref(getEmptyAllStats());
const noIdeas = ref(false);

function getPercentage(numerator: number, denominator: number) {
	if (denominator === 0) {
		return 0;
	}
	return Math.round((numerator / denominator) * 100);
}

(async () => {
	allStats.value = await Api.getStats();
	noIdeas.value = allStats.value.globalStats.totalIdeasCount === 0;
})();

</script>
