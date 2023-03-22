import Vue from "vue";
import App from "./App.vue";
import less from "less";
import router from "./router/index";
import ElementUI from "element-ui"; //element-ui的全部组件
import "element-ui/lib/theme-chalk/index.css"; //element-ui的css

Vue.config.productionTip = false;
Vue.use(less);
Vue.use(ElementUI); //使用elementUI
Vue.use(router);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app")