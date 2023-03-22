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
      const czml = [
        {
          id: "document",
          name: "CZML Geometries: Box",
          version: "1.0",
        },
        {
          id: "red box",
          name: "Red box with black outline",
          position: {
            epoch: "2012-08-04T10:00:00Z",
            cartographicDegrees: [
              0, -122.93797, 39.50935, 1776, 10, -122.93822, 39.50918, 1773, 20,
              -122.9385, 39.50883, 1772, 30,
            ],
          },
          box: {
            dimensions: {
              cartesian: [1000, 1000, 1000],
            },
            material: {
              solidColor: {
                color: {
                  rgba: [255, 0, 0, 128],
                },
              },
            },
            outline: true,
            outlineColor: {
              rgba: [0, 0, 0, 255],
            },
          },
        },
      ];
      window.viewer.dataSources
        .add(Cesium.CzmlDataSource.load(czml))
        .then(function (ds) {
          viewer.trackedEntity = ds.entities.getById("red box");
        });
    },
  },
};
