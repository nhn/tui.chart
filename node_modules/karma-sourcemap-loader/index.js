var fs = require('graceful-fs');
var path = require('path');

var sourcemapUrlRegeExp = /^\/\/#\s*sourceMappingURL=/;

var createSourceMapLocatorPreprocessor = function(args, logger) {
  var log = logger.create('preprocessor.sourcemap');
  var charsetRegex = /^;charset=([^;]+);/;

  return function(content, file, done) {
    function sourceMapData(data){
      file.sourceMap = JSON.parse(data);
      done(content);
    }

    function inlineMap(inlineData){

      var charset = 'utf-8';
      
      if (charsetRegex.test(inlineData)) {
        var matches = inlineData.match(charsetRegex);

        if (matches.length === 2) {
          charset = matches[1];
          inlineData = inlineData.slice(matches[0].length -1);
        }
      }

      if (/^;base64,/.test(inlineData)) {
        // base64-encoded JSON string
        log.debug('base64-encoded source map for', file.originalPath);
        var buffer = new Buffer(inlineData.slice(';base64,'.length), 'base64');
        sourceMapData(buffer.toString(charset));
      } else {
        // straight-up URL-encoded JSON string
        log.debug('raw inline source map for', file.originalPath);
        sourceMapData(decodeURIComponent(inlineData));
      }
    }

    function fileMap(mapPath){
      fs.exists(mapPath, function(exists) {
        if (!exists) {
          done(content);
          return;
        }
        fs.readFile(mapPath, function(err, data) {
          if (err){ throw err; }

          log.debug('external source map exists for', file.originalPath);
          sourceMapData(data);
        });
      });
    }

    var lines = content.split(/\n/);
    var lastLine = lines.pop();
    while (/^\s*$/.test(lastLine)) {
      lastLine = lines.pop();
    }

    var mapUrl;

    if (sourcemapUrlRegeExp.test(lastLine)) {
      mapUrl = lastLine.replace(sourcemapUrlRegeExp, '');
    }

    if (!mapUrl) {
      fileMap(file.path + ".map");
    } else if (/^data:application\/json/.test(mapUrl)) {
      inlineMap(mapUrl.slice('data:application/json'.length));
    } else {
      fileMap(path.resolve(path.dirname(file.path), mapUrl));
    }
  };
};

createSourceMapLocatorPreprocessor.$inject = ['args', 'logger'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:sourcemap': ['factory', createSourceMapLocatorPreprocessor]
};
