<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
        <div>
          <div v-for="(e, i) in idea.ee" :key="e.id" class="pb-2">
            <PracticeRow :startInteractive="startInteractive"
                         :isFocused="isFocused(i)" :rowOrder="i" @fullMatched="fullMatchedRow"
                         :expression="e"/>
          </div>
        </div>
        <hr>
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
			startInteractive: false,
		};
	},
	async mounted() {
		try {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
			this.fullMatchedRows = 0;
			this.currentlyFocusedRow = 0;
			this.startInteractive = true;
			this.nbrRowsToMatch = this.idea.ee.filter(e => e.language.isPractice).length;
		} catch {
			this.noIdeas = true;
		}
	},
	computed: {
		nextButtonClass() {
			if (this.startInteractive && this.fullMatchedRows === this.nbrRowsToMatch) {
				return 'btn btn-success flex-grow-1';
			}
			return 'btn btn-outline-secondary flex-grow-1';
		},
	},
	methods: {
		isFocused(rowNumber: number) {
			return rowNumber === this.currentlyFocusedRow;
		},
		fullMatchedRow(rowOrder: number, newMatch: boolean) {
			if (newMatch) {
				this.fullMatchedRows++;
			}
			if (this.idea.ee.length === rowOrder + 1) {
				if (this.fullMatchedRows === this.nbrRowsToMatch) {
					this.currentlyFocusedRow = -1;
					(this.$refs.nextButton as any).focus();
				} else {
					this.currentlyFocusedRow = 0;
				}
			} else {
				this.currentlyFocusedRow = rowOrder + 1;
			}
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
			this.fullMatchedRows = 0;
			this.currentlyFocusedRow = 0;
			this.nbrRowsToMatch = this.idea.ee.filter(e => e.language.isPractice).length;
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
