<template>
  <div>
    <Popup
      ref="coziePopup"
      :title="title"
      left="calc(50% - 100px)"
      :top="100 + 'px'"
      @close="close"
    >
      <el-tree
        :data="treeData"
        lazy
        show-checkbox
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
      treeData: [],
    };
  },
  mounted() {
    this.initBusEvent();
  },
  destroyed() {},
  methods: {
    initBusEvent() {
      Bus.$off("cozieTreeData");
      Bus.$on("cozieTreeData", (data) => {
        this.updateTreeData(data);
      });
    },
    updateTreeData(data) {
      this.treeData = data;
    },
    handleCheckChange(data, checked) {
      Bus.$emit("cozieCheckChange", data, checked);
    },
  },
};
</script>

<style></style>
