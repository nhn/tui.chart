var wd = require('wd');
var urlparse = require('url').parse;
var urlformat = require('url').format;

var WebDriverInstance = function (baseBrowserDecorator, args, logger) {
  var log = logger.create('WebDriver');
  var os = require('os');
  var ip = require('ip');
  var self = this;

  var config = args.config || {
    hostname: '127.0.0.1',
    port: 4444,
    remoteHost: false
  };

  // Intialize with default values
  var spec = {
    browserName: args.browserName,
    version: args.version || '',
    platform: args.platform || 'ANY',
    platformName: args.platformName || '',
    platformVersion: args.platformVersion || '',
    deviceName: args.deviceName || '',
    tags: args.tags || [],
    name: args.testName || 'Karma test'
  };

  Object.keys(args).forEach(function (key) {
    var value = args[key];
    switch (key) {
    case 'browserName':
      break;
    case 'platform':
      break;
    case 'testName':
      break;
    case 'tags':
      break;
    case 'version':
      if (!isNaN(value)) {
        value = value + ''; // for use Selenium Grid 3.x.x, this field must be string.
      }
      break;
    case 'config':
      // ignore
      return;
    }
    spec[key] = value;
  });

  if (!spec.browserName) {
    throw new Error('browserName is required!');
  }

  baseBrowserDecorator(this);

  this.name = spec.browserName + spec.version + ' via Remote WebDriver';

  // Handle x-ua-compatible option same as karma-ie-launcher(copy&paste):
  //
  // Usage :
  //   customLaunchers: {
  //     IE9: {
  //       base: 'WebDriver',
  //       config: webdriverConfig,
  //       browserName: 'internet explorer',
  //       'x-ua-compatible': 'IE=EmulateIE9'
  //     }
  //   }
  //
  // This is done by passing the option on the url, in response the Karma server will
  // set the following meta in the page.
  //   <meta http-equiv="X-UA-Compatible" content="[VALUE]"/>
  function handleXUaCompatible(args, urlObj) {
    if (args['x-ua-compatible']) {
      urlObj.query['x-ua-compatible'] = args['x-ua-compatible'];
    }
  }

  this._start = function (url) {
    var urlObj = urlparse(url, true),
        ipAddr;

    handleXUaCompatible(spec, urlObj);

    delete urlObj.search; //url.format does not want search attribute
    url = urlformat(urlObj);

    if (config.remoteHost) {
        ipAddr = ip.address();
	    url = url.replace('localhost', ipAddr);
        log.debug('Remote host feature worked: ' + ipAddr);
    }

    log.debug('WebDriver config: ' + JSON.stringify(config));
    log.debug('Browser capabilities: ' + JSON.stringify(spec));

    self.driver = wd.remote(config, 'promiseChain');
    self.browser = self.driver.init(spec);

    var interval = args.pseudoActivityInterval && setInterval(function() {
      log.debug('Imitate activity');
      self.browser.title();
    }, args.pseudoActivityInterval);

    self.browser
        .get(url)
        .done();

    self._process = {
      kill: function() {
        interval && clearInterval(interval);
        self.driver.quit(function() {
          log.info('Killed "' + spec.browserName + spec.version + '" session.');
          self._onProcessExit(self.error ? -1 : 0, self.error);
        });
      }
    };
  };

  // We can't really force browser to quit so just avoid warning about SIGKILL
  this._onKillTimeout = function(){};
};

WebDriverInstance.prototype = {
  name: 'WebDriver',

  DEFAULT_CMD: {
    linux: require('wd').path,
    darwin: require('wd').path,
    win32: require('wd').path
  },
  ENV_CMD: 'WEBDRIVER_BIN'
};

WebDriverInstance.$inject = ['baseBrowserDecorator', 'args', 'logger'];

// PUBLISH DI MODULE
module.exports = {
  'launcher:WebDriver': ['type', WebDriverInstance]
};
