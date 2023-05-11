<template>
  <div>
    <Popup
      ref="popup"
      :title="title"
      left="calc(80% - 200px)"
      top="5%"
      @close="close"
    >
      <div class="perspectiveContainer" v-if="show">
        <el-row>
          <el-button type="primary" plain @click="ToGod">
            God Perspective
          </el-button>
          <el-button type="success" plain @click="ToFirstPerson">
            First-Person Perspective
          </el-button>
          <el-button type="info" @click="showResults"
            >Show the Whole Results</el-button
          >
        </el-row>
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";

export default {
  name: "Perspective",
  components: {
    Popup,
    Bus,
  },
  data() {
    return {
      title: "Toolbar",
      show: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initBusEvent();
    });
  },
  methods: {
    /**
     * @description init the bus event
     * @returns {void}
     */
    initBusEvent() {
      Bus.$off("openPerspective");
      Bus.$on("openPerspective", this.open);
    },
    open() {
      this.$refs.popup.open();
      this.show = true;
    },
    close() {
      // this.$refs.popup.close();
    },
    /**
     * God Perspective
     * @param {*} e
     * @returns {void}
     */
    ToGod() {
      if (!window.CZMLDataSource) {
        this.$message({
          message: "Load the Animation First!",
          type: "warning",
        });
      } else {
        // window.viewer.trackedEntity = undefined;
        window.viewer.scene.preUpdate.addEventListener(
          this.updateView(0, 0, 100)
        );
      }
    },
    /**
     * First-Person Perspective
     * @param {*} e
     * @returns {void}
     */
    ToFirstPerson() {
      if (!window.CZMLDataSource) {
        this.$message({
          message: "Load the Animation First!",
          type: "warning",
        });
      } else {
        window.viewer.scene.preUpdate.addEventListener(
          this.updateView(-5, -4, 5)
        );
      }
    },
    /**
     * Update the view
     * @param {number} heading
     * @param {number} pitch
     * @param {number} roll
     */
    updateView(heading, pitch, roll) {
      let trackEntity = window.CZMLDataSource.entities.getById("Person");
      let center = trackEntity.position.getValue(
        window.viewer.clock.currentTime
      );
      let orientation = trackEntity.orientation.getValue(
        window.viewer.clock.currentTime
      );
      let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      transform = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation),
        center
      );
      window.viewer.camera.lookAtTransform(
        transform,
        new Cesium.Cartesian3(heading, pitch, roll)
      );
    },
    /**
     * Show the Whole Results
     * @param {*} e
     */
    showResults() {
      Bus.$emit("showResults");
    },
  },
};
</script>

<style scoped>
.perspectiveContainer {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
