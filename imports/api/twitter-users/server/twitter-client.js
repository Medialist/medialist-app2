import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import NpmTwitter from 'twitter'
import twitterScreenName from 'twitter-screen-name'
import TwitterUsers from '/imports/api/twitter-users/server/twitter-users'

class TwitterStream {
  constructor (stream) {
    this.stream = stream
  }
  onError (err) {
    console.error('Error during TwitterStream event handler', err)
  }
  on (event, cb) {
    return this.stream.on(event, Meteor.bindEnvironment(cb, this.onError))
  }
}

// Meteorising wrapper around the npm `twitter` module
class Twitter {
  constructor (opts) {
    this.twitter = new NpmTwitter(opts)
  }
  stream () {
    var args = Array.from(arguments)
    var cb = args[args.length - 1]
    console.assert(typeof cb === 'function')
    args[args.length - 1] = (stream) => cb.call(this, new TwitterStream(stream))
    return this.twitter.stream.apply(this.twitter, args)
  }
}

// An api for pulling data from twitter
// and storing it in the `TwitterUsers` collection
const TwitterClient = new Twitter({
  consumer_key: Meteor.settings.twitter.consumer_key,
  consumer_secret: Meteor.settings.twitter.consumer_secret,
  access_token_key: Meteor.settings.twitter.access_token_key,
  access_token_secret: Meteor.settings.twitter.access_token_secret
})

TwitterClient.grabUser = function (query, cb) {
  cb = cb || function () {}
  TwitterClient.twitter.get('users/show', query, Meteor.bindEnvironment(function (err, user) {
    if (err) {
      console.error('TwitterClient.grabUser: ', err, query)
      return cb(err)
    }
    if (!user.id_str) {
      console.log('TwitterClient.grabUser: got user with no id_str for ', query)
      return cb('User has no id_str', user)
    }
    user._id = user.id_str
    console.log('TwitterClient.grabUser: Got ' + user.screen_name, user.name)
    TwitterUsers.upsert(user._id, user)
    cb(err, user)
  }))
}

TwitterClient.grabUserByScreenName = function (screenName, cb) {
  const opts = {screen_name: twitterScreenName(screenName)}
  TwitterClient.grabUser(opts, cb)
}

TwitterClient.grabUserById = function (id, cb) {
  TwitterClient.grabUser({user_id: id}, cb)
}

// Max 100 users: https://dev.twitter.com/rest/reference/get/users/lookup
TwitterClient.lookupUsers = (identifiers, cb) => {
  check(identifiers, {
    id: Match.Optional([String]),
    screenName: Match.Optional([String])
  })

  var query = {}

  if (identifiers.id && identifiers.id.length) {
    query.user_id = identifiers.id.join(',')
  }

  if (identifiers.screenName && identifiers.screenName.length) {
    query.screen_name = identifiers.screenName.join(',')
  }

  if (!Object.keys(query).length) {
    return Meteor.setTimeout(() => cb(null, []))
  }

  TwitterClient.twitter.post('users/lookup', query, Meteor.bindEnvironment((err, users) => {
    if (err) {
      console.error('TwitterClient.lookupUsers', err, query)
      return cb(err)
    }

    cb(null, users)
  }))
}

export default TwitterClient
