/* eslint-disable */
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');
const { version, author, license } = require('./package.json');

module.exports = () => ({
  entry: './src/index.js',
  output: {
    filename: 'toastui-vue3-chart.js',
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'commonjs2' },
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      vue: '@vue/compat',
    },
  },
  externals: {
    '@toast-ui/chart': {
      commonjs: '@toast-ui/chart',
      commonjs2: '@toast-ui/chart',
      amd: '@toast-ui/chart',
      root: ['toastui', 'Chart'],
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.BannerPlugin({
      banner: [
        'TOAST UI Chart : Vue3 Wrapper',
        `@version ${version} | ${new Date().toDateString()}`,
        `@author ${author}`,
        `@license ${license}`,
      ].join('\n'),
    }),
  ],
});
