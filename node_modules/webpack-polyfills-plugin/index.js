var ConcatSource = require("webpack-core/lib/ConcatSource");
var fs = require("fs");

function PolyfillsPlugin(polyfills) {
    this.polyfills = polyfills || [];
}

module.exports = PolyfillsPlugin;

PolyfillsPlugin.prototype.apply = function(compiler) {

    var filesContent = "";

    this.polyfills.forEach(function(polyfill) {
        var filePath = require.resolve("./polyfills/" + polyfill + "/polyfill");
        if (filePath) {
            filesContent += fs.readFileSync(filePath, { encoding: 'utf8' });
        }
    });

    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
            chunks.forEach(function(chunk) {
                if(chunk.hasOwnProperty('initial')) {
                    if (!chunk.initial) return;
                } else {
                    if (!chunk.isInitial()) return;
                }

                chunk.files.forEach(function(file, i) {
                    compilation.assets[file] = new ConcatSource("/* Polyfills */\n", filesContent, compilation.assets[file]);
                });
            });
            callback();
        });
    });
};
