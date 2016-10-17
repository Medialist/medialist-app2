Package.describe({
  name: 'tableflip:twitter',
  summary: 'Interface with Twitter APIs on Meteor server',
  version: '0.0.1'
});

Npm.depends({'twitter': '1.2.5'})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.addFiles('twitter.js', 'server')
  api.export('Twitter', 'server')
  api.use('ecmascript')
})
