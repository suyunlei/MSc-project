<template>
  <div>
    <Popup
      ref="weather"
      :title="title"
      left="calc(100% - 600px)"
      :top="300 + 'px'"
      @close="close"
    >
      <div class="attributeContainer" ref="attributeTable">
        <div class="temp">
          <el-tag type="warning">Temperature</el-tag>
          <el-progress
            type="dashboard"
            :percentage="temperature"
            :color="temp_colors"
            :format="temp_format"
            :stroke-width="strokeWidth"
          >
          </el-progress>
        </div>

        <div class="RH">
          <el-tag>Relative Humidity</el-tag>
          <el-progress
            type="dashboard"
            :percentage="RH"
            :color="RH_colors"
            :format="RH_format"
            :stroke-width="strokeWidth"
          >
          </el-progress>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";

export default {
  name: "Weather_Attribute",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      title: "Real-time Weather",
      temperature: 0,
      RH: 0,
      strokeWidth: 12,
      temp_colors: [{ color: "#e6a23c", percentage: 30 }],
      RH_colors: [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#6f7ad3", percentage: 80 },
        { color: "#1989fa", percentage: 100 },
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
      Bus.$off("visualizeWeatherData");
      Bus.$on("visualizeWeatherData", (array) => {
        this.temperature = array[0];
        this.RH = array[1];
        this.open();
      });
    },

    /**
     *
     * @param {string} title
     * @param {*} value
     * @param {*} style
     */
    open() {
      this.$refs.weather.open();
    },

    /**
     * @description: close the popup
     * @param {*}
     * @return {void}
     */
    close() {
      // }
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
    change() {},
    /**
     * @description: format the temperature
     * @param {Number}
     * @return {String}
     */
    temp_format(percentage) {
      return `${percentage.toFixed(2)}℃`;
    },
    /**
     *
     * @param {*} percentage
     * @returns
     * @description: format the RH
     */
    RH_format(percentage) {
      return `${percentage.toFixed(2)}%`;
    },
  },
};
</script>

<style scoped lang="less">
.attributeContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;
}
.temp {
  width: 180px;
  height: 200px;
}

.RH {
  width: 180px;
  height: 200px;
}

.el-tag {
  // 使用flex使其水平居中

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
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
