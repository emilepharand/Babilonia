<template>
  <div>
    <h1>Languages</h1>
    <div v-for="lang in languages" :key="lang.id">
      <input type="text" v-model="lang.name"/>
      <input type="checkbox" v-model="lang.isPractice" false-value="0" true-value="1">
    </div>
    <a href="#" @click="change()">Change</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Languages',
  components: {},
  data() {
    return {
      languages: [],
    };
  },
  methods: {
    change() {
      alert(JSON.stringify(this.languages));
    },
  },
  async created() {
    const res = await fetch('http://localhost:5000/api/languages');
    this.languages = await res.json();
  },
});
</script>
