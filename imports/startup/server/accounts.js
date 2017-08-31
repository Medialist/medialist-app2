import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import sendLoginLinkTemplate from '/imports/api/email/server/templates/send-login-link'
import onCreateUser from '/imports/api/users/server/on-create-user'

Accounts.onCreateUser(onCreateUser)

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
