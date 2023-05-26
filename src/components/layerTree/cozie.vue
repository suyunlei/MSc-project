<template>
  <div class="cozieManager">
    <Popup
      ref="coziePopup"
      :title="title"
      left="calc(50% - 100px)"
      :top="100 + 'px'"
      @close="close"
    >
      <div class="participant_panel">
        <p>participant Panel</p>
        <el-tree
          :data="cozieData"
          empty-text="No Data"
          show-checkbox
          icon-class="el-icon-s-custom"
          @check-change="handleCheckChange"
          class="scrollbar"
        >
        </el-tree>
      </div>

      <div class="timeStamp">
        <p>Time Range</p>
        <el-date-picker
          v-model="time_start"
          type="datetime"
          placeholder="Select time start"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="{
            selectableRange: '00:00:00 - 23:59:59',
          }"
        >
        </el-date-picker>
        <el-date-picker
          v-model="time_end"
          type="datetime"
          placeholder="Select time end"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="{
            selectableRange: '00:00:00 - 23:59:59',
          }"
        >
        </el-date-picker>
      </div>
      <div class="submit_btn">
        <el-button type="primary">Submit</el-button>
      </div>
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
    height: 80px;
    display: flex;
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

  /deep/ .scrollbar {
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      scrollbar-arrow-color: red;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      -webkit-box-shadow: inset 0 0 5px rgba(218, 218, 218, 0.2);
      box-shadow: inset 0 0 5px rgba(218, 218, 218, 0.2);
      background: #797979;
      scrollbar-arrow-color: red;
    }

    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(218, 218, 218, 0.2);
      box-shadow: inset 0 0 5px rgba(218, 218, 218, 0.2);
      border-radius: 0;
      background: rgba(218, 218, 218, 0.1);
    }
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
