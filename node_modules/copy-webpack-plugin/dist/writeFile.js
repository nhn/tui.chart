'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = writeFile;

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cacache = require('cacache');

var _cacache2 = _interopRequireDefault(_cacache);

var _serializeJavascript = require('serialize-javascript');

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

var _package = require('../package.json');

var _findCacheDir = require('find-cache-dir');

var _findCacheDir2 = _interopRequireDefault(_findCacheDir);

var _promisify = require('./utils/promisify');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function writeFile(globalRef, pattern, file) {
    var info = globalRef.info,
        debug = globalRef.debug,
        compilation = globalRef.compilation,
        fileDependencies = globalRef.fileDependencies,
        written = globalRef.written,
        inputFileSystem = globalRef.inputFileSystem,
        copyUnmodified = globalRef.copyUnmodified;


    return (0, _promisify.stat)(inputFileSystem, file.absoluteFrom).then(function (stat) {
        // We don't write empty directories
        if (stat.isDirectory()) {
            return;
        }

        // If this came from a glob, add it to the file watchlist
        if (pattern.fromType === 'glob') {
            fileDependencies.push(file.absoluteFrom);
        }

        info('reading ' + file.absoluteFrom + ' to write to assets');
        return (0, _promisify.readFile)(inputFileSystem, file.absoluteFrom).then(function (content) {
            if (pattern.transform) {
                var transform = function transform(content, absoluteFrom) {
                    return pattern.transform(content, absoluteFrom);
                };

                if (pattern.cache) {
                    if (!globalRef.cacheDir) {
                        globalRef.cacheDir = (0, _findCacheDir2.default)({ name: 'copy-webpack-plugin' });
                    }

                    var cacheKey = pattern.cache.key ? pattern.cache.key : (0, _serializeJavascript2.default)({
                        name: _package.name,
                        version: _package.version,
                        pattern: pattern,
                        hash: _crypto2.default.createHash('md4').update(content).digest('hex')
                    });

                    return _cacache2.default.get(globalRef.cacheDir, cacheKey).then(function (result) {
                        return result.data;
                    }, function () {
                        return Promise.resolve().then(function () {
                            return transform(content, file.absoluteFrom);
                        }).then(function (content) {
                            return _cacache2.default.put(globalRef.cacheDir, cacheKey, content).then(function () {
                                return content;
                            });
                        });
                    });
                }

                content = transform(content, file.absoluteFrom);
            }

            return content;
        }).then(function (content) {
            var hash = _loaderUtils2.default.getHashDigest(content);

            if (pattern.toType === 'template') {
                info('interpolating template \'' + file.webpackTo + '\' for \'' + file.relativeFrom + '\'');

                // If it doesn't have an extension, remove it from the pattern
                // ie. [name].[ext] or [name][ext] both become [name]
                if (!_path2.default.extname(file.relativeFrom)) {
                    file.webpackTo = file.webpackTo.replace(/\.?\[ext\]/g, '');
                }

                file.webpackTo = _loaderUtils2.default.interpolateName({ resourcePath: file.absoluteFrom }, file.webpackTo, {
                    content: content,
                    regExp: file.webpackToRegExp,
                    context: pattern.context
                });
            }

            if (!copyUnmodified && written[file.absoluteFrom] && written[file.absoluteFrom]['hash'] === hash && written[file.absoluteFrom]['webpackTo'] === file.webpackTo) {
                info('skipping \'' + file.webpackTo + '\', because it hasn\'t changed');
                return;
            } else {
                debug('added ' + hash + ' to written tracking for \'' + file.absoluteFrom + '\'');
                written[file.absoluteFrom] = {
                    hash: hash,
                    webpackTo: file.webpackTo
                };
            }

            if (compilation.assets[file.webpackTo] && !file.force) {
                info('skipping \'' + file.webpackTo + '\', because it already exists');
                return;
            }

            info('writing \'' + file.webpackTo + '\' to compilation assets from \'' + file.absoluteFrom + '\'');
            compilation.assets[file.webpackTo] = {
                size: function size() {
                    return stat.size;
                },
                source: function source() {
                    return content;
                }
            };
        });
    });
}