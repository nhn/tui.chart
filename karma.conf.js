// Karma configuration
// Generated on Thu Jun 11 2015 10:22:53 GMT+0900 (KST)

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
  var webdriverConfig = {
    hostname: '10.77.32.96',
    port: 4444,
    remoteHost: true
  };

  config.set({
    frameworks: [
      'browserify',
      'jasmine'
    ],
    reporters: [
      'dots',
      'coverage',
      'junit'
    ],
    browsers: [
      'IE7',
      'IE8',
      'IE9',
      'IE10',
      'IE11',
      'Chrome-WebDriver',
      'Firefox-WebDriver'
    ],
    singleRun: true,
    autoWatch: true,
    files: [
      'lib/tui-code-snippet/code-snippet.min.js',
      'lib/raphael/raphael-min.js',
      'src/js/**/*.js',
      'test/**/*.spec.js'
    ],
    exclude: [
      'src/js/code-snippet-util.js',
      'src/js/polyfill.js',
      'src/js/helpers/colorutil.js'
    ],
    preprocessors: {
      'src/js/**/*.js': ['browserify'],
      'test/**/*.spec.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [istanbul({
        ignore: ['**/test/**', '**/tmpl/**'],
        defaultIgnore: true
      }), 'stringify']
    },
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
    junitReporter: {
      outputFile: 'report/junit-result.xml',
      suite: ''
    },
    customLaunchers: {
      'IE7': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 7
      },
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
      },
      'Firefox-WebDriver': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'firefox'
      }
    }
  });
};
