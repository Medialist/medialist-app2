import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const VALID_DOMAINS = (Meteor.settings.authentication && Meteor.settings.authentication.email_domains) || []

const findOrCreateUserId = (email) => {
  let user = Accounts.findUserByEmail(email)

  if (user) {
    return user._id
  }

  return Accounts.createUser({
    email: email
  })
}

const sendEmailLogInLink = (email) => {
  const domain = email.split('@').pop()
  const validDomain = VALID_DOMAINS.some(validDomain => domain === validDomain)

  if (!validDomain) {
    throw new Meteor.Error('INVALID_EMAIL')
  }

  const userId = findOrCreateUserId(email)

  if (Meteor.settings.authentication.send_link) {
    Accounts.sendLoginEmail(userId, email)

    return
  }

  // just sign the user in, only used for browser tests..
  const stampedLoginToken = Accounts._generateStampedLoginToken()
  Accounts._insertLoginToken(userId, stampedLoginToken)

  return stampedLoginToken
}

export default sendEmailLogInLink
