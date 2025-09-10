const {
  override,
  addWebpackResolve,
  addWebpackPlugin,
} = require("customize-cra");
const webpack = require("webpack");

module.exports = override(
  addWebpackResolve({
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
      vm: require.resolve("vm-browserify"),
      buffer: require.resolve("buffer"),
      util: require.resolve("util/"),
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
    },
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  )
);
