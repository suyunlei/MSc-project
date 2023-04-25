import Bus from "@tools/Bus";
export default {
  methods: {
    async json2CZML(e) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      window.treeData.push({
        id: file.name,
        name: file.name,
        children: [],
      });
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result;
        const data = JSON.parse(content);

        // get the keys to add to the treeData
        let attributes = Object.keys(data[0]);
        let foundRecord = window.treeData.find((item) => item.id === file.name);
        if (foundRecord) {
          let index = window.treeData.indexOf(foundRecord);
          // add the keys to the thermal_comfort in treeData
          for (let i = 3; i < attributes.length; i++) {
            window.treeData[index].children.push({
              id: i + 2,
              name: attributes[i],
            });
          }
        }
        Bus.$emit("updateTreeData", window.treeData);
        // add "time" attribute into each data point
        for (let i = 0; i < data.length; i++) {
          data[i].time = parseFloat(i * 100);
        }

        // init the vehicle model
        let vehicleEntity = await Cesium.IonResource.fromAssetId(1669983);
        window.vehicleEntity = vehicleEntity;
        // init a CZML file
        const czmlPath = [
          {
            id: "document",
            name: "CZML Path",
            version: "1.0",
          },
          {
            id: "Vehicle",
            availability: "2012-08-04T16:00:00Z/2012-08-04T20:00:00Z",
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
                  interval: "2012-08-04T16:00:00Z/2012-08-04T22:00:00Z",
                  boolean: true,
                },
              ],
              style: "FILL",
              text: "Participant",
              verticalOrigin: "CENTER",
            },
            model: {
              gltf: vehicleEntity,
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
              epoch: "2012-08-04T16:00:00Z",
              interpolationAlgorithm: "LAGRANGE",
              interpolationDegree: 5,
              // fuel_remaining: {
              //   epoch: "2012-08-04T16:00:00Z",
              //   number: [0, 22.5, 1000, 21.2],
              // },
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
                // 0, 103.7702304, 1.296996802, 50.0, 1000.0, 103.7702192,
                // 1.297058369, 50.0, 2000.0, 103.7701632, 1.297110608, 50.0,
              ],
            },
          },
        ];

        // add the attributes
        const keys = Object.keys(data[1]);
        for (let j in keys) {
          let attribute_name = keys[j];
          Object.defineProperty(czmlPath[1].properties, attribute_name, {
            value: { number: [] },
          });
        }
        // add data points into CZML file
        for (let i = 0; i < data.length; i++) {
          if (data[i].X && data[i].Y) {
            czmlPath[1].position.cartographicDegrees.push(data[i].time);
            czmlPath[1].position.cartographicDegrees.push(
              parseFloat(data[i].X)
            );
            czmlPath[1].position.cartographicDegrees.push(
              parseFloat(data[i].Y)
            );
            czmlPath[1].position.cartographicDegrees.push(0);
          }

          // add the attributes
          let ks = Object.keys(data[i]);
          for (let j in ks) {
            let attribute_name = ks[j];
            czmlPath[1].properties[attribute_name].number.push(
              parseFloat(data[i].time)
            );
            czmlPath[1].properties[attribute_name].number.push(
              parseFloat(data[i][attribute_name])
            );
          }
        }

        // if already have a CZML file, then replace it
        window.czmlPath = czmlPath;
      };
      reader.readAsText(file);
    },
  },
};
