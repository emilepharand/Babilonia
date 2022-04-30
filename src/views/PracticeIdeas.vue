<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
        <div>
          <div v-for="(e, i) in idea.ee" :key="e.id">
            <PracticeRow :isFocused="isFocused(i)" :rowOrder="i" @fullMatched="fullMatchedRow" :expression="e"/>
          </div>
        </div>
        <div class="d-flex">
          <button ref="nextButton" :class="nextButtonClass" @click="next()">Next</button>
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
			itemRefs: [],
			idea: getEmptyIdeaNoAsync(),
			noIdeas: false,
			currentlyFocusedRow: 0,
			fullMatchedRows: 0,
			nbrRowsToMatch: 0,
		};
	},
	async created() {
		try {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
			this.focusFirstPracticeRow();
			this.nbrRowsToMatch = this.idea.ee.filter(e => e.language.isPractice).length;
			this.fullMatchedRows = 0;
		} catch {
			this.noIdeas = true;
		}
	},
	computed: {
		nextButtonClass() {
			if (this.nbrRowsToMatch === this.fullMatchedRows) {
				return 'btn btn-sm btn-success flex-grow-1';
			}
			return 'btn btn-sm btn-dark flex-grow-1';
		},
	},
	methods: {
		isFocused(rowNumber: number) {
			console.log('isfocused');
			return rowNumber === this.currentlyFocusedRow;
		},
		fullMatchedRow(rowOrder: number) {
			this.fullMatchedRows++;
			if (this.idea.ee.length === rowOrder + 1) {
				this.currentlyFocusedRow = -1;
				(this.$refs.nextButton as any).focus();
			} else {
				this.currentlyFocusedRow = rowOrder + 1;
			}
		},
		focusFirstPracticeRow() {
			let i = 0;
			while (!this.idea.ee[i].language.isPractice) {
				i++;
			}
			this.currentlyFocusedRow = i;
		},
		// Reorders expressions to put visible expressions first
		reorderExpressions(ee: Expression[]): Expression[] {
			return ee.sort((e1, e2) => {
				if (e1.language.isPractice && !e2.language.isPractice) {
					return 1;
				}
				if (e1.language.isPractice && e2.language.isPractice) {
					return 0;
				}
				return -1;
			});
		},
		async next() {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
			this.focusFirstPracticeRow();
			this.nbrRowsToMatch = this.idea.ee.filter(e => e.language.isPractice).length;
			this.fullMatchedRows = 0;
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
