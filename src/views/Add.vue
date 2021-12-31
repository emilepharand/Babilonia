<template>
  <div class="browse">
    <h1>Add Idea</h1>
    <form>
      <div v-for="row in rows" :key="row.id">
        <select id="language" name="language" v-model="row.lang">
          <option v-for="language in languages" :key="language.name" :value="language.name">
            {{ language.name }}
          </option>
        </select>
        <input type="text" v-model="row.expr"/>
      </div>
    </form>
    <button @click="add()">Add</button>
  </div>
</template>

<script>
export default {
  name: 'Add',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      rows: [],
      languages: [],
    };
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async created() {
    const rows = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const i of [...Array(5).keys()]) {
      rows.push({
        id: i,
        lang: 'Français',
        expr: '',
      });
    }
    this.rows = rows;
    const res = await fetch('http://localhost:5000/api/languages');
    this.languages = await res.json();
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async add() {
      alert(JSON.stringify(this.rows));
    },
  },
};
</script>
