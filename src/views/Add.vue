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
import Idea from '../../server/model/idea';
import Config from '@/ts/config';
import Utils from '@/ts/utils';

export default defineComponent({
  name: 'Add',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: new Idea(101, []),
    };
  },
  async created() {
    this.idea = await Config.getAddIdeaTemplate();
  },
  methods: {
    async add() {
      const r = await Api.addIdea(this.idea);
      alert(JSON.stringify(r));
    },
    addRows(howMany: number, currentSize: number) {
      this.idea = Utils.addEmptyExpressions(this.idea, howMany, currentSize);
    },
  },
});
</script>
