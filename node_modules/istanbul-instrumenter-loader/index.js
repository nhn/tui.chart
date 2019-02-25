'use strict';

var istanbulLibInstrument = require('istanbul-lib-instrument');
var loaderUtils = require('loader-utils');
var assign = require('object-assign');
var convert = require('convert-source-map');

module.exports = function(source, sourceMap) {
    // use inline source map, if any
    var inlineSourceMap = convert.fromSource(source);
    if (!sourceMap && inlineSourceMap) {
        sourceMap = inlineSourceMap.sourcemap;
    }

    var userOptions = loaderUtils.parseQuery(this.query);
    var instrumenter = istanbulLibInstrument.createInstrumenter(
        assign({ produceSourceMap: this.sourceMap }, userOptions)
    );

    if (this.cacheable) {
        this.cacheable();
    }

    var that = this;
    return instrumenter.instrument(source, this.resourcePath, function (error, source) {
        that.callback(error, source, instrumenter.lastSourceMap());
    }, sourceMap);
};
