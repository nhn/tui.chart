/* eslint no-process-env: 0 */

'use strict';

var path = require('path');
var webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
};

module.exports = function(config) {
    var defaultConfig = {
        autoWatchBatchDelay: 100,
        basePath: '',
        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,
        captureTimeout: 100000,
        colors: true,
        coverageReporter: {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir: function(browser) {
                        return 'report-html/' + browser;
                    }
                },
                {
                    type: 'cobertura',
                    subdir: function(browser) {
                        return 'report-cobertura/' + browser;
                    },
                    file: 'cobertura.txt'
                }
            ]
        },
        exclude: [],
        files: [
            {
                pattern: 'lib/tui-code-snippet/code-snippet.js',
                watched: false
            },
            {
                pattern: 'lib/raphael/raphael.js',
                watched: false
            },

            'test/test.bundle.js'
        ],
        frameworks: ['jasmine'],
        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },
        logLevel: config.LOG_INFO,
        port: 9876,
        preprocessors: {
            'test/test.bundle.js': ['webpack', 'sourcemap']
        },
        webpack: {
            devtool: '#inline-source-map',
            resolve: {
                root: [path.resolve('./src/js')]
            },
            module: {
                loaders: [{
                    test: /\.less$/,
                    loader: 'css-loader!less?paths=src/less/'
                }]
            }
        },
        webpackMiddleware: {
            noInfo: true,
            stats: {
                colors: true
            }
        }
    };

    if (process.env.SERVER === 'ne') {
        defaultConfig.plugins = [
            'karma-jasmine',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-coverage',
            'karma-junit-reporter',
            'karma-webdriver-launcher'
        ];

        defaultConfig.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 8
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 9
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 10
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 11
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            }
        };

        defaultConfig.browsers = [
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver'
        ];

        defaultConfig.reporters = [
            'dots',
            'coverage',
            'junit'
        ];

        defaultConfig.singleRun = true;
        defaultConfig.autoWatch = false;
    } else {
        defaultConfig.plugins = [
            'karma-jasmine',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-chrome-launcher',
            'karma-narrow-reporter'
        ];
        defaultConfig.browsers = ['ChromeHeadless'];
        defaultConfig.reporters = ['narrow'];
        defaultConfig.singleRun = false;
        defaultConfig.autoWatch = true;
    }

    config.set(defaultConfig);
};
