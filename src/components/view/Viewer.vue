<template>
  <div id="cesiumContainer">
    <Layer />
    <Attribute />
    <Perspective />
    <finalChart />
    <Weather_Attribute />
    <cozie />
  </div>
</template>

<script>
import Layer from "../layerTree/Layer.vue";
import Attribute from "../layerTree/Attribute.vue";
import finalChart from "../layerTree/finalChart.vue";
import Weather_Attribute from "../layerTree/weatherPopup.vue";
import cozie from "../layerTree/cozie.vue";
import Bus from "@tools/Bus";
import object from "../mixin/object";
import Perspective from "../adds_on/Perspective.vue";
export default {
  name: "Viewer",
  mixins: [object],
  components: {
    Layer,
    Bus,
    Attribute,
    Perspective,
    finalChart,
    Weather_Attribute,
    cozie,
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
        // OSM baseMap
        // imageryProvider: new Cesium.OpenStreetMapImageryProvider({
        //   url: "https://a.tile.openstreetmap.org/",
        // }),

        // watercolor baseMap
        imageryProviderViewModels:
          Cesium.createDefaultImageryProviderViewModels(),
        selectedImageryProviderViewModel: new Cesium.ProviderViewModel({
          name: "Stamen Watercolor",
          iconUrl: Cesium.buildModuleUrl(
            "Widgets/Images/ImageryProviders/stamenWatercolor.png"
          ),
          tooltip: "Stamen Watercolor",
          creationFunction: function () {
            return new Cesium.UrlTemplateImageryProvider({
              url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png",
            });
          },
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
