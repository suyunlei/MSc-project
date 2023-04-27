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
        >
          <span
            class="custom-tree-node"
            slot-scope="{ data }"
            @dblclick="flyTo(data)"
          >
            <span>
              <i v-if="data.children" class="el-icon-folder"></i>
              <i
                v-else
                :class="
                  data.sourceType === 'location'
                    ? 'el-icon-location-outline'
                    : ''
                "
              >
              </i>
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
import { debug } from "console";
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
      selectNode: undefined,
      isClickParent: false,
      isNewFold: false,
      treeData: [],
      maxChecked: 3, // max checked number of nodes
    };
  },
  mounted() {
    // 打开弹窗
    this.$refs.layer.open();

    // 定义中转站事件
    this.initBusEvent();
  },
  computed: {
    checkedCount() {
      let count = 0;
      this.$refs.tree.getCheckedNodes().forEach((node) => {
        if (node.checked) {
          count++;
        }
      });
      return count;
    },
  },
  destroyed() {
    _treeTool = undefined;
  },
  methods: {
    // update the tree data
    updateTreeData(data) {
      this.treeData = data;
    },
    // check the node
    handleCheckChange(data, checked, indeterminate) {
      if (this.checkedCount > this.maxChecked) {
        // 取消勾选最后一个勾选的节点
        this.$refs.tree.setChecked(
          this.$refs.tree.getCheckedNodes().pop().id,
          false
        );
      } else {
        if (checked) {
          window.checked_id = data.id;
          window.checked_name = data.name;
        }
      }
      // console.log(data, checked, indeterminate);
    },
    // close the popup
    close() {
      Bus.$emit("checkTab", "index/add/treeLayer", false);
    },
    // init the Bus Event
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

    appendTreeNode() {
      this.append(this.selectNode);
    },
    expandedNode(node) {
      if (node && node.children && !node.expanded) {
        let treeNode = this.$refs.tree.getNode(node.id);
        if (treeNode) {
          treeNode.expanded = true;
          this.updataTreeNode({
            id: node.id,
            key: "expanded",
            value: true,
          });
        }
      }
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
