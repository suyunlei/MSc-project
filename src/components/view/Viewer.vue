<template>
  <div id="cesiumContainer">
    <Layer />
    <Attribute />
  </div>
</template>

<script>
import Layer from "../layerTree/Layer.vue";
import Attribute from "../layerTree/Attribute.vue";
import Bus from "@tools/Bus";
import object from "../mixin/object";
export default {
  name: "Viewer",
  mixins: [object],
  components: {
    Layer,
    Bus,
    Attribute,
  },
  data() {
    return {
      viewer: "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      // init the cesium viewer
      this.init();
      // add the animation to the buildings
      this.addAnimation();
    });
  },
  methods: {
    /**
     * init the map
     */
    init() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MGNiNDIzYy1hYzNjLTRmYzItOTk4ZS0wZjJjYzhjMDAwMTAiLCJpZCI6NzE0ODYsImlhdCI6MTYzNTIzNzg3Mn0.i0iTqEVPssK9EGZWU5_wdYSN_1ZObmwsu00Y29b6N0A";
      const viewer = new Cesium.Viewer("cesiumContainer", {
        shouldAnimate: true, // open animation
        animation: false,
        shadows: true,
        timeline: false,
        imageryProvider: new Cesium.OpenStreetMapImageryProvider({
          url: "https://a.tile.openstreetmap.org/",
        }),
        // terrainProvider: Cesium.createWorldTerrain(),
      });
      // HDR rendering
      viewer.scene.highDynamicRange = true;

      // add the cesium viewer to the window
      window.viewer = viewer;
      // init the treeData
      window.treeData = [];
    },
  },
};
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  font-family: "Microsoft YaHei";
}
</style>
