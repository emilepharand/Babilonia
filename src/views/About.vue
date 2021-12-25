<template>
  <div class="about">
    <h1>Idea</h1>
    <div v-for="e in here.expressions" v-bind:key="e.expression">
    <b>{{ e.language.name }}</b>: {{ e.expression }}
    </div>
    <button @click="nextIdea()">Next</button>
    <h1>Debug</h1>
    <p>{{ here }}</p>
  </div>
</template>

<script>
export default {
  name: 'About',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      here: null,
    };
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async nextIdea() {
      const res = await fetch('http://localhost:5000/api/ideas');
      this.here = await res.json();
    },
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async created() {
    const res = await fetch('http://localhost:5000/api/ideas');
    this.here = await res.json();
  },
};
</script>
