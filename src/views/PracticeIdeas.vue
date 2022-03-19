<template>
  <div class="practice">
    <h1>Practice</h1>
    <p v-if="noIdeas">No ideas have been found.</p>
    <div v-else>
        <table>
          <tr v-for="(e, i) in idea.ee" :key="e.id">
            <tbody v-if="e.language.isPractice">
            <td>{{ e.language.name }}</td>
            <td>
              <input v-if="i === 0" type="text"
                     v-model="e.texts[0]" disabled/>
              <input v-else type="text"
                     v-model="typed[i]"
                     :class="{'partial-match': isPartialMatch(i, e.texts),
                     'full-match': isFullMatch(i, e.texts),
                     'no-match': isNoMatch(i, e.texts),
                     }"/>
            </td>
            <td><input type="button" value="Hint" @click="hint(i, e.texts[0])"></td>
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
import {getEmptyIdea} from '../../server/model/ideas/idea';

export default defineComponent({
	name: 'PracticeIdeas',
	data() {
		return {
			idea: getEmptyIdea(),
			typed: [''],
			done: [false],
			noIdeas: false,
		};
	},
	async created() {
		try {
			this.idea = await Api.getNextIdea();
		} catch {
			this.noIdeas = true;
		}
	},
	methods: {
		isPartialMatch(i: number, txt: string[]) {
			if (this.done[i]) {
				txt[0].trim();
				return false;
			}
			return this.typed[i];
		},
		isNoMatch(i: number, txt: string[]) {
			if (this.done[i]) {
				txt[0].trim();
				return false;
			}
			return this.typed[i];
		},
		isFullMatch(i: number, txt: string[]) {
			if (this.done[i]) {
				return true;
			}
			const ret = this.typed[i];
			if (ret) {
				this.done[i] = true;

				this.typed[i] = txt.join(' | ');
			}
			return ret;
		},
		hint(rowNbr: number, txt: string) {
			if (this.typed[rowNbr] === undefined) {
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

