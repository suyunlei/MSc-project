import Bus from "@tools/Bus";
import axios from "axios";

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
    /**
     * load the NUS model
     * @returns {void}
     */
    loadNUS() {
      console.log("start load NUS model");
      const tileset = new Cesium.Cesium3DTileset({
        url: "http://localhost:9003/model/aBoGDJnV/tileset.json", // Cesiumlab
      });
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            // ["${height} >= 20", 'color("ORANGERED")'],
            // ["${height} >= 10", 'color("DARKORANGE")'],
            // ["true", 'color("white")'],
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
    /**
     * load the thermal comfort data (CZML file)
     */
    addCZML() {
      // force the user to select a file
      if (!window.czmlPath) {
        this.$message({
          message: "Please select a Thermal Comfort file first!",
          showClose: true,
          duration: 2000,
        });
      }

      window.viewer.clock.startTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T10:00:00Z"
      ); // set the Cesium Clock time to match the CZML data time interval

      window.viewer.clock.stopTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T12:15:40Z"
      );

      window.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
        "2012-08-04T10:00:00Z"
      );

      window.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // Stop at the end
      // window.viewer.clock.multiplier = 0.1;

      const dataSource = new Cesium.CzmlDataSource(); // Add a blank CzmlDataSource to hold our multi-part entity/entities.
      window.viewer.dataSources.add(dataSource);
      window.CZMLDataSource = dataSource;

      const partsToLoad = [
        {
          // range: [0, 1200],
          requested: false,
          loaded: false,
        },
      ];
      this.processPart(partsToLoad[0]); // process the first part
    },
    /**
     * process the CZML file
     * @param {Object} part - the CZML file
     */
    processPart(part) {
      part.requested = true;
      window.CZMLDataSource.process(window.czmlPath).then(function (ds) {
        part.loaded = true; // mark this part as loaded
        Bus.$emit("openPerspective"); // open the perspective table
        if (!window.viewer.trackedEntity) {
          window.viewer.trackedEntity = ds.entities.getById("Person"); // track the person model
        }
      });
    },
    // under development
    addGeoJSON() {
      const apiUrl = "https://dbc-91034050-29f6.cloud.databricks.com/api/2.0";
      const token = "dapib93d3d12501be524f4e69051c5417567";
      const endpoint =
        "dbfs:/FileStore/shared_uploads/suyunlei@u.nus.edu/weather/points.json";
      axios
        .get(`${apiUrl}/dbfs/read`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            path: endpoint,
          },
        })
        .then(function (response) {
          // handle success
          console.log(response.data);
          // Base64 to Uint8Array
          const base64ToUint8Array = (base64) =>
            Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const bytes = base64ToUint8Array(response.data.data);

          // decode as utf-8 string
          const decoder = new TextDecoder("utf-8");
          const decodedString = decoder.decode(bytes);

          // decode as json
          const jsonData = JSON.parse(decodedString);
          console.log(jsonData);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    },
    /**
     * add the animation to the building model
     * @returns {void}
     */
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

    /**
     * load the weather data
     * @returns {void}
     */
    loadWeatherData() {
      const apiUrl = "https://dbc-91034050-29f6.cloud.databricks.com/api/2.0";
      const token = "dapib93d3d12501be524f4e69051c5417567";
      const endpoint =
        "dbfs:/FileStore/shared_uploads/suyunlei@u.nus.edu/weather/points.json";
      axios
        .get(`${apiUrl}/dbfs/read`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            path: endpoint,
            cache: false,
          },
        })
        .then(function (response) {
          // Base64 to Uint8Array
          const base64ToUint8Array = (base64) =>
            Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const bytes = base64ToUint8Array(response.data.data);

          // decode as utf-8 string
          const decoder = new TextDecoder("utf-8");
          const decodedString = decoder.decode(bytes);

          // decode as json
          const jsonData = JSON.parse(decodedString);
          window.weatherStations = jsonData;
          console.log(window.weatherStations);

          // add the weather stations into the scene
          window.weatherStations.forEach((station) => {
            // 数据里写反了
            let lat = station.Long;
            let lon = station.Lat;
            let height;

            // if the station is on the rooftop, give it a height
            if (station.height) {
              height = station.height + 2;
            } else {
              height = 0;
            }

            // add the weather station billboard

            window.viewer.entities.add({
              name: station.ID,
              properties: {
                id: station.ID,
                name: station.Location,
                type: station.Type,
                description: station.Description,
              },
              position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
              billboard: {
                image: "https://i.328888.xyz/2023/05/17/Vi1uuz.png",
                width: 80,
                height: 80,
              },
              // add label
              label: {
                text: station.Location + "\n" + station.ID,
                fillColor: Cesium.Color.AQUA,
                font: "18px sans-serif",
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0, -50),
              },
              // add description
              description: `
              <div class="cesium-infoBox-description">
                <table class="cesium-infoBox-defaultTable">
                  <tbody>
                    <tr>
                      <th>Station Name</th>
                      <td>${station.Location}</td> 
                    </tr>
                    <tr>
                      <th>Type</th>
                      <td>${station.Type}</td> 
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>${station.Description}</td> 
                    </tr>
                    <tr>
                `,
            });
          });

          // add the weather stations to the treeData
          window.treeData.push({
            id: "weatherStations",
            label: "Weather Stations",
            disabled: true,
          });
          Bus.$emit("updateTreeData", window.treeData);

          console.log(window.viewer.entities);

          // add the click event to the weather stations
          window.viewer.selectedEntityChanged.addEventListener(function (
            selectedEntity
          ) {
            if (Cesium.defined(selectedEntity)) {
              window.viewer.infoBox.viewModel.description =
                selectedEntity.description.getValue();

              // 如果没有properties, 返回
              if (!selectedEntity.properties) {
                return;
              }

              let entityID = selectedEntity.properties.id._value;

              // get the weather data of the selected weather station through the ID
              axios
                .get(`${apiUrl}/dbfs/read`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  params: {
                    path: `${
                      "dbfs:/FileStore/shared_uploads/suyunlei@u.nus.edu/weather/weather" +
                      entityID +
                      ".json"
                    }`,
                  },
                })
                .then(function (response) {
                  // Base64 to Uint8Array
                  const base64ToUint8Array = (base64) =>
                    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
                  const bytes = base64ToUint8Array(response.data.data);

                  // decode as utf-8 string
                  const decoder = new TextDecoder("utf-8");
                  const decodedString = decoder.decode(bytes);

                  // decode as json
                  const jsonData = JSON.parse(decodedString);
                  console.log(jsonData);

                  // get the current time
                  let currentTime = new Date();
                  let month = currentTime.getMonth() + 1;
                  let hour = currentTime.getHours();

                  // get the temparature and humidity of the current time
                  let temparature, humidity;

                  jsonData.forEach((data) => {
                    if (entityID < 10) {
                      entityID = "0" + entityID;
                    } else {
                      entityID = entityID.toString();
                    }

                    // get the data of the current month and hour
                    if (data.Month == month && data.Hour == hour) {
                      let keys = Object.keys(data);
                      keys.forEach((key) => {
                        if (key.includes("Temperature")) {
                          temparature = data[key];
                        } else if (key.includes("RH")) {
                          humidity = data[key];
                        }
                      });

                      let weatherData = [temparature, humidity];
                      Bus.$emit("visualizeWeatherData", weatherData);
                      console.log(temparature);
                      console.log(humidity);
                    }
                  });
                });
            } else {
              viewer.infoBox.viewModel.description = "";
            }
          });
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    },

    /**
     * get the cozie participants menu
     * @returns {void}
     */

    get_participant_menu() {
      // loading animation
      const rLoading = this.openLoading();

      const url =
        "https://c3sclddcgcwy5tvzpfumcuggoa0unbuf.lambda-url.ap-southeast-1.on.aws/";

      var data = {
        api_key: "bqXYG83JNPa2l2uCi2zXZp08xxx",
        id_experiment: "dev", // might change to "dev, anna, anto"
      };
      let participants = [];
      axios
        .post(url, data)
        .then((res) => {
          console.log(`Status: ${res.status}`);
          participants = res.data;
          Bus.$emit("cozieTreeData", participants);
          rLoading.close(); // close the loading animation
        })
        .catch((err) => {
          console.error(err);
        });
    },

    /**
     * @description: clear all the data in the scene
     * @returns {void}
     * @param {*}
     * */
    clearAll() {
      // clear the treeData
      window.treeData = [];
      Bus.$emit("updateTreeData", window.treeData);

      // clear all the models in the scene
      window.viewer.scene.primitives.removeAll();

      // 以下代码在添加新的数据后会不显示
      window.viewer.entities.removeAll();
      window.viewer.dataSources.removeAll();
      window.viewer.trackedEntity = undefined;
      window.viewer.resize();
      window.viewer.scene.requestRender();
      // delete window.czmlPath;
      // delete window.tileset;
      // delete window.CZMLDataSource;
      // delete window.weatherStations;
    },
  },
};
