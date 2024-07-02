<template>

  <router-view />

</template>

<style scoped>
html,
body {
  border: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  position: relative;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
