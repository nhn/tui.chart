module.exports = function (karma) {

  var webdriverConfig = {
    hostname: 'ondemand.saucelabs.com',
    port: 80,
    user: 'USERNAME',
    pwd: 'APIKEY'
  }

  config.set({
    basePath: './',
    frameworks: ["jasmine"],
    reporters: ['progress'],
    logLevel: karma.LOG_INFO,
    customLaunchers: {
      'firefox': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'firefox',
        name: 'Karma'
      }
    },
    browsers: ['firefox'],
    files: [
      "tests/*.spec.js"
    ],
    singleRun: true
  });
}
