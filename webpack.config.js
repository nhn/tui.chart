/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require('./package.json');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const FILENAME = pkg.name + (isProduction ? '.min' : '');
  const BANNER = [
    'TOAST UI Chart 4th Edition',
    '@version ' + pkg.version + ' | ' + new Date().toDateString(),
    '@author ' + pkg.author,
    '@license ' + pkg.license
  ].join('\n');

  let config = {
    plugins: [new webpack.BannerPlugin({
      banner: BANNER,
      entryOnly: true
    })],
    entry: ['@babel/polyfill', './src/index.ts'],
    output: {
      library: ['tui', 'Chart'],
      libraryTarget: 'umd',
      libraryExport: 'default',
      filename: `${FILENAME}.js`,
      path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
      usedExports: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          // use: [MiniCssExtractPlugin.loader, 'style-loader', 'css-loader'],
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        '@src': path.resolve(__dirname, 'src/'),
        '@t': path.resolve(__dirname, 'types/'),
      },
    },
  };

  if (argv.mode === 'development') {
    config = {
      ...config,
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          title: 'Development',
          showErrors: true,
          template: 'index.html',
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
      },
      devtool: 'cheap-module-eval-source-map',
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
    };
  }

  return config;
};
