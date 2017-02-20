import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { Accounts } from 'meteor/accounts-base'

ServiceConfiguration.configurations.upsert(
  {
    service: 'twitter'
  },
  {
    $set: {
      consumerKey: Meteor.settings.twitter.consumer_key,
      secret: Meteor.settings.twitter.consumer_secret,
      loginStyle: 'popup'
    }
  }
)

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile || {}
  user.myMedialists = []
  user.myContacts = []
  return user
})
