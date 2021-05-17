/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

module.exports = () => {
  const mode = 'production';
  const { version, author, license } = pkg;

  const BANNER = [
    'TOAST UI Map Chart',
    `@version ${version} | ${new Date().toDateString()}`,
    `@author ${author}`,
    `@license ${license}`,
  ].join('\n');

  return {
    mode,
    entry: ['./src/index.ts'],
    output: {
      library: {
        export: 'default',
        type: 'commonjs2',
      },
      filename: `toastui-chart-shared.js`,
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/dist',
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: BANNER,
        entryOnly: true,
      }),
    ],
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
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true,
              warnings: true,
            },
          },
        }),
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@src': path.resolve(__dirname, 'src/'),
        '@t': path.resolve(__dirname, 'types/'),
      },
    },
  };
};
