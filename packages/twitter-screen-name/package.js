Package.describe({
  name: 'tableflip:twitter-screen-name',
  summary: 'Wrapper around the npm module twitter-screen-name',
  version: '1.0.0'
});

Npm.depends({'twitter-screen-name': '1.0.0'})

Package.onUse(function(api) {
  api.versionsFrom('1.2.1')
  api.use('cosmos:browserify', 'client')
  api.addFiles('server.js', 'server')
  api.addFiles('client.browserify.js', 'client')
  api.export('twitterScreenName', ['client', 'server'])
  api.use('ecmascript')
})
