import Bus from "@tools/Bus";

export default {
  methods: {
    // let the point cloud model to stick at the ground (no use now)
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
    // load the NUS building model (3D Tiles, not cloud point model)
    loadNUS() {
      console.log("start load NUS model");
      const tileset = new Cesium.Cesium3DTileset({
        url: "http://localhost:9003/model/aBoGDJnV/tileset.json", // Cesiumlab
      });
      window.tileset = tileset;
      window.tileset.readyPromise.then((tileset) => {
        // this.changeHeight(-120);
        window.viewer.scene.primitives.add(tileset);
        console.log(tileset);
        window.viewer.zoomTo(
          tileset,
          new Cesium.HeadingPitchRange(
            0.0,
            -0.5,
            tileset.boundingSphere.radius * 2.0
          )
        );
      });
      // add the NUS model to the treeData
      window.treeData.push({
        id: 1,
        name: "NUS Building Model",
        disabled: true,
      });
      Bus.$emit("updateTreeData", window.treeData);
    },
    // add a CZML
    addCZML() {
      Bus.$emit("updateTreeData", window.treeData);
      // set the Cesium Clock time to match the CZML data time interval
      window.viewer.clock.startTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T16:00:00Z"
      );
      window.viewer.clock.stopTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T16:30:00Z"
      );
      window.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T16:00:00Z"
      );
      window.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
      window.viewer.clock.multiplier = 1;

      // Add a blank CzmlDataSource to hold our multi-part entity/entities.
      const dataSource = new Cesium.CzmlDataSource();
      window.viewer.dataSources.add(dataSource);
      window.CZMLDataSource = dataSource;
      const partsToLoad = [
        {
          range: [0, 1200],
          requested: false,
          loaded: false,
        },
      ];
      this.processPart(partsToLoad[0]);

      // set the clock and get the attribute
      window.viewer.clock.onTick.addEventListener(function (clock) {
        if (window.czmlPath && window.checked_name) {
          const properties = window.czmlPath[1].properties;
          const name = window.checked_name;
          // get the start time of the CZML
          let startTime = Cesium.JulianDate.fromIso8601(properties.epoch);
          let interval = Cesium.JulianDate.secondsDifference(
            clock.currentTime,
            startTime
          );
          // get the attribute value according to the time interval
          for (let i = 0; i < properties[name].number.length; i++) {
            if (properties[name].number.indexOf(parseInt(interval)) !== -1) {
              let timeIndex = properties[name].number.indexOf(
                parseInt(interval)
              );
              // value is followed by the time interval in the CZML
              let value = properties[name].number[timeIndex + 1];
              window.thermal_value = value;
              // let the attribute table change
              Bus.$emit("change");
            }
          }
        }
      });
    },
    async processPart(part) {
      part.requested = true;
      window.CZMLDataSource.process(window.czmlPath).then(function () {
        console.log(window.czmlPath);
        part.loaded = true;
        if (!window.viewer.trackedEntity) {
          window.viewer.trackedEntity = vehicleEntity =
            window.dataSource.entities.getById("Vehicle");
        }
      });
    },
    // still not working
    addGeoJSON() {
      const tileset = new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(1606578),
      });
      tileset.readyPromise.then((tileset) => {
        window.viewer.scene.primitives.add(tileset);
        console.log(tileset);
      });
    },
  },
};
