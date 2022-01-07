<template>
  <div class="browse">
    <IdeaForm :idea="idea" title="Add Idea"/>
  </div>
  <button @click="add()">Add</button>
</template>

<script>
import IdeaForm from '@/components/IdeaForm/IdeaForm.vue';

export default {
  name: 'Add',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: {},
    };
  },
  async created() {
    const idea = {};
    idea.ee = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const i of [...Array(5)
      .keys()]) {
      idea.ee.push({
        id: i,
        language: {
          id: 1,
          name: 'Français',
          order: 0,
        },
        text: '',
      });
    }
    this.idea = idea;
  },
  methods: {
    async add() {
      const ee = this.idea.ee.filter((e) => e.text !== '');
      if (ee.length === 0) return;
      const url = 'http://localhost:5000/api/idea/add';
      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ee),
      });
      const r = await response.json();
      alert(JSON.stringify(r));
    },
  },
};
</script>
