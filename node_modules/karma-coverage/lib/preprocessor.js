// Coverage Preprocessor
// =====================
//
// Depends on the the reporter to generate an actual report

// Dependencies
// ------------

var istanbul = require('istanbul')
var minimatch = require('minimatch')
var path = require('path')
var _ = require('lodash')
var SourceMapConsumer = require('source-map').SourceMapConsumer
var SourceMapGenerator = require('source-map').SourceMapGenerator
var globalSourceCache = require('./source-cache')
var extend = require('util')._extend
var coverageMap = require('./coverage-map')

// Regexes
// -------

var coverageObjRegex = /\{.*"path".*"fnMap".*"statementMap".*"branchMap".*\}/g

// Preprocessor creator function
function createCoveragePreprocessor (logger, helper, basePath, reporters, coverageReporter) {
  var log = logger.create('preprocessor.coverage')

  // Options
  // -------

  var instrumenterOverrides = {}
  var instrumenters = {istanbul: istanbul}
  var includeAllSources = false
  var useJSExtensionForCoffeeScript = false

  if (coverageReporter) {
    instrumenterOverrides = coverageReporter.instrumenter
    instrumenters = extend({istanbul: istanbul}, coverageReporter.instrumenters)
    includeAllSources = coverageReporter.includeAllSources === true
    useJSExtensionForCoffeeScript = coverageReporter.useJSExtensionForCoffeeScript === true
  }

  var sourceCache = globalSourceCache.get(basePath)

  var instrumentersOptions = _.reduce(instrumenters, function getInstumenterOptions (memo, instrument, name) {
    memo[name] = {}

    if (coverageReporter && coverageReporter.instrumenterOptions) {
      memo[name] = coverageReporter.instrumenterOptions[name]
    }

    return memo
  }, {})

  // if coverage reporter is not used, do not preprocess the files
  if (!_.includes(reporters, 'coverage')) {
    return function (content, _, done) {
      done(content)
    }
  }

  // check instrumenter override requests
  function checkInstrumenters () {
    return _.reduce(instrumenterOverrides, function (acc, literal, pattern) {
      if (!_.includes(_.keys(instrumenters), String(literal))) {
        log.error('Unknown instrumenter: %s', literal)
        return false
      }
      return acc
    }, true)
  }

  if (!checkInstrumenters()) {
    return function (content, _, done) {
      return done(1)
    }
  }

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath)

    var jsPath = path.resolve(file.originalPath)
    // default instrumenters
    var instrumenterLiteral = 'istanbul'

    _.forEach(instrumenterOverrides, function (literal, pattern) {
      if (minimatch(file.originalPath, pattern, {dot: true})) {
        instrumenterLiteral = String(literal)
      }
    })

    var InstrumenterConstructor = instrumenters[instrumenterLiteral].Instrumenter
    var constructOptions = instrumentersOptions[instrumenterLiteral] || {}
    var codeGenerationOptions = null

    if (file.sourceMap) {
      log.debug('Enabling source map generation for "%s".', file.originalPath)
      codeGenerationOptions = extend({
        format: {
          compact: !constructOptions.noCompact
        },
        sourceMap: file.sourceMap.file,
        sourceMapWithCode: true,
        file: file.path
      }, constructOptions.codeGenerationOptions || {})
    }

    var options = extend({}, constructOptions)
    options = extend(options, {codeGenerationOptions: codeGenerationOptions})

    var instrumenter = new InstrumenterConstructor(options)
    instrumenter.instrument(content, jsPath, function (err, instrumentedCode) {
      if (err) {
        log.error('%s\n  at %s', err.message, file.originalPath)
        done(err.message)
      } else {
        if (file.sourceMap && instrumenter.lastSourceMap()) {
          log.debug('Adding source map to instrumented file for "%s".', file.originalPath)
          var generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(instrumenter.lastSourceMap().toString()))
          generator.applySourceMap(new SourceMapConsumer(file.sourceMap))
          file.sourceMap = JSON.parse(generator.toString())
          instrumentedCode += '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,'
          instrumentedCode += new Buffer(JSON.stringify(file.sourceMap)).toString('base64') + '\n'
        }

        // remember the actual immediate instrumented JS for given original path
        sourceCache[jsPath] = content

        if (includeAllSources) {
          // reset stateful regex
          coverageObjRegex.lastIndex = 0

          var coverageObjMatch = coverageObjRegex.exec(instrumentedCode)

          if (coverageObjMatch !== null) {
            var coverageObj = JSON.parse(coverageObjMatch[0])

            coverageMap.add(coverageObj)
          }
        }

        // RequireJS expects JavaScript files to end with `.js`
        if (useJSExtensionForCoffeeScript && instrumenterLiteral === 'ibrik') {
          file.path = file.path.replace(/\.coffee$/, '.js')
        }

        done(instrumentedCode)
      }
    })
  }
}

createCoveragePreprocessor.$inject = [
  'logger',
  'helper',
  'config.basePath',
  'config.reporters',
  'config.coverageReporter'
]

module.exports = createCoveragePreprocessor
