SourceMapSupport = {
  install: function () {
    if (Meteor.isClient) {
      installClient();
    } else if (Meteor.isServer) {
      installServer();
    }
  }
}

function installClient() {
  window.sourceMapSupport.install();
}

function installServer() {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var sourceMapSupport = Npm.require('source-map-support');

  var serverJsonPath = path.resolve(process.argv[2]);
  var serverDir = path.dirname(serverJsonPath);
  var serverJson = JSON.parse(fs.readFileSync(serverJsonPath, 'utf8'));

  // Map from load path to its source map.
  var parsedSourceMaps = {};

  // Lazy load source maps when we need them
  var loadSourceMaps = _.once(function () {
    // Read all the source maps into memory once.
    _.each(serverJson.load, function (fileInfo) {
      if (fileInfo.sourceMap) {
        var rawSourceMap = fs.readFileSync(
          path.resolve(serverDir, fileInfo.sourceMap), 'utf8');
        // Parse the source map only once, not each time it's needed. Also remove
        // the anti-XSSI header if it's there.
        var parsedSourceMap = JSON.parse(rawSourceMap.replace(/^\)\]\}'/, ''));
        // source-map-support doesn't ever look at the sourcesContent field, so
        // there's no point in keeping it in memory.
        delete parsedSourceMap.sourcesContent;
        if (fileInfo.sourceMapRoot) {
          // Add the specified root to any root that may be in the file.
          parsedSourceMap.sourceRoot = path.join(
            fileInfo.sourceMapRoot, parsedSourceMap.sourceRoot || '');
        }
        parsedSourceMaps[path.resolve(serverDir, fileInfo.path)] = parsedSourceMap;
      }
    });
  });

  var retrieveSourceMap = function (pathForSourceMap) {
    loadSourceMaps();
    if (_.has(parsedSourceMaps, pathForSourceMap))
      return { map: parsedSourceMaps[pathForSourceMap] };
    return null;
  };

  sourceMapSupport.install({
    // Use the source maps specified in program.json instead of parsing source
    // code for them.
    retrieveSourceMap: retrieveSourceMap,
    // For now, don't fix the source line in uncaught exceptions, because we
    // haven't fixed handleUncaughtExceptions in source-map-support to properly
    // locate the source files.
    handleUncaughtExceptions: false
  });
}
