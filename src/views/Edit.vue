<template>
  <div class="edit">
    <IdeaForm :idea="idea" title="Edit Idea"/>
    <button @click="edit()">Edit</button>
  </div>
</template>

<script>
import IdeaForm from '@/components/IdeaForm/IdeaForm.vue';

export default {
  name: 'Edit',
  components: {
    IdeaForm,
  },
  data() {
    return {
      idea: {},
    };
  },
  async created() {
    const url = `http://localhost:5000/api/idea/${this.$route.params.id}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.idea = (await response.json());
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async edit() {
      const idea = {};
      idea.id = this.idea.id;
      idea.ee = this.idea.ee.filter((e) => e.text !== '');
      const url = `http://localhost:5000/api/idea/edit/${this.idea.id}`;
      const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(idea),
      });
      const r = await response.json();
      alert(JSON.stringify(r));
    },
  },
};
</script>
