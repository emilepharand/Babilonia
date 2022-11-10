<template>
  <div
    v-if="loaded"
    id="ideas"
  >
    <div
      v-for="e in idea.ee"
      :key="e.id"
      class="expression"
      style="width: 800px;"
    >
      <div class="input-group">
        <select
          v-model="e.language"
          class="expression-language form-select"
          name="language"
        >
          <option
            v-for="language in languages"
            :key="language.id"
            :value="language"
          >
            {{ language.name }}
          </option>
        </select>
        <input
          v-model="e.text"
          class="expression-text form-control"
          style="flex-grow:2"
          type="text"
        >
        <div
          style="cursor: pointer"
          class="p-2 d-flex align-items-center"
          @click="e.known = !e.known"
        >
          <span
            tabindex="0"
            style="cursor: pointer"
            class="form-check-label"
            @keydown.enter="e.known = !e.known"
          >
            {{ e.known ? '✅':'❌' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {getEmptyLanguagesNoAsync} from '../../server/model/languages/language';
import * as Api from '../ts/api';
import type {Idea} from '../../server/model/ideas/idea';

defineProps<{
	title: string;
	idea: Idea;
}>();

defineEmits(['addRows', 'delete']);

const languages = ref(getEmptyLanguagesNoAsync());
const loaded = ref(false);

(async () => {
	languages.value = await Api.getLanguages();
	loaded.value = true;
})();
</script>
