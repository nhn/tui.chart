/* eslint no-process-env: 0 */
/**
 * Config file for testing
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
};

module.exports = function(config) {
    var defaultConfig = {
        basePath: './',
        frameworks: [
            'jasmine'
        ],
        files: [
            'test/index.js'
        ],
        preprocessors: {
            'test/index.js': ['webpack', 'sourcemap']
        },
        webpack: {
            devtool: '#inline-source-map',
            module: {
                preLoaders: [{
                    test: /\.js$/,
                    exclude: /(test|bower_components|node_modules)/,
                    loader: 'istanbul-instrumenter'
                },
                {
                    test: /\.js$/,
                    exclude: /(bower_components|node_modules)/,
                    loader: 'eslint-loader'
                }],
                loaders: [{
                    test: /\.less$/,
                    loader: 'style-loader!css-loader!less-loader?paths=src/less/'
                }]
            }
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatchBatchDelay: 100,
        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,
        captureTimeout: 100000,
        webpackMiddleware: {
            noInfo: true,
            stats: {
                colors: true
            }
        }
    };

    if (process.env.KARMA_SERVER === 'ne') {
        defaultConfig.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '8'
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '9'
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '11'
            },
            'Edge': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'MicrosoftEdge'
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            },
            'Safari-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'safari'
            }
        };

        defaultConfig.browsers = [
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Edge',
            'Chrome-WebDriver',
            'Firefox-WebDriver',
            'Safari-WebDriver'
        ];

        defaultConfig.reporters = [
            'dots',
            'coverage',
            'junit'
        ];

        defaultConfig.coverageReporter = {
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
        };

        defaultConfig.junitReporter = {
            outputDir: 'report/junit',
            suite: ''
        };

        defaultConfig.singleRun = true;
        defaultConfig.autoWatch = false;
    } else {
        defaultConfig.plugins = [
            'karma-jasmine',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-narrow-reporter'
        ];
        defaultConfig.browsers = ['ChromeHeadless'];
        defaultConfig.reporters = ['narrow'];
        defaultConfig.singleRun = false;
        defaultConfig.autoWatch = true;
    }

    config.set(defaultConfig);
};
