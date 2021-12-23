<template>
  <div class="about">
    <h1>{{ here }}</h1>
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async created() {
    const res = await fetch('http://localhost:5000/api/idea');
    this.here = await res.json();
  },
};
</script>
