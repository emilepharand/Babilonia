<template>
  <div>
    <h1>Add Idea</h1>
    <IdeaForm @addRows="addRows" :idea="idea" title="Add Idea"/>
    <button @click="add()">Add</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import { emptyIdea } from '../../server/model/idea';
import Config from '@/ts/config';
import Utils from '@/ts/utils';
import { Expression } from '../../server/model/expression';

export default defineComponent({
  name: 'Add',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: emptyIdea(),
    };
  },
  async created() {
    this.idea = await Config.getAddIdeaTemplate();
  },
  methods: {
    splitExpressionIntoTexts(e: Expression): string[] {
      return e.texts[0].split('|').map((e2) => e2.trim());
    },
    async add() {
      const eeSplit: Expression[] = [];
      this.idea.ee.forEach((e) => {
        const e2 = { ...e };
        e2.texts = this.splitExpressionIntoTexts(e);
        eeSplit.push(e2);
      });
      const r = await Api.addIdea(eeSplit);
      alert(JSON.stringify(r));
    },
    addRows(howMany: number, currentSize: number) {
      this.idea = Utils.addEmptyExpressions(this.idea, howMany, currentSize);
    },
  },
});
</script>
