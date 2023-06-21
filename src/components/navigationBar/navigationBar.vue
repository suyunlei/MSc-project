<template>
  <div>
    <div class="TapContainer">
      <div class="fileContainer">
        <div class="fileBtn">
          <i class="el-icon-menu"></i>
          <input type="file" id="fileInput" @change="json2CZML" />
        </div>
      </div>
      <el-tabs type="border-card" v-model="activeName" class="tabs">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.title"
          :name="tab.name"
          @mouseover="showFileDetails(true)"
        >
          <div class="ButtonContainer" :key="bt.name" v-for="bt in tab.content">
            <div class="buttonBox">
              <el-button
                type="text"
                class="el-button"
                @click="btnEvent(bt.name, bt)"
              >
                {{ bt.label }}
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
// 工具栏配置
import tabs from "../config/config.vue";
import object from "../mixin/object";
import json2CZML from "../mixin/json2CZML";
export default {
  name: "navigationBar",
  components: {},
  mixins: [object, json2CZML],
  data() {
    return {
      tabs: [],
      activeName: "index",
    };
  },
  mounted() {
    this.tabs = tabs.tabs;
  },
  methods: {
    // 提示信息
    message(type, info) {
      this.$notify({
        message: info,
        type: type,
        duration: "1000",
        offset: 140,
      });
    },
    // 点击事件
    btnEvent(type, btn) {
      if (this[type]) {
        this[type](btn);
      } else {
        this.$message("still not deveploped");
      }
    },
  },
};
</script>

<style scoped lang="less">
.fileContainer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}
.fileBtn {
  width: 40px;
  height: 39px;
  line-height: 39px;
  text-align: center;
  cursor: pointer;
  background-color: rgb(33, 34, 44);
  border: none;
  color: white;
  &:hover {
    color: rgb(231, 225, 225);
  }
}

/deep/ .el-tabs__header {
  margin-left: 40px !important;
}
/deep/ .el-radio__label {
  color: white;
}
.tabPaneContainer {
  padding: 5px 10px;
  height: 79px;
  overflow: hidden;
}
.buttondiv,
.ButtonContainer {
  display: inline-block;
}
.icondiv {
  font-size: 20px;
}
.buttondiv {
  border-right: 2px solid rgb(33, 34, 44);
  margin-right: 7px;
}

.buttonBox {
  font-size: 12px;
  margin-left: 20px;
  cursor: pointer;
}
.buttondiv:last-child {
  border-right: 0;
}
.title {
  color: rgb(192, 192, 192);
}
.el-button {
  padding: 0 10px;
  margin: 0 1px;
  height: 30px;
  color: #fff;
}
.ButtonContainer :hover {
  color: rgb(102, 177, 255);
}
/deep/ .el-tabs__item:hover {
  color: rgb(231, 225, 225) !important;
}
/deep/ .el-tabs__item,
/deep/ .el-tabs__nav-scroll {
  background: rgb(33, 34, 44) !important;
  color: #fff;
  height: 40px;
  border: none !important;
}
/deep/ .el-tabs__content {
  background: rgb(33, 34, 44) !important;
  border: none !important;
  padding: 0 !important;
}
/deep/ .el-tabs--border-card {
  border: none;
}
/deep/ .el-tabs--border-card > .el-tabs__header {
  border-bottom: 0px;
}
/deep/ .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  color: #fff;
  background: rgb(56, 57, 66) !important;
}
/deep/ .el-form-item__content {
  margin-left: 10px !important;
}
/deep/ .popper__arrow,
/deep/ .popper__arrow:after {
  border-style: none !important; //bug
}

#fileInput {
  opacity: 0;
  width: 40px;
  height: 40px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 999;
  cursor: pointer;
}
.TapContainer {
  font-family: "Microsoft YaHei";
}
</style>
