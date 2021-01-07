const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const { version, author, license } = require('./package.json');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-vue-chart.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'toastui',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
    },
  },
  externals: {
    'tui-chart': {
      commonjs: 'tui-chart',
      commonjs2: 'tui-chart',
      amd: 'tui-chart',
      root: ['tui', 'chart'],
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: ['@babel/preset-env'],
          // },
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.BannerPlugin({
      banner: [
        'TOAST UI Chart : Vue Wrapper',
        `@version ${version} | ${new Date().toDateString()}`,
        `@author ${author}`,
        `@license ${license}`,
      ].join('\n'),
    }),
    new ESLintPlugin(),
  ],
};
