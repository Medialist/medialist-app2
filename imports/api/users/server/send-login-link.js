import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

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
  const validDomain = Meteor.settings.public.authentication.emailDomains
    .concat(Meteor.settings.public.authentication.extraEmailDomains)
    .some(validDomain => domain === validDomain)

  if (!validDomain) {
    console.warn(`User tried to log in with invalid email domain '${domain}'`)

    throw new Meteor.Error('INVALID_EMAIL')
  }

  const userId = findOrCreateUserId(email)

  if (Meteor.settings.authentication.sendLink) {
    Accounts.sendLoginEmail(userId, email)

    return
  }

  // mark email verified
  Accounts.addEmail(userId, email, true)

  // just sign the user in, only used for browser tests..
  const stampedLoginToken = Accounts._generateStampedLoginToken()
  Accounts._insertLoginToken(userId, stampedLoginToken)

  return stampedLoginToken
}

export default sendEmailLogInLink
