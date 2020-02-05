/**
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 * @fileoverview webpack configuration file
 */
var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');
var SafeUmdPlugin = require('safe-umd-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var es3ifyPlugin = require('es3ify-webpack-plugin');
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

function getOptimization(isMinified) {
  if (isMinified) {
    return {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          extractComments: false
        }),
        new OptimizeCSSAssetsPlugin()
      ]
    };
  }

  return {
    minimize: false
  };
}

module.exports = function(env, argv) {
  var readableTimestamp = new Date().toString();
  var isProduction = argv.mode === 'production';
  var isMinified = !!argv.minify;
  var isBabelPolyfill = !!argv.babelpolyfill;
  var isAllDepth = !!argv.alldepth;
  var isNoDepth = !!argv.nodepth;
  var FILENAME =
    pkg.name +
    (isAllDepth ? '-all' : '') +
    (isBabelPolyfill ? '-polyfill' : '') +
    (isProduction && isMinified ? '.min' : '');

  var FILENAME_CSS = pkg.name + (isProduction && isMinified ? '.min' : '');

  var BANNER = FILENAME + '\n' +
    '@fileoverview ' + pkg.name + '\n' +
    '@author ' + pkg.author + '\n' +
    '@version ' + pkg.version + '\n' +
    '@license ' + pkg.license + '\n' +
    '@link ' + pkg.repository.url + '\n' +
    'bundle created at "' + readableTimestamp + '"';

  var config = {
    entry: ['./src/js/index.js'],
    output: {
      library: ['tui', 'chart'],
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/dist/',
      filename: FILENAME + '.js'
    },
    externals: {
      'tui-code-snippet': {
        commonjs: 'tui-code-snippet',
        commonjs2: 'tui-code-snippet',
        amd: 'tui-code-snippet',
        root: ['tui', 'util']
      },
      raphael: {
        commonjs: 'raphael',
        commonjs2: 'raphael',
        amd: 'raphael',
        root: 'Raphael'
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'eslint-loader',
          enforce: 'pre',
          options: {
            failOnError: isProduction
          }
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader?cacheDirectory'
        },
        {
          test: /\.less$/,
          loader: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
        }
      ]
    },
    plugins: [
      new SafeUmdPlugin(),
      new webpack.BannerPlugin({ banner:BANNER, entryOnly: true }),
      new MiniCssExtractPlugin({ filename: FILENAME_CSS + '.css' }),
      new es3ifyPlugin()
    ],
    cache: false,
    optimization: getOptimization(isMinified)
  };

  if (!isProduction) {
    Object.assign(config, {
      devtool: '#inline-source-map',
      devServer: {
        host: '0.0.0.0',
        port: 8080,
        contentBase: __dirname,
        noInfo: true,
        quiet: false,
        stats: {
          colors: true
        },
        disableHostCheck: true
      }
    });
  } else if (isNoDepth) {
    // default
    Object.assign(config, {
      entry: ['./src/js/index.js']
    });
  } else if (isAllDepth) {
    Object.assign(config, {
      entry: ['babel-polyfill', './src/js/index.js'],
      externals: {}
    });
  } else if (isBabelPolyfill) {
    Object.assign(config, {
      entry: ['babel-polyfill', './src/js/index.js']
    });
  }

  return config;
};
