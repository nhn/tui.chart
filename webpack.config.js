/**
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @fileoverview webpack 설정파일
 */

'use strict';

var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ENTRY_PATH = './src/js/chart.js'

var isProduction = process.argv.indexOf('--production') >= 0;
var isMinified = process.argv.indexOf('--minify') >= 0;
var eslintLoader = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    configFile: './.eslintrc',
    loader: 'eslint'
};
var lessLoader = {
    test: /\.less$/,
    loader: ExtractTextPlugin.extract('css-loader!less?paths=src/less/')
};

module.exports = function() {
    var readableTimestamp = (new Date()).toString();
    var bannerText = '@fileoverview ' + pkg.name + '\n' +
        '@author ' + pkg.author + '\n' +
        '@version ' + pkg.version + '\n' +
        '@license ' + pkg.license + '\n' +
        '@link ' + pkg.repository.url + '\n' +
        'bundle created at "' + readableTimestamp + '"';
    var config = {
        entry: ENTRY_PATH,
        output: {
            path: path.join(__dirname, (isProduction ? 'dist' : 'build')),
            publicPath: '/dev/',
            filename: 'chart' + (isMinified ? '.min' : '') + '.js'
        },
        module: {
            preLoaders: [eslintLoader],
            loaders: [lessLoader]
        },
        plugins: [
            new ExtractTextPlugin('chart' + (isMinified ? '.min' : '') + '.css')
        ]
    };

    if (!isProduction) {
        config.devtool = '#inline-source-map';
        config.devServer = {
            host: '0.0.0.0',
            port: 8080,
            contentBase: __dirname
        };
    }

    if (isMinified) {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        }));
    }

    config.plugins.push(new webpack.BannerPlugin(bannerText, {entryOnly: true}));

    return config;

}();
