const path = require("path");

const resolve = (dir) => {
  return path.join(__dirname, dir);
};

// 项目部署基础
// 默认情况下，我们假设你的应用将被部署在域的根目录下,
// 例如：https://www.my-app.com/
// 默认：'/'
// 如果您的应用程序部署在子路径中，则需要在这指定子路径
// 例如：https://www.foobar.com/my-app/
// 需要将它改为'/my-app/'
const BASE_URL = process.env.NODE_ENV === "production" ? "./" : "./";

module.exports = {
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'
  publicPath: BASE_URL,

  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: (config) => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@c", resolve("src/components"))
      .set("@api", resolve("src/api"))
      .set("@config", resolve("src/config"))
      .set("@tools", resolve("src/components/tools"))
      .set("@mixin", resolve("src/components/mixin"))
      .set("@map", resolve("src/components/map"))
      .set("@assets", resolve("src/assets"));
  },

  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  // 打包时不生成.map文件
  productionSourceMap: false,

  devServer: {
    open: true, // 自动打开浏览器
    // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
    proxy: "http://www.example.com/api",
    // Related: https://github.com/vuejs/vue-cli/issues/2051#issuecomment-449612956
    disableHostCheck: true,
  },

  pluginOptions: {
    // 'style-resources-loader': {
    //   preProcessor: 'less',
    //   patterns: [
    //     path.resolve(__dirname, 'src/style/custom.less') // global custom less file.
    //   ]
    // }
  },
  lintOnSave: false,
};
