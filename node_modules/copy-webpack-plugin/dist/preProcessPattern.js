'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = preProcessPattern;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _escape = require('./utils/escape');

var _escape2 = _interopRequireDefault(_escape);

var _isObject = require('./utils/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _promisify = require('./utils/promisify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://www.debuggex.com/r/VH2yS2mvJOitiyr3
var isTemplateLike = /(\[ext\])|(\[name\])|(\[path\])|(\[folder\])|(\[emoji(:\d+)?\])|(\[(\w+:)?hash(:\w+)?(:\d+)?\])|(\[\d+\])/;

function preProcessPattern(globalRef, pattern) {
    var info = globalRef.info,
        debug = globalRef.debug,
        warning = globalRef.warning,
        context = globalRef.context,
        inputFileSystem = globalRef.inputFileSystem,
        fileDependencies = globalRef.fileDependencies,
        contextDependencies = globalRef.contextDependencies,
        compilation = globalRef.compilation;


    pattern = typeof pattern === 'string' ? {
        from: pattern
    } : Object.assign({}, pattern);
    pattern.to = pattern.to || '';
    pattern.context = pattern.context || context;
    if (!_path2.default.isAbsolute(pattern.context)) {
        pattern.context = _path2.default.join(context, pattern.context);
    }
    pattern.ignore = globalRef.ignore.concat(pattern.ignore || []);

    info('processing from: \'' + pattern.from + '\' to: \'' + pattern.to + '\'');

    switch (true) {
        case !!pattern.toType:
            // if toType already exists
            break;
        case isTemplateLike.test(pattern.to):
            pattern.toType = 'template';
            break;
        case _path2.default.extname(pattern.to) === '' || pattern.to.slice(-1) === '/':
            pattern.toType = 'dir';
            break;
        default:
            pattern.toType = 'file';
    }

    debug('determined \'' + pattern.to + '\' is a \'' + pattern.toType + '\'');

    // If we know it's a glob, then bail early
    if ((0, _isObject2.default)(pattern.from) && pattern.from.glob) {
        pattern.fromType = 'glob';

        var fromArgs = Object.assign({}, pattern.from);
        delete fromArgs.glob;

        pattern.fromArgs = fromArgs;
        pattern.glob = (0, _escape2.default)(pattern.context, pattern.from.glob);
        pattern.absoluteFrom = _path2.default.resolve(pattern.context, pattern.from.glob);
        return Promise.resolve(pattern);
    }

    if (_path2.default.isAbsolute(pattern.from)) {
        pattern.absoluteFrom = pattern.from;
    } else {
        pattern.absoluteFrom = _path2.default.resolve(pattern.context, pattern.from);
    }

    debug('determined \'' + pattern.from + '\' to be read from \'' + pattern.absoluteFrom + '\'');

    return (0, _promisify.stat)(inputFileSystem, pattern.absoluteFrom).catch(function () {
        // If from doesn't appear to be a glob, then log a warning
        if ((0, _isGlob2.default)(pattern.from) || pattern.from.indexOf('*') !== -1) {
            pattern.fromType = 'glob';
            pattern.glob = (0, _escape2.default)(pattern.context, pattern.from);
        } else {
            var msg = 'unable to locate \'' + pattern.from + '\' at \'' + pattern.absoluteFrom + '\'';
            warning(msg);
            compilation.errors.push('[copy-webpack-plugin] ' + msg);
            pattern.fromType = 'nonexistent';
        }
    }).then(function (stat) {
        if (!stat) {
            return pattern;
        }

        if (stat.isDirectory()) {
            pattern.fromType = 'dir';
            pattern.context = pattern.absoluteFrom;
            contextDependencies.push(pattern.absoluteFrom);
            pattern.glob = (0, _escape2.default)(pattern.absoluteFrom, '**/*');
            pattern.absoluteFrom = _path2.default.join(pattern.absoluteFrom, '**/*');
            pattern.fromArgs = {
                dot: true
            };
        } else if (stat.isFile()) {
            pattern.fromType = 'file';
            pattern.context = _path2.default.dirname(pattern.absoluteFrom);
            pattern.glob = (0, _escape2.default)(pattern.absoluteFrom);
            pattern.fromArgs = {
                dot: true
            };
            fileDependencies.push(pattern.absoluteFrom);
        } else if (!pattern.fromType) {
            info('Unrecognized file type for ' + pattern.from);
        }
        return pattern;
    });
}