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
export default {
  name: "Viewer",
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
      this.init();
    });
  },
  methods: {
    /**
     * 初始化地图
     */
    init() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MGNiNDIzYy1hYzNjLTRmYzItOTk4ZS0wZjJjYzhjMDAwMTAiLCJpZCI6NzE0ODYsImlhdCI6MTYzNTIzNzg3Mn0.i0iTqEVPssK9EGZWU5_wdYSN_1ZObmwsu00Y29b6N0A";
      const viewer = new Cesium.Viewer("cesiumContainer", {
        shouldAnimate: true, // open animation
        animation: false,
        timeline: false,
        // terrainProvider: Cesium.createWorldTerrain(),
      });
      // 变量提升
      window.viewer = viewer;
      // window.viewer.scene.primitives.add(Cesium.createOsmBuildings());
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
