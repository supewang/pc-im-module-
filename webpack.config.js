const TerserPlugin = require("terser-webpack-plugin"); // 引入压缩插件
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const copyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  //...
  mode: "none",
  entry: {
    imClass: {
      import: "./index.js",
      dependOn: "shared"
    },
    another: {}
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js", // 输出文件
    library: "imClass",
    libraryTarget: "umd",
    libraryExport: "default", // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
    globalObject: "this" // 兼容node和浏览器运行，避免window is not undefined情况
  },
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/
      })
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
    // new copyWebpackPlugin([
    //   {
    //     from: __dirname + "./README.md",
    //     to: "./README.md"
    //   }
    // ])
  ]
};
