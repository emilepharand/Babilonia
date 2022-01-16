<template>
  <div>
    <h1>Languages</h1>
    <table>
      <tr>
      <th>Name</th>
      <th>Order</th>
      <th>Practice</th>
      </tr>
      <tr v-for="lang in languages" :key="lang.id">
        <td><input type="text" v-model="lang.name"/></td>
        <td><input type="number" v-model="lang.ordering"></td>
        <td><input type="checkbox" v-model="lang.isPractice" false-value="0" true-value="1"></td>
      </tr>
    </table>
    <a href="#" @click="change()">Change</a>
    <h2>Add a new language</h2>
    <div>
      <input type="text" v-model="newLanguage.name"/>
      <input type="number" v-model="newLanguage.ordering">
      <input type="checkbox" v-model="newLanguage.isPractice">
      <div>
        <a href="#" @click="addNewLanguage()">Add</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Api from '@/ts/api';
import Language from '../../server/model/language';

export default defineComponent({
  name: 'Languages',
  components: {},
  data() {
    return {
      languages: [],
      newLanguage: {
        id: -1,
        name: '',
        ordering: 5,
        isPractice: true,
      },
    };
  },
  methods: {
    change() {
      this.languages.forEach(
        // eslint-disable-next-line no-return-await
        async (lang) => await Api.editLanguage(lang),
      );
      alert(JSON.stringify(this.languages));
    },
    async addNewLanguage() {
      const r = await Api.addLanguage(this.newLanguage);
      alert(JSON.stringify(r));
    },
  },
  async created() {
    const res = await fetch('http://localhost:5000/api/languages');
    this.languages = await res.json();
  },
});
</script>
