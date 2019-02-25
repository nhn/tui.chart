module.exports = (config) ->
  config.set
    frameworks: ['mocha', 'requirejs']

    files: [
      # We do not want any files to execute automatically
      {pattern: 'calculator.coffee', included: false}
      {pattern: 'test.coffee', included: false}

      # Except for this one. This one shall execute.
      'requirejs.karma.coffee'
    ]

    browsers: ['Firefox']

    coffeePreprocessor:
      options:
        sourceMap: true

    preprocessors:
      # source files, that you wanna generate coverage for
      # do not include tests or libraries
      # (these files will be instrumented by Istanbul via Ibrik unless
      # specified otherwise in coverageReporter.instrumenter)
      'calculator.coffee': 'coverage'

      # note: project files will already be converted to
      # JavaScript via coverage preprocessor.
      # Thus, you'll have to limit the CoffeeScript preprocessor
      # to uncovered files.
      'test.coffee': 'coffee'
      'requirejs.karma.coffee': 'coffee'

    coverageReporter:
      type: 'text-summary'
      useJSExtensionForCoffeeScript: true
      instrumenters:
        ibrik : require('ibrik')
      instrumenter:
        '**/*.coffee': 'ibrik'

    # coverage reporter generates the coverage
    reporters: ['dots', 'coverage']

    plugins: [
      require('../../lib/index')
      'karma-mocha'
      'karma-requirejs'
      'karma-coffee-preprocessor'
      'karma-firefox-launcher'
    ]

    singleRun: true
