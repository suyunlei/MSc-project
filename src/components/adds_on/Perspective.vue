<template>
  <div>
    <Popup
      ref="perspective"
      :title="title"
      left="calc(80% - 200px)"
      top="5%"
      @close="close"
    >
      <div class="perspectiveContainer">
        <el-row>
          <el-button type="primary" plain @click="ToGod">
            God Perspective
          </el-button>
          <el-button type="success" plain @click="ToFirstPerson">
            First-Person Perspective
          </el-button>
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
      title: "Perspective",
    };
  },
  mounted() {
    this.$refs.perspective.open();
    this.init();
  },
  methods: {
    init() {
      // Bus.$off("togod");
      // Bus.$on("togod", this.ToGod);
      // Bus.$off("tofirstperson");
      // Bus.$on("tofirstperson", this.ToFirstPerson);
    },
    open() {
      this.$refs.perspective.open();
    },
    close() {
      this.$refs.perspective.close();
    },
    // God Perspective
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
    // First-Person Perspective
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
