<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
        <div id="practice-table">
          <div v-for="(e, i) in idea.ee" :key="e.id" class="pb-2">
            <PracticeRow :startInteractive="startInteractive"
                         :isFocused="isFocused(i)"
                         :rowOrder="i"
                         :reset="resetAll"
                         @focusPrevious="focusPrevious"
                         @focusNext="focusNext"
                         @skipFocus="skipFocus"
                         @focusedRow="focusedRow"
                         @fullMatched="fullMatchedRow"
                         :expression="e"/>
          </div>
        </div>
        <hr>
        <div class="d-flex btn-group">
          <button @click="resetRows()" class="btn btn-outline-secondary flex-grow-1">Reset</button>
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
			focusDirectionDown: true,
			resetAll: false,
		};
	},
	async mounted() {
		try {
			await this.displayNextIdea();
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
		async displayNextIdea() {
			const idea = await Api.getNextIdea();
			idea.ee = this.reorderExpressions(idea.ee);
			this.idea = idea;
			this.fullMatchedRows = 0;
			this.focusDirectionDown = true;
			this.startInteractive = true;
			this.currentlyFocusedRow = 0;
			this.nbrRowsToMatch = this.idea.ee.filter(e => e.language.isPractice).length;
		},
		focusedRow(rowNumber: number) {
			this.currentlyFocusedRow = rowNumber;
		},
		focusPrevious(rowNumber: number) {
			this.focusDirectionDown = false;
			if (this.currentlyFocusedRow === 0) {
				// Loop around
				this.currentlyFocusedRow = this.idea.ee.length - 1;
			} else {
				this.currentlyFocusedRow = rowNumber - 1;
			}
		},
		focusNext(rowNumber: number) {
			this.focusDirectionDown = true;
			if (this.currentlyFocusedRow === this.idea.ee.length - 1) {
				this.currentlyFocusedRow = 0;
			} else {
				this.currentlyFocusedRow = rowNumber + 1;
			}
		},
		skipFocus() {
			if (this.focusDirectionDown) {
				this.focusNext(this.currentlyFocusedRow);
			} else {
				this.focusPrevious(this.currentlyFocusedRow);
			}
		},
		isFocused(rowNumber: number) {
			return rowNumber === this.currentlyFocusedRow;
		},
		fullMatchedRow(rowOrder: number, newMatch: boolean) {
			if (newMatch) {
				this.fullMatchedRows++;
			}
			if (this.fullMatchedRows === this.nbrRowsToMatch) {
				this.currentlyFocusedRow = -1;
				(this.$refs.nextButton as any).focus();
			} else if (this.currentlyFocusedRow === rowOrder) {
				this.focusNext(rowOrder);
			} else {
				const temp = this.currentlyFocusedRow;
				this.currentlyFocusedRow = -1;
				this.$nextTick(() => {
					// Trigger focus (because value did not change so Vue will not react)
					this.currentlyFocusedRow = temp;
				});
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
			await this.displayNextIdea();
		},
		keyPressed(txt: string, s: string) {
			txt.trim();
			s.trim();
		},
		resetRows() {
			this.fullMatchedRows = 0;
			this.resetAll = true;
			this.$nextTick(() => {
				this.resetAll = false;
			});
			this.currentlyFocusedRow = 0;
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
