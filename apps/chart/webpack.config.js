/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const pkg = require('./package.json');

const commonConfig = {
  entry: ['./src/css/chart.css', './src/index.ts'],
  output: {
    library: ['toastui', 'Chart'],
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
      '@t': path.resolve(__dirname, 'types/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
};

module.exports = (env, { mode, minify, polyfill }) => {
  const isProduction = mode === 'production';
  const { version, author, license } = pkg;

  commonConfig.output.filename = `toastui-chart${polyfill ? '-polyfill' : ''}${
    minify ? '.min' : ''
  }.js`;

  const BANNER = [
    'TOAST UI Chart 4th Edition',
    `@version ${version} | ${new Date().toDateString()}`,
    `@author ${author}`,
    `@license ${license}`,
  ].join('\n');

  commonConfig.module.rules[0].options = {
    envName: polyfill ? 'polyfill' : mode,
  };

  if (isProduction) {
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
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // eslint-disable-line camelcase
                warnings: true,
              },
              output: {
                comments: /TOAST UI Chart/i,
              },
            },
          }),
          new CssMinimizerPlugin(),
        ],
      };
    }

    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, {
    mode,
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        title: 'Development',
        showErrors: true,
      }),
    ],
    devServer: {
      hot: true,
      open: 'Google Chrome',
      overlay: {
        warnings: true,
        errors: true,
      },
      clientLogLevel: 'debug',
      stats: {
        color: true,
      },
      contentBase: __dirname,
      host: '0.0.0.0',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
        },
      ],
    },
    devtool: 'eval-source-map',
  });
};
