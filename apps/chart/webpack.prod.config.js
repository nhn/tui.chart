/* eslint-disable */
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const pkg = require('./package.json');

module.exports = (env, args) => {
  const { minify } = env;
  const { mode } = args;
  const { version, author, license } = pkg;

  const BANNER = [
    'TOAST UI Chart 4th Edition',
    `@version ${version} | ${new Date().toDateString()}`,
    `@author ${author}`,
    `@license ${license}`,
  ].join('\n');

  const productionConfig = {
    mode,
    plugins: [
      new MiniCssExtractPlugin({ filename: `toastui-chart${minify ? '.min' : ''}.css` }),
      new webpack.BannerPlugin({
        banner: BANNER,
        entryOnly: true,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: `../../report/webpack/stats-${pkg.version}.html`,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    optimization: {
      minimize: false,
    },
  };

  if (minify) {
    productionConfig.optimization = {
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
        new CssMinimizerPlugin(),
      ],
    };
  }

  return productionConfig;
};
