<template>
  <div class="edit">
    <IdeaForm @addRows="addRows" :idea="idea" title="Edit Idea"/>
    <button @click="edit()">Edit</button>
    <button @click="deleteIdea()">Delete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/js/api';
import Idea from '../../server/model/idea';

export default defineComponent({
  name: 'Edit',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: new Idea(1, []),
    };
  },
  async created() {
    const ideaId = Number.parseInt(Array.from(this.$route.params.id)
      .join(''), 10);
    this.idea = await Api.getIdea(ideaId);
  },
  methods: {
    async edit() {
      const r = await Api.editIdea(this.idea);
      alert(JSON.stringify(r));
    },
    async deleteIdea() {
      const r = await Api.deleteIdea(this.idea.id);
      alert(JSON.stringify(r));
    },
    addRows(n: number) {
      for (let i = 0; i < n; i += 1) {
        this.idea.ee.push({
          id: i,
          ideaId: -1,
          language: {
            id: 1,
            name: 'Français',
            ordering: 0,
          },
          text: '',
        });
      }
    },
  },
});
</script>
