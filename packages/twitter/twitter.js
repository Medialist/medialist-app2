var twitter = Npm.require('twitter')

var TwitterStream = function(stream) {
  this.stream = stream
};
TwitterStream.prototype.on = function(event, cb) {
  return this.stream.on(event, Meteor.bindEnvironment(cb))
};
Twitter = function(opts) {
  this.twitter = new twitter(opts)
};
Twitter.prototype.stream = function() {
  var args = Array.prototype.slice.call(arguments)
  var cb = args[args.length-1]
  console.assert(typeof cb === 'function')
  args[args.length-1] = function(stream) {
      return cb.call(this, new TwitterStream(stream))
  }
  return this.twitter.stream.apply(this.twitter, args)
};
