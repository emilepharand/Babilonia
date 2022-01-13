<template>
  <div class="practice">
    <h1>Practice</h1>
    <table>
      <tr v-for="(e, i) in idea.ee" :key="e.id">
        <td>{{ e.language.name }}</td>
        <td>
          <input v-if="i === 0" type="text"
                 v-model="e.text" disabled/>
          <input v-else type="text"
                 v-model="typed[i]"
                 :class="{'partial-match': isPartialMatch(i, e.text),
                 'full-match': isFullMatch(i, e.text),
                 'no-match': isNoMatch(i, e.text),
                 }"/>
        </td>
      </tr>
    </table>
    <div>
      <button @click="next()">Next</button>
      <button @click="submit()">Submit</button>
    </div>
  </div>
</template>

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
  color:#fff;
  font-weight: bold;
}

.no-match {
  color: darkred;
}
</style>

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
      typed: [],
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
    async next() {
      this.idea = await Api.getNextIdea();
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
