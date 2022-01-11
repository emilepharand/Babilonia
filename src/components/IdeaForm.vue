<template>
  <h1>{{ title }}</h1>
  <div v-for="e in idea.ee" :key="e.id">
    <select id="language" name="language" v-model="e.language">
      <option v-for="language in languages" :key="language.id" :value="language">
        {{ language.name }}
      </option>
    </select>
    <input type="text" v-model="e.text"/>
  </div>
  <input type="button" @click="addRows()" value="Add rows">
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IdeaForm',
  props: {
    title: String,
    idea: Object,
  },
  data() {
    return {
      languages: [],
    };
  },
  async created() {
    const res = await fetch('http://localhost:5000/api/languages');
    this.languages = await res.json();
  },
  methods: {
    addRows() {
      this.$emit('addRows', 5);
    },
  },
  emits: ['addRows'],
});
</script>
