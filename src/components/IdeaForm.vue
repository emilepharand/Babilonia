<template>
  <div>
    <div v-for="e in idea.ee" :key="e.id">
      <select id="language" name="language" v-model="e.language">
        <option v-for="language in languages" :key="language.id" :value="language"
                false-value="0" true-value="1">
          {{ language.name }}
        </option>
      </select>
      <input type="text" v-model="e.texts[0]"/>
    </div>
    <input type="button" @click="$emit('addRows', 5, this.idea.ee.length)" value="More rows">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Idea } from '../../server/model/ideas/idea';

export default defineComponent({
  name: 'IdeaForm',
  props: {
    title: String,
    idea: Idea,
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
  emits: ['addRows'],
});
</script>
