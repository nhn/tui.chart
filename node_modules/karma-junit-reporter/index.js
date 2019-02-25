var os = require('os')
var path = require('path')
var fs = require('fs')
var builder = require('xmlbuilder')
var pathIsAbsolute = require('path-is-absolute')

// concatenate test suite(s) and test description by default
function defaultNameFormatter (browser, result) {
  return result.suite.join(' ') + ' ' + result.description
}

var JUnitReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
  var log = logger.create('reporter.junit')
  var reporterConfig = config.junitReporter || {}
  var pkgName = reporterConfig.suite || ''
  var outputDir = reporterConfig.outputDir
  var outputFile = reporterConfig.outputFile
  var useBrowserName = reporterConfig.useBrowserName
  var nameFormatter = reporterConfig.nameFormatter || defaultNameFormatter
  var classNameFormatter = reporterConfig.classNameFormatter
  var properties = reporterConfig.properties

  var suites = []
  var pendingFileWritings = 0
  var fileWritingFinished = function () {}
  var allMessages = []

  if (outputDir == null) {
    outputDir = '.'
  }

  outputDir = helper.normalizeWinPath(path.resolve(config.basePath, outputDir)) + path.sep

  if (typeof useBrowserName === 'undefined') {
    useBrowserName = true
  }

  baseReporterDecorator(this)

  this.adapters = [
    function (msg) {
      allMessages.push(msg)
    }
  ]

  var initializeXmlForBrowser = function (browser) {
    var timestamp = (new Date()).toISOString().substr(0, 19)
    var suite = suites[browser.id] = builder.create('testsuite')
    suite.att('name', browser.name)
      .att('package', pkgName)
      .att('timestamp', timestamp)
      .att('id', 0)
      .att('hostname', os.hostname())

    var propertiesElement = suite.ele('properties')
    propertiesElement.ele('property', {name: 'browser.fullName', value: browser.fullName})

    // add additional properties passed in through the config
    for (var property in properties) {
      if (properties.hasOwnProperty(property)) {
        propertiesElement.ele('property', {name: property, value: properties[property]})
      }
    }
  }

  var writeXmlForBrowser = function (browser) {
    var safeBrowserName = browser.name.replace(/ /g, '_')
    var newOutputFile
    if (outputFile && pathIsAbsolute(outputFile)) {
      newOutputFile = outputFile
    } else if (outputFile != null) {
      var dir = useBrowserName ? path.join(outputDir, safeBrowserName)
                               : outputDir
      newOutputFile = path.join(dir, outputFile)
    } else if (useBrowserName) {
      newOutputFile = path.join(outputDir, 'TESTS-' + safeBrowserName + '.xml')
    } else {
      newOutputFile = path.join(outputDir, 'TESTS.xml')
    }

    var xmlToOutput = suites[browser.id]
    if (!xmlToOutput) {
      return // don't die if browser didn't start
    }

    pendingFileWritings++
    helper.mkdirIfNotExists(path.dirname(newOutputFile), function () {
      fs.writeFile(newOutputFile, xmlToOutput.end({pretty: true}), function (err) {
        if (err) {
          log.warn('Cannot write JUnit xml\n\t' + err.message)
        } else {
          log.debug('JUnit results written to "%s".', newOutputFile)
        }

        if (!--pendingFileWritings) {
          fileWritingFinished()
        }
      })
    })
  }

  var getClassName = function (browser, result) {
    var browserName = browser.name.replace(/ /g, '_').replace(/\./g, '_') + '.'

    return (useBrowserName ? browserName : '') + (pkgName ? pkgName + '.' : '') + result.suite[0]
  }

  // "run_start" - a test run is beginning for all browsers
  this.onRunStart = function (browsers) {
    // TODO(vojta): remove once we don't care about Karma 0.10
    browsers.forEach(initializeXmlForBrowser)
  }

  // "browser_start" - a test run is beginning in _this_ browser
  this.onBrowserStart = function (browser) {
    initializeXmlForBrowser(browser)
  }

  // "browser_complete" - a test run has completed in _this_ browser
  this.onBrowserComplete = function (browser) {
    var suite = suites[browser.id]
    var result = browser.lastResult
    if (!suite || !result) {
      return // don't die if browser didn't start
    }

    suite.att('tests', result.total ? result.total : 0)
    suite.att('errors', result.disconnected || result.error ? 1 : 0)
    suite.att('failures', result.failed ? result.failed : 0)
    suite.att('time', (result.netTime || 0) / 1000)

    suite.ele('system-out').dat(allMessages.join() + '\n')
    suite.ele('system-err')

    writeXmlForBrowser(browser)

    // Release memory held by the test suite.
    suites[browser.id] = null
  }

  // "run_complete" - a test run has completed on all browsers
  this.onRunComplete = function () {
    allMessages.length = 0
  }

  this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
    var testsuite = suites[browser.id]

    if (!testsuite) {
      return
    }

    var spec = testsuite.ele('testcase', {
      name: nameFormatter(browser, result),
      time: ((result.time || 0) / 1000),
      classname: (typeof classNameFormatter === 'function' ? classNameFormatter : getClassName)(browser, result)
    })

    if (result.skipped) {
      spec.ele('skipped')
    }

    if (!result.success) {
      result.log.forEach(function (err) {
        spec.ele('failure', {type: ''}, formatError(err))
      })
    }
  }

  // wait for writing all the xml files, before exiting
  this.onExit = function (done) {
    if (pendingFileWritings) {
      fileWritingFinished = done
    } else {
      done()
    }
  }
}

JUnitReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError']

// PUBLISH DI MODULE
module.exports = {
  'reporter:junit': ['type', JUnitReporter]
}
