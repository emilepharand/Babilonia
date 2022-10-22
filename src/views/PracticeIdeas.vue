<template>
  <div class="view practice">
    <h1>Practice</h1>
    <div v-if="script.noIdeas.value">
      <NotEnoughData no-practiceable-idea />
    </div>
    <div v-else>
      <div id="practice-table">
        <div
          v-for="(e, i) in script.idea.value.ee"
          :key="e.id"
          class="pb-2"
        >
          <PracticeRow
            :start-interactive="script.startInteractive.value"
            :is-focused="script.isFocusedRow(i)"
            :row-order="i"
            :reset="script.resetAll.value"
            :expression="e"
            @focus-previous="script.focusPreviousRow"
            @focus-next="script.focusNextRow"
            @skip-focus="script.skipFocus"
            @focused-row="script.focusRow"
            @full-matched="script.rowFullyMatched"
          />
        </div>
      </div>
      <hr>
      <div class="d-flex btn-group">
        <button
          class="btn btn-outline-secondary flex-grow-1 reset-button"
          @click="script.resetRows()"
        >
          Reset
        </button>
        <button
          id="nextIdeaButton"
          :class="script.nextButtonClass.value"
          @click="script.nextIdea()"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// In a separate file because of #66
import NotEnoughData from '@/components/NotEnoughData.vue';
import PracticeRow from '@/components/practice/PracticeRow.vue';
import * as script from '@/views/PracticeIdeas'; </script>

<style scoped>
table {
  display: inline-block;
  text-align: left;
}
</style>
