<template>
  <div style="display:flex;flex-direction: column">
    <router-link to="/manage/ideas/add">Add Ideas</router-link>
    <router-link to="/manage/ideas/search">SearchHandler Ideas</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Ideas',
  components: {},
  data() {
    return {};
  },
  methods: {},
});
</script>
