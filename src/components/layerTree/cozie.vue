<template>
  <div class="cozieManager">
    <Popup
      ref="coziePopup"
      :title="title"
      left="calc(50% - 100px)"
      :top="100 + 'px'"
      @close="close"
    >
      <el-tree
        :data="cozieData"
        empty-text="No Data"
        show-checkbox
        icon-class="el-icon-s-custom"
        @check-change="handleCheckChange"
      >
      </el-tree>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";
export default {
  name: "Layer",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      title: "Cozie Manager",
      cozieData: [],
    };
  },
  mounted() {
    this.initBusEvent();
  },
  destroyed() {},
  methods: {
    /**
     * init the bus event
     * @returns {void}
     */
    initBusEvent() {
      Bus.$off("cozieTreeData");
      Bus.$on("cozieTreeData", (data) => {
        if (!data) {
          return;
        }
        data.forEach((data) => {
          this.cozieData.push({
            id: this.createRandomId(),
            label: data,
          });
        });
        console.log(this.cozieData);
        this.$refs.coziePopup.open();
      });
    },

    handleCheckChange(data, checked) {
      Bus.$emit("cozieCheckChange", data, checked);
    },

    close() {
      //
    },
    /**
     * create random id
     * @returns {string}
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
  },
};
</script>

<style scoped lang="less">
.cozieManager {
  .el-tree {
    background: transparent;
    color: #fff;
    width: 500px;
    display: flex;
    // 横着排列元素 一行三个
    flex-wrap: wrap;

    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
  }

  /deep/ .el-tree-node__content:hover {
    background-color: rgba(245, 247, 250, 0.2);
  }

  /deep/ .el-tree-node {
    width: 30%;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 14px;
    color: #fff;
    line-height: 30px;
    transition: background-color 0.3s;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: none;
  }
  /deep/ .el-tree-node:focus > .el-tree-node__content {
    background-color: rgba(245, 247, 250, 0.2);
  }

  /deep/ .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 10px;

    i {
      margin-right: 5px;
    }
  }

  /deep/ .el-checkbox > .is-disabled {
    display: none;
  }
}
</style>
