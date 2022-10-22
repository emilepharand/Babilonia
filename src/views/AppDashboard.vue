<template>
  <div class="view">
    <h1>Dashboard</h1>
    <div v-if="noIdeas">
      <NotEnoughData no-idea />
    </div>
    <div v-else>
      <div
        v-for="(ideaPerLanguage) in ideasPerLanguage"
        :key="ideaPerLanguage.language.id"
      >
        <p class="dashboard-row">
          You can express
          <strong>{{ ideaPerLanguage.count }}</strong>
          ideas in
          <strong>{{ ideaPerLanguage.language.name }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// In a separate file because of #66
import {ideasPerLanguage, noIdeas} from '@/views/AppDashboard';
import NotEnoughData from '@/components/NotEnoughData.vue'; </script>
