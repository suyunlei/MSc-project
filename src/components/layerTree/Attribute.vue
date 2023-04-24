<template>
  <div>
    <Popup
      ref="pop"
      :title="title"
      left="calc(100% - 250px)"
      width="200px"
      @close="close"
    >
      <div class="attributeContainer">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
        ></el-progress>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";

export default {
  name: "Attribute",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      percentage: 10,
      title: "Attribute",
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
    // 打开弹窗
    this.$refs.pop.open();
  },
  methods: {
    open() {
      this.$refs.pop.open();
    },
    close() {
      this.$refs.pop.close();
    },
    // change the number and color of the progress bar according to the attribute value
    change() {
      const name = window.checked_name;
      const value = window.czmlPath.properties[name].getValue(
        window.viewer.clock.currentTime
      );
      console.log(value);
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
