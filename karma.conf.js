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

function setConfig(defaultConfig, type) {
  if (type === 'ne') {
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
      // 'IE9',
      'IE10',
      'IE11',
      'Edge',
      'Chrome-WebDriver',
      'Firefox-WebDriver'
      // 'Safari-WebDriver'
    ];
    defaultConfig.reporters.push('coverage');
    defaultConfig.reporters.push('junit');
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
  } else {
    defaultConfig.browsers = ['ChromeHeadless'];

    // @TODO: 흠?
    defaultConfig.plugins = [
      'karma-jasmine',
      'karma-webpack',
      'karma-sourcemap-loader',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-narrow-reporter'
    ];
    defaultConfig.reporters = ['narrow'];
  }
}

module.exports = function(config) {
  const defaultConfig = {
    basePath: './',
    frameworks: ['jasmine'],
    files: ['test/index.js'],
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },
    reporters: ['dots'],
    webpack: {
      mode: 'development',
      devtool: '#inline-source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'istanbul-instrumenter-loader',
            query: {
              esModules: true
            },
            enforce: 'pre'
          },
          {
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'eslint-loader',
            enforce: 'pre'
          },
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
    logLevel: config.LOG_INFO,
    autoWatchBatchDelay: 100,
    browserDisconnectTimeout: 60000,
    browserNoActivityTimeout: 60000,
    captureTimeout: 100000,
    colors: true,
    autoWatch: true,
    singleRun: true
  };

  setConfig(defaultConfig, process.env.KARMA_SERVER);
  config.set(defaultConfig);
};
