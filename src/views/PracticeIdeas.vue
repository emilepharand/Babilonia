<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="noIdeas">
      <NotEnoughData noIdea />
    </div>
    <div v-else>
        <table>
          <tr v-for="(e, i) in idea.ee" :key="e.id">
            <tbody>
            <td>{{ e.language.name }}</td>
            <td>
              <input v-if="e.language.isPractice" type="text"
                     v-model="e.text" disabled/>
              <input v-else type="text"
                     v-model="typed[i]"
                     :disabled="done[i]"
                     :class="{'partial-match': isPartialMatch(i, e.text),
                     'full-match': done[i],
                     'no-match': isNoMatch(i, e.text),
                     }"/>
            </td>
            <td><input type="button" value="Hint" @click="hint(i, e.text)"></td>
            </tbody>
          </tr>
        </table>
        <div>
          <button @click="next()">Next</button>
          <button @click="submit()">Submit</button>
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

export default defineComponent({
	name: 'PracticeIdeas',
	components: {NotEnoughData},
	data() {
		return {
			idea: getEmptyIdeaNoAsync(),
			typed: [''],
			done: [false],
			noIdeas: false,
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
					return 1;
				}
				if (e1.language.isPractice && e2.language.isPractice) {
					return 0;
				}
				return -1;
			});
		},
		isPartialMatch(i: number, txt: string) {
			const typedWord = this.typed[i];
			const textToMatch = txt;
			const firstLettersMatch = this.checkFirstLettersMatch(textToMatch, typedWord);
			if (firstLettersMatch) {
				if (typedWord.length > 0 && typedWord.length === textToMatch.length) {
					this.done[i] = true;
					return false;
				}
				return true;
			}
			return false;
		},
		isNoMatch(i: number, txt: string) {
			return !this.checkFirstLettersMatch(txt, this.typed[i]);
		},
		checkFirstLettersMatch(textToMatch:string, typedWord: string) {
			if (typedWord as unknown === undefined) {
				return false;
			}
			let i = 0;
			while (i < typedWord.length) {
				if (textToMatch.charAt(i) === typedWord.charAt(i)) {
					i += 1;
				} else {
					return false;
				}
			}
			return true;
		},
		hint(rowNbr: number, txt: string) {
			if (this.typed[rowNbr] as unknown === undefined) {
				this.typed[rowNbr] = txt[0];
				this.done[rowNbr] = false;
			} else {
				let j = 0;
				while (j < this.typed[rowNbr].length && txt.charAt(j) === this.typed[rowNbr].charAt(j)) {
					j += 1;
				}
				if (j > 0) {
					if (txt[j + 1] === ' ') {
						this.typed[rowNbr] = txt.substring(0, j + 2);
					} else {
						this.typed[rowNbr] = txt.substring(0, j + 1);
					}
				} else {
					this.typed[rowNbr] = txt.substring(0, 1);
				}
			}
		},
		async next() {
			this.idea = await Api.getNextIdea();
			this.typed = [];
			this.done = [];
		},
		submit() {
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

.partial-match {
  color: darkgreen;
}

.full-match {
  background: darkgreen;
  color: #fff;
  font-weight: bold;
}

.no-match {
  color: darkred;
}
</style>

