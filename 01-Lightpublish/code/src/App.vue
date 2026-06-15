<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>

* {
  overflow-x: hidden;
  overflow-y: auto;   
}

html, body {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden; 
  overflow-y: auto; 
  position: relative;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

</style>
