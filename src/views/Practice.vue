<template>
  <div class="practice">
    <h1>Practice</h1>
    <table>
      <tr v-for="(e, i) in idea.ee" :key="e.id">
        <tbody v-if="e.language.isPractice">
        <td>{{ e.language.name }}</td>
        <td>
          <input v-if="i === 0" type="text"
                 v-model="e.texts[0]" disabled/>
          <input v-else type="text"
                 v-model="typed[i]"
                 :class="{'partial-match': isPartialMatch(i, e.texts[0]),
                 'full-match': isFullMatch(i, e.texts[0]),
                 'no-match': isNoMatch(i, e.texts[0]),
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Api from '@/ts/api';
import Idea from '../../server/model/idea';
import Utils, { TEXT_STATUS } from '@/ts/utils';

export default defineComponent({
  name: 'Practice',
  data() {
    return {
      idea: new Idea(1, []),
      typed: [''],
    };
  },
  async created() {
    this.idea = await Api.getNextIdea();
  },
  methods: {
    isPartialMatch(i: number, txt: string) {
      return this.typed[i] !== undefined
        && (Utils.checkText(this.typed[i], txt) === TEXT_STATUS.PARTIAL_MATCH);
    },
    isNoMatch(i: number, txt: string) {
      return this.typed[i] !== undefined
        && (Utils.checkText(this.typed[i], txt) === TEXT_STATUS.NO_MATCH);
    },
    isFullMatch(i: number, txt: string) {
      return this.typed[i] !== undefined
        && (Utils.checkText(this.typed[i], txt) === TEXT_STATUS.FULL_MATCH);
    },
    hint(rowNbr: number, txt: string) {
      if (this.typed[rowNbr] === undefined) {
        // eslint-disable-next-line prefer-destructuring
        this.typed[rowNbr] = txt[0];
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
    },
    submit() {
      alert(this.typed[0]);
    },
    keyPressed(txt: string, s: string) {
      alert(txt);
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
