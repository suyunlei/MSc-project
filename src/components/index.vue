<template>
  <div id="indexPage">
    <div class="navigationBar">
      <navigationBar />
    </div>
    <Viewer />
    <!-- <layerTree /> -->
  </div>
</template>

<script>
import navigationBar from "./navigationBar/navigationBar"
import Viewer from "./view/Viewer";
// import layerTree from "./layerTree/layerTree";
export default {
  name: "indexPage",
  components: {
    navigationBar,
    Viewer,
    // layerTree
  },
};
</script>

<style>
#indexPage{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>