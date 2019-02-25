'use strict';

var ReplaceSource = require('webpack-core/lib/ReplaceSource');

/**
 * @constructor
 */
function SafeUmdPlugin() {}

/**
 * Replace 'factory(root[...], root[...], ..)' code of the 
 * webpackUniversalModuleDefinition function to access nested namespace safely,
 * and returns the new ReplaceSource instance.
 * @param {Source} source - source
 * @param {string} srcText - string content of the source
 * @returns {ReplaceSource}
 */
function genReplacedSource(source, srcText) {
    var rFactoryCallWithRootAccessors = /factory\((?:root(?:\[[^\]]+\],?\s?)+)+\)/;
    var matched = rFactoryCallWithRootAccessors.exec(srcText);
    var mText, mIndex, newSource, replacedText;

    if (!matched) {
        return source;
    }

    mText = matched[0];
    mIndex = matched.index;
    newSource = new ReplaceSource(source);
    replacedText = replaceFactoryCall(mText);

    newSource.replace(mIndex, mIndex + mText.length - 1, replacedText);

    return newSource;
}

/**
 * Take a code string which looks like 
 * (factory(root["a"], root["a"]["b"]["c"]) 
 * and replace multi-nested root accessor with safely accessing code like 
 * (factory(root["a"], (root["a"] && root["a"]["b"] && root["a"]["b"]["c"]))
 * @param {string} factoryCall - a code string
 * @returns {string}
 */
function replaceFactoryCall(factoryCall) {
    var multiNestedRootAccessor = /root(?:\[[^\]]+\]){2,}/g;

    return factoryCall.replace(multiNestedRootAccessor, function(matched) {
        var units = matched.match(/"([^"]+)"/g);
        var len = units.length;
        var i = 0;
        var accessUnits = [];

        for (; i < len; i += 1) {
            accessUnits.push('root[' + units.slice(0, i + 1).join('][') + ']');
        }

        return '(' + accessUnits.join(' && ') + ')';
    });
}

SafeUmdPlugin.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {
        compilation.templatesPlugin('render-with-entry', function(source) {
            var srcText = source.source();

            // As this function is called more the once and 
            // can be called before the UMDMainTemplatePlugin, 
            // we should check if there's UMD function in the source
            if (srcText.indexOf('webpackUniversalModuleDefinition') < 0) {
                return source;
            }

            return genReplacedSource(source, srcText);
        });
    });
};

// Add static method for test
SafeUmdPlugin.genReplacedSource = genReplacedSource;

module.exports = SafeUmdPlugin;
