<template>
  <div>
    <Popup
      ref="pop"
      v-for="(data, index) in PopupData"
      :key="data.id"
      :title="data.title || 'Attribute'"
      left="calc(100% - 600px)"
      :top="300 + index * 200 + 'px'"
      width="500px"
      @close="close(data.id)"
    >
      <div class="attributeContainer" v-if="Show" ref="attributeTable">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
          :format="format"
          v-show="false"
        >
        </el-progress>
        <div id="chart" style="height: 400px" ref="chart"></div>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";
import * as echarts from "echarts";

export default {
  name: "Attribute",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      PopupData: [],
      percentage: 0,
      thermal_value: 0,
      title: "",
      Show: true,
      colors: [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 80 },
        { color: "#6f7ad3", percentage: 100 },
      ],
    };
  },
  mounted() {
    // this.$refs.pop.open();
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    /**
     * @description: init the event
     * @param {*}
     * @return {void}
     * @Date: 2021-04-27 17:48:00
     */
    init() {
      Bus.$off("change");
      Bus.$on("change", this.change);
      Bus.$off("showAttribute");
      Bus.$on("showAttribute", this.open);
      Bus.$off("closeAttribute");
      Bus.$on("closeAttribute", (data) => {
        this.close(data);
      });
    },

    /**
     * @description: initChart
     * @param {*}
     */
    initChart() {
      var myChart = echarts.init(document.getElementById("chart"), "dark");

      const time = [];
      const dataOne = [];

      let options = {
        title: {
          text: this.title,
          textStyle: {
            color: "white",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#283b56",
            },
          },
        },
        legend: {},
        xAxis: {
          type: "category",
          data: time,
          boundaryGap: true,
        },
        series: [
          {
            data: dataOne,
            type: "line",
            name: this.title,
            // markPoint: {
            //   data: [
            //     { type: "max", name: "MaxValue" },
            //     { type: "min", name: "MinValue" },
            //   ],
            // },
            markLine: {
              data: [{ type: "average", name: "AvgValue" }],
            },
          },
        ],
      };

      // change the y axis according to the title
      if (this.title === "Heart Rate") {
        options.yAxis = {
          type: "value",
          max: 150,
          min: 80,
          interval: 10,
        };
      } else if (this.title === "Noise") {
        options.yAxis = {
          type: "value",
          max: 80,
          min: 40,
          interval: 10,
        };
      } else if (this.title === "Solar Intensity") {
        options.yAxis = {
          type: "value",
          max: 50000,
          min: 0,
          interval: 10000,
        };
      } else {
        // other thermal attribute
        options.yAxis = {
          type: "value",
          max: 100,
          min: 0,
          interval: 10,
        };
      }

      window.chartInterval = setInterval(() => {
        if (window.CZMLDataSource.entities.getById("Person")) {
          let string = window.viewer.clock.currentTime.toString();
          let timeValue = string.substring(11, 19);
          if (this.thermal_value) {
            time.push(timeValue);
            dataOne.push(this.thermal_value);
          }

          // dataOne.shift();
        }
        myChart.setOption({
          xAxis: [
            {
              data: time,
            },
          ],
          series: [
            {
              data: dataOne,
            },
          ],
        });
      }, 1000);
      myChart.setOption(options);
    },
    /**
     *
     * @param {string} title
     * @param {*} value
     * @param {*} style
     */
    open(title, fid) {
      this.title = title;
      this.PopupData.push({
        id: this.createRandomId(),
        title,
        fid, // this value match the data(checked) id
      });

      if (!window.CZMLDataSource) {
        // if the CZML file is not loaded, then show the warning message
        this.$message({
          message: `Please Load the CZML file first!`,
          type: "warning",
        });
        Bus.$emit("clearCheckedNode");
      } else {
        /**
         * @description
         * 1. get the attribute value according to the time interval
         * 2. create a clock event to listen the time change
         * 3. show the attribute value in the chart
         * get the attribute value according to the time interval
         * @param {Cesium.Viewer.Clock} clock
         */
        window.clockEventListener = (clock) => {
          if (!window.CZMLDataSource.entities.getById("Person")) {
            this.Show = false;
            Cesium.Event.RemoveCallback();
          }

          if (window.czmlPath && title) {
            const properties = window.czmlPath[1].properties;
            const name = title;
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
                if (value) {
                  this.thermal_value = value;
                }

                // let the attribute table change
                // Bus.$emit("change");
                // this.change();
              }
            }
          }

          let endTime = new Cesium.JulianDate.fromIso8601(
            "2012-08-04T12:15:39.000Z"
          ); // set a nearest end time
          if (
            Cesium.JulianDate.greaterThan(
              window.viewer.clock.currentTime,
              endTime
            ) // if the current time is greater than the end time
          ) {
            // remove the CZML data source and stop the interval.
            window.viewer.dataSources.remove(window.CZMLDataSource);
            clearInterval(window.chartInterval);
            window.viewer.clock.onTick.removeEventListener(
              window.clockEventListener
            );
            this.$message({
              message: `The animation is over!`,
              type: "success",
            });
          }
        };

        window.viewer.clock.onTick.addEventListener(window.clockEventListener);

        setTimeout(() => {
          this.initChart();
        }, 100);
        let index = this.PopupData.length - 1;
        this.$nextTick(() => {
          this.$refs.pop[index].open();
        });

        return this.PopupData[index];
      }
    },

    /**
     * @description: close the popup
     * @param {*}
     * @return {void}
     */
    close(value) {
      // if this.PopupDatd doesn't have the item with value, return
      if (!this.PopupData.some((item) => item.id === value)) {
        return;
      } else {
        /** this for the many popup close */
        let index = this.PopupData.findIndex((item) => {
          return item.title === value || item.fid === value;
        });
        let data = this.PopupData.splice(index, 1)[0];
        debugger;
        data.close && data.close();

        window.viewer.clock.onTick.removeEventListener(
          window.clockEventListener
        );
        this.thermal_value = 0;
        // uncheck the node in the layer tree
        Bus.$emit("unsetChecked", data);
        window.viewer.trackedEntity = undefined;
      }
    },
    /**
     * @description: create a random id
     * @param {*}
     * @return {String}
     */
    createRandomId() {
      return (
        (Math.random() * 10000000).toString(16).substr(0, 4) +
        "-" +
        new Date().getTime() +
        "-" +
        Math.random().toString().substr(2, 5)
      );
    },
    /**
     * @description: change the number and color of the progress bar according to the attribute value
     * @param {*}
     * @return {void}
     */
    change() {
      let true_val = this.thermal_value;
      this.percentage = true_val;

      // if (true_val > 100) {
      //   this.percentage = 100;
      // } else {
      //   this.percentage = this.thermal_value;
      // }
      this.colors = [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 80 },
        { color: "#6f7ad3", percentage: 100 },
      ];
    },
    /**
     * @description: format the percentage
     * @param {Number}
     * @return {String}
     */
    format(percentage) {
      return `${percentage}`;
    },
  },
};
</script>

<style scoped lang="less">
.chart {
  height: 400px;
}
.el-progress {
  margin-top: 20px;
  margin-left: 30px;
  /deep/ .el-progress__text {
    color: white;
    font-size: 20px !important;
  }
}
</style>
