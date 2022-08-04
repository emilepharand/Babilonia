<template>
  <div id="ideas" v-if="loaded">
    <div class="expression" style="width: 800px;" v-for="e in idea.ee" :key="e.id">
      <div class="input-group">
        <select class="expression-language form-select" name="language" v-model="e.language">
          <option v-for="language in languages" :key="language.id" :value="language">
            {{ language.name }}
          </option>
        </select>
      <input class="expression-text form-control" style="flex-grow:2" type="text" v-model="e.text"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import Api from '@/ts/api';

defineProps({
	title: String,
	idea: Object,
});

defineEmits(['addRows', 'delete']);

const languages = ref(getEmptyLanguagesNoAsync());
const loaded = ref(false);

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
})();
</script>
