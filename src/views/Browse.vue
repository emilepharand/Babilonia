<template>
  <div class="browse">
    <h1>Idea</h1>
    <div v-for="e in idea.expressions" v-bind:key="e.id">
    <b>{{ e.language.name }}</b>: {{ e.text }}
    </div>
    <button @click="nextIdea()">Next</button>
    <router-link :to="'/idea/edit/' + idea.id">Edit</router-link>
  </div>
</template>

<script>
export default {
  name: 'Browse',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      idea: 'Loading...',
    };
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async nextIdea() {
      const res = await fetch('http://localhost:5000/api/ideas');
      this.idea = await res.json();
    },
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async created() {
    const res = await fetch('http://localhost:5000/api/ideas');
    this.idea = await res.json();
  },
};
</script>
