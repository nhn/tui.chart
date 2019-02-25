'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _preProcessPattern = require('./preProcessPattern');

var _preProcessPattern2 = _interopRequireDefault(_preProcessPattern);

var _processPattern = require('./processPattern');

var _processPattern2 = _interopRequireDefault(_processPattern);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CopyWebpackPlugin() {
    var patterns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!Array.isArray(patterns)) {
        throw new Error('[copy-webpack-plugin] patterns must be an array');
    }

    // Defaults debug level to 'warning'
    options.debug = options.debug || 'warning';

    // Defaults debugging to info if only true is specified
    if (options.debug === true) {
        options.debug = 'info';
    }

    var debugLevels = ['warning', 'info', 'debug'];
    var debugLevelIndex = debugLevels.indexOf(options.debug);
    function log(msg, level) {
        if (level === 0) {
            msg = 'WARNING - ' + msg;
        } else {
            level = level || 1;
        }
        if (level <= debugLevelIndex) {
            console.log('[copy-webpack-plugin] ' + msg); // eslint-disable-line no-console
        }
    }

    function warning(msg) {
        log(msg, 0);
    }

    function info(msg) {
        log(msg, 1);
    }

    function debug(msg) {
        log(msg, 2);
    }

    var apply = function apply(compiler) {
        var fileDependencies = void 0;
        var contextDependencies = void 0;
        var written = {};

        var context = void 0;

        if (!options.context) {
            context = compiler.options.context;
        } else if (!_path2.default.isAbsolute(options.context)) {
            context = _path2.default.join(compiler.options.context, options.context);
        } else {
            context = options.context;
        }

        var emit = function emit(compilation, cb) {
            debug('starting emit');
            var callback = function callback() {
                debug('finishing emit');
                cb();
            };

            fileDependencies = [];
            contextDependencies = [];

            var globalRef = {
                info: info,
                debug: debug,
                warning: warning,
                compilation: compilation,
                written: written,
                fileDependencies: fileDependencies,
                contextDependencies: contextDependencies,
                context: context,
                inputFileSystem: compiler.inputFileSystem,
                output: compiler.options.output.path,
                ignore: options.ignore || [],
                copyUnmodified: options.copyUnmodified,
                concurrency: options.concurrency
            };

            if (globalRef.output === '/' && compiler.options.devServer && compiler.options.devServer.outputPath) {
                globalRef.output = compiler.options.devServer.outputPath;
            }

            var tasks = [];

            patterns.forEach(function (pattern) {
                tasks.push(Promise.resolve().then(function () {
                    return (0, _preProcessPattern2.default)(globalRef, pattern);
                })
                // Every source (from) is assumed to exist here
                .then(function (pattern) {
                    return (0, _processPattern2.default)(globalRef, pattern);
                }));
            });

            Promise.all(tasks).catch(function (err) {
                compilation.errors.push(err);
            }).then(function () {
                return callback();
            });
        };

        var afterEmit = function afterEmit(compilation, cb) {
            debug('starting after-emit');
            var callback = function callback() {
                debug('finishing after-emit');
                cb();
            };

            var compilationFileDependencies = void 0;
            var addFileDependency = void 0;
            if (Array.isArray(compilation.fileDependencies)) {
                compilationFileDependencies = new Set(compilation.fileDependencies);
                addFileDependency = function addFileDependency(file) {
                    return compilation.fileDependencies.push(file);
                };
            } else {
                compilationFileDependencies = compilation.fileDependencies;
                addFileDependency = function addFileDependency(file) {
                    return compilation.fileDependencies.add(file);
                };
            }

            var compilationContextDependencies = void 0;
            var addContextDependency = void 0;
            if (Array.isArray(compilation.contextDependencies)) {
                compilationContextDependencies = new Set(compilation.contextDependencies);
                addContextDependency = function addContextDependency(file) {
                    return compilation.contextDependencies.push(file);
                };
            } else {
                compilationContextDependencies = compilation.contextDependencies;
                addContextDependency = function addContextDependency(file) {
                    return compilation.contextDependencies.add(file);
                };
            }

            // Add file dependencies if they're not already tracked
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = fileDependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var file = _step.value;

                    if (compilationFileDependencies.has(file)) {
                        debug('not adding ' + file + ' to change tracking, because it\'s already tracked');
                    } else {
                        debug('adding ' + file + ' to change tracking');
                        addFileDependency(file);
                    }
                }

                // Add context dependencies if they're not already tracked
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = contextDependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _context = _step2.value;

                    if (compilationContextDependencies.has(_context)) {
                        debug('not adding ' + _context + ' to change tracking, because it\'s already tracked');
                    } else {
                        debug('adding ' + _context + ' to change tracking');
                        addContextDependency(_context);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            callback();
        };

        if (compiler.hooks) {
            var plugin = { name: 'CopyPlugin' };

            compiler.hooks.emit.tapAsync(plugin, emit);
            compiler.hooks.afterEmit.tapAsync(plugin, afterEmit);
        } else {
            compiler.plugin('emit', emit);
            compiler.plugin('after-emit', afterEmit);
        }
    };

    return {
        apply: apply
    };
}

CopyWebpackPlugin['default'] = CopyWebpackPlugin;
module.exports = CopyWebpackPlugin;