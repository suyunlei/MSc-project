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
      <div class="attributeContainer" v-if="Show">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
          :format="format"
        >
        </el-progress>
        <div id="chart" style="height: 300px" ref="chart"></div>
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
      thermal_array: [],
      title: "",
      time: [],
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
      Bus.$on("closeAttribute", this.close);
    },

    /**
     * @description: initChart
     * @param {*}
     */
    initChart() {
      var myChart = echarts.init(document.getElementById("chart"), "dark");

      const time = this.time;
      const dataOne = this.thermal_array;

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
        yAxis: {
          type: "value",
          max: 120,
          min: 40,
          interval: 10,
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
      setInterval(() => {
        // time.shift();
        if (window.CZMLDataSource.entities.getById("Person")) {
          if (window.viewer.clock.currentTime) {
            time.push(window.viewer.clock.currentTime.toString());
          }
          // dataOne.shift();
          if (this.thermal_value) {
            dataOne.push(this.thermal_value);
          }
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
      }, 1);
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
      // set the clock and get the attribute
      window.viewer.clock.onTick.addEventListener((clock) => {
        if (!window.CZMLDataSource.entities.getById("Person")) {
          this.Show = false;
          Cesium.Event.RemoveCallback();
        }
        if (window.czmlPath && title) {
          const properties = window.czmlPath[1].properties;
          const name = title;
          this.time.push(clock.currentTime.toString());
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
                this.thermal_array.push(value);
              }
              // let the attribute table change
              // Bus.$emit("change");
              this.change();
            }
          }
        }
      });

      setTimeout(() => {
        this.initChart();
      }, 1);
      let index = this.PopupData.length - 1;
      this.$nextTick(() => {
        this.$refs.pop[index].open();
      });
      return this.PopupData[index];
    },

    /**
     * @description: close the popup
     * @param {*}
     * @return {void}
     */
    close(value) {
      // if this.PopupDatd doesn't have the item with value, return
      if (!this.PopupData.some((item) => item.fid === value)) {
        return;
      } else {
        let index = this.PopupData.findIndex((item) => {
          return item.fid === value;
        });

        let data = this.PopupData.splice(index, 1)[0];
        data.close && data.close();
      }
      this.thermal_value = 0;
      window.viewer.trackedEntity = undefined;
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
