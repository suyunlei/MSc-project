export default {
  methods: {
    // let the model to stick at the ground
    changeHeight(height) {
      height = Number(height);
      if (isNaN(height)) {
        return;
      }
      const cartographic = Cesium.Cartographic.fromCartesian(
        window.tileset.boundingSphere.center
      );
      const surface = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        0.0
      );
      const offset = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        height
      );
      const translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      );
      window.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    },
    // load the NUS building model
    loadNUS() {
      console.log("start load NUS model");
      const tileset = new Cesium.Cesium3DTileset({
        url: "http://localhost:9003/model/lNpPgHzM/tileset.json",
      });
      window.tileset = tileset;
      window.tileset.readyPromise.then((tileset) => {
        this.changeHeight(-120);
        window.viewer.scene.primitives.add(tileset);
        window.viewer.zoomTo(
          tileset,
          new Cesium.HeadingPitchRange(
            0.0,
            -0.5,
            tileset.boundingSphere.radius * 2.0
          )
        );
      });
    },
    // add a CZML
    addCZML() {
      // Add a blank CzmlDataSource to hold our multi-part entity/entities.
      const dataSource = new Cesium.CzmlDataSource();
      window.viewer.dataSources.add(dataSource);
      window.CZMLDataSource = dataSource;
      const partsToLoad = [
        {
          range: [0, 1000],
          requested: false,
          loaded: false,
        },
      ];
      this.processPart(partsToLoad[0]);
    },
    processPart(part) {
      let vehicleEntity;
      console.log(vehicleEntity);
      const czmlPath = require("../../assets/testpart.czml");
      part.requested = true;
      window.CZMLDataSource.process(czmlPath).then(function () {
        part.loaded = true;
        if (!window.viewer.trackedEntity) {
          window.viewer.trackedEntity = vehicleEntity =
            window.dataSource.entities.getById("Vehicle");
        }
      });
    },
  },
};
