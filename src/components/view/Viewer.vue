<template>
  <div id="cesiumContainer"></div>
</template>

<script>
export default {
  name: "Viewer",
  data() {
    return {
      viewer: "",
      tileset: "",
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
        terrainProvider: Cesium.createWorldTerrain(),
      });
      // 变量提升
      window.viewer = viewer;
    },
  },
};
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
