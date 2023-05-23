<template>
  <div>
    <Popup
      ref="weather"
      :title="title"
      left="calc(100% - 600px)"
      :top="300 + 'px'"
      width="500px"
      @close="close"
    >
      <div class="attributeContainer" ref="attributeTable">
        <el-progress
          type="dashboard"
          :percentage="temperature"
          :color="temp_colors"
          :format="format"
          v-show="false"
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
      temp_colors: [],
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
    init() {},

    /**
     *
     * @param {string} title
     * @param {*} value
     * @param {*} style
     */
    open(title) {
      this.title = title;
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
