'use strict';
var path = require('path');
var util = require('util');
var globby = require('globby');
var cpFile = require('cp-file');
var NestedError = require('nested-error-stacks');
var objectAssign = require('object-assign');
var Promise = require('pinkie-promise');

function CpyError(message, nested) {
	NestedError.call(this, message, nested);
	objectAssign(this, nested, {message: message});
}

util.inherits(CpyError, NestedError);

CpyError.prototype.name = 'CpyError';

function preprocessSrcPath(srcPath, opts) {
	if (opts.cwd) {
		srcPath = path.resolve(opts.cwd, srcPath);
	}

	return srcPath;
}

function preprocessDestPath(srcPath, dest, opts) {
	var basename = opts.rename || path.basename(srcPath);
	var dirname = path.dirname(srcPath);

	if (opts.cwd) {
		dest = path.resolve(opts.cwd, dest);
	}

	if (opts.parents) {
		return path.join(dest, dirname, basename);
	}

	return path.join(dest, basename);
}

module.exports = function (src, dest, opts) {
	if (!Array.isArray(src)) {
		return Promise.reject(new CpyError('Expected `files` to be an array, got ' + typeof src));
	}

	if (src.length === 0 || !dest) {
		return Promise.reject(new CpyError('`files` and `destination` required'));
	}

	opts = opts || {};

	return globby(src, opts)
		.then(function (files) {
			return Promise.all(files.map(function (srcPath) {
				var from = preprocessSrcPath(srcPath, opts);
				var to = preprocessDestPath(srcPath, dest, opts);

				return cpFile(from, to, opts).catch(function (err) {
					throw new CpyError('Cannot copy from `' + from + '` to `' + to + '`: ' + err.message, err);
				});
			}));
		})
		.catch(function (err) {
			throw new CpyError('Cannot glob `' + src + '`: ' + err.message, err);
		});
};
