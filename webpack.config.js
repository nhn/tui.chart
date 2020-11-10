/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  let config = {
    plugins: [new MiniCssExtractPlugin()],
    entry: ['@babel/polyfill', './src/index.ts'],
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
      usedExports: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'style-loader', 'css-loader'],
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
