import Vue from "vue";
import App from "./App.vue";
import less from "less";
import router from "./router/index";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css"; //element-ui css

// loading animation
import { Loading } from "element-ui";

Vue.config.productionTip = false;
Vue.use(less);
Vue.use(ElementUI);
Vue.use(router);
Vue.use(Loading);
Vue.use(Loading.directive);

Vue.prototype.openLoading = function () {
  const loading = this.$loading({
    lock: true,
    text: "Loading...",
    spinner: "el-icon-loading",
    fullscreen: true,
    background: "rgba(0, 0, 0, 0.7)",
    target: "#cesiumContainer",
    body: true,
    customClass: "mask",
  });
  setTimeout(function () {
    loading.close();
  }, 10000);
  return loading;
};

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
