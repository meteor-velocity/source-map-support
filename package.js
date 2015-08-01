Package.describe({
  name: 'velocity:source-map-support',
  version: '0.3.2',
  summary: 'Wrapper for npm package source-map-support',
  git: 'https://github.com/meteor-velocity/source-map-support.git',
  documentation: 'README.md'
});

Npm.depends({
  'source-map-support': '0.3.2'
})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.export('SourceMapSupport');
  api.use('underscore', 'server');
  api.addFiles('.npm/package/node_modules/source-map-support/browser-source-map-support.js', 'client');
  api.addFiles('source_map_support.js');
});
