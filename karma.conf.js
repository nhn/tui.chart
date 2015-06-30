// Karma configuration
// Generated on Thu Jun 11 2015 10:22:53 GMT+0900 (KST)

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
  var webdriverConfig = {
    hostname: 'fe.nhnent.com',
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
      'IE8',
      'IE9',
      'IE10',
      'IE11',
      'Chrome-WebDriver',
      'Firefox-WebDriver'
    ],
    singleRun: false,
    autoWatch: true,
    files: [
      'lib/raphael-min.js',
      'src/js/**/*.js',
      { pattern: 'test/fixtures/**/*', included: false },
      'test/**/*.spec.js'
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
      'IE8': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'IE8'
      },
      'IE9': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'IE9'
      },
      'IE10': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'IE10'
      },
      'IE11': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'IE11'
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
