<template>
  <div>
    <h1>Edit Idea</h1>
    <IdeaForm @addRows="addRows" :idea="idea" title="Edit Idea"/>
    <button @click="edit()">Edit</button>
    <button @click="deleteIdea()">Delete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/ts/api';
import { emptyIdea } from '../../server/model/idea';
import Utils from '@/ts/utils';

export default defineComponent({
  name: 'Edit',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: emptyIdea(),
    };
  },
  async created() {
    const ideaId = Number.parseInt(Array.from(this.$route.params.id)
      .join(''), 10);
    this.idea = await Api.getIdea(ideaId);
  },
  expose: ['addRows'],
  methods: {
    async edit() {
      const r = await Api.editIdea(this.idea);
      alert(JSON.stringify(r));
    },
    async deleteIdea() {
      const r = await Api.deleteIdea(this.idea.id);
      alert(JSON.stringify(r));
    },
    addRows(howMany: number, currentSize: number) {
      this.idea = Utils.addEmptyExpressions(this.idea, howMany, currentSize);
    },
  },
});
</script>
