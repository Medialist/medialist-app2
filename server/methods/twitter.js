var Future = Npm.require('fibers/future')

Meteor.methods({
  'twitter/grabUserByScreenName': function (screenName) {
    var fut = new Future()
    check(screenName, String)
    if (!this.userId) throw new Meteor.Error('Only logged in users can search by screenname')
    TwitterClient.grabUserByScreenName(screenName, function (err, res) {
      if (err) return fut.throw(new Meteor.Error('bad-twitter-handle', 'Twitter API does not recognise that handle', err))
      fut.return(res)
    })
    return fut.wait()
  }
})
