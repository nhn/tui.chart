# karma-junit-reporter

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/karma-runner/karma-junit-reporter)
 [![npm version](https://img.shields.io/npm/v/karma-junit-reporter.svg?style=flat-square)](https://www.npmjs.com/package/karma-junit-reporter) [![npm downloads](https://img.shields.io/npm/dm/karma-junit-reporter.svg?style=flat-square)](https://www.npmjs.com/package/karma-junit-reporter)

[![Build Status](https://img.shields.io/travis/karma-runner/karma-junit-reporter/master.svg?style=flat-square)](https://travis-ci.org/karma-runner/karma-junit-reporter) [![Dependency Status](https://img.shields.io/david/karma-runner/karma-junit-reporter.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-junit-reporter) [![devDependency Status](https://img.shields.io/david/dev/karma-runner/karma-junit-reporter.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-junit-reporter#info=devDependencies)

> Reporter for the JUnit XML format.

## Installation

The easiest way is to keep `karma-junit-reporter` as a devDependency in your `package.json`. Just run

```bash
npm install karma-junit-reporter --save-dev
```

to let npm automatically add it there.

## Configuration

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['progress', 'junit'],

    // the default configuration
    junitReporter: {
      outputDir: '', // results will be saved as $outputDir/$browserName.xml
      outputFile: undefined, // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: true, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {} // key value pair of properties to add to the <properties> section of the report
    }
  });
};
```

You can pass list of reporters as a CLI argument too:
```bash
karma start --reporters junit,dots
```

## Produce test result with schema acceptable in sonar

To make this possible, it's required to make the classnames of each tests to match its file name.

For Example:
```js
describe('analytics.AnalyticsModule_test', function(){

    var analytics;
    beforeEach(module('ECApp'));
    beforeEach(module('angularytics'));
    beforeEach(module('AnalyticsModule'));
...
```

should have a file name AnalyticsModule_test.js

This will produce test result with schema acceptable in sonar.

Grunt file reporters property example:
```js
reporters: ['junit', 'coverage', 'progress'],
junitReporter: {
    outputDir: $junitResults,
    suite: 'models'
},
coverageReporter: {
    type: 'lcov',
    dir: $coverageOutputDir,
    subdir: '.'
},
preprocessors: {
    'src/main/webapp/public/js/ec3.3/**/*.js': 'coverage',
    'src/main/webapp/public/js/ec3/**/*.js': 'coverage'
},
plugins: [
    'karma-jasmine',
    'karma-phantomjs-launcher',
    'ec-karma-junit-reporter23',
    'karma-coverage'
]
```

Sonar property example:
```js
sonar.projectName=js
sonar.sources=site-main-php/src/main/webapp/public/js
sonar.projectBaseDir=.
sonar.exclusions=site-main-php/src/main/webapp/public/js/lib/*.js,site-main-php/src/main/webapp/public/js/tests/**/*.php,site-main-php/src/main/webapp/public/js/tests/**/*.js,site-main-php/src/main/webapp/public/js/ec3.3/vendor/**
sonar.javascript.lcov.reportPath=site-main-php/target/coverage/lcov.info
sonar.javascript.jstestdriver.reportsPath=site-main-php/target/surefire-reports/
sonar.tests=site-main-php/src/main/webapp/public/js/tests
```

Example junit xml report:
```xml
<?xml version="1.0"?>
<testsuite name="PhantomJS 1.9.8 (Linux)" package="models" timestamp="2015-03-10T13:59:23" id="0" hostname="admin" tests="629" errors="0" failures="0" time="11.452">
  <properties>
    <property name="browser.fullName" value="Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34"/>
  </properties>
 <testcase name="(C.2) Checks if an empty object is returned when error 404 is encountered" time="0.01" classname="PhantomJS_1_9_8_(Linux).models.AnalyticsModule_test"/>
 <testcase name="(C.3) Checks if an empty array is returned when error 405 is encountered" time="0.013" classname="PhantomJS_1_9_8_(Linux).models.AnalyticsModule_test"/>
</testsuite>
...
```
----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
