/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { version, author, license } = require('./package.json');
const webpack = require('webpack');

module.exports = (env, { mode }) => ({
  entry: './src/index.ts',
  output: {
    filename: 'toastui-react-chart.js',
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'commonjs2' },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
        test: /\.(ts|tsx|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          envName: mode,
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
});
