<template>
  <transition name="el-fade-in-linear">
    <div
      class="popupBox"
      v-show="showBox"
      v-if="closeHidePage || showBox"
      :style="`top:${'70px'};${
        shadow ? 'pointer-events: all;background-color: rgba(0, 0, 0, 0.5)' : ''
      };`"
    >
      <div
        class="popupContainer"
        :style="`left:${left};top:${top};min-width:${width || ''}`"
        v-drag
      >
        <div class="popupTitle">
          <span>{{ title }}</span>
          <el-button-group>
            <el-button
              type="text"
              :icon="showContainer ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              :title="showContainer ? 'Collapse' : 'Open'"
              @click="showBody"
            ></el-button>
            <el-button
              type="text"
              icon="el-icon-close"
              title="Close"
              @click="close"
            ></el-button>
          </el-button-group>
        </div>
        <el-collapse-transition>
          <div v-show="showContainer">
            <div
              class="popupBody scrollbar"
              :style="`max-height:${maxHeight || '400px'}`"
            >
              <slot></slot>
            </div>
            <div class="popupBtn" v-if="showBtn">
              <el-button size="mini" @click="cancel">Cancel</el-button>
              <el-button type="primary" size="mini" @click="yes"
                >Confirm</el-button
              >
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Popup",
  components: {},
  props: [
    "title",
    "left",
    "top",
    "maxHeight",
    "width",
    "shadow",
    "closeHidePage",
    "showBtn",
  ],
  data() {
    return {
      // 是否显示弹窗
      showBox: false,
      // 是否显示内容
      showContainer: true,
    };
  },
  directives: {
    // 拖拽
    drag(el) {
      // 获取弹窗头部
      let popupTitle = el.querySelector(".popupTitle");
      // 添加鼠标按下事件
      popupTitle.onmousedown = function (e) {
        let disx = e.clientX - el.offsetLeft;
        let disy = e.clientY - el.offsetTop;
        let maxleft = el.parentElement.clientWidth - el.clientWidth;
        let maxTop = el.parentElement.clientHeight - el.clientHeight;
        document.onmousemove = function (e) {
          let left = e.clientX - disx;
          let top = e.clientY - disy;
          left < 0 && (left = 0);
          left > maxleft && (left = maxleft);
          top < 0 && (top = 0);
          top > maxTop && (top = maxTop);
          el.style.left = left + "px";
          el.style.top = top + "px";
        };
        document.onmouseup = function () {
          document.onmousemove = document.onmouseup = null;
        };
      };
    },
  },
  methods: {
    // 显示内容
    showBody() {
      this.showContainer = !this.showContainer;
    },
    // 关闭弹窗
    close() {
      this.showBox = false;
      this.$emit("close");
    },
    yes() {
      this.$emit("yes");
    },
    cancel() {
      this.$emit("cancel");
    },
    // 打开弹窗
    open() {
      this.showBox = true;
      this.$emit("open");
    },
  },
};
</script>

<style scoped lang="less">
.popupBox {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;

  .popupContainer {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(32, 160, 255, 0.6);
    border-radius: 5px;
    pointer-events: all;
    min-width: 323px;
    color: #fff;
    font-size: 18px;
    // font-family: 微软雅黑;

    .popupTitle {
      cursor: move;
      line-height: 40px;
      position: relative;

      span {
        margin-left: 15px;
      }

      .el-button-group {
        position: absolute;
        right: 0px;

        .el-button {
          color: #fff;
          font-size: 22px;
          padding: 8px;
        }
      }
    }
    .popupBody {
      border-top: 1px solid rgba(32, 160, 255, 0.3);
      padding: 5px;

      /deep/ .el-form {
        margin-right: 0;
        .el-form-item {
          padding-right: 20px;
        }
      }

      /deep/ .el-slider {
        padding: 0 10px;
      }

      /deep/ .el-input__icon {
        cursor: pointer;
      }

      /deep/ .nolabel-form-item {
        .el-form-item__content {
          margin-left: 0 !important;
        }
      }

      /deep/ .inline-form-item {
        display: inline-block;
        padding-right: 0 !important;

        .el-form-item__content {
          margin-left: 105px !important;
        }

        .el-color-picker {
          vertical-align: top;
        }

        & + & {
          margin-left: 25px;
        }
      }

      /deep/ .el-input-number {
        width: 100%;
      }

      /deep/ .el-form-item__label {
        color: #fff;
        font-size: 18px;
      }
    }

    /deep/ .scrollbar {
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 8px;
        /*高宽分别对应横竖滚动条的尺寸*/
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

    .popupBtn {
      text-align: right;
      border-top: 1px solid rgba(32, 160, 255, 0.3);
      padding: 5px;
    }
  }
}
</style>
