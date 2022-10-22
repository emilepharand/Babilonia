<template>
  <div class="view">
    <h1>Add Idea</h1>
    <div v-if="noLanguages">
      <NotEnoughData no-language />
    </div>
    <div v-else>
      <IdeaForm
        :idea="idea"
        title="Add Idea"
      />
      <div class="d-flex btn-group mt-2">
        <button
          id="add-rows"
          class="btn btn-outline-secondary flex-grow-1"
          @click="addRows()"
        >
          More Rows
        </button>
        <button
          id="save-idea"
          class="btn btn-outline-secondary flex-grow-1"
          @click="save()"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// In a separate file because of #66
import {addRows, idea, noLanguages, save} from '@/views/AddIdea';
import IdeaForm from '@/components/IdeaForm.vue';
import NotEnoughData from '@/components/NotEnoughData.vue'; </script>
