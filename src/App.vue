<template>
  <div id="app">
    <indexPage />
  </div>
</template>

<script>
import indexPage from "./components/index";
// import login from "./components/login/login page.vue";
export default {
  name: "App",
  components: {
    indexPage,
    // login,
  },
};
</script>

<style>
html,
body,
#app {
  margin: 0px;
  height: 100%;
  overflow: hidden;
  width: 100%;
}
</style>
