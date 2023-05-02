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
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${height} >= 20", 'color("ORANGERED")'],
            ["${height} >= 10", 'color("DARKORANGE")'],
            ["true", 'color("blue")'],
          ],
        },
        show: "${height} > 0",
        meta: {
          description: '"Building id ${id} has height ${height}."',
        },
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
        label: "NUS Building Model",
        disabled: true,
      });
      Bus.$emit("updateTreeData", window.treeData);
    },
    // add a CZML
    addCZML() {
      // force the user to select a file
      if (!window.czmlPath) {
        this.$message({
          message: "Please select a Thermal Comfort file first!",
          showClose: true,
          duration: 2000,
        });
      }
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
      window.viewer.clock.multiplier = 0.1;

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
      // window.viewer.clock.onTick.addEventListener(function (clock) {
      //   if (window.czmlPath && window.checked_name) {
      //     const properties = window.czmlPath[1].properties;
      //     const name = window.checked_name;
      //     // get the start time of the CZML
      //     let startTime = Cesium.JulianDate.fromIso8601(properties.epoch);
      //     let interval = Cesium.JulianDate.secondsDifference(
      //       clock.currentTime,
      //       startTime
      //     );
      //     // get the attribute value according to the time interval
      //     for (let i = 0; i < properties[name].number.length; i++) {
      //       if (properties[name].number.indexOf(parseInt(interval)) !== -1) {
      //         let timeIndex = properties[name].number.indexOf(
      //           parseInt(interval)
      //         );
      //         // value is followed by the time interval in the CZML
      //         let value = properties[name].number[timeIndex + 1];
      //         window.thermal_value = value;
      //         // let the attribute table change
      //         Bus.$emit("change");
      //       }
      //     }
      //   }
      // });
    },
    processPart(part) {
      part.requested = true;
      window.CZMLDataSource.process(window.czmlPath).then(function () {
        console.log(window.czmlPath);
        part.loaded = true;
        // Follow the vehicle with the camera. something to fix
        if (!window.viewer.trackedEntity) {
          window.viewer.trackedEntity =
            window.CZMLDataSource.entities.getById("Person");
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
    // add animations to the building model
    addAnimation() {
      const handler = new Cesium.ScreenSpaceEventHandler(
        window.viewer.scene.canvas
      );

      let enablePicking = true;

      const highlighted = {
        feature: undefined,
        originalColor: new Cesium.Color(),
      };

      const selected = {
        feature: undefined,
        originalColor: new Cesium.Color(),
      };

      // mouse move on animation
      handler.setInputAction((movement) => {
        if (enablePicking) {
          // If a feature was previously highlighted, undo the highlight
          if (Cesium.defined(highlighted.feature)) {
            highlighted.feature.color = highlighted.originalColor;
            highlighted.feature = undefined;
          }

          const feature = window.viewer.scene.pick(movement.endPosition);
          const featurePicked = feature instanceof Cesium.Cesium3DTileFeature;

          const isBuildingFeature =
            featurePicked && feature.hasProperty("height");

          if (isBuildingFeature) {
            // Highlight the feature if it's not already selected.
            if (feature !== selected.feature) {
              highlighted.feature = feature;
              Cesium.Color.clone(feature.color, highlighted.originalColor);
              feature.color = Cesium.Color.MAGENTA;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // mouse click on animation
      handler.setInputAction((movement) => {
        // If a feature was previously selected, undo the highlight
        if (Cesium.defined(selected.feature)) {
          selected.feature.color = selected.originalColor;
          selected.feature = undefined;
        }

        const feature = window.viewer.scene.pick(movement.position);
        const featurePicked = feature instanceof Cesium.Cesium3DTileFeature;
        const isBuildingFeature =
          featurePicked && feature.hasProperty("height");

        if (isBuildingFeature) {
          // Select the feature if it's not already selected
          if (selected.feature === feature) {
            return;
          }
          selected.feature = feature;

          // Save the selected feature's original color
          if (feature === highlighted.feature) {
            Cesium.Color.clone(
              highlighted.originalColor,
              selected.originalColor
            );
            highlighted.feature = undefined;
          } else {
            Cesium.Color.clone(feature.color, selected.originalColor);
          }
          feature.color = Cesium.Color.LIME;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
};
