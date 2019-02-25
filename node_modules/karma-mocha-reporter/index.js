'use strict';

var chalk = require('chalk');
var symbols = require('log-symbols');
var stripAnsi = require('strip-ansi');

/**
 * The MochaReporter.
 *
 * @param {!object} baseReporterDecorator The karma base reporter.
 * @param {!Function} formatError The karma function to format an error.
 * @param {!object} config The karma config.
 * @constructor
 */
var MochaReporter = function (baseReporterDecorator, formatError, config) {
    // extend the base reporter
    baseReporterDecorator(this);

    var self = this;
    var firstRun = true;
    var isRunCompleted = false;
    var internalPrefix = '$%$';

    /**
     * Returns the text repeated n times.
     *
     * @param {!string} text The text.
     * @param {!number} n The number of times the string should be repeated.
     * @returns {string}
     */
    function repeatString(text, n) {
        var res = [];
        var i;

        for (i = 0; i < n; i++) {
            res.push(text);
        }

        return res.join('');
    }

    config.mochaReporter = config.mochaReporter || {};

    var outputMode = config.mochaReporter.output || 'full';
    var ignoreSkipped = config.mochaReporter.ignoreSkipped || false;
    var divider = config.mochaReporter.hasOwnProperty('divider') ? config.mochaReporter.divider : '=';
    divider = repeatString(divider || '', process.stdout.columns || 80);

    // disable chalk when colors is set to false
    chalk.enabled = config.colors !== false;

    // set color functions
    config.mochaReporter.colors = config.mochaReporter.colors || {};

    // set symbol functions
    config.mochaReporter.symbols = config.mochaReporter.symbols || {};

    // set diff output
    config.mochaReporter.showDiff = config.mochaReporter.showDiff || false;

    // print first successful result
    config.mochaReporter.printFirstSuccess = config.mochaReporter.printFirstSuccess || false;

    var colors = {
        success: {
            symbol: config.mochaReporter.symbols.success || stripAnsi(symbols.success),
            print: chalk[config.mochaReporter.colors.success] || chalk.green
        },
        info: {
            symbol: config.mochaReporter.symbols.info || stripAnsi(symbols.info),
            print: chalk[config.mochaReporter.colors.info] || chalk.grey
        },
        warning: {
            symbol: config.mochaReporter.symbols.warning || stripAnsi(symbols.warning),
            print: chalk[config.mochaReporter.colors.warning] || chalk.yellow
        },
        error: {
            symbol: config.mochaReporter.symbols.error || stripAnsi(symbols.error),
            print: chalk[config.mochaReporter.colors.error] || chalk.red
        }
    };

    // init max number of log lines
    config.mochaReporter.maxLogLines = config.mochaReporter.maxLogLines || 999;

    if (isNaN(config.mochaReporter.maxLogLines)) {
        self.write(colors.warning.print('Option "config.mochaReporter.maxLogLines" must be of type number. Default value 999 is used!'));
        config.mochaReporter.maxLogLines = 999;
    }

    // check if mocha is installed when showDiff is enabled
    if (config.mochaReporter.showDiff) {
        try {
            var mocha = require('mocha');
            var diff = require('diff');
        } catch (e) {
            self.write(colors.error.print('Error loading module mocha!\nYou have enabled diff output. That only works with karma-mocha and mocha installed!\nRun the following command in your command line:\n  npm install karma-mocha mocha diff\n'));
            return;
        }
    }

    function getLogSymbol(color) {
        return chalk.enabled ? color.print(color.symbol) : stripAnsi(color.symbol);
    }

    /**
     * Returns a unified diff between two strings.
     *
     * @param {Error} err with actual/expected
     * @return {string} The diff.
     */
    function unifiedDiff(err) {
        var indent = '      ';

        function cleanUp(line) {
            if (line[0] === '+') {
                return indent + colors.success.print(line);
            }
            if (line[0] === '-') {
                return indent + colors.error.print(line);
            }
            if (line.match(/\@\@/)) {
                return null;
            }
            if (line.match(/\\ No newline/)) {
                return null;
            }
            return indent + line;
        }

        function notBlank(line) {
            return line !== null;
        }

        var msg = diff.createPatch('string', err.actual, err.expected);
        var lines = msg.split('\n').splice(4);
        return '\n      ' +
            colors.success.print('+ expected') + ' ' +
            colors.error.print('- actual') +
            '\n\n' +
            lines.map(cleanUp).filter(notBlank).join('\n');
    }

    /**
     * Return a character diff for `err`.
     *
     * @param {Error} err
     * @param {string} type
     * @return {string}
     */
    function errorDiff(err, type) {
        var actual = err.actual;
        var expected = err.expected;
        return diff['diff' + type](actual, expected).map(function (str) {
            if (str.added) {
                return colors.success.print(str.value);
            }
            if (str.removed) {
                return colors.error.print(str.value);
            }
            return str.value;
        }).join('');
    }

    /**
     * Pad the given `str` to `len`.
     *
     * @param {string} str
     * @param {string} len
     * @return {string}
     */
    function pad(str, len) {
        str = String(str);
        return Array(len - str.length + 1).join(' ') + str;
    }

    /**
     * Returns an inline diff between 2 strings with coloured ANSI output
     *
     * @param {Error} err with actual/expected
     * @return {string} Diff
     */
    function inlineDiff(err) {
        var msg = errorDiff(err, 'WordsWithSpace');

        // linenos
        var lines = msg.split('\n');
        if (lines.length > 4) {
            var width = String(lines.length).length;
            msg = lines.map(function (str, i) {
                return pad(++i, width) + ' |' + ' ' + str;
            }).join('\n');
        }

        // legend
        msg = '\n' +
            colors.success.print('expected') +
            ' ' +
            colors.error.print('actual') +
            '\n\n' +
            msg +
            '\n';

        // indent
        msg = msg.replace(/^/gm, '      ');
        return msg;
    }

    /**
     * Returns a formatted time interval
     *
     * @param {!number} time The time.
     * @returns {string}
     */
    function formatTimeInterval(time) {
        var mins = Math.floor(time / 60000);
        var secs = (time - mins * 60000) / 1000;
        var str = secs + (secs === 1 ? ' sec' : ' secs');

        if (mins) {
            str = mins + (mins === 1 ? ' min ' : ' mins ') + str;
        }

        return str;
    }

    /**
     * Checks if all items are completed
     *
     * @param {object} items The item objects
     * @returns {boolean}
     */
    function allChildItemsAreCompleted(items) {
        var item;
        var isCompleted = true;

        Object.keys(items).forEach(function (key) {
            item = items[key];

            if (item.type === 'it') {
                isCompleted = isCompleted && item.isCompleted;
            } else if (item.items) {
                // recursive check of child items
                isCompleted = isCompleted && allChildItemsAreCompleted(item.items);
            }
        });

        return isCompleted;
    }

    /**
     * Prints a single item
     *
     * @param {!object} item The item to print
     * @param {number} depth The depth
     */
    function printItem(item, depth) {
        // only print to output once
        if (item.name && !item.printed && (!item.skipped || !ignoreSkipped)) {
            // only print it block when it was ran through all browsers
            if (item.type === 'it' && !item.isCompleted) {
                return;
            }

            // indent
            var line = repeatString('  ', depth) + item.name.replace(internalPrefix, '');

            // it block
            if (item.type === 'it') {
                if (item.skipped) {
                    // print skipped tests info
                    line = colors.info.print(stripAnsi(line) + ' (skipped)');
                } else {
                    // set color to success or error
                    line = item.success ? colors.success.print(line) : colors.error.print(line);
                }
            } else {
                // print name of a suite block in bold
                line = chalk.bold(line);
            }

            // use write method of baseReporter
            self.write(line + '\n');

            // set item as printed
            item.printed = true;
        }
    }

    /**
     * Writes the test results to the output
     *
     * @param {!object} suite The test suite
     * @param {number=} depth The indention.
     */
    function print(suite, depth) {
        var keys = Object.keys(suite);
        var length = keys.length;
        var i, item;

        for (i = 0; i < length; i++) {
            item = suite[keys[i]];

            // start of a new suite
            if (item.isRoot) {
                depth = 1;
            }

            if (item.items) {
                var allChildItemsCompleted = allChildItemsAreCompleted(item.items);

                if (allChildItemsCompleted) {
                    // print current item because all children are completed
                    printItem(item, depth);

                    // print all child items
                    print(item.items, depth + 1);
                }
            } else {
                // print current item which has no children
                printItem(item, depth);
            }
        }
    }

    /**
     * Writes the failed test to the output
     *
     * @param {!object} suite The test suite
     * @param {number=} depth The indention.
     */
    function printFailures(suite, depth) {
        var keys = Object.keys(suite);
        var length = keys.length;
        var i, item;

        for (i = 0; i < length; i++) {
            item = suite[keys[i]];

            // start of a new suite
            if (item.isRoot) {
                depth = 1;
            }

            // only print to output when test failed
            if (item.name && !item.success && !item.skipped) {
                // indent
                var line = repeatString('  ', depth) + item.name.replace(internalPrefix, '');

                // it block
                if (item.type === 'it') {
                    // make item name error
                    line = colors.error.print(line) + '\n';

                    // add all browser in which the test failed with color warning
                    for (var bi = 0; bi < item.failed.length; bi++) {
                        var browserName = item.failed[bi];
                        line += repeatString('  ', depth + 1) + chalk.italic(colors.warning.print(browserName)) + '\n';
                    }

                    // add the error log in error color
                    item.log = item.log || [];
                    var log = item.log.length ? item.log[0].split('\n') : [];
                    var linesToLog = config.mochaReporter.maxLogLines;
                    var ii = 0;

                    // set number of lines to output
                    if (log.length < linesToLog) {
                        linesToLog = log.length;
                    }

                    // print diff
                    if (config.mochaReporter.showDiff && item.assertionErrors && item.assertionErrors[0]) {
                        var errorMessage = log.splice(0, 1)[0];

                        // print error message before diff
                        line += colors.error.print(repeatString('  ', depth) + errorMessage + '\n');

                        var expected = item.assertionErrors[0].expected;
                        var actual = item.assertionErrors[0].actual;
                        var utils = mocha.utils;
                        var err = {
                            actual: actual,
                            expected: expected
                        };

                        if (String(err.actual).match(/^".*"$/) && String(err.expected).match(/^".*"$/)) {
                            try {
                                err.actual = JSON.parse(err.actual);
                                err.expected = JSON.parse(err.expected);
                            } catch (e) { }
                        }

                        // ensure that actual and expected are strings
                        if (!(utils.isString(actual) && utils.isString(expected))) {
                            err.actual = utils.stringify(actual);
                            err.expected = utils.stringify(expected);
                        }

                        // create diff
                        var diff = config.mochaReporter.showDiff === 'inline' ? inlineDiff(err) : unifiedDiff(err);

                        line += diff + '\n';

                        // print formatted stack trace after diff
                        for (ii; ii < linesToLog; ii++) {
                            line += colors.error.print(formatError(log[ii]));
                        }
                    } else {
                        for (ii; ii < linesToLog; ii++) {
                            line += colors.error.print(formatError(log[ii], repeatString('  ', depth)));
                        }
                    }
                }

                // use write method of baseReporter
                self.write(line + '\n');
            }

            if (item.items) {
                // print all child items
                printFailures(item.items, depth + 1);
            }
        }
    }

    /**
     * Returns a singularized or plularized noun for "test" based on test count
     *
     * @param {!Number} testCount
     * @returns {String}
     */
    function getTestNounFor(testCount) {
        if (testCount === 1) {
            return 'test';
        }
        return 'tests';
    }

    /**
     * Called each time a test is completed in a given browser.
     *
     * @param {!object} browser The current browser.
     * @param {!object} result The result of the test.
     */
    function specComplete(browser, result) {
        // complete path of the test
        var path = [].concat(result.suite, result.description);
        var maxDepth = path.length - 1;

        path.reduce(function (suite, description, depth) {
            // add prefix to description to prevent errors when the description is a reserved name (e.g. 'toString' or 'hasOwnProperty')
            description = internalPrefix + description;

            var item;

            if (suite.hasOwnProperty(description) && suite[description].type === 'it' && self.numberOfBrowsers === 1) {
                item = {};
                description += ' ';
            } else {
                item = suite[description] || {};
            }

            suite[description] = item;

            item.name = description;
            item.isRoot = depth === 0;
            item.type = 'describe';
            item.skipped = result.skipped;
            item.success = (item.success === undefined ? true : item.success) && result.success;

            // set item success to true when item is skipped
            if (item.skipped) {
                item.success = true;
            }

            // it block
            if (depth === maxDepth) {
                item.type = 'it';
                item.count = item.count || 0;
                item.count++;
                item.failed = item.failed || [];
                item.success = result.success && item.success;
                item.name = (item.success ? getLogSymbol(colors.success) : getLogSymbol(colors.error)) + ' ' + item.name;
                item.skipped = result.skipped;
                item.visited = item.visited || [];
                item.visited.push(browser.name);
                self.netTime += result.time;

                if (result.skipped) {
                    self.numberOfSkippedTests++;
                }

                if (result.success === false) {
                    // add browser to failed browsers array
                    item.failed.push(browser.name);

                    // add error log
                    item.log = result.log;

                    // add assertion errors if available (currently in karma-mocha)
                    item.assertionErrors = result.assertionErrors;
                }

                if (config.reportSlowerThan && result.time > config.reportSlowerThan) {
                    // add slow report warning
                    item.name += colors.warning.print((' (slow: ' + formatTimeInterval(result.time) + ')'));
                    self.numberOfSlowTests++;
                }

                if (item.count === self.numberOfBrowsers || config.mochaReporter.printFirstSuccess) {
                    item.isCompleted = true;

                    // print results to output when test was ran through all browsers
                    if (outputMode !== 'minimal') {
                        print(self.allResults, depth);
                    }
                }
            } else {
                item.items = item.items || {};
            }

            return item.items;
        }, self.allResults);
    }

    self.specSuccess = specComplete;
    self.specSkipped = specComplete;
    self.specFailure = specComplete;

    self.onSpecComplete = function (browser, result) {
        specComplete(browser, result);
    };

    self.onRunStart = function () {
        if (!firstRun && divider) {
            self.write('\n' + chalk.bold(divider) + '\n');
        }
        firstRun = false;
        isRunCompleted = false;

        self.write('\n' + chalk.underline.bold('START:') + '\n');
        self._browsers = [];
        self.allResults = {};
        self.totalTime = 0;
        self.netTime = 0;
        self.numberOfSlowTests = 0;
        self.numberOfSkippedTests = 0;
        self.numberOfBrowsers = (config.browsers || []).length || 1;
    };

    self.onBrowserStart = function (browser) {
        self._browsers.push(browser);
    };

    self.onRunComplete = function (browsers, results) {
        browsers.forEach(function (browser) {
            self.totalTime += browser.lastResult.totalTime;
        });

        // print extra error message for some special cases, e.g. when having the error "Some of your tests did a full page reload!" the onRunComplete() method is called twice
        if (results.error && isRunCompleted) {
            self.write('\n');
            self.write(getLogSymbol(colors.error) + colors.error.print(' Error while running the tests! Exit code: ' + results.exitCode));
            self.write('\n\n');
            return;
        }

        isRunCompleted = true;

        self.write('\n' + colors.success.print('Finished in ' + formatTimeInterval(self.totalTime) + ' / ' +
            formatTimeInterval(self.netTime) + ' @ ' + new Date().toTimeString()));
        self.write('\n\n');

        if (browsers.length > 0 && !results.disconnected) {
            self.write(chalk.underline.bold('SUMMARY:') + '\n');
            self.write(colors.success.print(getLogSymbol(colors.success) + ' ' + results.success + ' ' + getTestNounFor(results.success) + ' completed'));
            self.write('\n');

            if (self.numberOfSkippedTests > 0) {
                self.write(colors.info.print(getLogSymbol(colors.info) + ' ' + self.numberOfSkippedTests + ' ' + getTestNounFor(self.numberOfSkippedTests) + ' skipped'));
                self.write('\n');
            }

            if (self.numberOfSlowTests > 0) {
                self.write(colors.warning.print(getLogSymbol(colors.warning) + ' ' + self.numberOfSlowTests + ' ' + getTestNounFor(self.numberOfSlowTests) + ' slow'));
                self.write('\n');
            }

            if (results.failed) {
                self.write(colors.error.print(getLogSymbol(colors.error) + ' ' + results.failed + ' ' + getTestNounFor(results.failed) + ' failed'));
                self.write('\n');

                if (outputMode !== 'noFailures') {
                    self.write('\n' + chalk.underline.bold('FAILED TESTS:') + '\n');
                    printFailures(self.allResults);
                }
            }
        }

        if (outputMode === 'autowatch') {
            outputMode = 'minimal';
        }
    };
};

// inject karma runner baseReporter and config
MochaReporter.$inject = ['baseReporterDecorator', 'formatError', 'config'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:mocha': ['type', MochaReporter]
};
