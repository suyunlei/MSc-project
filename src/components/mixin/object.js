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
    async processPart(part) {
      let vehicleEntity = await Cesium.IonResource.fromAssetId(1598324);
      const czmlPath = [
        {
          id: "document",
          name: "CZML Path",
          version: "1.0",
        },
        {
          id: "Vehicle",
          availability:
            "2012-08-04T16:00:00Z/2012-08-04T17:04:54.9962195740191Z",
          label: {
            fillColor: [
              {
                interval: "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
                rgba: [255, 255, 0, 255],
              },
            ],
            font: "bold 10pt Segoe UI Semibold",
            horizontalOrigin: "CENTER",
            outlineColor: {
              rgba: [0, 0, 0, 255],
            },
            pixelOffset: {
              cartesian2: [0.0, 20.0],
            },
            scale: 1.0,
            show: [
              {
                interval: "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
                boolean: true,
              },
            ],
            style: "FILL",
            text: "Test Vehicle",
            verticalOrigin: "CENTER",
          },
          model: {
            uri: vehicleEntity,
            minimumPixelSize: 100,
            maximumScale: 50,
          },
          orientation: {
            velocityReference: "#position",
          },
          viewFrom: {
            cartesian: [-2080, -1715, 779],
          },
          properties: {
            fuel_remaining: {
              epoch: "2012-08-04T16:00:00Z",
              number: [0, 22.5, 1000, 21.2],
            },
          },
          path: {
            material: {
              solidColor: {
                color: {
                  interval: "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
                  rgba: [255, 255, 0, 255],
                },
              },
            },
            width: [
              {
                interval: "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
                number: 5.0,
              },
            ],
            show: [
              {
                interval: "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
                boolean: true,
              },
            ],
          },
          position: {
            interpolationAlgorithm: "LAGRANGE",
            interpolationDegree: 1,
            epoch: "2012-08-04T16:00:00Z",
            cartographicDegrees: [
              0, 103.77601, 1.29735, 100, 1000.0, 103.77071, 1.291, 200,
            ],
          },
        },
      ];
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
