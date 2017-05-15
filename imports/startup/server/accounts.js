import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { Accounts } from 'meteor/accounts-base'
import sendLoginLinkTemplate from '/imports/api/email/server/templates/send-login-link'

ServiceConfiguration.configurations.upsert({
  service: 'twitter'
}, {
  $set: {
    consumerKey: Meteor.settings.twitter.consumer_key,
    secret: Meteor.settings.twitter.consumer_secret,
    loginStyle: 'popup'
  }
})

Accounts.onCreateUser((options, user) => {
  user.profile = options.profile || {}
  user.myCampaigns = []
  user.myContacts = []
  user.onCampaigns = 0

  return user
})

Accounts.urls.login = (token) => Meteor.absoluteUrl(`sign-in/${token}`)

Accounts.emailTemplates.from = Meteor.settings.email.defaultFrom
Accounts.emailTemplates.siteName = 'Medialist'
Accounts.emailTemplates.login = {
  subject: (user) => sendLoginLinkTemplate.subject({
    user: user
  }),
  text: (user, url) => sendLoginLinkTemplate.text({
    user: user,
    url: url
  }),
  html: (user, url) => sendLoginLinkTemplate.html({
    user: user,
    url: url
  })
}
