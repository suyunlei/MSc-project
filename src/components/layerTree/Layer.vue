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
          draggable
          :allow-drop="allowDrop"
          :expand-on-click-node="false"
          :auto-expand-parent="false"
          :default-expanded-keys="defaultExpanded"
          :default-checked-keys="defaultCheck"
          @node-expand="changeNodeExpand($event, true)"
          @node-collapse="changeNodeExpand($event, false)"
          @check="check"
          @node-contextmenu="rightClick"
        >
          <span
            class="custom-tree-node"
            slot-scope="{ data }"
            @dblclick="flyTo(data)"
            @click="select(data)"
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
              ></i>
              <el-input
                v-if="data.rename"
                v-model="data.name"
                size="mini"
                placeholder="layer name"
                @change="rename(data)"
                @blur="rename(data)"
              ></el-input>
              <span v-else>{{ data.name }}</span>
            </span>
          </span>
        </el-tree>
      </div>

      <div
        class="rightClickMenu"
        v-if="rightClickMenuDisplay"
        :style="{ ...rightClickMenuStyle }"
      >
        <ul>
          <li @click="openRename"><i class="el-icon-edit"></i>Rename</li>
          <li @click="deleteTreeNode"><i class="el-icon-delete"></i>Delete</li>
        </ul>
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
      rightClickMenuDisplay: false,
      rightClickMenuStyle: {},
      isClickParent: false,
      isNewFold: false,
      newFoldName: undefined,
      treeData: [
        {
          id: 1,
          label: "Level one 1",
          children: [
            {
              id: 4,
              label: "Level two 1-1",
              children: [
                {
                  id: 9,
                  label: "Level three 1-1-1",
                },
                {
                  id: 10,
                  label: "Level three 1-1-2",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          label: "Level one 2",
          children: [
            {
              id: 5,
              label: "Level two 2-1",
            },
            {
              id: 6,
              label: "Level two 2-2",
            },
          ],
        },
        {
          id: 3,
          label: "Level one 3",
          children: [
            {
              id: 7,
              label: "Level two 3-1",
            },
            {
              id: 8,
              label: "Level two 3-2",
            },
          ],
        },
      ],
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
    // 右键菜单元素
    rightClick(e, data, node, comp) {
      this.isClickParent = !!data.children;
      this.selectNode = data;
      this.rightClickMenuStyle = { top: e.pageY + "px", left: e.pageX + "px" };
      this.rightClickMenuDisplay = true;
      document.onclick = () => {
        this.rightClickMenuDisplay = false;
        document.onclick = undefined;
      };
    },
    close() {
      Bus.$emit("checkTab", "index/add/treeLayer", false);
    },
    // 定义中转站事件
    initBusEvent() {
      Bus.$off("addLayer");
      Bus.$on("addLayer", (type) => {
        this.selectNode = this.$refs.tree && this.$refs.tree.getCurrentNode();
      });
      Bus.$off("openLayer");
      Bus.$on("openLayer", (open = true) => {
        // 打开弹窗
        if (open) {
          this.$refs.layer.open();
        } else {
          this.$refs.layer.close();
        }
      });
      Bus.$off("addFile");
      Bus.$on("addFile", () => {
        this.selectNode = this.$refs.tree && this.$refs.tree.getCurrentNode();
        // 添加文件
        this.append(this.selectNode);
      });

      Bus.$off("clearFirstParentNode");
      Bus.$on("clearFirstParentNode", (parentName) => {
        // 清除所有对象
        this.clearFirstParentNode(parentName);
      });
    },
    // 初始化数据
    initData(data) {
      if (this.treeData.length) {
        this.removeChildData(this.treeData);
      }

      data.name && sessionStorage.setItem("SmartEarthTitle", data.name);
      // 设置工程树数据
      this.setTreeData(data.children);
      // 初始定位
      if (data.flyTo) {
        this.setView(data.flyTo);
      }
      // 加载场景数据
      // this.loadDataToScene();
    },
    // // 加载数据到场景
    // loadDataToScene() {
    //   if (window.sgworld) {
    //     // 工程树工具
    //     _treeTool = new window.TreeTool(window.sgworld);
    //     window.sgworld._treeTool = _treeTool;
    //     if (this.$refs.tree) {
    //       this.defaultCheck = [];
    //       this.defaultExpanded = [];
    //       // 遍历节点
    //       this.ergodicNode({ children: this.treeData });
    //     }
    //     // 初始定位
    //     if (this.viewCenter.length) {
    //       this.flyTo({
    //         flyTo: this.viewCenter,
    //       });
    //     }

    //     document.title =
    //       sessionStorage.getItem("SmartEarthTitle") || "SmartEarth";
    //   } else {
    //     setTimeout(() => {
    //       this.loadDataToScene();
    //     }, 500);
    //   }
    // },
    // 遍历节点
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
    // 勾选
    check(treeNode, data) {
      let isCheck = data.checkedKeys.indexOf(treeNode.id) > -1;
      // 勾选节点
      this.checkTreeNode({ id: treeNode.id, checked: isCheck });
      // 更新场景数据
      _treeTool.checkNode(treeNode, isCheck);

      // 只能同时加载一个地形
      if (
        isCheck &&
        treeNode.sourceType &&
        treeNode.sourceType.indexOf("terrain") > -1
      ) {
        let index = data.checkedNodes.findIndex((item) => {
          return (
            item.sourceType &&
            item.sourceType.indexOf("terrain") > -1 &&
            item.id !== treeNode.id
          );
        });
        if (index > -1) {
          // 取消勾选
          this.$refs.tree.setChecked(data.checkedNodes[index].id, false);
          this.checkTreeNode({
            id: data.checkedNodes[index].id,
            checked: false,
          });
        }
      }
    },
    // 添加节点|文件夹
    append(data) {
      this.$confirm("Select the type", "Message", {
        confirmButtonText: "Data",
        cancelButtonText: "Folder",
        distinguishCancelAndClose: true,
        closeOnClickModal: false,
      })
        .then(() => {
          // 选择数据
          this.selectData(data);
        })
        .catch((action) => {
          // 添加文件夹
          if (action === "cancel") {
            this.addFolder(data);
          }
        });
    },
    // 添加文件夹
    addFolder(data) {
      this.$prompt("Input Folder Name", "Message", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        inputValue: "New Folder",
        closeOnClickModal: false,
      })
        .then(({ value }) => {
          let newChild = {
            id: window.sgworld.Core.getuid(),
            name: value,
            rename: false,
            children: [],
          };
          this.addData(data, newChild);
        })
        .catch(() => {});
    },
    // 选择数据
    selectData(data) {
      this.selectNode = data;
      this.$refs.select.open();
    },

    // 添加数据到场景
    addSceneData(data, isEdit) {
      if (isEdit) {
        this.updataTreeNode({
          id: data.id,
          nodeValue: data,
        });
        return;
      }
      data.checked = true;
      // 添加节点
      this.addData(this.selectNode, data);
      // 添加数据到场景
      if (!_treeTool) {
        // 工程树工具
        _treeTool = new window.TreeTool(window.sgworld);
        window.sgworld._treeTool = _treeTool;
      }
      _treeTool.addData(data);
      this.selectNode = undefined;
    },
    // 添加树节点
    addData(data, value) {
      !value.rename && (value.rename = false);
      this.addTreeChildren({ pid: data && data.id, item: value });
      this.expandedNode(data);

      value.checked &&
        this.$nextTick(() => {
          this.$refs.tree.setChecked(value, true);
        });
    },
    // 根据名字获取父节点
    getParentNodeByName(name) {
      let index = this.treeData.findIndex((item) => {
        return item.name === name;
      });
      return this.treeData[index];
    },

    // 定位
    flyTo(treeNode) {
      if (treeNode.animationDatas) {
        this.$refs.animationEdit.start(treeNode.animationDatas);
      } else {
        _treeTool.flyTo(treeNode);
      }
    },
    select() {
      this.rightClickMenuDisplay = false;
    },
    // 移除
    remove(data) {
      // 移除节点
      this.removeTreeNode({ id: data.id });
      if (data.children) {
        this.removeChildData(data.children);
      } else {
        // 移除场景数据
        _treeTool.deleteData(data.id);
        if (data.sourceType === "demoAnimation") {
          Bus.$emit("closeAnimationEdit");
        }
      }
    },
    removeChildData(nodes) {
      nodes.forEach((item) => {
        if (item.children) {
          this.removeChildData(item.children);
        } else {
          // 移除场景数据
          _treeTool.deleteData(item.id);
          if (item.sourceType === "demoAnimation") {
            Bus.$emit("closeAnimationEdit");
          }
        }
      });
    },
    // 清除所有对象
    clearFirstParentNode(name) {
      let parentnode = this.getParentNodeByName(name);
      parentnode && this.remove(parentnode);
    },

    appendTreeNode() {
      this.append(this.selectNode);
    },
    // 右键删除按钮点击事件
    deleteTreeNode() {
      this.remove(this.selectNode);
    },
    // 添加目录
    addFold() {
      let newChild = {
        id: window.sgworld.Core.getuid(),
        name: "New Folder",
        children: [],
        rename: true,
      };
      this.addData(this.selectNode, newChild);
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
    addLayer() {
      this.selectData(this.selectNode);
    },
    openRename() {
      if (this.selectNode) {
        this.selectNode.rename = true;
      }
    },
    rename(data) {
      data.rename = false;
      this.updataTreeNode({
        id: data.id,
        key: "name",
        value: data.name,
      });
    },
    allowDrop(draggingNode, dropNode, type) {
      if (type === "inner") {
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>

<style scoped lang="less" scoped>
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
.rightClickMenu {
  position: fixed;
  display: block;
  z-index: 10000;
  background-color: #fff;
  padding: 5px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.rightClickMenu ul {
  margin: 0;
  padding: 0;
}
.rightClickMenu ul li {
  list-style: none;
  margin: 0;
  padding: 0 15px;
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;
  color: black;
}
.rightClickMenu ul li:hover {
  background-color: #ebeef5;
}
</style>
