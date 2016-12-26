/**
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @fileoverview webpack 설정파일
 */

'use strict';

var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ENTRY_PATH = './src/js/chart.js';
var BUNDLE_PATH = path.join(__dirname, 'dist/');
var BUNDLE_FILENAME = 'chart';

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

module.exports = (function() {
    var readableTimestamp = (new Date()).toString();
    var bannerText = '@fileoverview ' + pkg.name + '\n' +
        '@author ' + pkg.author + '\n' +
        '@version ' + pkg.version + '\n' +
        '@license ' + pkg.license + '\n' +
        '@link ' + pkg.repository.url + '\n' +
        'bundle created at "' + readableTimestamp + '"';

    // Basic setting
    var config = {
        entry: ENTRY_PATH,
        debug: false,
        output: {
            path: BUNDLE_PATH,
            publicPath: '/dist/',
            // We make minify file only in production build
            // 개발 테스트시에 서비스 코드의 수정없이 미니파이된 파일도 테스트 할수 있게 하기위해 미니 파일 파일은 프로덕션 빌드에서만 만든다
            filename: BUNDLE_FILENAME + (isProduction && isMinified ? '.min' : '') + '.js'
        },
        module: {
            preLoaders: [],
            loaders: [lessLoader]
        },
        plugins: [
            new ExtractTextPlugin(BUNDLE_FILENAME + (isProduction && isMinified ? '.min' : '') + '.css')
        ],
        cache: false
    };

    if (isProduction) {
        // Production setting
        config.module.preLoaders = [eslintLoader];
        config.eslint = {
            failOnError: true
        };
    } else {
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
                }
            }
        });
    }

    if (isMinified) {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        }));
    }

    config.plugins.push(new webpack.BannerPlugin(bannerText, {entryOnly: true}));

    return config;
})();
