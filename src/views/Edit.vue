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
      idea: [],
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
    this.idea = (await response.json()).expressions;
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async edit() {
      const ee = {};
      ee.expressions = this.rows;
      ee.expressions = ee.expressions.filter((e) => e.text !== '');
      // alert(JSON.stringify(this.rows));
      fetch('http://localhost:5000/api/idea/add', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ee),
      })
        .then((response) => {
          // alert(response.then().json());
        });
    },
  },
};
</script>
