<template>
  <div>
    <Popup
      ref="layer"
      :closeHidePage="true"
      :title="title"
      :left="left"
      :top="top"
      :maxHeight="maxHeight"
      @close="close"
    >
      <div class="treeContainer">
        <el-tree
          ref="tree"
          :data="treeData"
          show-checkbox
          node-key="id"
          empty-text="No Data"
          :expand-on-click-node="false"
          :auto-expand-parent="false"
          :check-strictly="true"
          :default-expanded-keys="defaultExpanded"
          :default-checked-keys="defaultCheck"
          @check-change="handleCheckChange"
          :props="defaultProps"
        >
          <span
            class="custom-tree-node"
            slot-scope="{ data }"
            @dblclick="flyTo(data)"
          >
            <span>
              <i v-if="data.children" class="el-icon-folder"></i>
              {{ data.label }}
            </span>
          </span>
        </el-tree>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";
// 工程树工具
let _treeTool;
export default {
  name: "Layer",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      title: "Layer Manager",
      left: "10px",
      top: "10px",
      maxHeight: "800px",
      defaultCheck: [],
      defaultExpanded: [],

      treeData: [],
      maxChecked: 3, // max checked number of nodes
      defaultProps: {
        children: "children",
        label: "label",
      },
    };
  },
  mounted() {
    // 打开弹窗
    this.$refs.layer.open();

    // 定义中转站事件
    this.initBusEvent();
  },
  destroyed() {
    _treeTool = undefined;
  },
  methods: {
    /***
     * @param {Object} data
     * @description update the tree node
     * @returns {void}
     */
    updateTreeData(data) {
      this.treeData = data;
    },
    /***
     * @param {Object} data
     * @param {Boolean} checked
     * @description check the node
     * @returns {void}
     */
    handleCheckChange(data, checked) {
      let num = this.$refs.tree.getCheckedNodes().length;
      // store the checked nodes
      window.attributeArray = this.$refs.tree.getCheckedNodes();
      console.log(window.attributeArray);
      if (num > this.maxChecked) {
        // cancel the last checked node
        this.$refs.tree.setChecked(
          this.$refs.tree.getCheckedNodes().pop().id,
          false
        );
        this.$message({
          message: `Maximum of ${this.maxChecked}nodes can be ticked`,
          type: "warning",
        });
      } else {
        if (checked) {
          // window.checked_id = data.id;
          // window.checked_name = data.label;
          Bus.$emit("showAttribute", data.label, data.id);
        } else {
          Bus.$emit("closeAttribute", data.id);
        }
      }
    },
    // close the popup
    /**
     * @description close the popup
     * @returns {void}
     */
    close() {
      Bus.$emit("checkTab", "index/add/treeLayer", false);
    },
    /***
     * @description init the Bus Event
     * @returns {void}
     */
    initBusEvent() {
      Bus.$off("clearFirstParentNode");
      Bus.$on("clearFirstParentNode", (parentName) => {
        // 清除所有对象
        this.clearFirstParentNode(parentName);
      });
      Bus.$off("updateTreeData");
      Bus.$on("updateTreeData", (data) => {
        // 更新树数据
        this.updateTreeData(data);
      });
    },
    // ergodic Node
    ergodicNode(node, addData = true) {
      node.rename = false;
      if (node.expanded) {
        this.defaultExpanded.push(node.id);
      }
      if (
        node.checked &&
        (!node.children || (node.children && !node.children.length))
      ) {
        this.defaultCheck.push(node.id);
        if (addData && node._children) {
          node._children.forEach((item) => {
            _treeTool.addData(item);
          });
        } else {
          addData && _treeTool.addData(node);
        }
      }
      if (node.children && node.children.length) {
        node.children.forEach((item) => {
          this.ergodicNode(item, addData);
        });
      }
    },
    // get the parent node by name
    getParentNodeByName(name) {
      let index = this.treeData.findIndex((item) => {
        return item.name === name;
      });
      return this.treeData[index];
    },

    // locate the layer
    flyTo(treeNode) {
      if (treeNode.animationDatas) {
        this.$refs.animationEdit.start(treeNode.animationDatas);
      } else {
        _treeTool.flyTo(treeNode);
      }
    },
    // remove the layer
    remove(data) {
      // remove the tree node
      this.removeTreeNode({ id: data.id });
      if (data.children) {
        this.removeChildData(data.children);
      } else {
        // remove the scene data
        _treeTool.deleteData(data.id);
      }
    },
    removeChildData(nodes) {
      nodes.forEach((item) => {
        if (item.children) {
          this.removeChildData(item.children);
        } else {
          // remove the scene data
          _treeTool.deleteData(item.id);
          if (item.sourceType === "demoAnimation") {
            Bus.$emit("closeAnimationEdit");
          }
        }
      });
    },
    // clear all the data
    clearFirstParentNode(name) {
      let parentnode = this.getParentNodeByName(name);
      parentnode && this.remove(parentnode);
    },
  },
};
</script>

<style scoped lang="less">
.treeContainer {
  width: 100%;
  height: 100%;

  .treeTitle {
    text-align: center;
    margin: 10px 0;

    /deep/ .el-upload {
      margin-right: 10px;
    }
  }

  .el-tree {
    background: transparent;
    color: #fff;
  }

  /deep/ .el-tree-node__content:hover {
    background-color: rgba(245, 247, 250, 0.2);
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
