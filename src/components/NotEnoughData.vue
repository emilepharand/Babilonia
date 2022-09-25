<template>
  <div>
    <p v-if="noIdea">
      No ideas have been found.
    </p>
    <p v-if="noPracticeableIdea">
      No practiceable ideas have been found.
    </p>
    <p v-if="noLanguage">
      No language has been found.
    </p>
  </div>
</template>

<script lang="ts" setup>
defineProps({
	noLanguage: Boolean,
	noIdea: Boolean,
	noPracticeableIdea: Boolean,
});
</script>
