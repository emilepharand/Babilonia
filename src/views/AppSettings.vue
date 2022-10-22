<template>
  <div class="view">
    <h1>Settings</h1>
    <h2>Practicing</h2>
    <div class="form-check">
      <input
        id="randomPractice"
        v-model="settings.randomPractice"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="randomPractice"
      >
        Loop ideas randomly
      </label>
      <i
        title="Draw ideas randomly instead of sequentially."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <div class="form-check">
      <input
        id="strictCharacters"
        v-model="settings.strictCharacters"
        class="form-check-input"
        type="checkbox"
      >
      <label
        class="form-check-label"
        for="strictCharacters"
      >
        Disable relaxed character mode
      </label>
      <i
        title="Do not accept <i>e</i> for <i>é</i>, <i>u</i> for <i>ü</i>, and so on."
        data-bs-html="true"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        class="fa-solid fa-circle-question"
      />
    </div>
    <button
      id="saveButton"
      class="btn btn-primary w-100"
      @click="save()"
    >
      Save
    </button>
    <p
      v-if="showSettingsSavedMessage"
      id="settingsSavedText"
      class="text-success"
    >
      Settings saved.
    </p>
  </div>
</template>

<script lang="ts" setup>
// In a separate file because of #66
import {save, settings, showSettingsSavedMessage} from '@/views/AppSettings'; </script>

<style scoped>
input[type="checkbox"], label {
  cursor: pointer;
}
i {
  margin-left: 5px;
}
</style>
