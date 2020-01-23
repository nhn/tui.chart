/* eslint no-process-env: 0 */
/**
 * Config file for testing
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
const webdriverConfig = {
  hostname: 'fe.nhnent.com',
  port: 4444,
  remoteHost: true
};
const es3ifyPlugin = require('es3ify-webpack-plugin');

module.exports = function(config) {
  const defaultConfig = {
    basePath: './',
    frameworks: ['jasmine'],
    files: ['test/index.js'],
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: '#inline-source-map',
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'istanbul-instrumenter',
            query: {
              esModules: true
            }
          },
          {
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'eslint-loader'
          }
        ],
        loaders: [
          {
            test: /\.less$/,
            loader: 'style-loader!css-loader!less-loader?paths=src/less/'
          },
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader?cacheDirectory'
          }
        ]
      },
      plugins: [new es3ifyPlugin()]
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
      IE9: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '9'
      },
      IE10: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '10'
      },
      IE11: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '11',
        platformName: 'windows'
      },
      Edge: {
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
      'IE9',
      'IE10',
      // 'IE11',
      // 'Edge',
      'Chrome-WebDriver',
      'Firefox-WebDriver'
      // 'Safari-WebDriver'
    ];

    defaultConfig.reporters = ['dots', 'coverage', 'junit'];

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
