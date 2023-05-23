<template>
  <div>
    <Popup
      ref="weather"
      :title="title"
      left="calc(100% - 600px)"
      :top="300 + 'px'"
      width="200px"
      @close="close"
    >
      <div class="attributeContainer" ref="attributeTable">
        <el-progress
          type="dashboard"
          :percentage="temperature"
          :color="temp_colors"
          :format="format"
        >
        </el-progress>
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
      title: "weather attributes",
      temperature: 0,
      temp_colors: [
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
      Bus.$off("visualizeTemperature");
      Bus.$on("visualizeTemperature", (data) => {
        this.temperature = data;
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
.el-progress {
  margin-top: 20px;
  margin-left: 30px;
  /deep/ .el-progress__text {
    color: white;
    font-size: 20px !important;
  }
}
</style>
