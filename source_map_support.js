SourceMapSupport = {
  install: function () {
    if (Meteor.isClient) {
      window.sourceMapSupport.install();
    }
    // On server side Meteor already has source-map-support by default
  }
}
