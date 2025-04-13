<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-transition" v-if="false">
      <q-toolbar>
        <q-toolbar-title>D-Pastillero</q-toolbar-title>
        <q-btn :icon="isDark ? 'dark_mode' : 'light_mode'" flat round @click="toggleDarkMode"
          :color="isDark ? 'yellow' : 'white'" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useDarkMode } from '../composables/useDarkMode';

const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style>
.header-transition {
  transition: transform 0.3s;
}
</style>
