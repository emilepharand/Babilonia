<template>
  <div class="browse">
    <IdeaForm :idea="idea" title="Add Idea"/>
  </div>
  <button @click="add()">Add</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IdeaForm from '@/components/IdeaForm.vue';
import Api from '@/js/api';
import Idea from '../../server/model/idea';
import Config from '@/js/config';

export default defineComponent({
  name: 'Add',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: new Idea(1, []),
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
  },
});
</script>
