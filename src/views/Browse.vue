<template>
  <div class="browse">
    <h1>Idea</h1>
    <button @click="nextIdea()">Next</button>
    <router-link :to="'/idea/edit/' + idea.id">Edit</router-link>
    <button @click="deleteIdea()">Delete</button>
    <div v-for="e in idea.ee" v-bind:key="e.id">
      <b>{{ e.language.name }}</b>: {{ e.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Api from '@/ts/api';
import Idea from '../../server/model/idea';

export default defineComponent({
  name: 'Browse',
  data() {
    return {
      idea: new Idea(1, []),
    };
  },
  methods: {
    async nextIdea() {
      this.idea = await Api.getNextIdea();
    },
    async deleteIdea() {
      const r = await Api.deleteIdea(this.idea.id);
      alert(JSON.stringify(r));
    },
  },
  async created() {
    this.idea = await Api.getNextIdea();
  },
});
</script>
