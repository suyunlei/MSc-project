<template>
  <div>
    <Popup
      ref="pop"
      v-for="(data, index) in PopupData"
      :key="data.id"
      :title="data.title || 'Attribute'"
      left="calc(100% - 300px)"
      :top="300 + index * 200 + 'px'"
      width="200px"
      @close="close(data.id)"
    >
      <div class="attributeContainer">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
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
  name: "Attribute",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      PopupData: [],
      percentage: 0,
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
    this.init();
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
     *
     * @param {string} title
     * @param {*} value
     * @param {*} style
     */
    open(title, value) {
      this.PopupData.push({
        id: this.createRandomId(),
        title,
        value, // this value match the data(checked) id
      });
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
      if (!this.PopupData.some((item) => item.value === value)) {
        return;
      } else {
        let index = this.PopupData.findIndex((item) => {
          return item.value === value;
        });
        let data = this.PopupData.splice(index, 1)[0];
        data.close && data.close();
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
      this.title = window.checked_name;
      let true_val = window.thermal_value;
      if (true_val > 100) {
        this.percentage = 100;
      }
      this.percentage = window.thermal_value;
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
.el-progress {
  margin-top: 20px;
  margin-left: 30px;
  /deep/ .el-progress__text {
    color: white;
    font-size: 20px !important;
  }
}
</style>
