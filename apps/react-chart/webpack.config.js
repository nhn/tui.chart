const path = require('path');
const { version, author, license } = require('./package.json');
const webpack = require('webpack');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-react-chart.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
    '@toast-ui/chart': {
      commonjs: '@toast-ui/chart',
      commonjs2: '@toast-ui/chart',
      amd: '@toast-ui/chart',
      root: ['toastui', 'Chart'],
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
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
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: [
        'TOAST UI Chart : React Wrapper',
        `@version ${version} | ${new Date().toDateString()}`,
        `@author ${author}`,
        `@license ${license}`,
      ].join('\n'),
    }),
  ],
};

module.exports = () => config;
