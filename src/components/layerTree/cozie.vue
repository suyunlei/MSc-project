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
        <p>Participant Panel</p>
        <el-tree
          :data="cozieData"
          empty-text="No Data"
          show-checkbox
          icon-class="el-icon-s-custom"
          @check-change="handleCheckChange"
          class="scrollbar"
          ref="cozieTree"
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
        <el-button type="primary" @click="submit">Submit</el-button>
        <!--还需要增加一个获取最新数值的按钮, 还不知道怎么放置-->
      </div>
    </Popup>
  </div>
</template>

<script>
import Bus from "@tools/Bus";
import Popup from "@tools/Popup";
import axios from "axios";

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
      time_start: "",
      time_end: "",
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

    handleCheckChange(data, checked) {},

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

    /**
     * @description: submit the data
     * @param {*}
     * @return {void}
     */
    submit() {
      let checkedNodes = this.$refs.cozieTree.getCheckedNodes(); //[{},{}]
      let start_day = this.time_start.split(" ")[0];
      let start_time = this.time_start.split(" ")[1];
      let end_day = this.time_end.split(" ")[0];
      let end_time = this.time_end.split(" ")[1];

      let start = start_day + "T" + start_time + "+08:00";
      let end = end_day + "T" + end_time + "+08:00";

      this.get_participant_data(checkedNodes, start, end);
    },

    /**
     * @description: Get data for one participant with start and end date
     * @param {Array[]} ids
     * @param {String} start
     * @param {String} end
     */
    get_participant_data(ids, start, end) {
      // loading animation
      const rLoading = this.openLoading();

      let requestCount = ids.length;

      // Add request interceptor
      axios.interceptors.request.use(
        function (config) {
          // Request starts, increment the request counter
          requestCount++;
          return config;
        },
        function (error) {
          return Promise.reject(error);
        }
      );

      // Add response interceptor
      axios.interceptors.response.use(
        function (response) {
          // Request ends, decrement the request counter
          requestCount--;
          // If the request counter is 0, it means all requests have completed, execute custom code
          if (requestCount === 0) {
            // Execute your code here
            console.log("All axios requests have completed");
            rLoading.close(); // Close the loading animation
          }
          return response;
        },
        function (error) {
          return Promise.reject(error);
        }
      );

      const url =
        "https://c3sclddcgcwy5tvzpfumcuggoa0unbuf.lambda-url.ap-southeast-1.on.aws/";

      ids.forEach((id) => {
        var data = {
          api_key: "bqXYG83JNPa2l2uCi2zXZp08xxx",
          id_experiment: "dev",
          id_participant: id.label,
          time_start: start,
          time_end: end,
        };

        axios
          .post(url, data)
          .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log("Body: ", res.data);

            // res.data might be empty
            if (!Array.isArray(res.data)) {
              console.log("res.data is not an array");
              return;
            }

            // if it's not empty, add the data to the viewer
            res.data.forEach((data) => {
              let lat = data.ws_latitude;
              let lon = data.ws_longitude;
              let height = data.ws_altitude;
              window.viewer.entities.add({
                name: "Participant",
                position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
                point: {
                  pixelSize: 10,
                  color: Cesium.Color.RED,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                },
                description: `
                              <div class="cesium-infoBox-description">
                                <table class="cesium-infoBox-defaultTable">
                                  <tbody>
                                    <tr>
                                      <th>q_location</th>
                                      <td>${data.q_location}</td>
                                    </tr>
                                    <tr>
                                      <th>acoustic_condition</th>
                                      <td>${data.acoustic_condition}</td>
                                    </tr>
                                    <tr>
                                      <th>q_thermal_condition</th>
                                      <td>${data.q_thermal_condition}</td>
                                    </tr>
                                    <tr>
                                      <th>q_visual_condition</th>
                                      <td>${data.q_visual_condition}</td>
                                    </tr>
                                    <tr>
                                      <th>q_air_quality_condition</th>
                                      <td>${data.q_air_quality_condition}</td>
                                    </tr>
                                    <tr>
                                      <th>general_comfort_condition</th>
                                      <td>${data.q_general_comfort_condition}</td>
                                    </tr>
                                    <tr>
                                `,
              });
            });
          })
          .catch((err) => {
            console.error(err);
          });
      });
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

  /deep/ .el-button {
    width: 100px;
    height: auto;
    margin: 0 10px;
    font-size: large;
  }

  .timeStamp {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    margin-left: 30px;
    margin-right: 30px;
  }

  .participant_panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    margin-left: 30px;
    margin-right: 30px;
  }
  .submit_btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
}
</style>
