/**
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @fileoverview webpack configuration file
 */

'use strict';

var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');

var SafeUmdPlugin = require('safe-umd-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var BUNDLE_PATH = path.join(__dirname, 'dist/');

var isProduction = process.argv.indexOf('--production') >= 0;
var isMinified = process.argv.indexOf('--minify') >= 0;

var FILENAME = pkg.name + (isProduction && isMinified ? '.min' : '');

module.exports = (function() {
    var readableTimestamp = (new Date()).toString();
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
        entry: './src/js/index.js',
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
            'tui-code-snippet': {
                'commonjs': 'tui-code-snippet',
                'commonjs2': 'tui-code-snippet',
                'amd': 'tui-code-snippet',
                'root': ['tui', 'util']
            },
            'raphael': {
                'commonjs': 'raphael',
                'commonjs2': 'raphael',
                'amd': 'raphael',
                'root': 'Raphael'
            }
        },
        module: {
            preLoaders: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'eslint'
            }],
            loaders: [{
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css-loader!less?paths=src/less/')
            }]
        },
        plugins: [
            new SafeUmdPlugin(),
            new webpack.BannerPlugin(BANNER, {entryOnly: true}),
            new ExtractTextPlugin(FILENAME + '.css')
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
    }

    if (isMinified) {
        config.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                'screw_ie8': false
            },
            output: {
                comments: false,
                'screw_ie8': false
            },
            mangle: {
                'screw_ie8': false
            }
        }));
    }

    return config;
})();
