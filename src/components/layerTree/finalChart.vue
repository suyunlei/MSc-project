<template>
  <div>
    <Popup
      ref="pop"
      :title="title"
      left="calc(80%-300px)"
      top="5%"
      width="800px"
      maxHeight="1000px"
    >
      <div class="finalChart" v-if="show">
        <div id="chart1" style="height: 400px" ref="chart1"></div>
        <div id="chart2" style="height: 400px" ref="chart1"></div>
        <div id="chart3" style="height: 400px" ref="chart1"></div>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";
import * as echarts from "echarts";

export default {
  name: "finalChart",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      title: "finalChart",
      show: false,
      charts: [],
      fileds: ["Heart Rate", "Noise", "Solar Intensity"], // the fields that you want to show
      attributes: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initBusEvent();
    });
  },
  methods: {
    /**
     * @description init the bus event
     * @returns {void}
     */
    initBusEvent() {
      Bus.$off("showResults");
      Bus.$on("showResults", () => {
        this.open();
      });
    },
    /**
     * @description init the chart
     * @returns {void}
     */
    initChart() {
      // give a loading time
      setTimeout(() => {
        for (let i = 1; i < 4; i++) {
          this.charts.push(
            echarts.init(document.getElementById("chart" + i), "dark")
          ); // init the chart
        }
        let objs = window.czmlPath[1].properties;

        this.fileds.forEach((field) => {
          this.attributes.push({
            name: field,
            value: objs[field].number,
          });
        }); // get the attributes that you want to show

        // add a time property to the attributes
        this.attributes.forEach((attribute) => {
          attribute.time = [];
          attribute.y = [];
        });

        // get the x and y
        this.attributes.forEach((attribute) => {
          for (let i = 0; i < attribute.value.length; i++) {
            if (i % 2 == 0) {
              attribute.time.push(attribute.value[i]);
            } else {
              attribute.y.push(attribute.value[i]);
            }
          }
        });

        console.log(this.attributes);

        this.charts.forEach((chart, index) => {
          let option = {
            title: {
              text: this.attributes[index].name,
              left: "center",
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
            xAxis: {
              type: "category",
              data: this.attributes[index].time,
              boundaryGap: true,
            },
            series: [
              {
                data: this.attributes[index].y,
                type: "line",
                name: this.attributes[index].name,
                markPoint: {
                  data: [
                    { type: "max", name: "MaxValue" },
                    { type: "min", name: "MinValue" },
                  ],
                },
                markLine: {
                  data: [{ type: "average", name: "AvgValue" }],
                },
              },
            ],
          };
          if (this.attributes[index].name == "Heart Rate") {
            option.yAxis = {
              type: "value",
              min: 80,
              max: 150,
              interval: 10,
            };
          } else if (this.attributes[index].name == "Noise") {
            option.yAxis = {
              type: "value",
              min: 40,
              max: 80,
              interval: 10,
            };
          } else if (this.attributes[index].name == "Solar Intensity") {
            option.yAxis = {
              type: "value",
              min: 0,
              max: 50000,
              interval: 10000,
            };
          }
          chart.setOption(option);
        });
      }, 1000);
    },
    /**
     * @description open the popup
     * @returns {void}
     */
    open() {
      this.$refs.pop.open();
      this.show = true;
      this.initChart();
    },
    /**
     * @description close the popup
     * @returns {void}
     */
    close() {
      this.$refs.pop.close();
      this.show = false;
    },
  },
};
</script>
<style scoped></style>
