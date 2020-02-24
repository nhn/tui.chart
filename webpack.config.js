/**
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 * @fileoverview webpack configuration file
 */
var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');
var SafeUmdPlugin = require('safe-umd-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var BUNDLE_PATH = path.join(__dirname, 'dist/');
var isProduction = process.argv.indexOf('--production') >= 0;
var isMinified = process.argv.indexOf('--minify') >= 0;

var isPolyfill = process.argv.indexOf('--polyfill') >= 0;
var isAlldepth = process.argv.indexOf('--alldepth') >= 0;
var isNodepth = process.argv.indexOf('--nodepth') >= 0;
var es3ifyPlugin = require('es3ify-webpack-plugin');

var FILENAME =
  pkg.name +
  (isAlldepth ? '-all' : '') +
  (isPolyfill ? '-polyfill' : '') +
  (isProduction && isMinified ? '.min' : '');

var FILENAME_CSS = pkg.name + (isProduction && isMinified ? '.min' : '');

module.exports = (function() {
  var readableTimestamp = new Date().toString();
  var BANNER = FILENAME + '\n' +
    '@fileoverview ' + pkg.name + '\n' +
    '@author ' + pkg.author + '\n' +
    '@version ' + pkg.version + '\n' +
    '@license ' + pkg.license + '\n' +
    '@link ' + pkg.repository.url + '\n' +
    'bundle created at "' + readableTimestamp + '"';

  // Basic setting
  var config = {
    eslint: {
      failOnError: isProduction
    },
    entry: ['./src/js/index.js'],
    debug: false,
    output: {
      library: ['tui', 'chart'],
      libraryTarget: 'umd',
      path: BUNDLE_PATH,
      publicPath: '/dist/',
      // We make minify file only in production build
      filename: FILENAME + '.js'
    },
    externals: {
      raphael: {
        commonjs: 'raphael',
        commonjs2: 'raphael',
        amd: 'raphael',
        root: 'Raphael'
      }
    },
    module: {
      preLoaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'eslint'
        }
      ],
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader?cacheDirectory'
        },
        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract('css-loader!less?paths=src/less/')
        }
      ]
    },
    plugins: [
      new SafeUmdPlugin(),
      new webpack.BannerPlugin(BANNER, { entryOnly: true }),
      new ExtractTextPlugin(FILENAME_CSS + '.css'),
      new es3ifyPlugin()
    ],
    cache: false
  };

  if (!isProduction) {
    // Dev server setting
    Object.assign(config, {
      devtool: '#inline-source-map',
      debug: true,
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
  } else if (isNodepth) {
    // default
    Object.assign(config, {
      entry: ['./src/js/index.js']
    });
  } else if (isAlldepth) {
    Object.assign(config, {
      entry: ['./src/js/indexPolyfill.js'],
      externals: {}
    });
  } else if (isPolyfill) {
    Object.assign(config, {
      entry: ['./src/js/indexPolyfill.js']
    });
  }

  if (isMinified) {
    config.plugins.unshift(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: false
        },
        output: {
          comments: false,
          screw_ie8: false
        },
        mangle: {
          screw_ie8: false
        }
      })
    );
  }

  return config;
})();
