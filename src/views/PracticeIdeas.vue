<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
        <div>
          <div v-for="e in idea.ee" :key="e.id">
            <PracticeRow :expression="e"/>
          </div>
        </div>
        <div class="d-flex">
          <button class="btn btn-sm btn-primary flex-grow-1" @click="next()">Next</button>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Api from '@/ts/api';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import NotEnoughData from '@/components/NotEnoughData.vue';
import {Expression} from '../../server/model/ideas/expression';
import PracticeRow from '@/components/practice/PracticeRow.vue';

export default defineComponent({
	name: 'PracticeIdeas',
	components: {NotEnoughData, PracticeRow},
	data() {
		return {
			idea: getEmptyIdeaNoAsync(),
			noIdeas: false,
			typed: '',
		};
	},
	async created() {
		try {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
		} catch {
			this.noIdeas = true;
		}
	},
	methods: {
		// Reorders expressions to put expressions to practice first
		reorderExpressions(ee: Expression[]): Expression[] {
			return ee.sort((e1, e2) => {
				if (e1.language.isPractice && !e2.language.isPractice) {
					return -1;
				}
				if (e1.language.isPractice && e2.language.isPractice) {
					return 0;
				}
				return 1;
			});
		},
		async next() {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
		},
		keyPressed(txt: string, s: string) {
			txt.trim();
			s.trim();
		},
	},
});
</script>

<style scoped>
table {
  display: inline-block;
  text-align: left;
}
</style>
